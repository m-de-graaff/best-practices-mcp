/**
 * Custom error classes for the MCP server
 */

export class MCPError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

export class ValidationError extends MCPError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400);
  }
}

export class NotFoundError extends MCPError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class SecurityError extends MCPError {
  constructor(message: string) {
    super('SECURITY_ERROR', message, 403);
  }
}

export class FileReadError extends MCPError {
  constructor(message: string) {
    super('FILE_READ_ERROR', message, 500);
  }
}

