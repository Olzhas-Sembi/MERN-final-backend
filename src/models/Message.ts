import mongoose, { Schema, type Document } from "mongoose"

export interface IMessage extends Document {
  matchId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  text: string
  attachments: {
    url: string
    type: string
  }[]
  readBy: mongoose.Types.ObjectId[]
  sentAt: Date
  edited: boolean
  isDeleted: boolean
}

const MessageSchema = new Schema<IMessage>(
  {
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    attachments: [
      {
        url: { type: String, required: true },
        type: { type: String, required: true },
      },
    ],
    readBy: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: false,
  },
)

// Indexes
MessageSchema.index({ matchId: 1, sentAt: -1 })
MessageSchema.index({ senderId: 1 })

export const Message = mongoose.model<IMessage>("Message", MessageSchema)
