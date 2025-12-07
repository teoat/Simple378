#!/bin/bash

# Test script for Frenly AI integration
# Verifies that the AI automation system can communicate with Frenly AI

echo "🧪 Testing Frenly AI Integration"
echo "================================="

# Check if backend is running
echo "🔍 Checking backend availability..."
if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running - start with: docker compose up -d backend"
    exit 1
fi

# Test Frenly AI chat endpoint
echo "🤖 Testing Frenly AI chat endpoint..."
response=$(curl -s -X POST http://localhost:8000/ai/chat \
    -H "Content-Type: application/json" \
    -d '{
        "message": "Hello Frenly AI! This is a test from the automation system.",
        "persona": "analyst"
    }' \
    --max-time 10)

if [ $? -eq 0 ] && echo "$response" | grep -q "response"; then
    echo "✅ Frenly AI chat endpoint working"
    echo "📝 AI Response preview: $(echo "$response" | jq -r '.response' | head -c 100)..."
else
    echo "❌ Frenly AI chat endpoint failed"
    echo "Response: $response"
fi

# Test Python AI agent
echo "🐍 Testing Python AI agent..."
if command -v python3 &> /dev/null && python3 -c "import requests, json; print('✅ Python dependencies available')"; then
    echo "✅ Python environment ready"
else
    echo "❌ Python environment not ready"
fi

# Test automation script
echo "🔧 Testing automation script..."
if [ -x "./automation.sh" ]; then
    echo "✅ Automation script is executable"
else
    echo "❌ Automation script not executable"
    chmod +x ./automation.sh
    echo "🔧 Made automation script executable"
fi

echo ""
echo "🎉 Integration test complete!"
echo "Run 'python3 ai_agent.py' to start the full AI automation system"</content>
<parameter name="filePath">test_frenly_integration.sh