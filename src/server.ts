import express from "express"
import { createServer } from "http"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import { WebSocketServer } from "ws"
import { useServer } from "graphql-ws/lib/use/ws"
import { makeExecutableSchema } from "@graphql-tools/schema"
import cors from "cors"
import { json } from "body-parser"
import mongoose from "mongoose"
import { typeDefs } from "./graphql/schema"
import { resolvers } from "./graphql/resolvers"
import { verifyToken } from "./lib/jwt"
import { logger } from "./lib/logger"

const PORT = process.env.PORT || 4000

async function startServer() {
  const app = express()
  const httpServer = createServer(app)

  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://mongo:27017/dating-app")
    logger.info("Connected to MongoDB")
  } catch (error) {
    logger.error("MongoDB connection error:", error)
    process.exit(1)
  }

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  })

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        const token = ctx.connectionParams?.authorization as string
        if (token) {
          try {
            const user = verifyToken(token.replace("Bearer ", ""))
            return { user }
          } catch (error) {
            logger.error("WebSocket auth error:", error)
          }
        }
        return {}
      },
    },
    wsServer,
  )

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
    formatError: (err) => {
      logger.error("GraphQL Error:", {
        message: err.message,
        code: err.extensions?.code,
        path: err.path,
        originalError: (err as any).originalError,
      })
      return {
        message: err.message,
        code: err.extensions?.code || "INTERNAL_ERROR",
        path: err.path,
        extensions: err.extensions,
      }
    },
  })

  await server.start()

  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    }),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization
        if (token) {
          try {
            const user = verifyToken(token.replace("Bearer ", ""))
            return { user }
          } catch (error) {
            logger.error("HTTP auth error:", error)
          }
        }
        return {}
      },
    }),
  )

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
  })

  httpServer.listen(PORT, () => {
    logger.info(`Server ready at http://localhost:${PORT}/graphql`)
    logger.info(`WebSocket ready at ws://localhost:${PORT}/graphql`)
  })
}

startServer().catch((error) => {
  logger.error("Failed to start server:", error)
  process.exit(1)
})
