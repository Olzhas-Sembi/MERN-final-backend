import { requireAdmin } from "../../lib/jwt"
import { User } from "../../models/User"
import { Profile } from "../../models/Profile"
import { Post } from "../../models/Post"
import { Match } from "../../models/Match"
import { Message } from "../../models/Message"
import mongoose from "mongoose"

export const adminResolvers = {
  Query: {
    adminStats: async (_: any, __: any, context: any) => {
      requireAdmin(context)

      const totalUsers = await User.countDocuments({ isDeleted: false })
      const totalProfiles = await Profile.countDocuments()
      const totalPosts = await Post.countDocuments({ isDeleted: false })
      const totalMatches = await Match.countDocuments({ isDeleted: false })
      const totalMessages = await Message.countDocuments({ isDeleted: false })

      const users = await User.find({ isDeleted: false })
      const usersByRole = [
        {
          role: "user",
          count: users.filter((u) => u.roles.includes("user")).length,
        },
        {
          role: "admin",
          count: users.filter((u) => u.roles.includes("admin")).length,
        },
      ]

      const matches = await Match.find({ isDeleted: false })
      const likesByUserMap = new Map<string, { likesGiven: number; likesReceived: number; username: string }>()

      users.forEach((user) => {
        likesByUserMap.set(user._id.toString(), {
          likesGiven: 0,
          likesReceived: 0,
          username: user.username,
        })
      })

      matches.forEach((match) => {
        match.likes.forEach((like) => {
          const userId = like.userId.toString()
          const stats = likesByUserMap.get(userId)
          if (stats) {
            stats.likesGiven++
          }

          const participantIds = match.participants.map((p: any) => 
            p._id ? p._id.toString() : p.toString()
          )
          participantIds.forEach((participantId: string) => {
            if (participantId !== userId) {
              const receiverStats = likesByUserMap.get(participantId)
              if (receiverStats) {
                receiverStats.likesReceived++
              }
            }
          })
        })
      })

      const likesByUser = Array.from(likesByUserMap.entries())
        .filter(([_, stats]) => stats.likesGiven > 0 || stats.likesReceived > 0)
        .map(([userId, stats]) => ({
          userId,
          username: stats.username,
          likesGiven: stats.likesGiven,
          likesReceived: stats.likesReceived,
        }))

      const posts = await Post.find({ isDeleted: false })
      const postsByUserMap = new Map<string, { postsCount: number; totalLikes: number; username: string }>()

      posts.forEach((post) => {
        const userId = post.authorId.toString()
        const user = users.find((u) => u._id.toString() === userId)
        if (user) {
          if (!postsByUserMap.has(userId)) {
            postsByUserMap.set(userId, {
              postsCount: 0,
              totalLikes: 0,
              username: user.username,
            })
          }
          const stats = postsByUserMap.get(userId)!
          stats.postsCount++
          stats.totalLikes += post.likesCount || 0
        }
      })

      const postsByUser = Array.from(postsByUserMap.entries()).map(([userId, stats]) => ({
        userId,
        username: stats.username,
        postsCount: stats.postsCount,
        totalLikes: stats.totalLikes,
      }))

      return {
        totalUsers,
        totalProfiles,
        totalPosts,
        totalMatches,
        totalMessages,
        usersByRole,
        likesByUser,
        postsByUser,
      }
    },
  },
}

