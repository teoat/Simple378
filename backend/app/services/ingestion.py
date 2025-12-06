import csv
import io
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Transaction
from uuid import UUID
import uuid
from fastapi import HTTPException, UploadFile
from app.core.config import settings
from concurrent.futures import ProcessPoolExecutor
import asyncio
from decimal import Decimal, InvalidOperation
import os
import tempfile
import json
import shutil
from pathlib import Path

TEMP_UPLOAD_DIR = Path(tempfile.gettempdir()) / "simple378_uploads"
TEMP_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


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
    async def save_temp_file(file: UploadFile) -> str:
        """
        Saves an uploaded file to a temporary location and returns the file ID.
        """
        upload_id = str(uuid.uuid4())
        file_path = TEMP_UPLOAD_DIR / f"{upload_id}.csv"
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            return upload_id
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save temp file: {str(e)}")

    @staticmethod
    def get_temp_file_path(upload_id: str) -> Path:
        file_path = TEMP_UPLOAD_DIR / f"{upload_id}.csv"
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Upload session expired or not found")
        return file_path

    @staticmethod
    def detect_csv_headers(upload_id: str) -> List[str]:
        """
        Reads the first line of the CSV to get headers.
        """
        file_path = IngestionService.get_temp_file_path(upload_id)
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                headers = next(reader)
                return [h.strip() for h in headers if h.strip()]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read CSV headers: {str(e)}")

    @staticmethod
    def preview_mapping(upload_id: str, mapping: Dict[str, str], limit: int = 5) -> List[Dict[str, Any]]:
        """
        Returns a preview of the data after applying the mapping.
        mapping format: { "target_field": "source_column_name" }
        """
        file_path = IngestionService.get_temp_file_path(upload_id)
        preview_data = []
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                
                count = 0
                for row in reader:
                    if count >= limit:
                        break
                        
                    mapped_row = IngestionService._apply_dynamic_mapping(row, mapping)
                    if mapped_row:
                        preview_data.append(mapped_row)
                        count += 1
                        
            return preview_data
        except Exception as e:
             raise HTTPException(status_code=400, detail=f"Failed to generate preview: {str(e)}")

    @staticmethod
    async def process_csv_with_mapping(
        db: AsyncSession,
        upload_id: str,
        mapping: Dict[str, str],
        subject_id: UUID,
        bank_name: str = "Manual Import"
    ) -> List[Transaction]:
        """
        Processes the temp file using the provided mapping and inserts transactions.
        """
        file_path = IngestionService.get_temp_file_path(upload_id)
        
        try:
            # We'll do this in-process for now since we have the file path
            # Ideally offload to worker if files are huge
            transactions_to_insert = []
            
            with open(file_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                
                for row in reader:
                    mapped_data = IngestionService._apply_dynamic_mapping(row, mapping)
                    if mapped_data:
                         transactions_to_insert.append({
                            "id": uuid.uuid4(),
                            "subject_id": subject_id,
                            "source_bank": bank_name,
                            "source_file_id": f"upload_{upload_id}",
                            **mapped_data,
                            "created_at": datetime.now(),
                            "updated_at": datetime.now()
                        })
            
            if not transactions_to_insert:
                 return []

            from sqlalchemy import insert
            stmt = insert(Transaction).values(transactions_to_insert)
            await db.execute(stmt)
            await db.commit()
            
            # Clean up temp file
            # os.remove(file_path) # Optional: keep for audit? For now, let's keep it safe.
            
            return [Transaction(**tx) for tx in transactions_to_insert]
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process import: {str(e)}")

    @staticmethod
    def _apply_dynamic_mapping(row: Dict[str, str], mapping: Dict[str, str]) -> Dict[str, Any]:
        """
        Applies mapping: mapping["target_field"] = "source_column"
        """
        try:
            # Essential fields
            date_col = mapping.get("date")
            amount_col = mapping.get("amount")
            desc_col = mapping.get("description")
            
            if not date_col or not amount_col:
                return None # Skip if essential mapping missing
                
            date_str = row.get(date_col)
            amount_str = row.get(amount_col)
            
            if not date_str or not amount_str:
                return None # Skip empty rows
                
            # Parse Date
            try:
                date = datetime.fromisoformat(date_str)
            except ValueError:
                try:
                    date = datetime.strptime(date_str, "%m/%d/%Y")
                except ValueError:
                    try:
                        date = datetime.strptime(date_str, "%Y-%m-%d")
                    except ValueError:
                         return None # Date parse failed

            # Parse Amount
            try:
                amount = Decimal(str(amount_str).replace('$', '').replace(',', ''))
            except (ValueError, TypeError, InvalidOperation):
                 return None

            result = {
                "date": date,
                "amount": amount,
                "description": row.get(desc_col, "Unknown Transaction"),
                "currency": "USD"
            }
            
            # Optional fields
            if "category" in mapping:
                 cat_col = mapping["category"]
                 if cat_col in row:
                     result["category"] = row.get(cat_col)
            
            return result

        except Exception:
            return None

