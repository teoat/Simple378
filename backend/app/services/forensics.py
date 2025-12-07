import json
import os
import logging
import asyncio
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Event

# Configure logger
logger = logging.getLogger(__name__)

try:
    import cv2
    import numpy as np
except ImportError:
    logger.warning("OpenCV not found. Manipulation detection will be limited.")
    cv2 = None
    np = None

try:
    import magic
except ImportError:
    logger.warning("python-magic not found. File type detection will be limited.")
    magic = None


class ForensicsService:
    def __init__(self):
        self.exiftool_path = "exiftool"  # Assumes exiftool is in PATH

    async def scan_file(self, file_path: str) -> bool:
        """
        Scans a file for viruses using ClamAV (Mock implementation).
        In production, integrate with pyclamd or a sidebar process.
        Returns True if safe, False if malicious.
        """
        # Mock Scan: Check for EICAR test string signature in the first 1KB
        try:
            with open(file_path, "rb") as f:
                header = f.read(1024)
                # Standard EICAR string check (partial mock)
                if b"EICAR-STANDARD-ANTIVIRUS-TEST-FILE" in header:
                    logger.warning(f"Virus detected in {file_path}")
                    return False
        except Exception as e:
            logger.error(f"Scan error: {e}")
            # Fail open or closed based on policy? We'll fail open for MVP but log error

        return True

    async def analyze_document(
        self, file_path: str, db: Optional[AsyncSession] = None
    ) -> Dict[str, Any]:
        """
        Orchestrates the forensic analysis of a document.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        # 1. Security Scan
        is_safe = await self.scan_file(file_path)
        if not is_safe:
            raise ValueError("Malicious file detected. Analysis aborted.")

        # Run independent tasks concurrently
        metadata_task = self.extract_metadata(file_path)
        manipulation_task = self.detect_manipulation(file_path)

        metadata, manipulation_score = await asyncio.gather(
            metadata_task, manipulation_task
        )

        file_type = "unknown"
        if magic:
            # Run magic.from_file in a thread as it is blocking
            file_type = await asyncio.to_thread(magic.from_file, file_path, mime=True)

        result = {
            "file_path": file_path,
            "file_type": file_type,
            "metadata": metadata,
            "manipulation_analysis": manipulation_score,
            "summary": self._generate_summary(metadata, manipulation_score),
        }

        # 2. Event Sourcing
        if db:
            try:
                event_id = uuid.uuid4()
                event = Event(
                    id=event_id,
                    aggregate_id=event_id,
                    aggregate_type="document_analysis",
                    event_type="DOCUMENT_ANALYZED",
                    version=1,
                    payload={
                        "filename": os.path.basename(file_path),
                        "file_type": file_type,
                        "is_suspicious": result["manipulation_analysis"].get(
                            "is_suspicious", False
                        ),
                        "summary": result["summary"],
                    },
                    metadata_={"source": "ForensicsService"},
                    created_at=datetime.utcnow(),
                )
                db.add(event)
                await db.commit()
            except Exception as e:
                logger.error(f"Failed to persist event: {e}")

        return result

    async def extract_metadata(self, file_path: str) -> Dict[str, Any]:
        """
        Extracts metadata using ExifTool.
        """
        try:
            # Run exiftool as a subprocess asynchronously
            process = await asyncio.create_subprocess_exec(
                self.exiftool_path,
                "-j",
                file_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                logger.debug(
                    f"ExifTool warning (often benign): {stderr.decode()[:100]}"
                )
                return {}

            # Parse JSON output
            data = json.loads(stdout.decode())
            if isinstance(data, list) and len(data) > 0:
                return data[0]
            return {}

        except Exception as e:
            logger.error(f"Error extracting metadata: {str(e)}")
            return {"error": str(e)}

    async def detect_manipulation(self, file_path: str) -> Dict[str, Any]:
        """
        Performs basic image manipulation detection.
        Currently implements a basic Error Level Analysis (ELA) check.
        """
        if cv2 is None or np is None:
            return {"status": "skipped", "reason": "OpenCV not installed"}

        try:
            # Only analyze images
            if not await self._is_image(file_path):
                return {"status": "skipped", "reason": "Not an image file"}

            # 1. Error Level Analysis (ELA)
            # Run CPU-intensive ELA in a separate thread
            ela_score = await asyncio.to_thread(self._calculate_ela_score, file_path)

            return {
                "ela_score": ela_score,
                "is_suspicious": ela_score > 0.5,  # Threshold
                "details": "High ELA score indicates potential manipulation .",
            }

        except Exception as e:
            logger.error(f"Error in manipulation detection: {str(e)}")
            return {"error": str(e)}

    async def _is_image(self, file_path: str) -> bool:
        if magic:
            mime = await asyncio.to_thread(magic.from_file, file_path, mime=True)
            return mime.startswith("image/")
        return file_path.lower().endswith((".jpg", ".jpeg", ".png", ".tiff"))

    def _calculate_ela_score(self, file_path: str) -> float:
        """
        Calculates a simple ELA score.
        """
        try:
            original = cv2.imread(file_path)
            if original is None:
                return 0.0

            # Use in-memory encoding/decoding to avoid disk I/O
            _, encoded_img = cv2.imencode(
                ".jpg", original, [cv2.IMWRITE_JPEG_QUALITY, 90]
            )
            resaved = cv2.imdecode(encoded_img, cv2.IMREAD_COLOR)
            diff = cv2.absdiff(original, resaved)
            score = np.mean(diff) / 255.0
            normalized_score = min(score * 10, 1.0)

            return float(normalized_score)
        except Exception:
            return 0.0

    def _generate_summary(self, metadata: Dict, manipulation: Dict) -> str:
        summary = []
        software = metadata.get("Software", "")
        if "Photoshop" in software or "GIMP" in software:
            summary.append(f"Warning: Image edited with {software}.")

        if "GPSLatitude" in metadata:
            summary.append("GPS data found.")
        else:
            summary.append("No GPS data.")

        if manipulation.get("is_suspicious"):
            summary.append("Potential manipulation detected (High ELA score).")

        return " ".join(summary)
