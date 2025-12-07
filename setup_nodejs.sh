#!/bin/bash
# Node.js Installation Guide for macOS
# Created: 2025-12-07

echo "=================================================="
echo "Node.js Installation Guide for Simple378"
echo "=================================================="
echo ""

# Check if Node.js is already installed
if command -v node &> /dev/null; then
    echo "✅ Node.js is already installed!"
    node --version
    npm --version
    echo ""
    echo "You can skip to Step 2 in the installation guide."
    exit 0
fi

echo "❌ Node.js is not installed."
echo ""
echo "Please choose an installation method:"
echo ""
echo "OPTION 1: Install via Official Installer (RECOMMENDED)"
echo "  1. Visit: https://nodejs.org/"
echo "  2. Download the LTS version (Long Term Support)"
echo "  3. Run the .pkg installer"
echo "  4. Follow the installation wizard"
echo "  5. Restart your terminal"
echo "  6. Run: node --version"
echo ""
echo "OPTION 2: Install Homebrew first, then Node.js"
echo "  1. Install Homebrew:"
echo "     /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
echo "  2. Then install Node.js:"
echo "     brew install node"
echo ""
echo "OPTION 3: Install via NVM (Node Version Manager)"
echo "  1. Install NVM:"
echo "     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
echo "  2. Restart terminal, then:"
echo "     nvm install --lts"
echo "     nvm use --lts"
echo ""
echo "=================================================="
echo "After installing Node.js, run this to verify:"
echo "  node --version"
echo "  npm --version"
echo ""
echo "Then proceed to the next setup script:"
echo "  cd /Users/Arief/Desktop/Simple378"
echo "  ./setup_frontend.sh"
echo "=================================================="
