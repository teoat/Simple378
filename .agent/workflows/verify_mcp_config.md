---
description: Verify Agent Coordination MCP Configuration
---

# Verify MCP Configuration

This workflow verifies that the Agent Coordination MCP server is correctly configured.

1. Check if configuration file exists
// turbo
2. Run the following command to verify config:
   ```bash
   if [ -f ".agent/mcp_config.json" ]; then echo "✅ Config found"; else echo "❌ Config missing"; exit 1; fi
   ```

3. Verify agent-coordination server entry
// turbo
4. Run:
   ```bash
   if grep -q "agent-coordination" ".agent/mcp_config.json"; then echo "✅ Server configured"; else echo "❌ Server not configured"; exit 1; fi
   ```

5. Verify server file exists
// turbo
6. Run:
   ```bash
   if [ -f "mcp-server/dist/agent-coordination.js" ]; then echo "✅ Server file found"; else echo "❌ Server file missing"; exit 1; fi
   ```
