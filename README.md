# Best Practices MCP Server

A Model Context Protocol (MCP) server that provides access to comprehensive best practice documentation for various technologies and frameworks.

## Overview

This MCP server exposes best practice guides for:
- **React** - React development best practices
- **Next.js** - Next.js framework best practices
- **TypeScript** - TypeScript development best practices
- **Zustand** - Zustand state management best practices
- **TanStack Query** - TanStack Query data fetching best practices
- **UI/UX** - UI/UX design and implementation best practices

The server implements both **tools** and **resources** capabilities, allowing clients to retrieve best practices through either method.

## Recommended Tech Stack

For modern React/Next.js applications, we recommend the following packages:

| Category      | Package                                   | Why                                |
| ------------- | ----------------------------------------- | ---------------------------------- |
| Data fetching | `@tanstack/react-query`                   | Powerful caching & synchronization |
| State         | `zustand`                                 | Small, scalable, no boilerplate    |
| Forms         | `react-hook-form` + `@hookform/resolvers` | Lightweight, performant            |
| Validation    | `zod`                                     | Type-safe schema validation        |
| HTTP          | `axios`                                   | Flexible request library           |
| Animations    | `framer-motion`                           | Declarative animations             |
| Icons         | `lucide-react`                            | Clean icon set                     |
| Dates         | `date-fns`                                | Lightweight date utils             |
| SEO           | `next-seo`                                | Manage OpenGraph + meta tags       |
| Lint/format   | `@biomejs/biome`                          | Unified lint + format engine       |

These packages are chosen for their:
- **Performance** - Minimal bundle size and optimal runtime performance
- **Developer Experience** - Excellent TypeScript support and intuitive APIs
- **Maintainability** - Active communities and regular updates
- **Compatibility** - Work seamlessly together in modern React applications

## Features

- ✅ **Tools Interface** - `get_best_practice` tool for retrieving documentation
- ✅ **Resources Interface** - Browse available practices as resources (practice://topic)
- ✅ **Security** - Path traversal protection and input validation
- ✅ **Error Handling** - Comprehensive error differentiation and reporting
- ✅ **Structured Logging** - JSON-formatted logs for debugging
- ✅ **TypeScript** - Full TypeScript support with strict mode

## Installation

### Prerequisites
- Node.js 18+ or higher
- pnpm (recommended) or npm

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd best-practices-mcp

# Install dependencies
pnpm install
# or
npm install

# Build the project
pnpm build
# or
npm run build
```

## Usage

### Running the Server

```bash
# Development mode (with hot reload)
pnpm dev
# or
npm run dev

# Production mode
pnpm start
# or
npm start
```

The server will start and listen on stdio for MCP client connections.

### Using with MCP Clients

#### Tool Usage

Call the `get_best_practice` tool with a topic:

```json
{
  "name": "get_best_practice",
  "arguments": {
    "topic": "react"
  }
}
```

**Available topics:**
- `react`
- `nextjs`
- `typescript`
- `zustand`
- `tanstack-query`
- `ui`

#### Resource Usage

List available resources:

```
GET /resources
```

Read a specific resource:

```
GET /resources/practice://react
```

## API Documentation

### Tools

#### `get_best_practice`

Retrieves best practice documentation for a specified topic.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "topic": {
      "type": "string",
      "enum": ["react", "nextjs", "typescript", "zustand", "tanstack-query", "ui"],
      "description": "Topic to fetch best practices for"
    }
  },
  "required": ["topic"]
}
```

**Response:**
- **Success**: Returns markdown content with MIME type `text/markdown`
- **Error**: Returns error message with details about what went wrong

**Error Cases:**
- Invalid topic: Returns list of available topics
- File not found: Returns specific error message
- Security violation: Returns access denied message

### Resources

#### Resource List

Returns all available best practice resources.

**Response:**
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

#### Read Resource

Retrieves the content of a specific practice resource.

**URI Format:** `practice://{topic}`

**Response:**
```json
{
  "contents": [
    {
      "uri": "practice://react",
      "mimeType": "text/markdown",
      "text": "# React Best Practices\n..."
    }
  ]
}
```

## Project Structure

```
src/
├── index.ts                 # Entry point
├── server.ts               # Server setup and handlers
├── types.ts                # Type definitions and constants
├── validation.ts           # Zod schemas for input validation
├── tools/
│   └── getPractice.ts      # Tool implementation with security
├── resources/
│   └── practices.ts        # Resource handlers
└── utils/
    ├── logger.ts           # Structured logging
    └── errors.ts           # Custom error classes

src/data/
├── react-best-practices.md
├── nextjs-best-practices.md
├── typescript-best-practices.md
├── zustand-best-practices.md
└── tanstack-query-best-practices.md
```

## Development

### Scripts

```bash
# Build TypeScript and copy data files to dist/
pnpm build

# Run in development mode (no build needed)
pnpm dev

# Run in production mode (requires build first)
pnpm start

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Lint code (when configured)
pnpm lint

# Format code (when configured)
pnpm format
```

### Build Process

The build process performs two steps:
1. **TypeScript Compilation** - Compiles `.ts` files to `.js` in the `dist/` directory
2. **Asset Copying** - Copies markdown files from `src/data/` to `dist/data/`

This ensures the built distribution is self-contained and can run without the `src/` directory.

**Build output structure:**
```
dist/
├── data/                    # Markdown files (copied from src/data/)
│   ├── react-best-practices.md
│   ├── nextjs-best-practices.md
│   ├── typescript-best-practices.md
│   ├── zustand-best-practices.md
│   ├── tanstack-query-best-practices.md
│   └── ui-best-practices.md
├── index.js                 # Entry point
├── server.js                # MCP server setup
├── types.js                 # Type definitions
├── validation.js            # Input validation
├── tools/                   # Tool implementations
├── resources/               # Resource handlers
└── utils/                   # Utilities (errors, logger)
```

### Configuration Files

- **tsconfig.json** - TypeScript configuration
- **biome.json** - Code formatting and linting rules
- **.env.example** - Environment variable template
- **.gitignore** - Git ignore rules

## Security

### Security Features

1. **Path Traversal Protection** - Validates that file paths stay within the data directory
2. **Input Validation** - Whitelist of allowed topics with Zod validation
3. **Error Sanitization** - Error messages don't leak sensitive information
4. **Structured Logging** - All operations are logged for audit trails

### Security Best Practices

- Only whitelisted topics are accepted
- File paths are validated before reading
- All errors are caught and handled safely
- Sensitive information is not exposed in error messages

## Error Handling

The server implements comprehensive error handling:

- **ValidationError** - Invalid input parameters
- **NotFoundError** - Requested resource not found
- **SecurityError** - Security violation detected
- **FileReadError** - File system errors

Each error type is handled appropriately and returns meaningful messages to clients.

## Logging

The server uses structured JSON logging for all operations:

```json
{
  "level": "info",
  "message": "Successfully read practice file",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "topic": "react"
  }
}
```

Log levels: `debug`, `info`, `warn`, `error`

## Contributing

Contributions are welcome! Please ensure:

1. Code follows TypeScript strict mode
2. All changes include appropriate error handling
3. Security best practices are maintained
4. Code is properly documented with JSDoc comments

## License

ISC

## Support

For issues or questions, please refer to:
- [MCP Specification](https://modelcontextprotocol.io/specification/latest)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)
- [Zod Documentation](https://zod.dev)

