import mongoose, { Schema, type Document } from "mongoose"

export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId
  content: string
  images: string[]
  likesCount: number
  likedBy: mongoose.Types.ObjectId[]
  commentsCount: number
  visibility: "public" | "friends" | "private"
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    images: {
      type: [String],
      default: [],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    likedBy: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
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
PostSchema.index({ authorId: 1, createdAt: -1 })
PostSchema.index({ visibility: 1, isDeleted: 1, createdAt: -1 })

export const Post = mongoose.model<IPost>("Post", PostSchema)
