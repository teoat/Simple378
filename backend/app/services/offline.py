import sqlite3
import os
from cryptography.fernet import Fernet
from typing import Dict, Any


class OfflineStorageService:
    def __init__(self, storage_path: str = "offline_storage"):
        self.storage_path = storage_path
        os.makedirs(self.storage_path, exist_ok=True)

    def _get_db_path(self, case_id: str) -> str:
        return os.path.join(self.storage_path, f"case_{case_id}.db")

    async def export_case_to_sqlite(
        self, case_id: str, case_data: Dict[str, Any]
    ) -> str:
        """
        Exports case data to a local SQLite file.
        Returns the path to the created database file.
        """
        db_path = self._get_db_path(case_id)

        # Remove existing if any
        if os.path.exists(db_path):
            os.remove(db_path)

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Create tables
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS case_metadata (
                id TEXT PRIMARY KEY,
                title TEXT,
                description TEXT,
                status TEXT
            )
        """
        )

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS evidence (
                id TEXT PRIMARY KEY,
                filename TEXT,
                metadata TEXT
            )
        """
        )

        # Insert data (Simplified for MVP)
        cursor.execute(
            "INSERT INTO case_metadata (id, title, description, status) VALUES (?, ?, ?, ?)",
            (
                case_data["id"],
                case_data.get("title"),
                case_data.get("description"),
                case_data.get("status"),
            ),
        )

        conn.commit()
        conn.close()

        return db_path

    async def encrypt_archive(
        self, file_path: str, key: bytes = None
    ) -> tuple[str, bytes]:
        """
        Encrypts the given file using AES (Fernet).
        Returns the path to the encrypted file and the key used.
        """
        if key is None:
            key = Fernet.generate_key()

        fernet = Fernet(key)

        with open(file_path, "rb") as file:
            original_data = file.read()

        encrypted_data = fernet.encrypt(original_data)

        encrypted_path = f"{file_path}.enc"
        with open(encrypted_path, "wb") as file:
            file.write(encrypted_data)

        # Clean up original unencrypted file
        if os.path.exists(file_path):
            os.remove(file_path)

        return encrypted_path, key

    async def export_case(self, case_data: Dict[str, Any]) -> bytes:
        """
        Complete export workflow: create SQLite, encrypt, return encrypted bytes.
        """
        case_id = case_data["id"]

        # Export to SQLite
        db_path = await self.export_case_to_sqlite(case_id, case_data)

        # Encrypt the database
        encrypted_path, key = await self.encrypt_archive(db_path)

        # Read encrypted file
        with open(encrypted_path, "rb") as f:
            encrypted_data = f.read()

        # Clean up encrypted file
        if os.path.exists(encrypted_path):
            os.remove(encrypted_path)

        # Return both encrypted data and the key
        return encrypted_data, key
