const fs = require("fs");
const path = require("path");
const config = require("../../config");

const OWNERS_PATH = path.join(__dirname, "..", "storage", "owners.json");

function readOwnersFile() {
  try {
    const raw = fs.readFileSync(OWNERS_PATH, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data.owners) ? data.owners : [];
  } catch {
    return [];
  }
}

function writeOwnersFile(owners) {
  const data = { owners: owners };
  fs.writeFileSync(OWNERS_PATH, JSON.stringify(data, null, 2), "utf8");
}

function getSysId() {
  return config.SYS_ID || config.SYS || config.SYSID || null;
}

function getOwners() {
  const fromConfig = Array.isArray(config.OWNERS) ? config.OWNERS : [];
  const fromFile = readOwnersFile();
  // merge unique
  return [...new Set([...fromConfig, ...fromFile])];
}

function isSys(userId) {
  const sys = getSysId();
  return !!sys && userId === sys;
}

function isOwner(userId) {
  if (isSys(userId)) return true;
  return getOwners().includes(userId);
}

module.exports = {
  readOwnersFile,
  writeOwnersFile,
  getOwners,
  getSysId,
  isSys,
  isOwner
};
