# Dating App Backend

GraphQL API server with real-time features for the dating application.

## Tech Stack

- Node.js + Express
- Apollo Server (GraphQL)
- MongoDB + Mongoose
- GraphQL Subscriptions (graphql-ws)
- JWT Authentication
- TypeScript
- Jest for testing

## Getting Started

### Development

\`\`\`bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Start MongoDB (if running locally)
# Or use Docker Compose

# Run development server
npm run dev
\`\`\`

### Docker

\`\`\`bash
# Build and run
docker build -t dating-app-api .
docker run -p 4000:4000 --env-file .env dating-app-api
\`\`\`

## Scripts

- \`npm run dev\` - Start development server with hot reload
- \`npm run build\` - Build TypeScript to JavaScript
- \`npm start\` - Start production server
- \`npm test\` - Run tests
- \`npm run test:watch\` - Run tests in watch mode
- \`npm run seed\` - Seed database with test data
- \`npm run lint\` - Run ESLint

## API Endpoints

- **GraphQL**: http://localhost:4000/graphql
- **WebSocket**: ws://localhost:4000/graphql
- **Health Check**: http://localhost:4000/health

## Testing

\`\`\`bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.ts

# Watch mode
npm run test:watch
\`\`\`

## Database Seeding

\`\`\`bash
npm run seed
\`\`\`

This creates:
- 4 test users (alice, bob, charlie, diana)
- Profiles for each user
- A match between Alice and Bob
- Sample messages and posts

Test credentials: \`alice@example.com\` / \`password123\`

## Environment Variables

See \`.env.example\` for all required variables.

## Project Structure

\`\`\`
server/
├── src/
│   ├── models/          # Mongoose models
│   ├── graphql/         # Schema and resolvers
│   ├── lib/             # Utilities (JWT, logger, errors)
│   ├── scripts/         # Seed script
│   ├── __tests__/       # Jest tests
│   └── server.ts        # Entry point
├── Dockerfile
└── package.json
\`\`\`
