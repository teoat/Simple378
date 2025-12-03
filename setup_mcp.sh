#!/bin/bash

# Setup MCP Servers

# Add Node.js to PATH
export PATH="/usr/local/Cellar/node/25.2.1/bin:$PATH"

echo "Starting MCP Server Setup..."
echo "Using Node: $(which node)"
echo "Using NPM: $(which npm)"
echo "Using NPX: $(which npx)"

# 1. Verify Local Agent Coordination Server
echo "Verifying Agent Coordination Server..."
if [ -f "mcp-server/dist/index.js" ]; then
  echo "Agent Coordination Server found at mcp-server/dist/index.js"
else
  echo "Error: Agent Coordination Server not found."
fi

# 2. Verify NPX
echo "Verifying NPX..."
npx --yes cowsay "NPX is working"
if [ $? -eq 0 ]; then
  echo "NPX verification successful."
else
  echo "Error: NPX verification failed."
fi

# 3. Pre-cache NPX packages
echo "Pre-caching NPX packages..."

packages=(
  "@modelcontextprotocol/server-filesystem"
  "@modelcontextprotocol/server-redis"
  "@wkronmiller/prometheus-mcp-server"
  "@modelcontextprotocol/server-postgres"
  "@modelcontextprotocol/server-puppeteer"
  "@modelcontextprotocol/server-memory"
  "@upstash/context7-mcp"
  "@modelcontextprotocol/server-sequential-thinking"
  "@modelcontextprotocol/server-brave-search"
  "@modelcontextprotocol/server-github"
  "@modelcontextprotocol/server-git"
)

for pkg in "${packages[@]}"; do
  echo "Caching $pkg..."
  # We use --help to trigger the download without starting the server
  npx --yes "$pkg" --help > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "Successfully cached $pkg"
  else
    echo "Warning: Failed to cache $pkg (or it doesn't support --help)"
  fi
done

echo "MCP Server Setup Complete."
