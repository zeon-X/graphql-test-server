// @MD.SHEFAT ZEON

const { ApolloServer } = require("apollo-server");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { context } = require("./src/auth");
const { JWT_SECRET, PORT } = require("./src/config");
const { resolvers } = require("./src/resolvers");
const { typeDefs } = require("./src/schema");

dotenv.config();

/**
 * =========================
 *         Server
 * =========================
 */
const server = new ApolloServer({ typeDefs, resolvers, context });

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log("Sample JWT:", jwt.sign({ user: "test" }, JWT_SECRET));
});
