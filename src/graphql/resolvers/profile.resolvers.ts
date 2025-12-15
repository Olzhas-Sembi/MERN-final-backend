import { Profile } from "../../models/Profile"
import { User } from "../../models/User"
import { Match } from "../../models/Match"
import { requireAuth } from "../../lib/jwt"
import { ValidationError } from "../../lib/errors"
import { z } from "zod"
import mongoose from "mongoose"

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  birthDate: z.union([
    z.string().datetime(),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
    z.date()
  ]).optional().transform((val) => {
    // Преобразуем Date в строку ISO, если это Date объект
    if (val instanceof Date) {
      return val.toISOString()
    }
    // Если это строка формата YYYY-MM-DD, преобразуем в ISO
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return new Date(val).toISOString()
    }
    return val
  }),
  gender: z.enum(["male", "female", "other"]).optional(),
  bio: z.string().max(500).optional(),
  photos: z.array(z.string().url()).min(1).optional(),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      city: z.string(),
    })
    .optional(),
  lookingFor: z.array(z.string()).optional(),
})

export const profileResolvers = {
  Query: {
    searchProfiles: async (_: any, { input }: any, context: any) => {
      const auth = requireAuth(context)
      const { gender, minAge, maxAge, city, limit = 20, offset = 0 } = input

      const filter: any = { isDeleted: false }

      // Exclude own profile
      const currentUserId = new mongoose.Types.ObjectId(auth.userId)
      filter.userId = { $ne: currentUserId }

      if (gender) {
        filter.gender = gender
      }

      if (city) {
        filter["location.city"] = city
      }

      // Age filtering
      if (minAge || maxAge) {
        const now = new Date()
        if (maxAge) {
          const minDate = new Date(now.getFullYear() - maxAge - 1, now.getMonth(), now.getDate())
          filter.birthDate = { $gte: minDate }
        }
        if (minAge) {
          const maxDate = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate())
          filter.birthDate = { ...filter.birthDate, $lte: maxDate }
        }
      }

      // Exclude profiles that current user has already interacted with
      // 1. Exclude matched (mutual likes) and rejected
      const existingMatches = await Match.find({
        participants: currentUserId,
        isDeleted: false,
        status: { $in: ["matched", "rejected", "blocked"] },
      })

      // 2. Exclude profiles that current user has already liked (even if pending)
      const matchesWhereUserLiked = await Match.find({
        participants: currentUserId,
        isDeleted: false,
        "likes.userId": currentUserId, // Current user has liked them
      })

      // Get user IDs to exclude
      const excludedUserIds = new Set<string>()
      
      // Add matched/rejected/blocked users
      existingMatches.forEach((match) => {
        match.participants.forEach((participantId) => {
          if (participantId.toString() !== auth.userId) {
            excludedUserIds.add(participantId.toString())
          }
        })
      })

      // Add users that current user has already liked
      matchesWhereUserLiked.forEach((match) => {
        match.participants.forEach((participantId) => {
          if (participantId.toString() !== auth.userId) {
            excludedUserIds.add(participantId.toString())
          }
        })
      })

      // Exclude these users from search
      if (excludedUserIds.size > 0) {
        filter.userId = {
          ...(filter.userId || {}),
          $nin: Array.from(excludedUserIds).map((id) => new mongoose.Types.ObjectId(id)),
        }
      }

      const total = await Profile.countDocuments(filter)
      const profiles = await Profile.find(filter).skip(offset).limit(limit).sort({ createdAt: -1 })

      return {
        profiles,
        total,
        hasMore: offset + profiles.length < total,
      }
    },
  },

  Mutation: {
    updateProfile: async (_: any, { input }: any, context: any) => {
      const auth = requireAuth(context)

      // Validate input
      const validation = updateProfileSchema.safeParse(input)
      if (!validation.success) {
        throw new ValidationError("Invalid input", validation.error.errors)
      }

      const data = validation.data

      // Convert birthDate string to Date if provided
      if (data.birthDate) {
        const dateValue = typeof data.birthDate === 'string' ? data.birthDate : data.birthDate
        ;(data as any).birthDate = new Date(dateValue)
      }

      // Find or create profile
      let profile = await Profile.findOne({ userId: auth.userId })

      if (profile) {
        // Update existing profile - обновляем только переданные поля
        if (data.displayName !== undefined) profile.displayName = data.displayName
        if (data.birthDate !== undefined) profile.birthDate = data.birthDate as any
        if (data.gender !== undefined) profile.gender = data.gender
        if (data.bio !== undefined) profile.bio = data.bio
        if (data.photos !== undefined) profile.photos = data.photos
        if (data.location !== undefined) profile.location = data.location as any
        if (data.lookingFor !== undefined) profile.lookingFor = data.lookingFor
        await profile.save()
      } else {
        // Create new profile - проверяем обязательные поля
        if (!data.displayName || !data.birthDate || !data.gender || !data.photos || data.photos.length === 0) {
          throw new ValidationError("Missing required fields: displayName, birthDate, gender, and at least one photo are required")
        }
        profile = await Profile.create({
          userId: auth.userId,
          ...data,
        })
      }

      return profile
    },
  },

  Profile: {
    user: async (parent: any) => {
      return await User.findById(parent.userId)
    },
    location: async (parent: any) => {
      // Возвращаем null если location не установлен или пустой
      if (!parent.location || !parent.location.lat || !parent.location.lng) {
        return null
      }
      return parent.location
    },
  },
}
