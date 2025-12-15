import { Message } from "../models/Message"
import mongoose from "mongoose"

describe("Message Service", () => {
  it("should create message with required fields", () => {
    const message = new Message({
      matchId: new mongoose.Types.ObjectId(),
      senderId: new mongoose.Types.ObjectId(),
      text: "Hello, how are you?",
      attachments: [],
      readBy: [],
      sentAt: new Date(),
    })

    expect(message.text).toBe("Hello, how are you?")
    expect(message.attachments).toEqual([])
    expect(message.edited).toBe(false)
  })

  it("should handle attachments", () => {
    const message = new Message({
      matchId: new mongoose.Types.ObjectId(),
      senderId: new mongoose.Types.ObjectId(),
      text: "Check this out!",
      attachments: [{ url: "https://example.com/image.jpg", type: "image" }],
      readBy: [],
      sentAt: new Date(),
    })

    expect(message.attachments.length).toBe(1)
    expect(message.attachments[0].type).toBe("image")
  })

  it("should validate text length constraint", () => {
    const longText = "a".repeat(2001)
    const message = new Message({
      matchId: new mongoose.Types.ObjectId(),
      senderId: new mongoose.Types.ObjectId(),
      text: longText,
      attachments: [],
      readBy: [],
      sentAt: new Date(),
    })

    const error = message.validateSync()
    expect(error).toBeDefined()
  })
})
