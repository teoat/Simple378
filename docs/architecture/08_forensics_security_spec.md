# Deep Dive: Forensics & Evidence Security

## 1. Overview
This document defines the security architecture for the **Forensics Service** (Phase 2/5). This service handles the ingestion, storage, and analysis of sensitive documents (bank statements, IDs, contracts). Strict adherence to **Chain of Custody** and **Data Privacy** is mandatory.

## 2. Storage Architecture

### 2.1 Encryption at Rest
All uploaded files MUST be encrypted before being written to disk.
- **Algorithm:** AES-256-GCM.
- **Key Management:**
    - Master Key stored in environment variable (or AWS KMS / HashiCorp Vault in prod).
    - Unique Data Encryption Key (DEK) per file, wrapped with Master Key.
- **Implementation:** Use Python `cryptography.fernet` or `streaming-encryption` libraries.

### 2.2 Directory Structure
```
 /storage
   /encrypted
     /{case_id}
       /{file_hash}.enc  <-- The encrypted blob
   /metadata
     /{file_hash}.json   <-- Metadata (uploader, timestamp, original_name)
```

## 3. Chain of Custody (Audit Trail)
Every action on a file is logged to an immutable `AuditLog` table.

| Event | Data Logged |
| :--- | :--- |
| **Upload** | UserID, Timestamp, IP, SHA-256 Hash of original file. |
| **Access** | UserID, Timestamp, Reason for access. |
| **Deletion** | UserID, Timestamp, ApprovalID (Deletion requires 2-person rule). |

**Hashing:** The SHA-256 hash of the *original* file is calculated immediately upon upload and stored. This allows us to prove later that the file has not been tampered with.

## 4. PII Scrubbing Pipeline
When a document is processed for OCR or analysis, PII must be redacted unless explicitly authorized.

1.  **Text Extraction:** OCR (Tesseract) extracts raw text.
2.  **PII Detection:** Use Microsoft Presidio or Regex to identify:
    - SSNs / Tax IDs
    - Credit Card Numbers
    - Emails / Phones
3.  **Redaction:** Replace PII with tokens (e.g., `[SSN-REDACTED]`) in the *analysis* view. The original file remains untouched (encrypted).

## 5. Access Control
- **Role-Based:** Only users with `Forensics_Viewer` role can decrypt and view files.
- **Time-Bound:** Access links (Presigned URLs) expire after 15 minutes.
- **Watermarking:** (Optional) Overlay "CONFIDENTIAL - {UserEmail}" on viewed images to deter leaks.