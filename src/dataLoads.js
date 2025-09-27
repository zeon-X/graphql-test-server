/**
 * =========================
 *         Data loads
 * =========================
 */
import actions from "./db/action" assert { type: "json" };
import nodes from "./db/node.json" assert { type: "json" };
import resourceTemplates from "./db/resourceTemplate.json" assert { type: "json" };
import responses from "./db/response.json" assert { type: "json" };
import triggers from "./db/trigger.json" assert { type: "json" };

export { actions, nodes, resourceTemplates, responses, triggers };
