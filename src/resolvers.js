import {
  actions,
  nodes,
  resourceTemplates,
  responses,
  triggers,
} from "./dataLoads.js";
import { asIdArray, getNodeId, loadNodeFlexible } from "./helpers.js";
import { JSONScalar, LongScalar } from "./scalars.js";

/**
 * =========================
 *        Resolvers
 * =========================
 */
export const resolvers = {
  Query: {
    node: (_, { nodeId }) => loadNodeFlexible(nodeId),
    nodes: () => nodes,
    actions: () => actions,
    triggers: () => triggers,
    responses: () => responses,
    resourceTemplates: () => resourceTemplates,
  },

  JSON: JSONScalar,
  Long: LongScalar,

  NodeObject: {
    id: (node) => getNodeId(node),

    // Trigger
    trigger: (node, _, { loaders }) => {
      const id = node.trigger ?? node.triggerId;
      return id ? loaders.triggerLoader.load(id) : null;
    },
    triggerId: (node) => node.trigger ?? node.triggerId ?? null,

    // Responses
    responses: (node, _, { loaders }) => {
      const ids = asIdArray(node.responses ?? node.responseIds);
      return Promise.all(ids.map((id) => loaders.responseLoader.load(id)));
    },
    responseIds: (node) => asIdArray(node.responses ?? node.responseIds),

    // Actions
    actions: (node, _, { loaders }) => {
      const ids = asIdArray(node.actions ?? node.actionIds);
      return Promise.all(ids.map((id) => loaders.actionLoader.load(id)));
    },
    actionIds: (node) => asIdArray(node.actions ?? node.actionIds),

    // Pre/Post actions (map IDs -> objects and filter nulls)
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

    // Parents
    parents: (node, _, { loaders }) => {
      const parentIds = asIdArray(node.parentIds ?? node.parents);
      return Promise.all(parentIds.map((id) => loaders.nodeLoader.load(id)));
    },
    parentIds: (node) => asIdArray(node.parentIds ?? node.parents),

    // Bounded, cycle-safe ancestors
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

  // Normalize platforms to satisfy platform: String!
  Response: {
    platforms: (response) => {
      const raw = Array.isArray(response.platforms) ? response.platforms : [];
      const normalized = raw
        .filter(Boolean)
        .map((p) => {
          // Legacy shape { integrationId, localeGroups } -> new { platform, variations }
          if (p && (p.integrationId || p.localeGroups)) {
            return {
              platform: p.integrationId ?? "unknown",
              variations: Array.isArray(p.localeGroups)
                ? p.localeGroups.flatMap((g) => g?.variations ?? [])
                : [],
            };
          }
          // Already correct shape
          return p;
        })
        .filter(
          (p) => typeof p?.platform === "string" && p.platform.trim().length > 0
        );
      return normalized;
    },
  },

  // Keep variations list safe
  ResponseVariation: {
    responses: (variation) => variation.responses || [],
  },

  // Serialize ResourceTemplate.schema if DB stored an object
  ResourceTemplate: {
    schema: (rt) => {
      const s = rt.schema;
      if (s == null) return null;
      return typeof s === "string" ? s : JSON.stringify(s);
    },
  },
};
