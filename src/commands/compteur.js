const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const IDS = require("../utils/ids");
const {
  readStore,
  writeStore,
  getSeparatorLabel,
  metricLabel,
  metricOptionsBasicGroup,
  metricOptionsPresenceGroup,
  metricOptionsOtherGroup,
  updateCounterByIndex
} = require("../services/counterService");

const BRAND = "ᶜᵉᶰᵗᵉʳ ᵇᵒᵗˢ";
function panelComponents() {
  const counterSelect = new StringSelectMenuBuilder()
    .setCustomId(IDS.SELECT_COUNTER)
    .setPlaceholder("Modifier les compteurs")
    .addOptions(
      { label: "Compteur 1", value: "1", emoji: "1️⃣" },
      { label: "Compteur 2", value: "2", emoji: "2️⃣" },
      { label: "Compteur 3", value: "3", emoji: "3️⃣" },
      { label: "Compteur 4", value: "4", emoji: "4️⃣" },
      { label: "Compteur 5", value: "5", emoji: "5️⃣" }
    );

  const sepSelect = new StringSelectMenuBuilder()
    .setCustomId(IDS.SELECT_SEPARATOR)
    .setPlaceholder("Modifier le séparateur des milliers")
    .addOptions(
      { label: "Aucun", value: "none" },
      { label: "12 536", value: "space" },
      { label: "12,536", value: "comma" },
      { label: "12.536", value: "dot" },
      { label: "12'536", value: "apostrophe" }
    );

  return [
    new ActionRowBuilder().addComponents(counterSelect),
    new ActionRowBuilder().addComponents(sepSelect)
  ];
}
function counterComponents(index) {
  const btnVoice = new ButtonBuilder()
    .setCustomId(`${IDS.BTN_CREATE_VOICE_PREFIX}${index}`)
    .setLabel("Créer un salon vocal")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("📣");

  const btnCat = new ButtonBuilder()
    .setCustomId(`${IDS.BTN_CREATE_CATEGORY_PREFIX}${index}`)
    .setLabel("Créer une catégorie")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("📁");

  const btnText = new ButtonBuilder()
    .setCustomId(`${IDS.BTN_CREATE_TEXT_PREFIX}${index}`)
    .setLabel("Créer un salon textuel")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("📝");

  const btnPick = new ButtonBuilder()
    .setCustomId(`${IDS.BTN_PICK_CHANNEL_PREFIX}${index}`)
    .setLabel("Choisir le salon")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("🏷️");

  const sub1 = new StringSelectMenuBuilder()
    .setCustomId(`${IDS.SELECT_SUB1_PREFIX}${index}`)
    .setPlaceholder("Premier sous-compteur")
    .addOptions(
      ...metricOptionsBasicGroup().map(o => ({ label: o.label, value: o.value })),
      ...metricOptionsPresenceGroup().map(o => ({ label: o.label, value: o.value })),
      ...metricOptionsOtherGroup().map(o => ({ label: o.label, value: o.value }))
    );

  const sub2 = new StringSelectMenuBuilder()
    .setCustomId(`${IDS.SELECT_SUB2_PREFIX}${index}`)
    .setPlaceholder("Deuxième sous-compteur")
    .addOptions(
      ...metricOptionsBasicGroup().map(o => ({ label: o.label, value: o.value })),
      ...metricOptionsPresenceGroup().map(o => ({ label: o.label, value: o.value })),
      ...metricOptionsOtherGroup().map(o => ({ label: o.label, value: o.value }))
    );

  const validate = new ButtonBuilder()
    .setCustomId(`${IDS.BTN_VALIDATE_PREFIX}${index}`)
    .setLabel("Valider")
    .setStyle(ButtonStyle.Success)
    .setEmoji("✅");

  return [
    new ActionRowBuilder().addComponents(btnVoice, btnCat),
    new ActionRowBuilder().addComponents(btnText, btnPick),
    new ActionRowBuilder().addComponents(sub1),
    new ActionRowBuilder().addComponents(sub2),
    new ActionRowBuilder().addComponents(validate)
  ];
}

