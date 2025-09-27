/**
 * =========================
 *         Config
 * =========================
 */
const JWT_SECRET = process.env.JWT_SECRET || "test_secret";
const PORT = process.env.PORT || 4000;

module.exports = { JWT_SECRET, PORT };
