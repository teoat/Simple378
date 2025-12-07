Here are step-by-step instructions for deploying all services to Docker using `docker-compose.prod.yml`:

### **1. Prerequisites**

*   **Docker:** Ensure Docker Desktop (for Windows/macOS) or Docker Engine (for Linux) is installed and running.
*   **Docker Compose:** Ensure Docker Compose is installed. It usually comes bundled with Docker Desktop.
*   **Git:** To clone the project repository.

### **2. Project Setup**

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-repo/Simple378.git # Replace with your actual repository URL
    cd Simple378
    ```
2.  **Create `.env.production` File:**
    *   The `docker-compose.prod.yml` relies on environment variables defined in a `.env.production` file.
    *   Carefully create this file in the root of your project directory (`Simple378/`).
    *   **WARNING:** This file contains sensitive credentials. **DO NOT commit it to version control.**

    ```bash
    # Example content for .env.production
    # Replace placeholder values with your actual, secure credentials.

    # --- Database (PostgreSQL) ---
    POSTGRES_USER=fraud_admin_prod
    POSTGRES_PASSWORD=YourSecurePostgresPassword! # <<<<<< CHANGE THIS to a strong, unique password!
    POSTGRES_DB=fraud_detection_prod

    # --- Redis Cache ---
    REDIS_PASSWORD=YourSecureRedisPassword # <<<<<< CHANGE THIS to a strong, unique password!

    # --- AI Service API Keys ---
    # Obtain these from Anthropic and OpenAI dashboards
    ANTHROPIC_API_KEY=sk-ant-... # <<<<<< REPLACE WITH YOUR ANTHROPIC API KEY
    OPENAI_API_KEY=sk-... # <<<<<< REPLACE WITH YOUR OPENAI API KEY

    # --- MeiliSearch ---
    MEILISEARCH_API_KEY=YourSecureMeiliSearchAPIKey # <<<<<< CHANGE THIS to a strong, unique API key!

    # --- Backend Secret Key ---
    # Used for JWTs and other security features. Must be a long, random, unique string (e.g., 32+ chars)
    SECRET_KEY=a_very_long_and_random_string_of_at_least_32_characters_for_production_security # <<<<<< CHANGE THIS to a strong, unique secret key!

    # --- CORS Configuration ---
    # Comma-separated list of allowed origins (e.g., https://your-domain.com,https://another-domain.com)
    CORS_ORIGINS=https://your-production-domain.com # <<<<<< CHANGE THIS to your actual production domain!

    # --- Frontend API URL ---
    # This should point to your Nginx proxy for the backend API
    API_URL=https://your-production-domain.com/api/v1 # <<<<<< CHANGE THIS to your actual production domain!
    API_WS_URL=wss://your-production-domain.com/ws # <<<<<< CHANGE THIS to your actual production domain!

    # --- Other Backend Settings ---
    LOG_LEVEL=INFO 
    DB_ECHO=false # Set to false in production

    # --- Qdrant (Vector DB) ---
    QDRANT_URL=http://vector_db:6333 # Internal Docker Compose service name, usually no API key for local Docker Compose
    ```
3.  **Prepare Nginx SSL Certificates:**
    *   The `nginx` service in `docker-compose.prod.yml` expects SSL certificates to be mounted from `./nginx/ssl`.
    *   Place your SSL certificate (`fullchain.pem` or similar) and private key (`privkey.pem` or similar) inside the `Simple378/nginx/ssl/` directory.
    *   Ensure your `nginx.conf` is updated to reference these files correctly.

### **3. Database Migrations (Critical Step!)**

Before starting the application services, you **must** run database migrations to set up the database schema.

1.  **Start only the `db` service temporarily:**
    ```bash
    docker compose -f docker-compose.prod.yml up db -d
    ```
2.  **Wait for the database to be ready:** Give it a minute or two. You can check logs: `docker compose -f docker-compose.prod.yml logs db`
3.  **Run Migrations:**
    *   You'll need a way to run `alembic upgrade head`. The easiest way is to run a temporary container based on your `backend` image.
    *   **Option A (Recommended: Temporary container for migrations):**
        ```bash
        # Ensure your backend image is built locally or pulled
        docker compose -f docker-compose.prod.yml build backend

        # Run migrations using the backend image, connecting to the db service
        docker run --rm \
          --network Simple378_fraud_net \
          -e DATABASE_URL="postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}" \
          -e REDIS_URL="redis://cache:6379/0" \
          -e SECRET_KEY="dummy_key_for_migration_only" \
          -e LOG_LEVEL="INFO" \
          -v "$(pwd)/backend:/app" \
          ${DOCKERHUB_USERNAME}/fraud-detection-backend:latest \
          bash -c "poetry run alembic upgrade head"
        # NOTE: Replace ${POSTGRES_USER}, ${POSTGRES_PASSWORD}, ${POSTGRES_DB} with values from your .env.production
        # Replace ${DOCKERHUB_USERNAME}/fraud-detection-backend:latest with the actual image name from your CI/CD if applicable
        ```
    *   **Option B (Custom `init` container - more robust but requires `docker-compose.prod.yml` modification):**
        *   This would involve adding a separate service to `docker-compose.prod.yml` that runs migrations and exits, making it a dependency of the `backend` service. (Not implemented in `docker-compose.prod.yml` currently).
4.  **Stop the temporary `db` service:**
    ```bash
    docker compose -f docker-compose.prod.yml stop db
    ```
    (It will be started again with all services).

### **4. Build and Run All Services**

Once `db` is migrated:

1.  **Build and Start All Services:**
    ```bash
    docker compose -f docker-compose.prod.yml up --build -d
    ```
    *   `--build`: Rebuilds service images (backend, mcp-server, frontend) from their Dockerfiles. This ensures you have the latest code.
    *   `-d`: Runs containers in detached mode (in the background).

### **5. Access the Application**

*   The frontend (served by Nginx) will be available at `http://localhost` or `https://localhost` (if you've configured HTTPS in Nginx and your `/etc/hosts` or DNS is set up) or your configured domain.
*   Backend API will be proxied through Nginx.
*   Jaeger UI (for tracing) should be accessible at `http://localhost:16686`.

### **6. Post-Deployment Checks**

*   **Check Service Status:**
    ```bash
    docker compose -f docker-compose.prod.yml ps
    ```
    All services should be `Up` and healthy.
*   **View Logs:**
    ```bash
    docker compose -f docker-compose.prod.yml logs -f
    ```
    Monitor logs for any errors or warnings.
*   **Access Health Endpoints:**
    *   Backend: `curl -k https://localhost/api/v1/health` (assuming Nginx is forwarding)
    *   Frontend: Access your domain in a web browser.
*   **Test Functionality:** Log in, perform key actions, and verify the application behaves as expected.

### **7. Troubleshooting Common Issues**

*   **Containers not starting:** Check `docker compose -f docker-compose.prod.yml logs <service_name>`.
*   **"Permission denied" errors:** Ensure correct file permissions on mounted volumes (e.g., `./nginx/ssl`).
*   **Database connection issues:** Verify `DATABASE_URL` in `.env.production` and check `db` service logs.
*   **Nginx issues:** Check `nginx` service logs for configuration errors or proxying problems.
*   **SSL errors:** Double-check your SSL certificate paths and Nginx configuration.
