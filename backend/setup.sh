#!/bin/bash
# Backend Setup Script
# Run this script to install Poetry and set up the backend environment

set -e  # Exit on error

echo "🔧 Backend Setup Script"
echo "======================="

# Check Python version
echo "→ Checking Python installation..."
python3 --version

# Install Poetry
echo ""
echo "→ Installing Poetry..."
if command -v poetry &> /dev/null; then
    echo "✓ Poetry is already installed: $(poetry --version)"
else
    echo "Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
    
    # Add Poetry to PATH (adjust for your shell)
    echo ""
    echo "⚠️  Add Poetry to your PATH:"
    echo 'export PATH="$HOME/.local/bin:$PATH"'
    echo ""
    echo "Run: source ~/.zshrc  # or source ~/.bashrc"
fi

# Navigate to backend
cd backend

# Install dependencies
echo ""
echo "→ Installing backend dependencies..."
poetry install

# Verify installation
echo ""
echo "→ Verifying installation..."
poetry run python --version

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "To start the backend server:"
echo "  cd backend"
echo "  poetry run uvicorn app.main:app --reload"
echo ""
echo "API will be available at: http://localhost:8000"
echo "Documentation: http://localhost:8000/api/v1/docs"
