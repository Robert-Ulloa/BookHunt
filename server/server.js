const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const path = require('path');
const mongoose = require('./config/connection'); 
const { typeDefs, resolvers } = require('./schemas');

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  try {
    await server.start();

    //  middlewares
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // GraphQL route
    app.use('/graphql', expressMiddleware(server));

    // Serve static assets if in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/build')));
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
      });
    }

    await mongoose.connection;

    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`GraphQL at http://localhost:${PORT}/graphql`);
    });
  } catch (err) {
    console.error('Error starting the server:', err);
  }
};

startApolloServer();