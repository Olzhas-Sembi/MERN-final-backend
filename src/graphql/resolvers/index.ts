import { userResolvers } from "./user.resolvers"
import { authResolvers } from "./auth.resolvers"
import { profileResolvers } from "./profile.resolvers"
import { matchResolvers } from "./match.resolvers"
import { messageResolvers } from "./message.resolvers"
import { postResolvers } from "./post.resolvers"
import { adminResolvers } from "./admin.resolvers"
import { PubSub } from "graphql-subscriptions"

export const pubsub = new PubSub()

const dateScalar = {
  Date: {
    serialize: (value: Date) => value.toISOString(),
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: any) => {
      if (ast.kind === "StringValue") {
        return new Date(ast.value)
      }
      return null
    },
  },
}

export const resolvers = {
  ...dateScalar,
  Query: {
    ...userResolvers.Query,
    ...profileResolvers.Query,
    ...matchResolvers.Query,
    ...messageResolvers.Query,
    ...postResolvers.Query,
    ...adminResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...profileResolvers.Mutation,
    ...matchResolvers.Mutation,
    ...messageResolvers.Mutation,
    ...postResolvers.Mutation,
  },
  Subscription: {
    ...messageResolvers.Subscription,
  },
  User: userResolvers.User,
  Profile: profileResolvers.Profile,
  Match: matchResolvers.Match,
  Message: messageResolvers.Message,
  Post: postResolvers.Post,
}
