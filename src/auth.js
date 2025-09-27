/**
 * =========================
 *       Auth Context
 * =========================
 */

import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";
import { buildLoaders } from "./loaders.js";

export const context = ({ req }) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) throw new Error("Missing Bearer token");
  const token = auth.replace("Bearer ", "");
  try {
    jwt.verify(token, JWT_SECRET);
  } catch (e) {
    throw new Error("Invalid token");
  }
  return { loaders: buildLoaders() };
};
