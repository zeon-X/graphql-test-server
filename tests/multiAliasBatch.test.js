// @MD.SHEFAT ZEON
// tests/multiAliasBatch.test.js

const { ApolloServer } = require("apollo-server");
const { resolvers } = require("../src/resolvers.js");
const { typeDefs } = require("../src/schema.js");
const { buildLoaders } = require("../src/loaders.js");

describe("MultiAliasBatch Query", () => {
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

  it("should handle multiple aliases and repeated nodes", async () => {
    const query = `
      query MultiAliasBatch($greet: ID!, $webinar: ID!, $email: ID!, $ten: ID!, $twelve: ID!) {
        A1: node(nodeId: $greet) { id name compositeId trigger { _id name } }
        A2: node(nodeId: $greet) { id name compositeId parents { id name } }
        B: node(nodeId: $webinar) { id name compositeId parents { id name } responses { _id name } actions { _id name } }
        C: node(nodeId: $email) { id name compositeId postActions { _id name } ancestors(depth: 5) { id name } }
        D: node(nodeId: $ten) { id name compositeId parents { id name } }
        E: node(nodeId: $twelve) { id name compositeId parents { id name } }
        nodes { id name compositeId root }
      }
    `;

    const variables = {
      greet: "V78P4OA9maz31ORn",
      webinar: "rCMUtmL3aOULyqBL",
      email: "L2ZrxYMqAW44L5tB",
      ten: "Er9xF8cOr7oVrrvj",
      twelve: "cqBGDrKZrRqiMJpz",
    };

    const res = await server.executeOperation({ query, variables });

    expect(res.errors).toBeUndefined();
    expect(res.data.A1).toBeDefined();
    expect(res.data.A2).toBeDefined();
    expect(res.data.B).toBeDefined();
    expect(res.data.C).toBeDefined();
    expect(res.data.D).toBeDefined();
    expect(res.data.E).toBeDefined();
    expect(res.data.nodes.length).toBeGreaterThan(0);
  });
});
