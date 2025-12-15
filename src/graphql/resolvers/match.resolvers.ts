import { Match } from "../../models/Match"
import { User } from "../../models/User"
import { requireAuth } from "../../lib/jwt"
import { NotFoundError, ValidationError } from "../../lib/errors"
import mongoose from "mongoose"

export const matchResolvers = {
  Query: {
    matches: async (_: any, __: any, context: any) => {
      const auth = requireAuth(context)
      const userId = new mongoose.Types.ObjectId(auth.userId)

      const matches = await Match.find({
        participants: userId,
        status: "matched",
        isDeleted: false,
      }).sort({ updatedAt: -1 })

      return matches
    },

    match: async (_: any, { id }: any, context: any) => {
      const auth = requireAuth(context)
      const userId = new mongoose.Types.ObjectId(auth.userId)

      const match = await Match.findOne({
        _id: id,
        participants: userId,
        isDeleted: false,
      })

      if (!match) {
        throw new NotFoundError("Match")
      }

      return match
    },
  },

  Mutation: {
    likeProfile: async (_: any, { targetUserId }: any, context: any) => {
      const auth = requireAuth(context)
      
      if (!targetUserId) {
        throw new ValidationError("targetUserId is required")
      }

      const currentUserId = new mongoose.Types.ObjectId(auth.userId)
      const targetUserObjectId = new mongoose.Types.ObjectId(targetUserId)

      // Don't allow liking yourself
      if (currentUserId.equals(targetUserObjectId)) {
        throw new ValidationError("Cannot like your own profile")
      }

      // Check if target user exists
      const targetUser = await User.findById(targetUserId)
      if (!targetUser || targetUser.isDeleted) {
        throw new NotFoundError("User")
      }

      // Check if match already exists
      let match = await Match.findOne({
        participants: { $all: [currentUserId, targetUserObjectId] },
        isDeleted: false,
      })

      if (match) {
        // Check if already liked
        const alreadyLiked = match.likes.some((like) => like.userId.equals(currentUserId))

        if (!alreadyLiked) {
          // Add like
          match.likes.push({
            userId: currentUserId,
            at: new Date(),
          })

          // Check if it's a mutual match
          const mutualLike = match.likes.some((like) => like.userId.equals(targetUserObjectId))

          if (mutualLike && match.status === "pending") {
            match.status = "matched"
          }

          await match.save()
        }
      } else {
        // Create new match with like
        match = await Match.create({
          participants: [currentUserId, targetUserObjectId],
          status: "pending",
          likes: [
            {
              userId: currentUserId,
              at: new Date(),
            },
          ],
        })
      }

      // Return match (participants will be populated by resolver)
      return match
    },

    dislikeProfile: async (_: any, { targetUserId }: any, context: any) => {
      const auth = requireAuth(context)
      const currentUserId = new mongoose.Types.ObjectId(auth.userId)
      const targetUserObjectId = new mongoose.Types.ObjectId(targetUserId)

      // Find or create match with rejected status
      const match = await Match.findOne({
        participants: { $all: [currentUserId, targetUserObjectId] },
        isDeleted: false,
      })

      if (match) {
        match.status = "rejected"
        await match.save()
      } else {
        await Match.create({
          participants: [currentUserId, targetUserObjectId],
          status: "rejected",
          likes: [],
        })
      }

      return true
    },
  },

  Match: {
    participants: async (parent: any) => {
      return await User.find({ _id: { $in: parent.participants } })
    },

    likes: async (parent: any) => {
      return Promise.all(
        parent.likes.map(async (like: any) => ({
          userId: like.userId,
          user: await User.findById(like.userId),
          at: like.at,
        })),
      )
    },
  },
}
