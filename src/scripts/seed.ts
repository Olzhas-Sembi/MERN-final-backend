import mongoose from "mongoose"
import bcrypt from "bcrypt"
import { User } from "../models/User"
import { Profile } from "../models/Profile"
import { Match } from "../models/Match"
import { Message } from "../models/Message"
import { Post } from "../models/Post"
import { logger } from "../lib/logger"

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dating-app"

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    logger.info("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Profile.deleteMany({})
    await Match.deleteMany({})
    await Message.deleteMany({})
    await Post.deleteMany({})
    logger.info("Cleared existing data")

    // Create users
    const password = await bcrypt.hash("password123", 10)

    const users = await User.create([
      {
        username: "alice",
        email: "alice@example.com",
        passwordHash: password,
        roles: ["user"],
        isVerified: true,
      },
      {
        username: "bob",
        email: "bob@example.com",
        passwordHash: password,
        roles: ["user"],
        isVerified: true,
      },
      {
        username: "charlie",
        email: "charlie@example.com",
        passwordHash: password,
        roles: ["user"],
        isVerified: true,
      },
      {
        username: "diana",
        email: "diana@example.com",
        passwordHash: password,
        roles: ["user"],
        isVerified: true,
      },
    ])

    logger.info(`Created ${users.length} users`)

    // Create profiles
    const profiles = await Profile.create([
      {
        userId: users[0]._id,
        displayName: "Alice",
        birthDate: new Date("1995-05-15"),
        gender: "female",
        bio: "Love traveling and photography",
        photos: ["/diverse-woman-smiling.png"],
        location: { lat: 40.7128, lng: -74.006, city: "New York" },
        lookingFor: ["relationship", "friendship"],
      },
      {
        userId: users[1]._id,
        displayName: "Bob",
        birthDate: new Date("1992-08-22"),
        gender: "male",
        bio: "Software engineer who loves hiking",
        photos: ["/man-outdoor.jpg"],
        location: { lat: 40.7128, lng: -74.006, city: "New York" },
        lookingFor: ["relationship"],
      },
      {
        userId: users[2]._id,
        displayName: "Charlie",
        birthDate: new Date("1998-03-10"),
        gender: "male",
        bio: "Musician and coffee enthusiast",
        photos: ["/man-playing-guitar.png"],
        location: { lat: 34.0522, lng: -118.2437, city: "Los Angeles" },
        lookingFor: ["friendship", "casual"],
      },
      {
        userId: users[3]._id,
        displayName: "Diana",
        birthDate: new Date("1996-11-30"),
        gender: "female",
        bio: "Artist and yoga instructor",
        photos: ["/woman-doing-yoga.png"],
        location: { lat: 34.0522, lng: -118.2437, city: "Los Angeles" },
        lookingFor: ["relationship"],
      },
    ])

    logger.info(`Created ${profiles.length} profiles`)

    // Create a match between Alice and Bob
    const match = await Match.create({
      participants: [users[0]._id, users[1]._id],
      status: "matched",
      likes: [
        { userId: users[0]._id, at: new Date() },
        { userId: users[1]._id, at: new Date() },
      ],
    })

    logger.info("Created match between Alice and Bob")

    // Create messages
    await Message.create([
      {
        matchId: match._id,
        senderId: users[0]._id,
        text: "Hi Bob! How are you?",
        attachments: [],
        sentAt: new Date(Date.now() - 3600000),
        readBy: [users[0]._id, users[1]._id],
      },
      {
        matchId: match._id,
        senderId: users[1]._id,
        text: "Hey Alice! I'm doing great, thanks! How about you?",
        attachments: [],
        sentAt: new Date(Date.now() - 3000000),
        readBy: [users[0]._id, users[1]._id],
      },
      {
        matchId: match._id,
        senderId: users[0]._id,
        text: "I'm good! Would you like to grab coffee sometime?",
        attachments: [],
        sentAt: new Date(Date.now() - 1800000),
        readBy: [users[0]._id],
      },
    ])

    logger.info("Created messages")

    // Create posts
    await Post.create([
      {
        authorId: users[0]._id,
        content: "Just got back from an amazing trip to Iceland! The northern lights were incredible.",
        images: ["/northern-lights-iceland.png"],
        likesCount: 15,
        commentsCount: 3,
        visibility: "public",
      },
      {
        authorId: users[2]._id,
        content: "New song out now! Check it out on my profile.",
        images: [],
        likesCount: 8,
        commentsCount: 2,
        visibility: "public",
      },
    ])

    logger.info("Created posts")

    logger.info("Seed completed successfully!")
    logger.info("Test credentials: alice@example.com / password123")

    await mongoose.connection.close()
  } catch (error) {
    logger.error("Seed failed:", error)
    process.exit(1)
  }
}

seed()
