import mongoose, { Schema, type Document } from "mongoose"

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId
  displayName: string
  birthDate: Date
  gender: "male" | "female" | "other"
  bio?: string
  photos: string[]
  location?: {
    lat: number
    lng: number
    city: string
  }
  lookingFor: string[]
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    photos: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 1,
        message: "At least one photo is required",
      },
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      city: { type: String },
    },
    lookingFor: {
      type: [String],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
ProfileSchema.index({ userId: 1 })
ProfileSchema.index({ gender: 1, isDeleted: 1 })
ProfileSchema.index({ "location.city": 1 })

export const Profile = mongoose.model<IProfile>("Profile", ProfileSchema)
