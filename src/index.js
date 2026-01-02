const { Client, GatewayIntentBits, Partials, REST, Routes } = require("discord.js");
const { TOKEN, CLIENT_ID, GUILD_ID } = require("../config");
const { loadCommands } = require("./handlers/commands");
const { handleInteractions } = require("./handlers/interactions");
const { startCounterLoop, updateAllCounters } = require("./services/counterService");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences
  ],
  partials: [Partials.GuildMember, Partials.User]
});

loadCommands(client);

client.on("interactionCreate", async (interaction) => {
  await handleInteractions(client, interaction);
});

client.once("ready", async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(TOKEN);
  const cmds = [...client.commands.values()].map(c => c.data.toJSON());

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: cmds }
  );

  console.log("✅ Slash commands enregistrées.");

  await updateAllCounters(client, GUILD_ID).catch(() => {});
  startCounterLoop(client, GUILD_ID);
});

client.login(TOKEN);
