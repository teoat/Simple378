#!/usr/bin/env python3
"""
Database Initialization Script for AntiGravity Fraud Detection System
Creates the basic database schema for the minimal backend
"""

import os
import psycopg2
from psycopg2.extras import execute_values

def init_database():
    """Initialize the database with basic schema"""

    # Database connection parameters
    db_params = {
        'host': 'simple378-db-1',
        'database': 'fraud_detection',
        'user': 'fraud_admin',
        'password': 'secure_fraud_db_password_2024_strong',
        'port': '5432'
    }

    try:
        print("🔌 Connecting to database...")
        conn = psycopg2.connect(**db_params)
        conn.autocommit = True
        cursor = conn.cursor()

        print("✅ Connected successfully")

        # Create basic tables
        print("📋 Creating database schema...")

        # Cases table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cases (
                id VARCHAR(50) PRIMARY KEY,
                subject_name VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                risk_score INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                assigned_to VARCHAR(255)
            );
        """)

        # Case details table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS case_details (
                id SERIAL PRIMARY KEY,
                case_id VARCHAR(50) REFERENCES cases(id),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(50) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'analyst',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        print("✅ Tables created successfully")

        # Insert sample data
        print("📝 Inserting sample data...")

        # Sample cases
        cases_data = [
            ('case-001', 'John Doe', 'active', 75, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z', 'analyst1'),
            ('case-002', 'Jane Smith', 'pending', 45, '2024-01-02T00:00:00Z', '2024-01-02T00:00:00Z', 'analyst2'),
            ('case-003', 'Bob Johnson', 'closed', 25, '2024-01-03T00:00:00Z', '2024-01-03T00:00:00Z', 'analyst1'),
        ]

        execute_values(cursor,
            "INSERT INTO cases (id, subject_name, status, risk_score, created_at, updated_at, assigned_to) VALUES %s ON CONFLICT (id) DO NOTHING",
            cases_data
        )

        # Sample users
        users_data = [
            ('user-001', 'test@example.com', 'Test User', 'analyst'),
            ('user-002', 'admin@example.com', 'Admin User', 'admin'),
        ]

        execute_values(cursor,
            "INSERT INTO users (id, email, name, role) VALUES %s ON CONFLICT (id) DO NOTHING",
            users_data
        )

        # Sample case details
        cursor.execute("""
            INSERT INTO case_details (case_id, description) VALUES
            ('case-001', 'High-risk transaction pattern detected'),
            ('case-002', 'Suspicious account activity under review'),
            ('case-003', 'Case resolved - no fraud detected')
            ON CONFLICT DO NOTHING
        """)

        print("✅ Sample data inserted")

        # Create indexes for performance
        print("🔍 Creating indexes...")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_cases_risk_score ON cases(risk_score);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")

        print("✅ Indexes created")

        # Verify data
        cursor.execute("SELECT COUNT(*) FROM cases;")
        case_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM users;")
        user_count = cursor.fetchone()[0]

        print(f"📊 Database initialized: {case_count} cases, {user_count} users")

        cursor.close()
        conn.close()

        print("🎉 Database initialization complete!")
        return True

    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

if __name__ == "__main__":
    success = init_database()
    exit(0 if success else 1)