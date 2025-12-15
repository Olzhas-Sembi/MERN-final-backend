import jwt, { SignOptions } from "jsonwebtoken"
import { GraphQLError } from "graphql"

const JWT_SECRET: string = process.env.JWT_SECRET || "your-secret-key-change-this"
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d"

export interface JWTPayload {
  userId: string
  email: string
  roles: string[]
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions)
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded as JWTPayload
  } catch (error) {
    throw new GraphQLError("Invalid or expired token", {
      extensions: { code: "UNAUTHENTICATED" },
    })
  }
}

export function requireAuth(context: any): JWTPayload {
  if (!context.user) {
    throw new GraphQLError("Authentication required", {
      extensions: { code: "UNAUTHENTICATED" },
    })
  }
  return context.user
}

export function requireAdmin(context: any): JWTPayload {
  const user = requireAuth(context)
  if (!user.roles || !user.roles.includes("admin")) {
    throw new GraphQLError("Admin access required", {
      extensions: { code: "FORBIDDEN" },
    })
  }
  return user
}
