/**
 * =========================
 *   GraphQL SDL (with Long)
 * =========================
 */
const baseTypeDefs = `
  scalar JSON
  scalar Long

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
    createdAt: Long!
    updatedAt: Long
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
    createdAt: Long!
    updatedAt: Long
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
    createdAt: Long!
    updatedAt: Long
    name: String!
    platforms: [ResponsePlatform]!
  }

  type ResourceTemplate {
    _id: ID!
    createdAt: Long!
    updatedAt: Long
    name: String!
    description: String
    schema: String
  }

  type NodeObject {
    id: ID!
    createdAt: Long!
    updatedAt: Long
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

// Safe, cycle-aware recursive traversal
const extraTypeDefs = `
  extend type NodeObject {
    ancestors(depth: Int = 10, unique: Boolean = true): [NodeObject!]!
  }
`;

// Final typeDefs (original + extension)
export const typeDefs = [baseTypeDefs, extraTypeDefs].join("\n");
