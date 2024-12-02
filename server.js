require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const connectDB = require('./config/db');
const { typeDefs, resolvers } = require('./graphql');
const auth = require('./middleware/auth');
const cors = require('cors');

const startServer = async () => {
  const app = express();
  const FRONTEND_URL = process.env.FRONTEND_URL;
  const BACKEND_URL = process.env.BACKEND_URL;
  
  // Connect to MongoDB
  await connectDB();

  app.use(cors({
    origin: FRONTEND_URL,
    credentials: false
  }));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      let user = null;
      try {
        user = await auth(req);
      } catch (error) {
        // Continue without user context
      }
      return { user };
    }
  });

  await server.start();
  server.applyMiddleware({ 
    app,
    cors: false
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 PORT: ${PORT}`);
    console.log(`🚀 GraphQL endpoint: http://${BACKEND_URL}:${PORT}${server.graphqlPath}`);
  });
};

startServer().catch(error => {
  console.error('Error starting server:', error);
}); 