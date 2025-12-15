import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import { User } from "../models/User"
import { Profile } from "../models/Profile"
import { Match } from "../models/Match"
import { Message } from "../models/Message"
import bcrypt from "bcrypt"

describe("Integration Tests", () => {
  let mongoServer: MongoMemoryServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  afterEach(async () => {
    const collections = mongoose.connection.collections
    for (const key in collections) {
      await collections[key].deleteMany({})
    }
  })

  it("should complete full user flow: signup -> profile -> match -> message", async () => {
    // 1. Create two users
    const passwordHash = await bcrypt.hash("password123", 10)

    const user1 = await User.create({
      username: "alice",
      email: "alice@test.com",
      passwordHash,
      roles: ["user"],
      isVerified: true,
    })

    const user2 = await User.create({
      username: "bob",
      email: "bob@test.com",
      passwordHash,
      roles: ["user"],
      isVerified: true,
    })

    expect(user1._id).toBeDefined()
    expect(user2._id).toBeDefined()

    // 2. Create profiles
    const profile1 = await Profile.create({
      userId: user1._id,
      displayName: "Alice",
      birthDate: new Date("1995-05-15"),
      gender: "female",
      photos: ["photo1.jpg"],
      lookingFor: ["relationship"],
    })

    const profile2 = await Profile.create({
      userId: user2._id,
      displayName: "Bob",
      birthDate: new Date("1992-08-22"),
      gender: "male",
      photos: ["photo2.jpg"],
      lookingFor: ["relationship"],
    })

    expect(profile1.displayName).toBe("Alice")
    expect(profile2.displayName).toBe("Bob")

    // 3. Create match with mutual likes
    const match = await Match.create({
      participants: [user1._id, user2._id],
      status: "matched",
      likes: [
        { userId: user1._id, at: new Date() },
        { userId: user2._id, at: new Date() },
      ],
    })

    expect(match.status).toBe("matched")
    expect(match.participants.length).toBe(2)

    // 4. Send messages
    const message1 = await Message.create({
      matchId: match._id,
      senderId: user1._id,
      text: "Hi Bob!",
      attachments: [],
      readBy: [user1._id],
      sentAt: new Date(),
    })

    const message2 = await Message.create({
      matchId: match._id,
      senderId: user2._id,
      text: "Hey Alice!",
      attachments: [],
      readBy: [user2._id],
      sentAt: new Date(),
    })

    expect(message1.text).toBe("Hi Bob!")
    expect(message2.text).toBe("Hey Alice!")

    // 5. Verify relationships
    const foundMatch = await Match.findById(match._id)
    expect(foundMatch?.participants).toContainEqual(user1._id)
    expect(foundMatch?.participants).toContainEqual(user2._id)

    const messages = await Message.find({ matchId: match._id }).sort({ sentAt: 1 })
    expect(messages.length).toBe(2)
    expect(messages[0].text).toBe("Hi Bob!")
    expect(messages[1].text).toBe("Hey Alice!")
  })

  it("should handle profile search with filters", async () => {
    const passwordHash = await bcrypt.hash("password123", 10)

    // Create multiple users with profiles
    const users = await Promise.all([
      User.create({
        username: "user1",
        email: "user1@test.com",
        passwordHash,
        roles: ["user"],
      }),
      User.create({
        username: "user2",
        email: "user2@test.com",
        passwordHash,
        roles: ["user"],
      }),
      User.create({
        username: "user3",
        email: "user3@test.com",
        passwordHash,
        roles: ["user"],
      }),
    ])

    await Promise.all([
      Profile.create({
        userId: users[0]._id,
        displayName: "User 1",
        birthDate: new Date("1995-01-01"),
        gender: "female",
        photos: ["photo.jpg"],
        location: { lat: 40.7128, lng: -74.006, city: "New York" },
        lookingFor: ["relationship"],
      }),
      Profile.create({
        userId: users[1]._id,
        displayName: "User 2",
        birthDate: new Date("1998-01-01"),
        gender: "male",
        photos: ["photo.jpg"],
        location: { lat: 40.7128, lng: -74.006, city: "New York" },
        lookingFor: ["friendship"],
      }),
      Profile.create({
        userId: users[2]._id,
        displayName: "User 3",
        birthDate: new Date("1992-01-01"),
        gender: "female",
        photos: ["photo.jpg"],
        location: { lat: 34.0522, lng: -118.2437, city: "Los Angeles" },
        lookingFor: ["relationship"],
      }),
    ])

    // Search by gender
    const femaleProfiles = await Profile.find({ gender: "female", isDeleted: false })
    expect(femaleProfiles.length).toBe(2)

    // Search by city
    const nyProfiles = await Profile.find({
      "location.city": "New York",
      isDeleted: false,
    })
    expect(nyProfiles.length).toBe(2)
  })
})
