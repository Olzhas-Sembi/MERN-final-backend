import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  username: string
  email: string
  passwordHash: string
  roles: string[]
  isVerified: boolean
  isDeleted: boolean
  lastSeen: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      enum: ["user", "admin"],
      default: ["user"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Index for queries
UserSchema.index({ email: 1 })
UserSchema.index({ username: 1 })
UserSchema.index({ isDeleted: 1 })

export const User = mongoose.model<IUser>("User", UserSchema)
