import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
async function main() {
    const transport = new StdioClientTransport({
        command: "node",
        args: ["dist/index.js"],
    });
    const client = new Client({
        name: "test-client",
        version: "1.0.0",
    }, {
        capabilities: {},
    });
    await client.connect(transport);
    const tools = await client.listTools();
    console.log("Tools:", tools.tools.map((t) => t.name));
    const requiredTools = [
        "extract_receipt_data",
        "ocr_document",
        "flag_expense_fraud",
        "match_bank_transaction",
        "agent_register",
        "agent_claim_task"
    ];
    const missing = requiredTools.filter(t => !tools.tools.find(tool => tool.name === t));
    if (missing.length > 0) {
        console.error("Missing tools:", missing);
        process.exit(1);
    }
    console.log("All required tools present.");
    process.exit(0);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
