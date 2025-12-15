import { Message } from "../../models/Message"
import { Match } from "../../models/Match"
import { User } from "../../models/User"
import { requireAuth } from "../../lib/jwt"
import { NotFoundError, ForbiddenError, ValidationError } from "../../lib/errors"
import { pubsub } from "./index"
import mongoose from "mongoose"
import { z } from "zod"

const MESSAGE_ADDED = "MESSAGE_ADDED"

export const messageResolvers = {
  Query: {
    messages: async (_: any, { matchId, after }: any, context: any) => {
      const auth = requireAuth(context)
      const userId = new mongoose.Types.ObjectId(auth.userId)

      if (!matchId) {
        throw new ValidationError("matchId is required")
      }

      // Verify user is part of the match
      const match = await Match.findOne({
        _id: matchId,
        participants: userId,
        isDeleted: false,
      })

      if (!match) {
        throw new ForbiddenError("Access denied to this match")
      }

      const filter: any = { matchId, isDeleted: false }
      if (after) {
        filter._id = { $lt: new mongoose.Types.ObjectId(after) }
      }

      const messages = await Message.find(filter).sort({ sentAt: -1 }).limit(50)

      return {
        messages: messages.reverse(),
        hasMore: messages.length === 50,
      }
    },
  },

  Mutation: {
    sendMessage: async (_: any, { matchId, text, attachments }: any, context: any) => {
      const auth = requireAuth(context)

      // Validate input
      if (!matchId || typeof matchId !== "string") {
        throw new ValidationError("matchId is required")
      }

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        throw new ValidationError("text is required and cannot be empty")
      }

      if (text.length > 2000) {
        throw new ValidationError("text must be less than 2000 characters")
      }

      const userId = new mongoose.Types.ObjectId(auth.userId)
      const matchObjectId = new mongoose.Types.ObjectId(matchId)

      // Verify user is part of the match and it's active
      const match = await Match.findOne({
        _id: matchObjectId,
        participants: userId,
        status: "matched",
        isDeleted: false,
      })

      if (!match) {
        throw new ForbiddenError("Cannot send message to this match. Match not found or not active.")
      }

      // Validate attachments if provided
      const validAttachments = (attachments || []).map((att: any) => ({
        url: att.url || "",
        type: att.type || "image",
      }))

      // Create message
      const message = await Message.create({
        matchId: matchObjectId,
        senderId: userId,
        text: text.trim(),
        attachments: validAttachments,
        sentAt: new Date(),
        readBy: [userId],
        edited: false,
      })

      // Update match timestamp
      match.updatedAt = new Date()
      await match.save()

      // Publish to subscription
      await pubsub.publish(`${MESSAGE_ADDED}_${matchId}`, {
        messageAdded: message,
      })

      return message
    },

    markMessageRead: async (_: any, { messageId }: any, context: any) => {
      const auth = requireAuth(context)
      const userId = new mongoose.Types.ObjectId(auth.userId)

      const message = await Message.findById(messageId)
      if (!message || message.isDeleted) {
        throw new NotFoundError("Message")
      }

      // Verify user is part of the match
      const match = await Match.findOne({
        _id: message.matchId,
        participants: userId,
      })

      if (!match) {
        throw new ForbiddenError("Access denied")
      }

      // Add user to readBy if not already there
      if (!message.readBy.some((id) => id.equals(userId))) {
        message.readBy.push(userId)
        await message.save()
      }

      return message
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: (_: any, { matchId }: any, _context: any) => {
        // Note: In production, verify user has access to this match
        return pubsub.asyncIterator([`${MESSAGE_ADDED}_${matchId}`])
      },
    },

    userOnlineStatus: {
      subscribe: (_: any, { userId }: any) => {
        return pubsub.asyncIterator([`USER_ONLINE_${userId}`])
      },
    },
  },

  Message: {
    match: async (parent: any) => {
      return await Match.findById(parent.matchId)
    },

    sender: async (parent: any) => {
      return await User.findById(parent.senderId)
    },
  },
}
