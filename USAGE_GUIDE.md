# How to Use the Best Practices MCP Server

## Quick Start

### 1. Start the Server

```bash
# Development mode (recommended for testing)
pnpm dev

# Production mode
pnpm start
```

The server runs on **stdio** and waits for MCP client connections.

### 2. Connect from an MCP Client

Your MCP server provides two ways to access best practices:
- **Tools**: Call `get_best_practice` with a topic
- **Resources**: Browse `practice://` URIs

## Available Topics

| Topic | Description |
|-------|-------------|
| `react` | React development best practices |
| `nextjs` | Next.js framework best practices |
| `typescript` | TypeScript development best practices |
| `zustand` | Zustand state management best practices |
| `tanstack-query` | TanStack Query data fetching best practices |
| `ui` | UI/UX design and development best practices |

## Using with Claude Desktop

### 1. Configure Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "best-practices": {
      "command": "node",
      "args": ["h:\\Projects\\best-practices-mcp\\dist\\index.js"],
      "env": {}
    }
  }
}
```

**Location of config file:**
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### 2. Restart Claude Desktop

After adding the configuration, restart Claude Desktop to load your MCP server.

### 3. Use in Claude Chat

Ask Claude to get best practices:

```
Get React best practices
```

```
Show me TypeScript best practices
```

```
What are the UI/UX best practices?
```

Claude will use your MCP server to retrieve the documentation!

## Using with Other MCP Clients

### Tool Interface

Send a tool call request:

```json
{
  "method": "tools/call",
  "params": {
    "name": "get_best_practice",
    "arguments": {
      "topic": "react"
    }
  }
}
```

### Resources Interface

List available resources:
```json
{
  "method": "resources/list"
}
```

Read a specific resource:
```json
{
  "method": "resources/read",
  "params": {
    "uri": "practice://react"
  }
}
```

## Example Responses

### Tool Response
```json
{
  "content": [
    {
      "type": "text/markdown",
      "text": "# React Best Practices\n\n## 1. Component Design\n..."
    }
  ]
}
```

### Resource List Response
```json
{
  "resources": [
    {
      "uri": "practice://react",
      "name": "React Best Practices", 
      "description": "Best practices for React development",
      "mimeType": "text/markdown"
    },
    ...
  ]
}
```

## Development & Testing

### Local Testing

```bash
# Start in development mode
pnpm dev

# In another terminal, test with MCP inspector (if available)
npx @modelcontextprotocol/inspector

# Or test with a simple JSON-RPC call
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```

### Build for Production

```bash
# Build TypeScript
pnpm build

# Run production build
pnpm start
```

## Troubleshooting

### Common Issues

1. **"Server not found"**
   - Check the path in `claude_desktop_config.json`
   - Ensure you've built the project (`pnpm build`)

2. **"Permission denied"** 
   - Check file permissions
   - Use absolute paths in config

3. **"Module not found"**
   - Run `pnpm install` 
   - Ensure `dist/` folder exists after `pnpm build`

### Logs & Debugging

The server outputs structured JSON logs:

```bash
# View logs while running
pnpm dev

# Example log output:
{"level":"info","message":"Successfully read practice file","timestamp":"2024-01-15T10:30:00.000Z","data":{"topic":"react"}}
```

### Validate Configuration

Test your setup:

```bash
# 1. Build succeeds
pnpm build

# 2. Tests pass  
pnpm test

# 3. Server starts without errors
pnpm start
```

## Advanced Usage

### Custom Client Integration

If you're building your own MCP client:

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Connect to your MCP server
const transport = new StdioClientTransport({
  command: "node",
  args: ["path/to/your/dist/index.js"]
});

const client = new Client({
  name: "my-client",
  version: "1.0.0"
}, {
  capabilities: {}
});

await client.connect(transport);

// Call tools
const result = await client.request({
  method: "tools/call",
  params: {
    name: "get_best_practice",
    arguments: { topic: "react" }
  }
});
```

### Environment Variables

Create `.env` file for configuration:

```bash
# .env
LOG_LEVEL=debug
DATA_PATH=./src/data
```

## Security Notes

- ✅ Path traversal protection enabled
- ✅ Input validation with whitelisted topics
- ✅ Safe error handling (no path leakage)
- ✅ Structured logging for audit trails

The server only serves files from `src/data/` and only accepts whitelisted topics.

## Support

For issues:
1. Check the logs for error details
2. Verify your configuration matches this guide
3. Ensure all dependencies are installed
4. Test with `pnpm test` to verify functionality

## Next Steps

Once you have the server working:
1. Customize the best practice content in `src/data/`
2. Add your own topics by updating `src/types.ts`
3. Extend functionality with new tools or resources
4. Deploy to a server for team access

---

**Ready to use!** Start with `pnpm dev` and configure Claude Desktop to begin accessing your best practices.