require("dotenv").config();
const { ApolloServer } = require("apollo-server");
const jwt = require("jsonwebtoken");
const DataLoader = require("dataloader");
const { GraphQLScalarType, Kind } = require("graphql");

/**
 * Your original schema (unchanged)
 * NOTE: we rename it to baseTypeDefs and then extend it below.
 */
const baseTypeDefs = `
  scalar JSON

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
    _id: ID!
    createdAt: String!
    updatedAt: String
    name: String!
    description: String
    functionString: String
    params: ActionParams
    resourceTemplateId: ID
    resourceTemplate: ResourceTemplate
  }

  type NodeRedirect {
    compositeId: ID
    triggerId: ID
  }

  type NodePosition {
    x: Float!
    y: Float!
  }

  type TriggerParams {
    to: String
    subject: String
    text: String
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

  type ResponseWhatsAppHeader {
    type: String
    text: String
  }

  type WhatsAppHeader {
    type: String
    text: String
  }

  type WhatsAppBody {
    text: String
  }

  type WhatsAppListActionSectionRow {
    id: String
    title: String
    description: String
  }

  type WhatsAppListActionSection {
    title: String
    rows: [WhatsAppListActionSectionRow]
  }

  type WhatsAppListAction {
    title: String
    sections: [WhatsAppListActionSection]
    button: String
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

  type ResponsePlatform {
    platform: String!
    variations: [ResponseVariation]!
  }

  type Response {
    _id: ID!
    createdAt: String!
    updatedAt: String
    name: String!
    platforms: [ResponsePlatform]!
  }

  type ResourceTemplate {
    _id: ID!
    createdAt: String!
    updatedAt: String
    name: String!
    description: String
    schema: String
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

  input WhatsAppListActionSectionRowInput {
    id: String
    title: String
    description: String
  }

  input WhatsAppListActionSectionInput {
    title: String
    rows: [WhatsAppListActionSectionRowInput]
  }

  input WhatsAppListActionInput {
    title: String
    sections: [WhatsAppListActionSectionInput]
    button: String
  }

  input WhatsAppHeaderInput {
    type: String
    text: String
  }

  input WhatsAppBodyInput {
    text: String
  }

  input ResponseMessageInput {
    type: String!
    text: String
    id: String!
    transform: String
    header: WhatsAppHeaderInput
    body: WhatsAppBodyInput
    action: WhatsAppListActionInput
  }

  input ResponseVariationInput {
    name: String!
    responses: [ResponseMessageInput]!
  }

  input ResponsePlatformInput {
    platform: String!
    variations: [ResponseVariationInput]!
  }

  input ResponseInput {
    name: String!
    platforms: [ResponsePlatformInput]!
  }

  input NodeRedirectInput {
    compositeId: ID
    triggerId: ID
  }

  input NodePositionInput {
    x: Float!
    y: Float!
  }

  input NodeInput {
    name: String!
    description: String
    parentIds: [ID!]
    root: Boolean
    triggerId: ID
    responseIds: [ID!]
    actionIds: [ID!]
    preActionIds: [ID!]
    postActionIds: [ID!]
    priority: Float
    compositeId: ID
    global: Boolean
    colour: String
    analytics: String
    memberTagging: String
    type: String
    tags: [String]
    saveCompositeId: Boolean
    position: NodePositionInput
    redirect: NodeRedirectInput
  }

  type Mutation {
    createResponse(input: ResponseInput!): Response
    createNode(input: NodeInput!): NodeObject

    updateNode(
      id: ID!
      name: String
      description: String
      parentIds: [ID!]
      root: Boolean
      triggerId: ID
      responseIds: [ID!]
      actionIds: [ID!]
      preActionIds: [ID!]
      postActionIds: [ID!]
      priority: Float
      compositeId: ID
      global: Boolean
      colour: String
      analytics: String
      memberTagging: String
      type: String
      tags: [String]
      saveCompositeId: Boolean
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

/**
 * Safe, cycle-aware recursive traversal
 */
const extraTypeDefs = `
  extend type NodeObject {
    ancestors(depth: Int = 10, unique: Boolean = true): [NodeObject!]!
  }
