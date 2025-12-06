import csv
import io
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Transaction
from uuid import UUID
import uuid
from fastapi import HTTPException
from app.core.config import settings
from concurrent.futures import ProcessPoolExecutor
import asyncio
from decimal import Decimal, InvalidOperation
from app.services.ai.llm_service import LLMService
from langchain_core.messages import HumanMessage
import json
import pandas as pd
import shutil
import os


def _parse_csv_in_process(file_content: bytes, bank_name: str, filename: str) -> List[Dict[str, Any]]:
    decoded_content = file_content.decode("utf-8")
    csv_reader = csv.DictReader(io.StringIO(decoded_content))
    
    parsed_data = []
    for row in csv_reader:
        tx_data = IngestionService._map_row(row, bank_name)
        if tx_data:
            tx_data["source_file_id"] = filename # Add filename for Transaction model
            parsed_data.append(tx_data)
    return parsed_data


class IngestionService:
    """
    Service to handle ingestion of transaction files from various banks.
    """
    _executor: ProcessPoolExecutor = ProcessPoolExecutor()
    
    @staticmethod
    async def process_csv(
        db: AsyncSession, 
        file_content: bytes, 
        bank_name: str, 
        subject_id: UUID,
        filename: str
    ) -> List[Transaction]:
        """
        Parses a CSV file and creates Transaction records.
        """
        max_size_bytes = settings.MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024
        if len(file_content) > max_size_bytes:
            raise HTTPException(
                status_code=413, 
                detail=f"File too large. Maximum allowed size is {settings.MAX_UPLOAD_FILE_SIZE_MB} MB."
            )

        # Offload CPU-bound CSV parsing to a separate process
        loop = asyncio.get_event_loop()
        parsed_transactions_data = await loop.run_in_executor(
            IngestionService._executor,
            _parse_csv_in_process,
            file_content,
            bank_name,
            filename
        )

        if not parsed_transactions_data:
            return []

        # Prepare data for bulk insert
        transactions_to_insert = []
        for tx_data in parsed_transactions_data:
            transactions_to_insert.append({
                "id": uuid.uuid4(),
                "subject_id": subject_id,
                "source_bank": bank_name,
                **tx_data,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            })

        # Execute bulk insert
        from sqlalchemy import insert
        stmt = insert(Transaction).values(transactions_to_insert)
        await db.execute(stmt)
        await db.commit()
        
        # Return created objects (re-querying might be needed if we need the ORM objects, 
        # but for performance we often skip this or return the IDs)
        # For now, let's return a list of Transaction objects constructed from data to satisfy type hint
        # Note: These won't be attached to the session in the same way as db.add()
        return [Transaction(**tx) for tx in transactions_to_insert]

    @staticmethod
    async def create_transactions_batch(
        db: AsyncSession,
        transactions_data: List[Dict[str, Any]],
        subject_id: UUID,
        bank_name: str = "Manual Import"
    ) -> List[Transaction]:
        """
        Creates multiple transaction records from a list of dictionaries.
        """
        transactions = []
        for tx_data in transactions_data:
            # Handle date conversion if it's a string
            if isinstance(tx_data.get('date'), str):
                try:
                    tx_data['date'] = datetime.fromisoformat(tx_data['date'].replace('Z', '+00:00'))
                except ValueError:
                    pass 

            # Ensure amount is converted to Decimal
            if isinstance(tx_data.get('amount'), (float, int, str)):
                try:
                    tx_data['amount'] = Decimal(str(tx_data['amount']))
                except (ValueError, TypeError, InvalidOperation):
                    raise HTTPException(status_code=400, detail="Invalid amount format")

            transaction = Transaction(
                subject_id=subject_id,
                source_bank=bank_name,
                source_file_id="manual_import",
                **tx_data
            )
            db.add(transaction)
            transactions.append(transaction)
        
        await db.commit()
        return transactions

    @staticmethod
    async def auto_map_columns(headers: List[str]) -> List[Dict[str, Any]]:
        """
        Use AI to automatically map CSV headers to transaction fields.
        Returns list of mappings with confidence scores.
        """
        llm_service = LLMService()

        # Define the target fields we can map to
        target_fields = {
            "date": "Transaction date (format: YYYY-MM-DD or MM/DD/YYYY)",
            "amount": "Transaction amount (numeric value, can be positive or negative)",
            "description": "Transaction description or memo",
            "currency": "Currency code (e.g., USD, EUR)",
            "account_number": "Account number or account ID",
            "category": "Transaction category or type",
            "reference": "Reference number or transaction ID",
            "balance": "Account balance after transaction"
        }

        prompt = f"""You are an expert at mapping CSV headers to financial transaction fields.

Given these CSV headers: {', '.join(headers)}

Map each header to the most appropriate transaction field from this list:
{json.dumps(target_fields, indent=2)}

For each header, provide:
- target_field: The best matching field name from the list above, or null if no good match
- confidence: A score from 0.0 to 1.0 indicating how confident you are in this mapping
- reasoning: Brief explanation of why this mapping makes sense

Return your response as a JSON array of objects, one for each header.

Example response format:
[
  {{
    "header": "Date",
    "target_field": "date",
    "confidence": 0.95,
    "reasoning": "Standard date field name"
  }},
  {{
    "header": "Amount",
    "target_field": "amount",
    "confidence": 0.98,
    "reasoning": "Direct match for transaction amount"
  }}
]"""

        try:
            messages = [HumanMessage(content=prompt)]
            response = await llm_service.generate_response(messages)

            # Parse the JSON response
            mappings = json.loads(response)

            # Validate and clean the response
            validated_mappings = []
            for mapping in mappings:
                if isinstance(mapping, dict) and 'header' in mapping and 'target_field' in mapping:
                    validated_mapping = {
                        'source': mapping['header'],
                        'target': mapping.get('target_field'),
                        'confidence': min(1.0, max(0.0, float(mapping.get('confidence', 0.5)))),
                        'reasoning': mapping.get('reasoning', '')
                    }
                    validated_mappings.append(validated_mapping)

            return validated_mappings

        except Exception as e:
            print(f"AI auto-mapping failed: {e}")
            # Fallback to basic pattern matching
            return IngestionService._fallback_mapping(headers)

    @staticmethod
    def _fallback_mapping(headers: List[str]) -> List[Dict[str, Any]]:
        """
        Basic pattern matching fallback when AI mapping fails.
        """
        mappings = []
        for header in headers:
            header_lower = header.lower()
            target = None
            confidence = 0.5

            if any(word in header_lower for word in ['date', 'posting']):
                target = 'date'
                confidence = 0.8
            elif any(word in header_lower for word in ['amount', 'value', 'sum']):
                target = 'amount'
                confidence = 0.8
            elif any(word in header_lower for word in ['description', 'memo', 'details']):
                target = 'description'
                confidence = 0.8
            elif any(word in header_lower for word in ['currency', 'curr']):
                target = 'currency'
                confidence = 0.7
            elif any(word in header_lower for word in ['account', 'acct']):
                target = 'account_number'
                confidence = 0.7
            elif any(word in header_lower for word in ['category', 'type']):
                target = 'category'
                confidence = 0.6
            elif any(word in header_lower for word in ['reference', 'ref', 'id']):
                target = 'reference'
                confidence = 0.6
            elif any(word in header_lower for word in ['balance', 'bal']):
                target = 'balance'
                confidence = 0.6

            mappings.append({
                'source': header,
                'target': target,
                'confidence': confidence,
                'reasoning': 'Pattern matching fallback'
            })

        return mappings

    @staticmethod
    def _map_row(row: Dict[str, str], bank_name: str) -> Dict[str, Any]:
        """
        Maps a CSV row to Transaction model fields based on bank_name.
        """
        try:
            if bank_name.lower() == "chase":
                # Example Chase format: Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #
                # We'll assume a simplified version for MVP or standard columns
                
                # MVP Assumption: We look for standard keys or specific Chase keys
                date_str = row.get("Posting Date") or row.get("Date")
                description = row.get("Description") or row.get("Memo")
                amount_str = row.get("Amount")
                
                if not date_str or not amount_str:
                    return None

                # Parse Date (Assuming MM/DD/YYYY)
                date = datetime.strptime(date_str, "%m/%d/%Y")
                
                # Parse Amount as Decimal
                amount = Decimal(amount_str)
                
                return {
                    "date": date,
                    "description": description,
                    "amount": amount,
                    "currency": "USD"
                }
            
            elif bank_name.lower() == "wells_fargo":
                # Example Wells Fargo: date, amount, description
                date_str = row.get("date")
                amount_str = row.get("amount")
                description = row.get("description")
                
                if not date_str or not amount_str:
                    return None
                    
                date = datetime.strptime(date_str, "%m/%d/%Y")
                amount = Decimal(amount_str)
                
                return {
                    "date": date,
                    "description": description,
                    "amount": amount,
                    "currency": "USD"
                }

            else:
                # Generic fallback - expects standard columns
                date_str = row.get("date") or row.get("Date")
                amount_str = row.get("amount") or row.get("Amount")
                description = row.get("description") or row.get("Description")
                
                if not date_str or not amount_str:
                    return None
                
                # Try ISO format first, then US format
                try:
                    date = datetime.fromisoformat(date_str)
                except ValueError:
                    date = datetime.strptime(date_str, "%m/%d/%Y")
                    
                amount = Decimal(amount_str)
                
                return {
                    "date": date,
                    "description": description,
                    "amount": amount,
                    "currency": "USD"
                }

            except Exception as e:
                print(f"Error parsing row: {row} - {e}")
                return None

    @staticmethod
    async def init_upload(file_obj, filename: str, upload_dir: str) -> Dict[str, Any]:
        """
        Step 1: Save file and get suggested mappings.
        """
        os.makedirs(upload_dir, exist_ok=True)
        file_id = str(uuid.uuid4())
        file_path = os.path.join(upload_dir, f"{file_id}.csv")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)
            
        # Read headers
        try:
            df = pd.read_csv(file_path, nrows=0)
            headers = df.columns.tolist()
        except Exception as e:
            os.remove(file_path) # Cleanup on valid check fail
            raise HTTPException(status_code=400, detail=f"Invalid CSV file: {str(e)}")
        
        # Get AI mapping suggestions
        mappings = await IngestionService.auto_map_columns(headers)
        
        suggested_mapping = {}
        for m in mappings:
            if m.get("target") and m.get("confidence", 0) > 0.6:
                suggested_mapping[m["target"]] = m["source"]
                
        return {
            "file_id": file_id,
            "headers": headers,
            "suggested_mapping": suggested_mapping
        }

    @staticmethod
    async def preview_mapping(file_id: str, mapping: Dict[str, str], upload_dir: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Step 2: Preview data with applied mapping.
        """
        file_path = os.path.join(upload_dir, f"{file_id}.csv")
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found or expired")
            
        try:
            df = pd.read_csv(file_path, nrows=limit)
            
            # Apply mapping: Frontend sends {target: source}, Pandas needs {source: target}
            rename_map = {v: k for k, v in mapping.items()}
            df = df.rename(columns=rename_map)
            
            # Filter to mapped columns
            mapped_cols = [k for k in mapping.keys() if k in df.columns]
            df = df[mapped_cols]
            
            # Fill NaNs to avoid JSON conversion errors
            df = df.fillna("")
            
            return df.to_dict(orient="records")
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")

    @staticmethod
    async def process_mapped_file(
        db: AsyncSession,
        file_id: str,
        mapping: Dict[str, str],
        subject_id: UUID,
        bank_name: str,
        upload_dir: str
    ) -> List[Transaction]:
        """
        Step 3: Process the full file with confirmed mapping.
        """
        file_path = os.path.join(upload_dir, f"{file_id}.csv")
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found or expired")
            
        try:
            df = pd.read_csv(file_path)
            
            # Apply mapping
            rename_map = {v: k for k, v in mapping.items()}
            df = df.rename(columns=rename_map)
            
            # Filter to mapped columns
            mapped_cols = [k for k in mapping.keys() if k in df.columns]
            df = df[mapped_cols]
            
            # Convert to list of dicts
            records = df.to_dict(orient="records")
            
            # Clean records
            cleaned_records = []
            for record in records:
                clean = {}
                for k, v in record.items():
                    if pd.notna(v) and v != "":
                        clean[k] = v
                cleaned_records.append(clean)
                
            # Create transactions
            transactions = await IngestionService.create_transactions_batch(
                db=db,
                transactions_data=cleaned_records,
                subject_id=subject_id,
                bank_name=bank_name
            )
            
            # Clean up file
            os.remove(file_path)
            
            return transactions
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
