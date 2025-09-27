const { ApolloServer } = require("apollo-server");
const { resolvers } = require("../src/resolvers.js");
const { typeDefs } = require("../src/schema.js");

describe("CrossLinkTorture Query", () => {
  let server;

  beforeAll(() => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
      context: () => ({ user: { id: "test-user" } }),
    });
  });

  it("should return node with ancestors up to depth 6", async () => {
    const query = `
      query CrossLinkTorture($nodeId: ID!, $depth: Int = 6) {
        node(nodeId: $nodeId) {
          id
          name
          compositeId
          ancestors(depth: $depth, unique: true) {
            id
            name
            compositeId
          }
        }
      }
    `;
    const variables = { nodeId: "L2ZrxYMqAW44L5tB", depth: 6 };
    const res = await server.executeOperation({ query, variables });

    expect(res.errors).toBeUndefined();
    expect(res.data.node).toBeDefined();
    expect(res.data.node.ancestors.length).toBeLessThanOrEqual(6);
  });
});
