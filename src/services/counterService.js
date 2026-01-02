const fs = require("fs");
const path = require("path");
const { ChannelType } = require("discord.js");
const { formatNumber } = require("../utils/format");
const { UPDATE_INTERVAL } = require("../../config");

const STORE_PATH = path.join(__dirname, "..", "storage", "counters.json");

function readStore() {
  return JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
}
function writeStore(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function getSeparatorLabel(mode) {
  switch (mode) {
    case "none": return "Aucun";
    case "space": return "12 536";
    case "comma": return "12,536";
    case "dot": return "12.536";
    case "apostrophe": return "12'536";
    default: return "Aucun";
  }
}

const METRICS = {
  members: { label: "Compteur de membre" },
  humans: { label: "Compteur de membre hors bots" },
  bots: { label: "Compteur de bots" },
  in_voice: { label: "Compteur de membres en vocal" },
  in_voice_humans: { label: "Compteur de membres en vocal hors bots" },
  online: { label: "Compteur de membres en ligne" },
  online_humans: { label: "Compteur de membres en ligne hors bots" },
  offline: { label: "Compteur de membres hors ligne" },
  roles: { label: "Compteur de rôles" },
  boosts: { label: "Compteur de boost" },
  channels: { label: "Compteur de salons" },
  role_has: { label: "Compteur de membres ayant un certain rôle" }
};

const SHORT = {
  members: "Membres",
  humans: "Membres (hors bots)",
  bots: "Bots",
  in_voice: "En vocal",
  in_voice_humans: "En vocal (hors bots)",
  online: "En ligne",
  online_humans: "En ligne (hors bots)",
  offline: "Hors ligne",
  roles: "Rôles",
  boosts: "Boosts",
  channels: "Salons",
  role_has: "Avec rôle"
};

function shortLabel(key) {
  return SHORT[key] ?? "Compteur";
}

function metricOptionsBasicGroup() {
  return [
    { value: "members", label: "👥 Compteur de membre" },
    { value: "humans", label: "👤 Compteur de membre hors bots" },
    { value: "bots", label: "🤖 Compteur de bots" },
    { value: "in_voice", label: "🔊 Compteur de membres en vocal" },
    { value: "in_voice_humans", label: "🔈 Compteur de membres en vocal hors bots" }
  ];
}

function metricOptionsPresenceGroup() {
  return [
    { value: "online", label: "🔵 Compteur de membres en ligne" },
    { value: "online_humans", label: "🔷 Compteur de membres en ligne hors bots" },
    { value: "offline", label: "🔴 Compteur de membres hors ligne" },
    { value: "role_has", label: "✨ Compteur de membres ayant un certain rôle" },
    { value: "channels", label: "🔖 Compteur de salons" }
  ];
}

function metricOptionsOtherGroup() {
  return [
    { value: "roles", label: "⭐ Compteur de rôles" },
    { value: "boosts", label: "💎 Compteur de boost" }
  ];
}

function metricLabel(value) {
  return METRICS[value]?.label ?? "None";
}

async function fetchMembersSafe(guild) {
  try {
    if (guild.members.cache.size > 0) return guild.members.cache;
    return await guild.members.fetch();
  } catch {
    return null;
  }
}

async function computeMetric(guild, key, counterExtra) {
  if (!guild) return 0;

  const members = await fetchMembersSafe(guild);
  if (!members) return 0;

  switch (key) {
    case "members": return members.size;
    case "humans": return members.filter(m => !m.user.bot).size;
    case "bots": return members.filter(m => m.user.bot).size;

    case "in_voice":
      return guild.channels.cache
        .filter(c => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice)
        .reduce((acc, c) => acc + (c.members?.size || 0), 0);

    case "in_voice_humans":
      return guild.channels.cache
        .filter(c => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice)
        .reduce((acc, c) => acc + (c.members ? c.members.filter(m => !m.user.bot).size : 0), 0);

    case "online":
      return members.filter(m => m.presence && m.presence.status !== "offline").size;

    case "online_humans":
      return members.filter(m => !m.user.bot && m.presence && m.presence.status !== "offline").size;

    case "offline":
      return members.filter(m => !m.presence || m.presence.status === "offline").size;

    case "roles": return guild.roles.cache.size;
    case "channels": return guild.channels.cache.size;
    case "boosts": return guild.premiumSubscriptionCount ?? 0;

    case "role_has": {
      const roleId = counterExtra?.roleId;
      if (!roleId) return 0;
      const role = guild.roles.cache.get(roleId);
      if (!role) return 0;
      return role.members.size;
    }

    default: return 0;
  }
}

function buildChannelName(subKey, valueFormatted) {
  return `${shortLabel(subKey)} ${valueFormatted}`;
}

async function updateOneCounter(guild, store, idx) {
  const c = store.counters[idx];
  if (!c || !c.channelId) return;

  const channel = guild.channels.cache.get(c.channelId) || await guild.channels.fetch(c.channelId).catch(() => null);
  if (!channel) return;

  const sepMode = store.thousandsSeparator || "none";
  const val1 = c.sub1 ? await computeMetric(guild, c.sub1, c.extra) : null;
  const val2 = c.sub2 ? await computeMetric(guild, c.sub2, c.extra) : null;
  if (!c.sub1 && !c.sub2) return;

  let name;
  if (c.sub1 && c.sub2) {
    const a = formatNumber(val1, sepMode);
    const b = formatNumber(val2, sepMode);
    name = `${shortLabel(c.sub1)} ${a} • ${shortLabel(c.sub2)} ${b}`;
  } else {
    const k = c.sub1 || c.sub2;
    const v = formatNumber(c.sub1 ? val1 : val2, sepMode);
    name = buildChannelName(k, v);
  }

  name = name.slice(0, 95);
  if (channel.name !== name) await channel.setName(name).catch(() => {});
}

async function updateAllCounters(client, guildId) {
  const store = readStore();
  const guild = await client.guilds.fetch(guildId).catch(() => null);
  if (!guild) return;

  for (const idx of Object.keys(store.counters)) {
    await updateOneCounter(guild, store, idx);
  }
}

async function updateCounterByIndex(client, guildId, idx) {
  const store = readStore();
  const guild = await client.guilds.fetch(guildId).catch(() => null);
  if (!guild) return;
  await updateOneCounter(guild, store, String(idx));
}

function startCounterLoop(client, guildId) {
  setInterval(() => {
    updateAllCounters(client, guildId).catch(() => {});
  }, UPDATE_INTERVAL);
}

module.exports = {
  readStore,
  writeStore,
  getSeparatorLabel,
  metricLabel,
  metricOptionsBasicGroup,
  metricOptionsPresenceGroup,
  metricOptionsOtherGroup,
  updateAllCounters,
  updateCounterByIndex,
  startCounterLoop
};
