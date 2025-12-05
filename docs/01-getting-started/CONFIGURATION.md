# ⚙️ Configuration Guide

> Environment variables and settings for Simple378

---

## Environment Variables

### Core Settings

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` | ✅ |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` | ✅ |
| `SECRET_KEY` | JWT signing key | - | ✅ |
| `DEBUG` | Enable debug mode | `false` | ❌ |

### Authentication

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_ALGORITHM` | Token algorithm | `HS256` | ❌ |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `30` | ❌ |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime | `7` | ❌ |

### AI & ML

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key | - | ✅ |
| `OPENAI_MODEL` | Model to use | `gpt-4` | ❌ |
| `QDRANT_URL` | Vector database | `http://localhost:6333` | ❌ |

### Security

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CORS_ORIGINS` | Allowed origins | `http://localhost:5173` | ❌ |
| `RATE_LIMIT_PER_MINUTE` | API rate limit | `100` | ❌ |
| `MAX_FILE_SIZE_MB` | Upload limit | `50` | ❌ |

---

## Sample .env File

```env
# ===================
# DATABASE
# ===================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/simple378
REDIS_URL=redis://localhost:6379

# ===================
# SECURITY
# ===================
SECRET_KEY=your-super-secret-key-at-least-32-characters
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ===================
# AI SERVICES
# ===================
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4

# ===================
# APPLICATION
# ===================
DEBUG=true
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# ===================
# FILE HANDLING
# ===================
MAX_FILE_SIZE_MB=50
ALLOWED_FILE_TYPES=pdf,csv,xlsx,jpg,png
```

---

## Frontend Configuration

### vite.config.ts

```typescript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### Environment Variables

Create `.env.local` in frontend directory:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

---

## Backend Configuration

### app/core/config.py

Key configuration is loaded from environment variables using Pydantic Settings:

```python
class Settings(BaseSettings):
    database_url: str
    redis_url: str
    secret_key: str
    debug: bool = False
    
    class Config:
        env_file = ".env"
```

---

## Fraud Detection Settings

Configure fraud detection thresholds in the database or via admin panel:

| Setting | Description | Default |
|---------|-------------|---------|
| `MIRRORING_THRESHOLD` | % for mirroring detection | `95%` |
| `VELOCITY_WINDOW_HOURS` | Time window for velocity | `24` |
| `ROUND_TRIP_MAX_DAYS` | Days to check round-trip | `7` |
| `HIGH_RISK_SCORE` | High risk threshold | `80` |
| `CRITICAL_RISK_SCORE` | Critical risk threshold | `95` |

---

## Next Steps

- [User Guide](../03-user-guide/DASHBOARD.md) - Start using the system
- [Deployment](../05-operations/DEPLOYMENT.md) - Production setup
