/**
 * =========================
 *        DataLoaders
 * =========================
 */

const DataLoader = require("dataloader");
const {
  actionById,
  loadNodeFlexible,
  responseById,
  rtById,
  triggerById,
} = require("./helpers");

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

module.exports = { buildLoaders };
