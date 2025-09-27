/**
 * =========================
 *        Scalars
 * =========================
 */

const { GraphQLScalarType, Kind } = require("graphql");

function parseJsonLiteral(ast) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT: {
      const value = Object.create(null);
      ast.fields.forEach((field) => {
        value[field.name.value] = parseJsonLiteral(field.value);
      });
      return value;
    }
    case Kind.LIST:
      return ast.values.map(parseJsonLiteral);
    default:
      return null;
  }
}

const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  description: "Arbitrary JSON value",
  parseValue: (value) => value,
  serialize: (value) => value,
  parseLiteral: parseJsonLiteral,
});

const LongScalar = new GraphQLScalarType({
  name: "Long",
  description:
    "64-bit integer; accepts number or numeric string. Returns number when safe.",
  serialize(value) {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() !== "" && !isNaN(value)) {
      const n = Number(value);
      return Number.isFinite(n) ? n : value;
    }
    throw new TypeError(`Long cannot serialize value: ${value}`);
  },
  parseValue(value) {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() !== "" && !isNaN(value)) {
      const n = Number(value);
      return Number.isFinite(n) ? n : value;
    }
    throw new TypeError(`Long cannot parse value: ${value}`);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) return Number(ast.value);
    if (ast.kind === Kind.STRING && !isNaN(ast.value)) {
      const n = Number(ast.value);
      return Number.isFinite(n) ? n : ast.value;
    }
    return null;
  },
});

module.exports = { JSONScalar, LongScalar };
