import mongoose, { Schema, type Document } from "mongoose"

export interface IMatch extends Document {
  participants: mongoose.Types.ObjectId[]
  status: "pending" | "matched" | "rejected" | "blocked"
  likes: {
    userId: mongoose.Types.ObjectId
    at: Date
  }[]
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

const MatchSchema = new Schema<IMatch>(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
      validate: {
        validator: (v: mongoose.Types.ObjectId[]) => v.length === 2,
        message: "Match must have exactly 2 participants",
      },
    },
    status: {
      type: String,
      enum: ["pending", "matched", "rejected", "blocked"],
      default: "pending",
    },
    likes: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
MatchSchema.index({ participants: 1, status: 1 })
MatchSchema.index({ status: 1, isDeleted: 1 })

export const Match = mongoose.model<IMatch>("Match", MatchSchema)