async function openCounter(interaction, index, client) {
  const store = readStore();
  await interaction.update({
    embeds: [counterEmbed(index, store, client)],
    components: counterComponents(index)
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("compteur")
    .setDescription("Configurer les salons compteurs du serveur"),

  async execute(client, interaction) {
    const store = readStore();
    await interaction.reply({ embeds: [panelEmbed(store, client)], components: panelComponents() });
  },

  async onComponent(client, interaction) {
    const store = readStore();

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === IDS.SELECT_COUNTER) {
        const idx = interaction.values[0];
        return openCounter(interaction, idx, client);
      }

      if (interaction.customId === IDS.SELECT_SEPARATOR) {
        store.thousandsSeparator = interaction.values[0];
        writeStore(store);
        await interaction.update({
          embeds: [panelEmbed(store, client)],
          components: panelComponents()
        });
        return;
      }

      if (interaction.customId.startsWith(IDS.SELECT_SUB1_PREFIX)) {
        const idx = interaction.customId.split(":").pop();
        store.counters[idx].sub1 = interaction.values[0];
        writeStore(store);
        await interaction.update({
          embeds: [counterEmbed(idx, store, client)],
          components: counterComponents(idx)
        });
        return;
      }

      if (interaction.customId.startsWith(IDS.SELECT_SUB2_PREFIX)) {
        const idx = interaction.customId.split(":").pop();
        store.counters[idx].sub2 = interaction.values[0];
        writeStore(store);
        await interaction.update({
          embeds: [counterEmbed(idx, store, client)],
          components: counterComponents(idx)
        });
        return;
      }

      if (interaction.customId.startsWith(IDS.CHANNEL_PICK_SELECT_PREFIX)) {
        const idx = interaction.customId.split(":").pop();
        const picked = interaction.values[0];
        if (picked === "none") {
          return interaction.update({ content: "❌ Aucun salon sélectionnable.", components: [] });
        }
        store.counters[idx].channelId = picked;
        writeStore(store);
        await interaction.update({ content: `✅ Salon choisi : <#${picked}>` , components: [] });
        return;
      }
    }

    if (interaction.isButton()) {
      const guild = interaction.guild;
      if (!guild) return;

      const me = await guild.members.fetchMe().catch(() => null);
      if (!me?.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return interaction.reply({ content: "❌ Il me faut la permission **Gérer les salons**.", ephemeral: false });
      }

      const needDefer = !interaction.deferred && !interaction.replied;

      if (interaction.customId.startsWith(IDS.BTN_CREATE_VOICE_PREFIX)) {
        const idx = interaction.customId.split(":").pop();
        if (needDefer) await interaction.deferReply().catch(() => {});

        const c = store.counters[idx];
        const ch = await guild.channels.create({
          name: `compteur-${idx}`,
          type: ChannelType.GuildVoice
        });

        c.channelId = ch.id;
        writeStore(store);

        await updateCounterByIndex(client, guild.id, idx);

        await interaction.editReply({ content: `✅ Salon vocal créé : <#${ch.id}>` }).catch(() => {});
        await interaction.message.edit({
          embeds: [counterEmbed(idx, readStore(), client)],
          components: counterComponents(idx)
        }).catch(() => {});
        return;
      }

      if (interaction.customId.startsWith(IDS.BTN_CREATE_TEXT_PREFIX)) {
        const idx = interaction.customId.split(":").pop();
        if (needDefer) await interaction.deferReply().catch(() => {});

        const c = store.counters[idx];
        const ch = await guild.channels.create({
          name: `compteur-${idx}`,
          type: ChannelType.GuildText
        });

        c.channelId = ch.id;
        writeStore(store);

        await updateCounterByIndex(client, guild.id, idx);

        await interaction.editReply({ content: `✅ Salon textuel créé : <#${ch.id}>` }).catch(() => {});
        await interaction.message.edit({
          embeds: [counterEmbed(idx, readStore(), client)],
          components: counterComponents(idx)
        }).catch(() => {});
        return;
      }

      if (interaction.customId.startsWith(IDS.BTN_CREATE_CATEGORY_PREFIX)) {
        if (needDefer) await interaction.deferReply().catch(() => {});
        const cat = await guild.channels.create({
          name: `Compteurs`,
          type: ChannelType.GuildCategory
        });
        await interaction.editReply({ content: `✅ Catégorie créée : **${cat.name}**` }).catch(() => {});
        return;
      }

      if (interaction.customId.startsWith(IDS.BTN_PICK_CHANNEL_PREFIX)) {
        const idx = interaction.customId.split(":").pop();

        const channels = guild.channels.cache
          .filter(c => [ChannelType.GuildVoice, ChannelType.GuildText].includes(c.type))
          .map(c => ({ label: c.name.slice(0, 100), value: c.id }))
          .slice(0, 25);

        const menu = new StringSelectMenuBuilder()
          .setCustomId(`${IDS.CHANNEL_PICK_SELECT_PREFIX}${idx}`)
          .setPlaceholder("Choisir un salon")
          .addOptions(channels.length ? channels : [{ label: "Aucun salon dispo", value: "none" }]);

        await interaction.reply({
          ephemeral: false,
          content: "Sélectionne le salon à utiliser pour ce compteur :",
          components: [new ActionRowBuilder().addComponents(menu)]
        });
        return;
      }

      if (interaction.customId.startsWith(IDS.BTN_VALIDATE_PREFIX)) {
        const idx = interaction.customId.split(":").pop();
        if (needDefer) await interaction.deferReply().catch(() => {});
        await updateCounterByIndex(client, interaction.guild.id, idx);
        await interaction.editReply({ content: `✅ Compteur ${idx} appliqué.` }).catch(() => {});
        return;
      }
    }
  }
};