`;

// Final typeDefs (original + extension)
const typeDefs = [baseTypeDefs, extraTypeDefs].join("\n");

// ---- Load JSON data (unchanged path layout) ----
const nodes = require("./db/node.json");
const triggers = require("./db/trigger.json");
const responses = require("./db/response.json");
const actions = require("./db/action.json");
const resourceTemplates = require("./db/resourceTemplate.json");

// ---- Config ----
const JWT_SECRET = process.env.JWT_SECRET || "test_secret";
const PORT = process.env.PORT || 4000;

// ---- ID helpers & lookup maps ----
const getNodeId = (n) => n?._id ?? n?.id ?? n?.compositeId ?? null;
const getActionId = (a) => a?._id ?? a?.id ?? null;
const getResponseId = (r) => r?._id ?? r?.id ?? null;
const getTriggerId = (t) => t?._id ?? t?.id ?? null;
const getRTId = (rt) => rt?._id ?? rt?.id ?? null;

const nodeById = new Map(nodes.map((n) => [getNodeId(n), n]));
const nodeByComposite = new Map(
  nodes.map((n) => [n?.compositeId, n]).filter(([k]) => !!k)
);
const actionById = new Map(actions.map((a) => [getActionId(a), a]));
const responseById = new Map(responses.map((r) => [getResponseId(r), r]));
const triggerById = new Map(triggers.map((t) => [getTriggerId(t), t]));
const rtById = new Map(resourceTemplates.map((rt) => [getRTId(rt), rt]));

// Flexible node fetcher by id or compositeId
function loadNodeFlexible(id) {
  if (!id) return null;
  return nodeById.get(id) || nodeByComposite.get(id) || null;
}

// Normalize “ids maybe array/maybe single/maybe null”
const asIdArray = (val) =>
  val == null ? [] : Array.isArray(val) ? val : [val];

// ---- DataLoaders (avoid N+1) ----
function buildLoaders() {
  return {
    nodeLoader: new DataLoader(async (keys) =>
      keys.map((k) => loadNodeFlexible(k))
    ),
    actionLoader: new DataLoader(async (keys) =>
      keys.map((k) => actionById.get(k) || null)
    ),
    responseLoader: new DataLoader(async (keys) =>
      keys.map((k) => responseById.get(k) || null)
    ),
    triggerLoader: new DataLoader(async (keys) =>
      keys.map((k) => triggerById.get(k) || null)
    ),
    rtLoader: new DataLoader(async (keys) =>
      keys.map((k) => rtById.get(k) || null)
    ),
  };
}

// ---- Auth + context (add loaders to context) ----
const context = ({ req }) => {
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

// ---- Resolvers (DataLoader + safe recursion) ----
const resolvers = {
  Query: {
    node: (_, { nodeId }) => loadNodeFlexible(nodeId),
    nodes: () => nodes, // handy for browsing/debug
    actions: () => actions,
    triggers: () => triggers,
    responses: () => responses,
    resourceTemplates: () => resourceTemplates,
  },

  JSON: new GraphQLScalarType({
    name: "JSON",
    description: "Arbitrary JSON value",
    parseValue: (value) => value,
    serialize: (value) => value,
    parseLiteral: (ast) => {
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
            value[field.name.value] = parseLiteral(field.value);
          });
          return value;
        }
        case Kind.LIST:
          return ast.values.map(parseLiteral);
        default:
          return null;
      }
    },
  }),

  NodeObject: {
    id: (node) => getNodeId(node),

    preActions: (node, _, { loaders }) => {
      const ids = Array.isArray(node.preActions ?? node.preActionIds)
        ? node.preActions ?? node.preActionIds
        : [];
      if (!ids.length) return [];
      return Promise.all(ids.map((id) => loaders.actionLoader.load(id))).then(
        (list) => list.filter(Boolean)
      );
    },

    postActions: (node, _, { loaders }) => {
      const ids = Array.isArray(node.postActions ?? node.postActionIds)
        ? node.postActions ?? node.postActionIds
        : [];
      if (!ids.length) return [];
      return Promise.all(ids.map((id) => loaders.actionLoader.load(id))).then(
        (list) => list.filter(Boolean)
      );
    },

    // trigger / triggerId
    trigger: (node, _, { loaders }) => {
      const id = node.trigger ?? node.triggerId;
      return id ? loaders.triggerLoader.load(id) : null;
    },
    triggerId: (node) => node.trigger ?? node.triggerId ?? null,

    // responses / responseIds
    responses: (node, _, { loaders }) => {
      const ids = asIdArray(node.responses ?? node.responseIds);
      return Promise.all(ids.map((id) => loaders.responseLoader.load(id)));
    },
    responseIds: (node) => asIdArray(node.responses ?? node.responseIds),

    // actions / actionIds
    actions: (node, _, { loaders }) => {
      const ids = asIdArray(node.actions ?? node.actionIds);
      return Promise.all(ids.map((id) => loaders.actionLoader.load(id)));
    },
    actionIds: (node) => asIdArray(node.actions ?? node.actionIds),

    // parents / parentIds (plain recursion via GraphQL)
    parents: (node, _, { loaders }) => {
      const parentIds = asIdArray(node.parentIds ?? node.parents);
      return Promise.all(parentIds.map((id) => loaders.nodeLoader.load(id)));
    },
    parentIds: (node) => asIdArray(node.parentIds ?? node.parents),

    // NEW: cycle-safe, bounded recursion
    ancestors: async (node, { depth = 10, unique = true }, { loaders }) => {
      const seen = new Set();
      const out = [];

      const enqueue = (n) => {
        const id = getNodeId(n);
        if (!id) return false;
        if (unique && seen.has(id)) return false;
        seen.add(id);
        out.push(n);
        return true;
      };

      // BFS up the parent chain with depth bound
      let frontier = asIdArray(node.parentIds ?? node.parents);
      let level = 0;

      while (frontier.length && level < depth) {
        const batch = await Promise.all(
          frontier.map((id) => loaders.nodeLoader.load(id))
        );
        frontier = [];
        for (const parent of batch.filter(Boolean)) {
          if (enqueue(parent)) {
            const gp = asIdArray(parent.parentIds ?? parent.parents);
            frontier.push(...gp);
          }
        }
        level += 1;
      }

      return out;
    },
  },

  Trigger: {
    resourceTemplate: (t, _, { loaders }) => {
      const id = t.resourceTemplateId;
      return id ? loaders.rtLoader.load(id) : null;
    },
  },

  Action: {
    resourceTemplate: (a, _, { loaders }) => {
      const id = a.resourceTemplateId;
      return id ? loaders.rtLoader.load(id) : null;
    },
  },

  Response: {
    // platforms: (response) => response.platforms || [],
    platforms: (response) => {
      const raw = Array.isArray(response.platforms) ? response.platforms : [];

      // Map legacy shapes and filter out nulls/bad entries
      const normalized = raw
        .filter(Boolean) // removes literal null entries
        .map((p) => {
          // If your DB sometimes uses integrationId/localeGroups (older shape),
          // coerce it into the current { platform, variations } shape.
          if (p && (p.integrationId || p.localeGroups)) {
            return {
              platform: p.integrationId ?? "unknown", // must be non-null per SDL
              variations: Array.isArray(p.localeGroups)
                ? p.localeGroups.flatMap((g) => g?.variations ?? [])
                : [],
            };
          }
          // Otherwise assume it's already in the new shape
          return p;
        })
        // Ensure we never return an object without a platform string
        .filter(
          (p) => typeof p?.platform === "string" && p.platform.trim().length > 0
        );

      return normalized;
    },
  },

  ResponseVariation: {
    responses: (variation) => variation.responses || [],
  },
};

// ---- Server ----
const server = new ApolloServer({ typeDefs, resolvers, context });

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log("Sample JWT:", jwt.sign({ user: "test" }, JWT_SECRET));
});
