# Encryption Key Management

## Current Implementation

### Offline Export Encryption
The `OfflineStorageService` in [`offline.py`](file:///Users/Arief/Desktop/Simple378/backend/app/services/offline.py) generates AES-256 encryption keys using Fernet to encrypt case data exports.

**Current Behavior** (MVP):
- A unique encryption key is generated for each export
- The key is **not** currently stored or returned to the user
- Encrypted data is returned as bytes

## Production Key Management Implementation
(Implemented as of Phase 5)

### Secure Key Delivery Strategy
The system implements **Option 1: Return Key to User**, which places the responsibility of key management on the authorized user while ensuring the server does not retain decryption capabilities for exported data.

### Implementation Details

The `OfflineStorageService` and the export API endpoint have been updated to:
1.  Generate a unique AES-256 key for each export.
2.  Encrypt the case data (SQLite database) with this key.
3.  Return **both** the encrypted data (as hex) and the encryption key to the user in a secure JSON response.
4.  **Discard** the key from the server immediately after the response is sent.

### API Response Format
```json
{
    "encrypted_data": "7b226964223a...",
    "encryption_key": "gAAAAABk...",
    "filename": "case_offline_12345.enc",
    "warning": "Store this key securely. Without it, the encrypted data cannot be decrypted."
}
```

### Security Benefits
*   **Zero Knowledge Storage**: The server does not store the decryption key, meaning even a full database compromise does not expose the contents of offline exports.
*   **User Control**: The authorized analyst has full control over the access to the offline data.
*   **Audit Trail**: The generation of the export is logged in the system audit logs (Chain of Custody).

### User Instructions
Users are instructed to:
1.  Save the `encrypted_data` to a file (e.g., `case_data.enc`).
2.  Store the `encryption_key` in a secure password manager or separate secure location.
3.  Use the provided offline viewer tool (which accepts the key) to decrypt and view the case data.

