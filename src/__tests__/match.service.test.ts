import { Match } from "../models/Match"
import mongoose from "mongoose"

describe("Match Service", () => {
  it("should validate match with two participants", () => {
    const match = new Match({
      participants: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
      status: "pending",
      likes: [],
    })

    expect(match.participants.length).toBe(2)
    expect(match.status).toBe("pending")
  })

  it("should handle like addition", () => {
    const userId = new mongoose.Types.ObjectId()
    const match = new Match({
      participants: [userId, new mongoose.Types.ObjectId()],
      status: "pending",
      likes: [{ userId, at: new Date() }],
    })

    expect(match.likes.length).toBe(1)
    expect(match.likes[0].userId).toEqual(userId)
  })

  it("should validate match statuses", () => {
    const validStatuses = ["pending", "matched", "rejected", "blocked"]
    validStatuses.forEach((status) => {
      const match = new Match({
        participants: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
        status,
        likes: [],
      })
      expect(match.status).toBe(status)
    })
  })
})
