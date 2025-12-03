#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { Redis } from "ioredis";
// Configuration
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const COORDINATION_TTL = parseInt(process.env.COORDINATION_TTL || "3600", 10);
// Redis Client
const redis = new Redis(REDIS_URL);
redis.on("error", (err) => {
    // Suppress errors to allow server to start for tool listing even if Redis is down
    // console.error("Redis error:", err.message);
});
// Server Setup
const server = new Server({
    name: "agent-coordination",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Tool Definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            // Coordination Tools
            {
                name: "agent_register",
                description: "Register an agent instance with the coordination server.",
                inputSchema: {
                    type: "object",
                    properties: {
                        agentId: { type: "string" },
                        capabilities: { type: "array", items: { type: "string" } },
                    },
                    required: ["agentId", "capabilities"],
                },
            },
            {
                name: "agent_claim_task",
                description: "Claim a task to prevent other agents from working on it.",
                inputSchema: {
                    type: "object",
                    properties: {
                        agentId: { type: "string" },
                        taskId: { type: "string" },
                    },
                    required: ["agentId", "taskId"],
                },
            },
            {
                name: "agent_lock_file",
                description: "Lock a file for editing.",
                inputSchema: {
                    type: "object",
                    properties: {
                        agentId: { type: "string" },
                        filePath: { type: "string" },
                    },
                    required: ["agentId", "filePath"],
                },
            },
            {
                name: "agent_detect_conflicts",
                description: "Check if a file is locked by another agent.",
                inputSchema: {
                    type: "object",
                    properties: {
                        filePath: { type: "string" },
                    },
                    required: ["filePath"],
                },
            },
            {
                name: "agent_update_status",
                description: "Update the agent's current status.",
                inputSchema: {
                    type: "object",
                    properties: {
                        agentId: { type: "string" },
                        status: { type: "string" },
                    },
                    required: ["agentId", "status"],
                },
            },
            {
                name: "agent_unlock_file",
                description: "Unlock a file.",
                inputSchema: {
                    type: "object",
                    properties: {
                        agentId: { type: "string" },
                        filePath: { type: "string" },
                    },
                    required: ["agentId", "filePath"],
                },
            },
            {
                name: "agent_release_task",
                description: "Release a claimed task.",
                inputSchema: {
                    type: "object",
                    properties: {
                        agentId: { type: "string" },
                        taskId: { type: "string" },
                    },
                    required: ["agentId", "taskId"],
                },
            },
            // Fraud Detection Tools
            {
                name: "extract_receipt_data",
                description: "Extract structured data from a receipt image.",
                inputSchema: {
                    type: "object",
                    properties: {
                        imagePath: { type: "string" },
                    },
                    required: ["imagePath"],
                },
            },
            {
                name: "ocr_document",
                description: "Perform OCR on a document.",
                inputSchema: {
                    type: "object",
                    properties: {
                        filePath: { type: "string" },
                    },
                    required: ["filePath"],
                },
            },
            {
                name: "flag_expense_fraud",
                description: "Analyze an expense for potential fraud.",
                inputSchema: {
                    type: "object",
                    properties: {
                        amount: { type: "number" },
                        vendor: { type: "string" },
                        description: { type: "string" },
                        date: { type: "string" },
                    },
                    required: ["amount", "vendor", "date"],
                },
            },
            {
                name: "match_bank_transaction",
                description: "Attempt to match an expense to a bank transaction.",
                inputSchema: {
                    type: "object",
                    properties: {
                        expenseId: { type: "string" },
                        amount: { type: "number" },
                        date: { type: "string" },
                    },
                    required: ["expenseId", "amount", "date"],
                },
            },
        ],
    };
});
// Tool Implementation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            // Coordination Tools
            case "agent_register": {
                const { agentId, capabilities } = args;
                await redis.set(`agent:${agentId}:info`, JSON.stringify({ capabilities, lastSeen: Date.now() }), "EX", COORDINATION_TTL);
                return { content: [{ type: "text", text: `Agent ${agentId} registered.` }] };
            }
            case "agent_claim_task": {
                const { agentId, taskId } = args;
                const key = `task:${taskId}:lock`;
                const acquired = await redis.set(key, agentId, "EX", COORDINATION_TTL, "NX");
                if (!acquired) {
                    const owner = await redis.get(key);
                    throw new Error(`Task ${taskId} is already claimed by ${owner}`);
                }
                return { content: [{ type: "text", text: `Task ${taskId} claimed by ${agentId}.` }] };
            }
            case "agent_lock_file": {
                const { agentId, filePath } = args;
                const key = `file:${filePath}:lock`;
                const acquired = await redis.set(key, agentId, "EX", COORDINATION_TTL, "NX");
                if (!acquired) {
                    const owner = await redis.get(key);
                    throw new Error(`File ${filePath} is locked by ${owner}`);
                }
                return { content: [{ type: "text", text: `File ${filePath} locked by ${agentId}.` }] };
            }
            case "agent_detect_conflicts": {
                const { filePath } = args;
                const owner = await redis.get(`file:${filePath}:lock`);
                return { content: [{ type: "text", text: owner ? `Locked by ${owner}` : "Unlocked" }] };
            }
            case "agent_update_status": {
                const { agentId, status } = args;
                await redis.set(`agent:${agentId}:status`, status, "EX", COORDINATION_TTL);
                return { content: [{ type: "text", text: `Status updated for ${agentId}.` }] };
            }
            case "agent_unlock_file": {
                const { agentId, filePath } = args;
                const key = `file:${filePath}:lock`;
                const owner = await redis.get(key);
                if (owner === agentId) {
                    await redis.del(key);
                    return { content: [{ type: "text", text: `File ${filePath} unlocked.` }] };
                }
                throw new Error(`Cannot unlock file ${filePath}: Owned by ${owner || "nobody"}`);
            }
            case "agent_release_task": {
                const { agentId, taskId } = args;
                const key = `task:${taskId}:lock`;
                const owner = await redis.get(key);
                if (owner === agentId) {
                    await redis.del(key);
                    return { content: [{ type: "text", text: `Task ${taskId} released.` }] };
                }
                throw new Error(`Cannot release task ${taskId}: Owned by ${owner || "nobody"}`);
            }
            // Fraud Detection Tools
            case "extract_receipt_data": {
                // Mock implementation for now, calling backend in future
                // const response = await axios.post(`${BACKEND_URL}/api/v1/forensics/extract`, args);
                // return { content: [{ type: "text", text: JSON.stringify(response.data) }] };
                return { content: [{ type: "text", text: JSON.stringify({ vendor: "Mock Vendor", amount: 100.00, date: "2023-10-27" }) }] };
            }
            case "ocr_document": {
                return { content: [{ type: "text", text: "Mock OCR Text Content" }] };
            }
            case "flag_expense_fraud": {
                const { amount } = args;
                const isFraud = amount > 1000;
                return { content: [{ type: "text", text: JSON.stringify({ isFraud, confidence: isFraud ? 0.9 : 0.1 }) }] };
            }
            case "match_bank_transaction": {
                return { content: [{ type: "text", text: JSON.stringify({ matchFound: true, transactionId: "tx_123" }) }] };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});
// Start Server
const transport = new StdioServerTransport();
await server.connect(transport);
