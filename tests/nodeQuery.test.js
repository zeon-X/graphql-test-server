// @MD.SHEFAT ZEON
// tests/nodeQuery.test.js

const { ApolloServer } = require("apollo-server");
const { resolvers } = require("../src/resolvers.js");
const { typeDefs } = require("../src/schema.js");
const { buildLoaders } = require("../src/loaders.js");

describe("Node Query", () => {
  let server;

  beforeAll(() => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
      context: () => ({
        user: { id: "test-user" },
        loaders: buildLoaders(),
      }),
    });
  });

  it("should fetch node with trigger, responses, actions, and parent details", async () => {
    const query = `
      query Node($nodeId: ID!) {
        node(nodeId: $nodeId) {
          name
          triggerId
          trigger {
            _id
            resourceTemplateId
          }
          responseIds
          actionIds
          parentIds
          parents {
            name
            description
            actionIds
            parentIds
          }
        }
      }
    `;

    const variables = { nodeId: "L2ZrxYMqAW44L5tB" };

    const res = await server.executeOperation({ query, variables });

    expect(res.errors).toBeUndefined();
    expect(res.data.node).toBeDefined();
    expect(res.data.node.name).toBeDefined();
    expect(res.data.node.triggerId).toBeDefined();
    expect(res.data.node.trigger).toBeDefined();
    expect(res.data.node.parents).toBeInstanceOf(Array);
  });
});
