# 🔧 Troubleshooting Guide

> Common issues and solutions for Simple378

---

## Quick Diagnostics

```bash
# Check all services
docker-compose ps

# View logs
docker-compose logs -f

# Backend health
curl http://localhost:8000/health

# Database connection
docker exec simple378-postgres pg_isready
```

---

## Common Issues

### 🔴 Cannot Login

**Symptoms:**
- "Invalid credentials" error
- "Failed to fetch" error
- Infinite loading

**Solutions:**

1. **Check backend is running:**
   ```bash
   docker-compose ps backend
   docker-compose logs backend | tail -50
   ```

2. **Check database connection:**
   ```bash
   docker exec simple378-backend python -c "from app.core.database import engine; print('OK')"
   ```

3. **Verify user exists:**
   ```sql
   SELECT email, is_active FROM users WHERE email = 'admin@example.com';
   ```

4. **Reset password:**
   ```bash
   docker exec simple378-backend python scripts/reset_password.py admin@example.com newpassword
   ```

---

### 🔴 Frontend Not Loading

**Symptoms:**
- White screen
- 404 errors
- CSS not loading

**Solutions:**

1. **Check frontend container:**
   ```bash
   docker-compose logs frontend
   ```

2. **Rebuild frontend:**
   ```bash
   docker-compose up -d --build frontend
   ```

3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

4. **Check Nginx config:**
   ```bash
   nginx -t
   ```

---

### 🔴 Database Connection Failed

**Symptoms:**
- "Connection refused" error
- Backend crashes on startup

**Solutions:**

1. **Check PostgreSQL is running:**
   ```bash
   docker-compose ps postgres
   docker-compose logs postgres
   ```

2. **Verify connection string:**
   ```bash
   echo $DATABASE_URL
   ```

3. **Test connection:**
   ```bash
   docker exec simple378-postgres psql -U postgres -d simple378 -c "SELECT 1"
   ```

4. **Restart PostgreSQL:**
   ```bash
   docker-compose restart postgres
   ```

---

### 🔴 Redis Connection Failed

**Symptoms:**
- WebSocket not connecting
- Session errors
- Queue not processing

**Solutions:**

1. **Check Redis is running:**
   ```bash
   docker exec simple378-redis redis-cli ping
   ```

2. **Check memory:**
   ```bash
   docker exec simple378-redis redis-cli info memory
   ```

3. **Clear Redis (if needed):**
   ```bash
   docker exec simple378-redis redis-cli FLUSHALL
   ```

---

### 🔴 File Upload Failing

**Symptoms:**
- "File too large" error
- Upload hangs
- 413 error

**Solutions:**

1. **Check file size limit:**
   - Nginx: `client_max_body_size`
   - Backend: `MAX_FILE_SIZE_MB` env var

2. **Check disk space:**
   ```bash
   df -h
   ```

3. **Check upload directory permissions:**
   ```bash
   ls -la /app/uploads
   ```

---

### 🔴 Slow Performance

**Symptoms:**
- Pages take >3 seconds to load
- API requests timeout
- High CPU/memory

**Solutions:**

1. **Check resource usage:**
   ```bash
   docker stats
   ```

2. **Check slow queries:**
   ```sql
   SELECT query, calls, mean_time 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

3. **Add database indexes:**
   ```sql
   CREATE INDEX CONCURRENTLY idx_cases_status ON cases(status);
   ```

4. **Increase resources:**
   ```yaml
   # docker-compose.yml
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 2G
   ```

---

### 🔴 WebSocket Disconnecting

**Symptoms:**
- Real-time updates not working
- Frequent reconnection messages
- "Connection closed" errors

**Solutions:**

1. **Check WebSocket endpoint:**
   ```bash
   wscat -c ws://localhost:8000/ws
   ```

2. **Check Nginx WebSocket config:**
   ```nginx
   location /ws {
       proxy_pass http://backend;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
       proxy_read_timeout 86400;
   }
   ```

3. **Check for proxy timeouts:**
   - Increase `proxy_read_timeout`

---

### 🔴 AI/LLM Not Working

**Symptoms:**
- Frenly AI not responding
- "API key invalid" error
- Analysis failing

**Solutions:**

1. **Check API key:**
   ```bash
   echo $OPENAI_API_KEY | head -c 10
   ```

2. **Test API connection:**
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

3. **Check rate limits:**
   - OpenAI dashboard for usage

---

## Log Analysis

### View Recent Errors

```bash
docker-compose logs --since "1h" | grep -i error
```

### Export Logs

```bash
docker-compose logs > logs_$(date +%Y%m%d).txt
```

### Follow Specific Service

```bash
docker-compose logs -f backend
```

---

## Recovery Procedures

### Full System Restart

```bash
docker-compose down
docker-compose up -d
```

### Database Restore

```bash
# Stop application
docker-compose stop backend

# Restore backup
docker exec -i simple378-postgres psql -U postgres simple378 < backup.sql

# Restart
docker-compose start backend
```

### Factory Reset (⚠️ Deletes Data)

```bash
docker-compose down -v
docker-compose up -d
docker-compose exec backend alembic upgrade head
docker-compose exec backend python scripts/seed_data.py
```

---

## Getting Help

1. **Check documentation:** This guide and related docs
2. **Search issues:** GitHub Issues for similar problems
3. **Create issue:** With logs and reproduction steps
4. **Contact support:** support@simple378.io

---

## Related

- [Deployment](./DEPLOYMENT.md)
- [Monitoring](./MONITORING.md)
