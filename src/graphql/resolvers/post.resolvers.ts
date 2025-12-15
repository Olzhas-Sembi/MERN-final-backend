import { Post } from "../../models/Post"
import { User } from "../../models/User"
import { requireAuth } from "../../lib/jwt"
import { NotFoundError, ValidationError } from "../../lib/errors"
import { z } from "zod"
import mongoose from "mongoose"

const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  images: z.array(z.string()).optional(),
  visibility: z.enum(["public", "friends", "private"]).optional(),
})

export const postResolvers = {
  Query: {
    posts: async (_: any, { limit = 20, offset = 0 }: any, context: any) => {
      requireAuth(context)

      const posts = await Post.find({
        isDeleted: false,
        visibility: "public",
      })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)

      return posts
    },
    post: async (_: any, { id }: any, context: any) => {
      requireAuth(context)

      const post = await Post.findOne({
        _id: id,
        isDeleted: false,
      })

      if (!post) {
        throw new NotFoundError("Post")
      }

      return post
    },
  },

  Mutation: {
    createPost: async (_: any, { input }: any, context: any) => {
      const auth = requireAuth(context)

      if (!input) {
        throw new ValidationError("Input is required")
      }

      // Validate input
      const validation = createPostSchema.safeParse(input)
      if (!validation.success) {
        throw new ValidationError("Invalid input", validation.error.errors)
      }

      const { content, images = [], visibility = "public" } = validation.data

      // Ensure authorId is ObjectId
      const authorId = new mongoose.Types.ObjectId(auth.userId)

      const post = await Post.create({
        authorId,
        content: content.trim(),
        images: images || [],
        visibility: visibility || "public",
        likesCount: 0,
        likedBy: [],
        commentsCount: 0,
        isDeleted: false,
      })

      return post
    },

    likePost: async (_: any, { postId }: any, context: any) => {
      const auth = requireAuth(context)

      const post = await Post.findById(postId)
      if (!post || post.isDeleted) {
        throw new NotFoundError("Post")
      }

      // Check if user already liked
      const userId = new mongoose.Types.ObjectId(auth.userId)
      const alreadyLiked = post.likedBy.some((id) => id.toString() === auth.userId)

      if (alreadyLiked) {
        // Unlike
        post.likedBy = post.likedBy.filter((id) => id.toString() !== auth.userId)
        post.likesCount = Math.max(0, post.likesCount - 1)
      } else {
        // Like
        post.likedBy.push(userId)
        post.likesCount += 1
      }

      await post.save()

      return post
    },
  },

  Post: {
    author: async (parent: any) => {
      return await User.findById(parent.authorId)
    },
    likedBy: async (parent: any) => {
      // Return array of user IDs who liked the post
      return parent.likedBy?.map((id: any) => id.toString()) || []
    },
    isLiked: async (parent: any, _: any, context: any) => {
      if (!context.user) return false
      return parent.likedBy?.some((id: any) => id.toString() === context.user.userId) || false
    },
  },
}
