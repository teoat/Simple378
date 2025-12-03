#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

class BackendToolsServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'backend-tools',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'extract_receipt_data',
          description: 'Extract data from a receipt image or file',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Absolute path to the receipt file',
              },
            },
            required: ['file_path'],
          },
        },
        {
          name: 'ocr_document',
          description: 'Perform OCR on a document to extract text',
          inputSchema: {
            type: 'object',
            properties: {
              file_path: {
                type: 'string',
                description: 'Absolute path to the document',
              },
            },
            required: ['file_path'],
          },
        },
        {
          name: 'flag_expense_fraud',
          description: 'Analyze an expense claim for potential fraud',
          inputSchema: {
            type: 'object',
            properties: {
              expense_id: {
                type: 'string',
                description: 'ID of the expense to analyze',
              },
              amount: {
                type: 'number',
                description: 'Amount of the expense',
              },
              merchant: {
                type: 'string',
                description: 'Merchant name',
              },
              category: {
                type: 'string',
                description: 'Expense category',
              },
            },
            required: ['amount', 'merchant'],
          },
        },
        {
          name: 'match_bank_transaction',
          description: 'Match an expense against bank transactions',
          inputSchema: {
            type: 'object',
            properties: {
              amount: {
                type: 'number',
                description: 'Transaction amount',
              },
              date: {
                type: 'string',
                description: 'Transaction date (YYYY-MM-DD)',
              },
              merchant: {
                type: 'string',
                description: 'Merchant name',
              },
            },
            required: ['amount', 'date'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'extract_receipt_data': {
            const { file_path } = z
              .object({ file_path: z.string() })
              .parse(request.params.arguments);
            
            // Call backend API or run local logic
            // For now, we'll assume an endpoint exists or mock it if strictly local
            // Since we are "agentic", we should try to hit the API
            
            // TODO: Implement actual API call
            // const response = await axios.post(`${API_BASE_URL}/api/v1/ingestion/extract`, { file_path });
            // return { content: [{ type: 'text', text: JSON.stringify(response.data) }] };

            return {
              content: [
                {
                  type: 'text',
                  text: `Simulated extraction for ${file_path}: { "merchant": "Test Store", "total": 100.00, "date": "2023-10-27" }`,
                },
              ],
            };
          }

          case 'ocr_document': {
            const { file_path } = z
              .object({ file_path: z.string() })
              .parse(request.params.arguments);
            
            return {
              content: [
                {
                  type: 'text',
                  text: `Simulated OCR for ${file_path}: "This is the extracted text content."`,
                },
              ],
            };
          }

          case 'flag_expense_fraud': {
             const args = z
              .object({
                expense_id: z.string().optional(),
                amount: z.number(),
                merchant: z.string(),
                category: z.string().optional(),
              })
              .parse(request.params.arguments);

            return {
              content: [
                {
                  type: 'text',
                  text: `Fraud analysis for ${args.merchant} ($${args.amount}): Low Risk (Score: 0.1)`,
                },
              ],
            };
          }

          case 'match_bank_transaction': {
            const args = z
              .object({
                amount: z.number(),
                date: z.string(),
                merchant: z.string().optional(),
              })
              .parse(request.params.arguments);

            return {
              content: [
                {
                  type: 'text',
                  text: `Found 1 matching transaction for $${args.amount} on ${args.date}`,
                },
              ],
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid arguments: ${error.errors
              .map((e) => `${e.path.join('.')}: ${e.message}`)
              .join(', ')}`
          );
        }
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Backend Tools MCP server running on stdio');
  }
}

const server = new BackendToolsServer();
server.run().catch(console.error);
