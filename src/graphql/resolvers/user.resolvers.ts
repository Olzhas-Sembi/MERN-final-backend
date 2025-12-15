import { User } from "../../models/User"
import { Profile } from "../../models/Profile"
import { requireAuth } from "../../lib/jwt"
import { NotFoundError } from "../../lib/errors"

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      const auth = requireAuth(context)
      const user = await User.findById(auth.userId)
      if (!user || user.isDeleted) {
        throw new NotFoundError("User")
      }
      return user
    },

    user: async (_: any, { id }: any) => {
      const user = await User.findById(id)
      if (!user || user.isDeleted) {
        throw new NotFoundError("User")
      }
      return user
    },
  },

  User: {
    profile: async (parent: any) => {
      return await Profile.findOne({ userId: parent._id, isDeleted: false })
    },
  },
}
