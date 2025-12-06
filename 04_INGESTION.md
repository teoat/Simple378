# Forensics & Ingestion Page

**Route:** `/forensics`  
**Component:** `src/pages/Forensics.tsx`  
**Status:** ✅ Implemented

---

## Overview

The Forensics page provides a comprehensive interface for uploading, analyzing, and processing documents for fraud investigation. It features a multi-stage processing pipeline, OCR capabilities, metadata extraction, and forensic analysis.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Header: "Forensics & Ingestion"        [📊 CSV Import]     │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │     📁 Drop files here or click to browse              │ │
│  │     Supported: PDF, DOCX, XLSX, PNG, JPG, TIFF        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Processing Pipeline                                        │
│  ┌────┐ ┌────┐ ┌────┐ ┌────────┐ ┌─────────┐ ┌─────┐      │
│  │Upld│→│Scan│→│OCR │→│Metadata│→│Forensics│→│Index│      │
│  │ ✅ │ │ ✅ │ │ 🔄 │ │   ⏳   │ │    ⏳   │ │  ⏳ │      │
│  └────┘ └────┘ └────┘ └────────┘ └─────────┘ └─────┘      │
│                                                             │
│  Analysis Results                                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📋 Metadata              ⚠️ Forensic Flags            │ │
│  │ Author: John Doe         🔴 Modification detected     │ │
│  │ Pages: 3                 🟠 Inconsistent fonts        │ │
│  │ Created: Dec 1, 2025     🟡 Embedded JS found         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Upload History                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📄 Invoice_Dec2025.pdf  2.1MB  Dec 6  ✅ Complete     │ │
│  │ 📄 Contract_v2.docx     850KB  Dec 5  ✅ Complete     │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Components

| Component | Description |
|-----------|-------------|
| `UploadZone` | Drag-and-drop file upload area |
| `ProcessingPipeline` | Visual stages: Upload → Scan → OCR → Metadata → Forensics → Index |
| `ForensicResults` | Display of analysis findings |
| `UploadHistory` | List of previously uploaded files |
| `CSVWizard` | Modal wizard for CSV column mapping |

---

## Features

### File Upload
- Multi-file upload support
- Drag-and-drop interface
- Real-time upload progress
- File type validation

### Processing Pipeline
| Stage | Description |
|-------|-------------|
| Upload | File transfer |
| Virus Scan | ClamAV malware detection |
| OCR | Text extraction (Tesseract) |
| Metadata | EXIF/XMP extraction |
| Forensics | Manipulation detection |
| Indexing | Full-text search indexing |

### Forensic Flags
| Severity | Description |
|----------|-------------|
| 🔴 Critical | Strong evidence of tampering |
| 🟠 Warning | Potential anomaly detected |
| 🟡 Info | Notable but not suspicious |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ingestion/upload` | Upload file |
| GET | `/api/v1/ingestion/:id` | Get processing status |
| GET | `/api/v1/ingestion/history` | Get upload history |
| POST | `/api/v1/ingestion/csv-import` | Import CSV data |

---

## Related Files

```
frontend/src/
├── pages/Forensics.tsx
└── components/ingestion/
    ├── UploadZone.tsx
    ├── ProcessingPipeline.tsx
    ├── ForensicResults.tsx
    ├── UploadHistory.tsx
    └── CSVWizard.tsx
```

---

## Future Enhancements

- [ ] Batch upload queue
- [ ] Video/audio analysis
- [ ] ML-based anomaly detection
- [ ] Document comparison view
- [ ] Cloud storage connectors
