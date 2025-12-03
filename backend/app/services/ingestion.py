import csv
import io
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.transaction import Transaction
from uuid import UUID

class IngestionService:
    """
    Service to handle ingestion of transaction files from various banks.
    """
    
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
        decoded_content = file_content.decode("utf-8")
        csv_reader = csv.DictReader(io.StringIO(decoded_content))
        
        transactions = []
        
        for row in csv_reader:
            tx_data = IngestionService._map_row(row, bank_name)
            if tx_data:
                transaction = Transaction(
                    subject_id=subject_id,
                    source_bank=bank_name,
                    source_file_id=filename,
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
                # Let's try to be flexible or define a standard MVP format
                
                # MVP Assumption: We look for standard keys or specific Chase keys
                date_str = row.get("Posting Date") or row.get("Date")
                description = row.get("Description") or row.get("Memo")
                amount_str = row.get("Amount")
                
                if not date_str or not amount_str:
                    return None

                # Parse Date (Assuming MM/DD/YYYY)
                date = datetime.strptime(date_str, "%m/%d/%Y")
                
                # Parse Amount
                amount = float(amount_str)
                
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
                amount = float(amount_str)
                
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
                    
                amount = float(amount_str)
                
                return {
                    "date": date,
                    "description": description,
                    "amount": amount,
                    "currency": "USD"
                }
                
        except Exception as e:
            print(f"Error parsing row: {row} - {e}")
            return None
