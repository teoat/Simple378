# SSL Certificate Setup

## For Development (Self-Signed)

Generate self-signed certificates for local development:

```bash
mkdir -p nginx/ssl
cd nginx/ssl

# Generate private key
openssl genrsa -out key.pem 2048

# Generate certificate (valid for 365 days)
openssl req -new -x509 -key key.pem -out cert.pem -days 365 \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## For Production (Let's Encrypt)

### Using Certbot

1. Install Certbot:
```bash
sudo apt-get update
sudo apt-get install certbot
```

2. Generate certificates:
```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

3. Copy certificates to nginx/ssl directory:
```bash
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
```

4. Set up auto-renewal:
```bash
sudo certbot renew --dry-run
```

### Using Docker with Certbot

Add to `docker-compose.prod.yml`:

```yaml
  certbot:
    image: certbot/certbot
    container_name: fraud_certbot
    volumes:
      - ./nginx/ssl:/etc/letsencrypt
      - ./nginx/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

Then run:
```bash
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d yourdomain.com -d www.yourdomain.com \
  --email your-email@example.com --agree-tos --no-eff-email
```

## Update Nginx Configuration

After obtaining certificates, update the paths in `nginx/nginx.conf`:

```nginx
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
```

## Test SSL Configuration

```bash
# Test SSL configuration
openssl s_client -connect localhost:443 -servername localhost

# Check certificate
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Verify SSL with online tools
# https://www.ssllabs.com/ssltest/
```

## Security Best Practices

1. **Certificate Permissions**: Ensure private keys have restricted permissions
   ```bash
   chmod 600 nginx/ssl/key.pem
   chmod 644 nginx/ssl/cert.pem
   ```

2. **Regular Renewal**: Certificates expire, set up automatic renewal

3. **Strong Ciphers**: Use only TLS 1.2 and 1.3 (already configured in nginx.conf)

4. **HSTS**: HTTP Strict Transport Security is enabled (already configured)

5. **Certificate Pinning**: Consider implementing for additional security
