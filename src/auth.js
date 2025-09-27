const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");
const { buildLoaders } = require("./loaders");

module.exports.context = ({ req }) => {
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
