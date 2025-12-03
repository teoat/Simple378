# Encryption Key Management

## Current Implementation

### Offline Export Encryption
The `OfflineStorageService` in [`offline.py`](file:///Users/Arief/Desktop/Simple378/backend/app/services/offline.py) generates AES-256 encryption keys using Fernet to encrypt case data exports.

**Current Behavior** (MVP):
- A unique encryption key is generated for each export
- The key is **not** currently stored or returned to the user
- Encrypted data is returned as bytes

## TODO: Production Key Management

### Options for Secure Key Storage

#### 1. Return Key to User (Recommended for MVP)
```python
# Modify export_case() to return both encrypted data and key
return {
    "encrypted_data": encrypted_data,
    "encryption_key": key.decode('utf-8'),
    "instructions": "Store this key securely. It cannot be recovered."
}
```

**Pros**: Simple, user controls key
**Cons**: User responsible for key storage

#### 2. Store in Database (with User's Master Key)
```python
# Store encrypted with user's master password/key
encrypted_export_key = encrypt_with_user_master_key(key, user_id)
await db.execute(
    "INSERT INTO encryption_keys (case_id, encrypted_key) VALUES ($1, $2)",
    case_id, encrypted_export_key
)
```

**Pros**: User can recover exports
**Cons**: Requires additional master key management

#### 3. HSM/Key Management Service (Production)
- Use AWS KMS, Azure Key Vault, or HashiCorp Vault
- Keys stored in hardwaresecurity module
- API calls to encrypt/decrypt

**Pros**: Enterprise-grade security
**Cons**: Additional infrastructure

## Recommended Implementation

For production:
1. **Return key in API response** with clear warnings
2. **Store key hash** (not actual key) in database for audit
3. **Log key access** in chain of custody

```python
# Enhanced export endpoint
@router.post("/{analysis_id}/export-offline")
async def export_offline_package(...):
    offline_service = OfflineStorageService()
    encrypted_data, encryption_key = await offline_service.export_case_with_key(case_data)
    
    # Log in chain of custody
    custody_entry = ChainOfCustodyService.create_custody_entry(
        actor_id=current_user.id,
        action="exported_offline",
        resource_id=analysis_id,
        resource_type="case",
        evidence_hash=ChainOfCustodyService.generate_hash(encryption_key)
    )
    
    return {
        "encrypted_data": encrypted_data.hex(),
        "encryption_key": encryption_key.decode(),
        "warning": "Store this key securely. Without it, the encrypted data cannot be decrypted."
    }
```

## Migration Path
1. Update `OfflineStorageService.export_case()` to return key
2. Update API endpoint to include key in response
3. Add encryption key hash to chain of custody
4. Document key storage procedures for users
