const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { readOwnersFile, writeOwnersFile, isSys } = require("../utils/auth");

const BRAND = "ᶜᵉᶰᵗᵉʳ ᵇᵒᵗˢ";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unowner")
    .setDescription("Retirer un owner du bot (SYS uniquement)")
    .addUserOption(o => o.setName("membre").setDescription("Membre à retirer").setRequired(true)),

  async execute(client, interaction) {
    if (!isSys(interaction.user.id)) {
      return interaction.reply({ content: "❌ Accès refusé.", ephemeral: true });
    }

    const user = interaction.options.getUser("membre");
    const owners = readOwnersFile();

    if (!owners.includes(user.id)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2F3136)
            .setDescription("⚠️ Ce membre n'est pas owner.")
            .setFooter({ text: BRAND })
        ]
      });
    }

    const next = owners.filter(id => id !== user.id);
    writeOwnersFile(next);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x2F3136)
          .setDescription(`✅ **${user}** n'est plus owner du bot.`)
          .setFooter({ text: BRAND })
      ]
    });
  }
};
