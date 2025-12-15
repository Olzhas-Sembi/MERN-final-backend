import bcrypt from "bcrypt"
import { generateToken, verifyToken } from "../lib/jwt"

describe("Authentication", () => {
  describe("Password hashing", () => {
    it("should hash password correctly", async () => {
      const password = "testpassword123"
      const hash = await bcrypt.hash(password, 10)

      expect(hash).not.toBe(password)
      expect(await bcrypt.compare(password, hash)).toBe(true)
    })

    it("should reject incorrect password", async () => {
      const password = "testpassword123"
      const hash = await bcrypt.hash(password, 10)

      expect(await bcrypt.compare("wrongpassword", hash)).toBe(false)
    })
  })

  describe("JWT tokens", () => {
    it("should generate and verify valid token", () => {
      const payload = {
        userId: "123",
        email: "test@example.com",
        roles: ["user"],
      }

      const token = generateToken(payload)
      const decoded = verifyToken(token)

      expect(decoded.userId).toBe(payload.userId)
      expect(decoded.email).toBe(payload.email)
      expect(decoded.roles).toEqual(payload.roles)
    })

    it("should reject invalid token", () => {
      expect(() => verifyToken("invalid.token.here")).toThrow()
    })
  })
})
