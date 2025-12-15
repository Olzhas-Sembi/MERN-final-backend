export const typeDefs = `#graphql
  scalar Date

  type User {
    id: ID!
    username: String!
    email: String!
    roles: [String!]!
    isVerified: Boolean!
    lastSeen: Date
    profile: Profile
    createdAt: Date!
    updatedAt: Date!
  }

  type Profile {
    id: ID!
    userId: ID!
    user: User!
    displayName: String!
    birthDate: Date!
    gender: Gender!
    bio: String
    photos: [String!]!
    location: Location
    lookingFor: [String!]!
    createdAt: Date!
    updatedAt: Date!
  }

  enum Gender {
    male
    female
    other
  }

  type Location {
    lat: Float!
    lng: Float!
    city: String!
  }

  input LocationInput {
    lat: Float!
    lng: Float!
    city: String!
  }

  type Match {
    id: ID!
    participants: [User!]!
    status: MatchStatus!
    likes: [Like!]!
    createdAt: Date!
    updatedAt: Date!
  }

  enum MatchStatus {
    pending
    matched
    rejected
    blocked
  }

  type Like {
    userId: ID!
    user: User!
    at: Date!
  }

  type Message {
    id: ID!
    matchId: ID!
    match: Match!
    senderId: ID!
    sender: User!
    text: String!
    attachments: [Attachment!]!
    readBy: [ID!]!
    sentAt: Date!
    edited: Boolean!
  }

  type Attachment {
    url: String!
    type: String!
  }

  input AttachmentInput {
    url: String!
    type: String!
  }

  type Post {
    id: ID!
    authorId: ID!
    author: User!
    content: String!
    images: [String!]!
    likesCount: Int!
    likedBy: [ID!]!
    isLiked: Boolean!
    commentsCount: Int!
    visibility: PostVisibility!
    createdAt: Date!
    updatedAt: Date!
  }

  enum PostVisibility {
    public
    friends
    private
  }

  type AuthPayload {
    accessToken: String!
    user: User!
  }

  input SignUpInput {
    username: String!
    email: String!
    password: String!
  }

  input SignInInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    displayName: String
    birthDate: Date
    gender: Gender
    bio: String
    photos: [String!]
    location: LocationInput
    lookingFor: [String!]
  }

  input CreatePostInput {
    content: String!
    images: [String!]
    visibility: PostVisibility
  }

  input SearchProfilesInput {
    gender: Gender
    minAge: Int
    maxAge: Int
    city: String
    limit: Int
    offset: Int
  }

  type ProfileConnection {
    profiles: [Profile!]!
    total: Int!
    hasMore: Boolean!
  }

  type MessageConnection {
    messages: [Message!]!
    hasMore: Boolean!
  }

  type OnlineStatus {
    userId: ID!
    online: Boolean!
  }

  type AdminStats {
    totalUsers: Int!
    totalProfiles: Int!
    totalPosts: Int!
    totalMatches: Int!
    totalMessages: Int!
    usersByRole: [UserRoleCount!]!
    likesByUser: [UserLikeStats!]!
    postsByUser: [UserPostStats!]!
  }

  type UserRoleCount {
    role: String!
    count: Int!
  }

  type UserLikeStats {
    userId: ID!
    username: String!
    likesGiven: Int!
    likesReceived: Int!
  }

  type UserPostStats {
    userId: ID!
    username: String!
    postsCount: Int!
    totalLikes: Int!
  }

  type Query {
    me: User
    user(id: ID!): User
    searchProfiles(input: SearchProfilesInput!): ProfileConnection!
    matches: [Match!]!
    match(id: ID!): Match
    messages(matchId: ID!, after: ID): MessageConnection!
    posts(limit: Int, offset: Int): [Post!]!
    post(id: ID!): Post
    adminStats: AdminStats!
  }

  type Mutation {
    signUp(input: SignUpInput!): AuthPayload!
    signIn(input: SignInInput!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): Profile!
    likeProfile(targetUserId: ID!): Match!
    dislikeProfile(targetUserId: ID!): Boolean!
    sendMessage(matchId: ID!, text: String!, attachments: [AttachmentInput!]): Message!
    markMessageRead(messageId: ID!): Message!
    createPost(input: CreatePostInput!): Post!
    likePost(postId: ID!): Post!
    logout: Boolean!
  }

  type Subscription {
    messageAdded(matchId: ID!): Message!
    userOnlineStatus(userId: ID!): OnlineStatus!
  }
`
