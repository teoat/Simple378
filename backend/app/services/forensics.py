import json
import subprocess
import tempfile
import os
import logging
from typing import Dict, Any, Optional

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

    async def analyze_document(self, file_path: str) -> Dict[str, Any]:
        """
        Orchestrates the forensic analysis of a document.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        metadata = await self.extract_metadata(file_path)
        manipulation_score = await self.detect_manipulation(file_path)
        
        file_type = "unknown"
        if magic:
            file_type = magic.from_file(file_path, mime=True)

        return {
            "file_path": file_path,
            "file_type": file_type,
            "metadata": metadata,
            "manipulation_analysis": manipulation_score,
            "summary": self._generate_summary(metadata, manipulation_score)
        }

    async def extract_metadata(self, file_path: str) -> Dict[str, Any]:
        """
        Extracts metadata using ExifTool.
        """
        try:
            # Run exiftool as a subprocess
            process = subprocess.Popen(
                [self.exiftool_path, "-j", file_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            stdout, stderr = process.communicate()

            if process.returncode != 0:
                logger.error(f"ExifTool failed: {stderr.decode()}")
                return {"error": "Failed to extract metadata"}

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
            if not self._is_image(file_path):
                return {"status": "skipped", "reason": "Not an image file"}

            # 1. Error Level Analysis (ELA)
            ela_score = self._calculate_ela_score(file_path)
            
            # 2. Metadata Consistency Check (Placeholder)
            # In a real implementation, we would check if Software tag exists in metadata
            
            return {
                "ela_score": ela_score,
                "is_suspicious": ela_score > 0.5,  # Threshold
                "details": "High ELA score indicates potential manipulation or resaving."
            }

        except Exception as e:
            logger.error(f"Error in manipulation detection: {str(e)}")
            return {"error": str(e)}

    def _is_image(self, file_path: str) -> bool:
        if magic:
            mime = magic.from_file(file_path, mime=True)
            return mime.startswith("image/")
        return file_path.lower().endswith(('.jpg', '.jpeg', '.png', '.tiff'))

    def _calculate_ela_score(self, file_path: str) -> float:
        """
        Calculates a simple ELA score.
        Resaves the image at 90% quality and compares the difference.
        Returns a score between 0.0 and 1.0.
        """
        try:
            original = cv2.imread(file_path)
            if original is None:
                return 0.0

            # Create a temp file for the resaved image
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                tmp_path = tmp.name

            # Resave with 90% quality
            cv2.imwrite(tmp_path, original, [cv2.IMWRITE_JPEG_QUALITY, 90])
            
            # Read back
            resaved = cv2.imread(tmp_path)
            
            # Calculate absolute difference
            diff = cv2.absdiff(original, resaved)
            
            # Calculate mean difference intensity
            score = np.mean(diff) / 255.0
            
            # Cleanup
            os.remove(tmp_path)
            
            # Normalize score (heuristic)
            # A raw score of 0.1 is actually quite high for ELA difference
            normalized_score = min(score * 10, 1.0)
            
            return float(normalized_score)

        except Exception:
            return 0.0

    def _generate_summary(self, metadata: Dict, manipulation: Dict) -> str:
        summary = []
        
        # Check for software traces
        software = metadata.get("Software", "")
        if "Photoshop" in software or "GIMP" in software:
            summary.append(f"Warning: Image edited with {software}.")
            
        # Check GPS
        if "GPSLatitude" in metadata:
            summary.append("GPS data found.")
        else:
            summary.append("No GPS data.")
            
        # Check Manipulation
        if manipulation.get("is_suspicious"):
            summary.append("Potential manipulation detected (High ELA score).")
            
        return " ".join(summary)
