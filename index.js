require("dotenv").config();
const { ApolloServer } = require("apollo-server");
const jwt = require("jsonwebtoken");

// GraphQL Schema
const typeDefs = `
  type ActionEmailParams {
    to: String
    from: String
    subject: String
    text: String
  }

  type ActionParams {
    to: String
    from: String
    subject: String
    text: String
  }

  type Action {
    id: ID!
    createdAt: String!
    updatedAt: String
    name: String!
    description: String
    functionString: String
    params: ActionParams
    resourceTemplateId: ID
    resourceTemplate: ResourceTemplate
  }

  type TriggerKeyword {
    caseSensitive: Boolean!
    keyword: [String!]!
  }

  type TriggerIndividualTriggers {
    Email: Boolean
  }

  type TriggerParams {
    keywords: [TriggerKeyword]
    payloads: [String]
    IndividualTriggers: TriggerIndividualTriggers
  }

  type Trigger {
    _id: ID!
    createdAt: String!
    updatedAt: String
    name: String!
    description: String
    params: TriggerParams
    functionString: String
    resourceTemplateId: ID
    resourceTemplate: ResourceTemplate
  }

  type Response {
    _id: ID!
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

  type WhatsAppButton {
    type: String!
    reply: WhatsAppButtonReply
  }

  type WhatsAppButtonReply {
    id: String
    title: String
    payload: String
  }

  type WhatsAppListSection {
    title: String
    rows: [WhatsAppListRow]
  }

  type WhatsAppListRow {
    id: String
    title: String
    description: String
    payload: String
  }

  type WhatsAppListAction {
    button: String
    sections: [WhatsAppListSection]
  }

  type WhatsAppHeader {
    type: String
    text: String
  }

  type WhatsAppBody {
    text: String
  }

  type ResponseMessage {
    type: String!
    text: String
    id: String!
    transform: String
    header: WhatsAppHeader
    body: WhatsAppBody
    action: WhatsAppListAction
  }

  type ResponseVariation {
    name: String!
    responses: [ResponseMessage]!
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

  type NodeRedirect {
    nodeId: ID
    runPostAction: Boolean
  }

  type NodePosition {
    x: Float
    y: Float
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
    preActions: [Action]
    postActions: [Action]
    priority: Float
    compositeId: ID
    global: Boolean
    colour: String
    redirect: NodeRedirect
    analytics: JSON
    memberTagging: JSON
    type: String
    tags: [String]
    saveCompositeId: Boolean
    position: NodePosition
  }

  scalar JSON

  type Query {
    node(nodeId: ID!): NodeObject
    nodes: [NodeObject]
    actions: [Action]
    triggers: [Trigger]
    responses: [Response]
    resourceTemplates: [ResourceTemplate]
  }

  input ActionParamsInput {
    to: String
    from: String
    subject: String
    text: String
  }

  input NodePositionInput {
    x: Float
    y: Float
  }

  input NodeRedirectInput {
    nodeId: ID
    runPostAction: Boolean
  }

  type Mutation {
    createNode(
      name: String!
      description: String
      triggerId: ID
      responseIds: [ID]
      actionIds: [ID]
      preActions: [ID]
      postActions: [ID]
      priority: Float
      global: Boolean
      colour: String
      position: NodePositionInput
      redirect: NodeRedirectInput
    ): NodeObject

    updateNode(
      id: ID!
      name: String
      description: String
      triggerId: ID
      responseIds: [ID]
      actionIds: [ID]
      preActions: [ID]
      postActions: [ID]
      priority: Float
      global: Boolean
      colour: String
      position: NodePositionInput
      redirect: NodeRedirectInput
    ): NodeObject

    deleteNode(id: ID!): Boolean

    createAction(
      name: String!
      description: String
      functionString: String
      params: ActionParamsInput
      resourceTemplateId: ID!
    ): Action
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
    preActions: (node) =>
      node.preActions ? node.preActions.map(findActionById) : null,
    postActions: (node) =>
      node.postActions ? node.postActions.map(findActionById) : null,
  },
  Action: {
    id: (action) => action._id || action.id,
    resourceTemplate: (action) =>
      findResourceTemplateById(action.resourceTemplateId),
    params: (action) => action.params || null,
  },
  Trigger: {
    resourceTemplate: (trigger) =>
      findResourceTemplateById(trigger.resourceTemplateId),
    params: (trigger) => trigger.params || null,
  },
  Response: {
    platforms: (response) => response.platforms || [],
  },
  ResponseVariation: {
    responses: (variation) => variation.responses || [],
  },
};

const server = new ApolloServer({ typeDefs, resolvers, context });

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log("Sample JWT:", jwt.sign({ user: "test" }, JWT_SECRET));
});
