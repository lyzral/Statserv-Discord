const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getOwners } = require("../utils/auth");

const BRAND = "ᶜᵉᶰᵗᵉʳ ᵇᵒᵗˢ";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ownerlist")
    .setDescription("Afficher les owners du bot"),

  async execute(client, interaction) {
    const owners = getOwners();
    const list = owners.length ? owners.map(id => `<@${id}>`).join("\n") : "Aucun owner défini.";

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x2F3136)
          .setTitle("👑 Owners du bot")
          .setDescription(list)
          .setFooter({ text: BRAND })
      ]
    });
  }
};
