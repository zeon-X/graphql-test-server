// @MD.SHEFAT ZEON

import { ApolloServer } from "apollo-server";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { context } from "./src/auth.js";
import { JWT_SECRET, PORT } from "./src/config.js";
import { resolvers } from "./src/resolvers.js";
import { typeDefs } from "./src/schema.js";

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
