import {
  actions,
  nodes,
  resourceTemplates,
  responses,
  triggers,
} from "./dataLoads.js";

/**
 * =========================
 *      Lookup helpers
 * =========================
 */
export const getNodeId = (n) => n?._id ?? n?.id ?? n?.compositeId ?? null;
const getActionId = (a) => a?._id ?? a?.id ?? null;
const getResponseId = (r) => r?._id ?? r?.id ?? null;
const getTriggerId = (t) => t?._id ?? t?.id ?? null;
const getRTId = (rt) => rt?._id ?? rt?.id ?? null;

const nodeById = new Map(nodes.map((n) => [getNodeId(n), n]));
const nodeByComposite = new Map(
  nodes.map((n) => [n?.compositeId, n]).filter(([k]) => !!k)
);
export const actionById = new Map(actions.map((a) => [getActionId(a), a]));
export const responseById = new Map(
  responses.map((r) => [getResponseId(r), r])
);
export const triggerById = new Map(triggers.map((t) => [getTriggerId(t), t]));
export const rtById = new Map(resourceTemplates.map((rt) => [getRTId(rt), rt]));

// Flexible node fetcher by id or compositeId
export function loadNodeFlexible(id) {
  if (!id) return null;
  return nodeById.get(id) || nodeByComposite.get(id) || null;
}

// Normalize “ids maybe array/maybe single/maybe null”
export const asIdArray = (val) =>
  val == null ? [] : Array.isArray(val) ? val : [val];
