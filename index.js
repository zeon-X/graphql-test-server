require("dotenv").config();
const { ApolloServer } = require("apollo-server");
const jwt = require("jsonwebtoken");

// GraphQL Schema
const typeDefs = `
  type Action {
    id: ID!
    createdAt: String!
    updatedAt: String
    name: String!
    description: String
    functionString: String
    resourceTemplateId: ID
    resourceTemplate: ResourceTemplate
  }

  type Trigger {
    _id: ID!
    createdAt: String!
    updatedAt: String
    name: String!
    description: String
    functionString: String
    resourceTemplateId: ID
    resourceTemplate: ResourceTemplate
  }

  type Response {
    id: ID!
    createdAt: String!
    updatedAt: String
    name: String!
    description: String
    platforms: [ResponsePlatform]
  }

  type ResponsePlatform {
    integrationId: ID
    build: Int
    localeGroups: [ResponseLocaleGroup]
  }

  type ResponseLocaleGroup {
    localeGroupId: ID
    localeGroup: String
    variations: [ResponseVariation]
  }

  type ResponseVariation {
    name: String!
    responses: JSON
  }

  type ResourceTemplate {
    _id: ID!
    createdAt: String!
    updatedAt: String
    name: String!
    description: String
    schema: JSON
    integrationId: String
    functionString: String
    key: String
  }

  type NodeObject {
    id: ID!
    createdAt: String!
    updatedAt: String
    name: String!
    description: String
    parents: [NodeObject]
    parentIds: [ID]
    root: Boolean
    trigger: Trigger
    triggerId: ID
    responses: [Response]
    responseIds: [ID]
    actions: [Action]
    actionIds: [ID]
    priority: Float
    compositeId: ID
    global: Boolean
    colour: String
  }

  scalar JSON

  type Query {
    node(nodeId: ID!): NodeObject
  }
`;

// Load JSON data
const nodes = require("./data/node.json");
const triggers = require("./data/trigger.json");
const responses = require("./data/response.json");
const actions = require("./data/action.json");
const resourceTemplates = require("./data/resourceTemplate.json");

// JWT secret from env
const JWT_SECRET = process.env.JWT_SECRET || "test_secret";
const PORT = process.env.PORT || 4000;

// Helper functions to find by ID
function findNodeById(id) {
  return nodes.find((n) => n._id === id || n.id === id);
}
function findTriggerById(id) {
  return triggers.find((t) => t._id === id);
}
function findResponseById(id) {
  return responses.find((r) => r._id === id || r.id === id);
}
function findActionById(id) {
  return actions.find((a) => a._id === id || a.id === id);
}
function findResourceTemplateById(id) {
  return resourceTemplates.find((rt) => rt._id === id);
}

// Auth middleware
const context = ({ req }) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) throw new Error("Missing Bearer token");
  const token = auth.replace("Bearer ", "");
  try {
    jwt.verify(token, JWT_SECRET);
  } catch (e) {
    throw new Error("Invalid token");
  }
  return {};
};

// Resolvers
const resolvers = {
  Query: {
    node: (_, { nodeId }) => {
      return findNodeById(nodeId);
    },
  },
  NodeObject: {
    id: (node) => node._id || node.id,
    trigger: (node) => (node.trigger ? findTriggerById(node.trigger) : null),
    triggerId: (node) => node.trigger || node.triggerId || null,
    responses: (node) =>
      (node.responses || node.responseIds || []).map(findResponseById),
    responseIds: (node) => node.responses || node.responseIds || [],
    actions: (node) =>
      (node.actions || node.actionIds || []).map(findActionById),
    actionIds: (node) => node.actions || node.actionIds || [],
    parents: (node) => (node.parents || node.parentIds || []).map(findNodeById),
    parentIds: (node) => node.parents || node.parentIds || [],
  },
  Trigger: {
    resourceTemplate: (trigger) =>
      findResourceTemplateById(trigger.resourceTemplateId),
  },
  Action: {
    resourceTemplate: (action) =>
      findResourceTemplateById(action.resourceTemplateId),
  },
};

const server = new ApolloServer({ typeDefs, resolvers, context });

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log("Sample JWT:", jwt.sign({ user: "test" }, JWT_SECRET));
});
