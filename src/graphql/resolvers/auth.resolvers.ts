import bcrypt from "bcrypt"
import { User } from "../../models/User"
import { generateToken } from "../../lib/jwt"
import { ValidationError } from "../../lib/errors"
import { z } from "zod"

const signUpSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
})

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const authResolvers = {
  Mutation: {
    signUp: async (_: any, { input }: any) => {
      // Validate input
      const validation = signUpSchema.safeParse(input)
      if (!validation.success) {
        throw new ValidationError("Invalid input", validation.error.errors)
      }

      const { username, email, password } = validation.data

      // Check if user exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      })

      if (existingUser) {
        throw new ValidationError("User with this email or username already exists")
      }

      // Hash password
      const saltRounds = Number.parseInt(process.env.SALT_ROUNDS || "10")
      const passwordHash = await bcrypt.hash(password, saltRounds)

      // Create user
      const user = await User.create({
        username,
        email,
        passwordHash,
        roles: ["user"],
        isVerified: false,
      })

      // Generate token
      const accessToken = generateToken({
        userId: user._id.toString(),
        email: user.email,
        roles: user.roles,
      })

      return {
        accessToken,
        user,
      }
    },

    signIn: async (_: any, { input }: any) => {
      // Validate input
      const validation = signInSchema.safeParse(input)
      if (!validation.success) {
        throw new ValidationError("Invalid input", validation.error.errors)
      }

      const { email, password } = validation.data

      // Find user
      const user = await User.findOne({ email, isDeleted: false })
      if (!user) {
        throw new ValidationError("Invalid email or password")
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash)
      if (!isValid) {
        throw new ValidationError("Invalid email or password")
      }

      // Update last seen
      user.lastSeen = new Date()
      await user.save()

      // Generate token
      const accessToken = generateToken({
        userId: user._id.toString(),
        email: user.email,
        roles: user.roles,
      })

      return {
        accessToken,
        user,
      }
    },

    logout: async (_: any, __: any, context: any) => {
      // In JWT, logout is handled client-side by removing the token
      // We just update lastSeen
      if (context.user) {
        await User.findByIdAndUpdate(context.user.userId, {
          lastSeen: new Date(),
        })
      }
      return true
    },
  },
}
