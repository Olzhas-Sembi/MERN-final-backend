import { Post } from "../models/Post"
import mongoose from "mongoose"

describe("Post Service", () => {
  it("should create post with content", () => {
    const post = new Post({
      authorId: new mongoose.Types.ObjectId(),
      content: "This is my first post!",
      images: [],
      likesCount: 0,
      commentsCount: 0,
      visibility: "public",
    })

    expect(post.content).toBe("This is my first post!")
    expect(post.visibility).toBe("public")
    expect(post.likesCount).toBe(0)
  })

  it("should validate visibility enum", () => {
    const validVisibilities: Array<"public" | "friends" | "private"> = ["public", "friends", "private"]
    validVisibilities.forEach((visibility) => {
      const post = new Post({
        authorId: new mongoose.Types.ObjectId(),
        content: "Test post",
        images: [],
        likesCount: 0,
        commentsCount: 0,
        visibility,
      })
      expect(post.visibility).toBe(visibility)
    })
  })

  it("should handle images array", () => {
    const post = new Post({
      authorId: new mongoose.Types.ObjectId(),
      content: "Post with images",
      images: ["image1.jpg", "image2.jpg"],
      likesCount: 0,
      commentsCount: 0,
      visibility: "public",
    })

    expect(post.images.length).toBe(2)
  })
})
