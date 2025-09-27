// @MD.SHEFAT ZEON
// tests/toggleSections.test.js

const { ApolloServer } = require("apollo-server");
const { resolvers } = require("../src/resolvers.js");
const { typeDefs } = require("../src/schema.js");
const { buildLoaders } = require("../src/loaders.js");

describe("ToggleSections Query", () => {
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

  it("should toggle sections with @include/@skip directives", async () => {
    const query = `
      query ToggleSections(
        $nodeId: ID!
        $withTrigger: Boolean!
        $withResponses: Boolean!
        $withActions: Boolean!
        $withParents: Boolean!
      ) {
        node(nodeId: $nodeId) {
          id
          name
          compositeId
          triggerId @include(if: $withTrigger)
          trigger @include(if: $withTrigger) { _id name resourceTemplate { _id name } }
          responseIds @include(if: $withResponses)
          responses @include(if: $withResponses) { _id name createdAt }
          actionIds @include(if: $withActions)
          actions @include(if: $withActions) { _id name }
          parents @include(if: $withParents) { id name parentIds }
        }
      }
    `;

    const variables = {
      nodeId: "rCMUtmL3aOULyqBL",
      withTrigger: true,
      withResponses: false,
      withActions: true,
      withParents: true,
    };

    const res = await server.executeOperation({ query, variables });

    expect(res.errors).toBeUndefined();
    expect(res.data.node).toBeDefined();
    expect(res.data.node.responses).toBeUndefined();
    expect(res.data.node.actions).toBeDefined();
    expect(res.data.node.parents).toBeDefined();
  });
});
