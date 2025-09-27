// @MD.SHEFAT ZEON
// tests/fourLevelParentChain.test.js

const { ApolloServer } = require("apollo-server");
const { resolvers } = require("../src/resolvers.js");
const { typeDefs } = require("../src/schema.js");
const { buildLoaders } = require("../src/loaders.js");

describe("FourLevelParentChain Query", () => {
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

  it("should return explicit four-level parent chain without cycles", async () => {
    const query = `
      query FourLevelParentChain($leafId: ID!) {
        leaf: node(nodeId: $leafId) {
          id
          name
          parentIds
          p1: parents {
            id name parentIds
            p2: parents {
              id name parentIds
              p3: parents {
                id name parentIds
                p4: parents { id name parentIds }
              }
            }
          }
        }
      }
    `;

    const variables = { leafId: "L2ZrxYMqAW44L5tB" };

    const res = await server.executeOperation({ query, variables });

    expect(res.errors).toBeUndefined();
    expect(res.data.leaf).toBeDefined();
    expect(res.data.leaf.p1).toBeDefined();
  });
});
