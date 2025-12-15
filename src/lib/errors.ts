import { GraphQLError } from "graphql"

export class AppError extends GraphQLError {
  constructor(message: string, code: string, details?: any) {
    super(message, {
      extensions: {
        code,
        details,
      },
    })
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR", details)
  }
}

// Helper to format validation errors
export function formatValidationErrors(errors: any[]): string {
  if (!errors || errors.length === 0) return "Validation failed"
  return errors.map((e) => `${e.path?.join(".") || "field"}: ${e.message}`).join(", ")
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, "UNAUTHENTICATED")
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access forbidden") {
    super(message, "FORBIDDEN")
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND")
  }
}
