import mongoose from "mongoose"
import bcrypt from "bcrypt"
import { User } from "../models/User"
import { Profile } from "../models/Profile"
import { Match } from "../models/Match"
import { Message } from "../models/Message"
import { Post } from "../models/Post"
import { logger } from "../lib/logger"

const MONGO_URI = process.env.MONGO_URI || (process.env.NODE_ENV === "production" ? "mongodb://mongo:27017/dating-app" : "mongodb://localhost:27017/dating-app")

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    logger.info("Connected to MongoDB")

    await User.deleteMany({})
    await Profile.deleteMany({})
    await Match.deleteMany({})
    await Message.deleteMany({})
    await Post.deleteMany({})
    logger.info("Cleared existing data")

    const password = await bcrypt.hash("password123", 10)

    const users = await User.create([
      {
        username: "olzhas",
        email: "olzhas@example.com",
        passwordHash: password,
        roles: ["admin", "user"],
        isVerified: true,
      },
      {
        username: "askhat",
        email: "askhat@example.com",
        passwordHash: password,
        roles: ["user"],
        isVerified: true,
      },
      {
        username: "tashmit",
        email: "tashmit@example.com",
        passwordHash: password,
        roles: ["user"],
        isVerified: true,
      },
      {
        username: "yelzhan",
        email: "yelzhan@example.com",
        passwordHash: password,
        roles: ["user"],
        isVerified: true,
      },
      {
        username: "tima",
        email: "tima@example.com",
        passwordHash: password,
        roles: ["user"],
        isVerified: true,
      },
    ])

    logger.info(`Created ${users.length} users`)

    const profiles = await Profile.create([
      {
        userId: users[0]._id,
        displayName: "Olzhas",
        birthDate: new Date("2004-07-03"),
        gender: "male",
        bio: "самый горячий",
        photos: ["https://4l0del5xod.ufs.sh/f/2yJTA4VqesICHLnQx2XsDKuiVcBjLhdHTGU2ZqymX8Nek0fz"],
        location: { lat: 43.2220, lng: 76.8512, city: "Алматы" },
        lookingFor: ["relationship", "friendship"],
      },
      {
        userId: users[1]._id,
        displayName: "Askhat",
        birthDate: new Date("2004-05-14"),
        gender: "female",
        bio: "самая горячая",
        photos: ["https://4l0del5xod.ufs.sh/f/2yJTA4VqesICDhIfD9yMWRvidbhoe6OFCcmfEBl9L4QAGVTj"],
        location: { lat: 43.2220, lng: 76.8512, city: "Алматы" },
        lookingFor: ["relationship", "friendship"],
      },
      {
        userId: users[2]._id,
        displayName: "Tashmit",
        birthDate: new Date("2005-03-31"),
        gender: "female",
        bio: "ищу папика",
        photos: ["https://4l0del5xod.ufs.sh/f/2yJTA4VqesICyMKYghp2MhUIlZbKjSO34mtCdTzXqYnNfogQ"],
        location: { lat: 43.2220, lng: 76.8512, city: "Алматы" },
        lookingFor: ["relationship"],
      },
      {
        userId: users[3]._id,
        displayName: "Yelzhan",
        birthDate: new Date("2004-11-30"),
        gender: "male",
        bio: "ненавижу месси",
        photos: ["https://4l0del5xod.ufs.sh/f/2yJTA4VqesICSRZsIAPCipXRz9kwKafyEWM4Dr5Ztb0mlg3Y"],
        location: { lat: 43.2183, lng: 76.8395, city: "Алатау" },
        lookingFor: ["friendship", "casual"],
      },
      {
        userId: users[4]._id,
        displayName: "Tima",
        birthDate: new Date("2007-07-07"),
        gender: "male",
        bio: "люблю кодить",
        photos: ["https://4l0del5xod.ufs.sh/f/2yJTA4VqesIC2TSTSqVqesICbx6UXkivufZ4opAydlOH9GP1"],
        location: { lat: 43.2183, lng: 76.8395, city: "Алатау" },
        lookingFor: ["friendship"],
      },
    ])

    logger.info(`Created ${profiles.length} profiles`)

    const match = await Match.create({
      participants: [users[0]._id, users[1]._id],
      status: "matched",
      likes: [
        { userId: users[0]._id, at: new Date() },
        { userId: users[1]._id, at: new Date() },
      ],
    })

    logger.info("Created match between Olzhas and Askhat")

    await Message.create([
      {
        matchId: match._id,
        senderId: users[0]._id,
        text: "Привет Askhat! Как дела?",
        attachments: [],
        sentAt: new Date(Date.now() - 3600000),
        readBy: [users[0]._id, users[1]._id],
      },
      {
        matchId: match._id,
        senderId: users[1]._id,
        text: "Привет Olzhas! Отлично, спасибо! А у тебя?",
        attachments: [],
        sentAt: new Date(Date.now() - 3000000),
        readBy: [users[0]._id, users[1]._id],
      },
      {
        matchId: match._id,
        senderId: users[0]._id,
        text: "Тоже хорошо! Может, сходим куда-нибудь?",
        attachments: [],
        sentAt: new Date(Date.now() - 1800000),
        readBy: [users[0]._id],
      },
    ])

    logger.info("Created messages")

    await Post.create([
      {
        authorId: users[0]._id,
        content: "Готов встретиться с самой горячей! 🔥",
        images: [],
        likesCount: 5,
        commentsCount: 2,
        visibility: "public",
      },
      {
        authorId: users[4]._id,
        content: "Только что закончил новый проект по кодингу! 💻",
        images: [],
        likesCount: 3,
        commentsCount: 1,
        visibility: "public",
      },
      {
        authorId: users[3]._id,
        content: "Месси - переоценен! Роналду лучше! ⚽",
        images: [],
        likesCount: 2,
        commentsCount: 5,
        visibility: "public",
      },
    ])

    logger.info("Created posts")

    logger.info("Seed completed successfully!")
    logger.info("Admin credentials: olzhas@example.com / password123")
    logger.info("Test user credentials: askhat@example.com / password123")

    await mongoose.connection.close()
  } catch (error) {
    logger.error("Seed failed:", error)
    process.exit(1)
  }
}

seed()
