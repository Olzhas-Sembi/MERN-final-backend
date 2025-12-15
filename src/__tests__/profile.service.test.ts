import { Profile } from "../models/Profile"
import mongoose from "mongoose"

describe("Profile Service", () => {
  it("should validate required fields", () => {
    const profile = new Profile({
      userId: new mongoose.Types.ObjectId(),
      displayName: "John Doe",
      birthDate: new Date("1995-01-01"),
      gender: "male",
      photos: ["photo1.jpg"],
      lookingFor: ["relationship"],
    })

    expect(profile.displayName).toBe("John Doe")
    expect(profile.gender).toBe("male")
    expect(profile.photos.length).toBeGreaterThan(0)
  })

  it("should validate gender enum", () => {
    const validGenders: Array<"male" | "female" | "other"> = ["male", "female", "other"]
    validGenders.forEach((gender) => {
      const profile = new Profile({
        userId: new mongoose.Types.ObjectId(),
        displayName: "Test User",
        birthDate: new Date("1995-01-01"),
        gender,
        photos: ["photo.jpg"],
        lookingFor: [],
      })
      expect(profile.gender).toBe(gender)
    })
  })

  it("should require at least one photo", () => {
    const profile = new Profile({
      userId: new mongoose.Types.ObjectId(),
      displayName: "Test User",
      birthDate: new Date("1995-01-01"),
      gender: "male",
      photos: [],
      lookingFor: [],
    })

    const error = profile.validateSync()
    expect(error).toBeDefined()
  })

  it("should handle optional location data", () => {
    const profile = new Profile({
      userId: new mongoose.Types.ObjectId(),
      displayName: "Test User",
      birthDate: new Date("1995-01-01"),
      gender: "female",
      photos: ["photo.jpg"],
      location: { lat: 40.7128, lng: -74.006, city: "New York" },
      lookingFor: ["friendship"],
    })

    expect(profile.location?.city).toBe("New York")
    expect(profile.location?.lat).toBe(40.7128)
  })
})