function buildCountersList(store) {
  const lines = [];
  for (let i = 1; i <= 5; i++) {
    const c = store.counters[String(i)];
    const ok = !!(c.channelId || c.sub1 || c.sub2);
    lines.push(`${ok ? "✅" : "⚪"} **Compteur ${i}**`);
  }
  return lines.join("\n");
}

function panelEmbed(store) {
  const e = new EmbedBuilder()
    .setColor(0x2F3136)
    .setTitle("📊 Paramètres des compteurs")
    .setDescription("Configure les salons **stats** de ton serveur (jusqu’à **5** compteurs).")
    .addFields(
      { name: "🧩 Compteurs", value: buildCountersList(store), inline: false },
      { name: "🔢 Séparateur des milliers", value: `**${getSeparatorLabel(store.thousandsSeparator || "none")}**`, inline: false })
    .setFooter({ text: "ᶜᵉᶰᵗᵉʳ ᵇᵒᵗˢ" });

  return e;
}

function counterEmbed(index, store) {
  const c = store.counters[String(index)];
  const salon = c.channelId ? `<#${c.channelId}>` : "—";
  const sub1 = c.sub1 ? metricLabel(c.sub1) : "—";
  const sub2 = c.sub2 ? metricLabel(c.sub2) : "—";

  const e = new EmbedBuilder()
    .setColor(0x2F3136)
    .setTitle(`⚙️ Paramètres du Compteur ${index}`)
    .setDescription("Crée un salon, choisis-en un existant, puis sélectionne tes sous-compteurs.")
    .addFields(
      { name: "📌 Salon", value: salon, inline: false },
      { name: "1️⃣ Premier sous-compteur", value: sub1, inline: true },
      { name: "2️⃣ Deuxième sous-compteur", value: sub2, inline: true }
    )
    .setFooter({ text: "ᶜᵉᶰᵗᵉʳ ᵇᵒᵗˢ" });

  return e;
}

