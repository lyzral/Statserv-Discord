const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mv")
    .setDescription("Déplacer un utilisateur dans ton salon vocal")
    .addUserOption(opt =>
      opt.setName("membre")
        .setDescription("Utilisateur à déplacer")
        .setRequired(true)
    ),

  async execute(client, interaction) {
    const author = interaction.member;
    const target = interaction.options.getMember("membre");

    if (!author.voice.channel) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2F3136)
            .setDescription("⚠️ **Tu n'es pas connecté à un salon vocal.**")
            .setFooter({ text: "ᶜᵉᶰᵗᵉʳ ᵇᵒᵗˢ" })
        ]
      });
    }

    if (!target) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2F3136)
            .setDescription("❌ **Impossible de trouver ce membre.**")
            .setFooter({ text: "ᶜᵉᶰᵗᵉʳ ᵇᵒᵗˢ" })
        ]
      });
    }

    if (!target.voice.channel) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2F3136)
            .setDescription("⚠️ **Ce membre n'est pas en vocal.**")
            .setFooter({ text: "ᶜᵉᶰᵗᵉʳ ᵇᵒᵗˢ" })
        ]
      });
    }

    if (target.voice.channelId === author.voice.channelId) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2F3136)
            .setDescription("⚠️ **Ce membre est déjà dans ton salon vocal.**")
            .setFooter({ text: "ᶜᵉᶰᵗᵉʳ ᵇᵒᵗˢ" })
        ]
      });
    }

    try {
      await target.voice.setChannel(author.voice.channel);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2F3136)
            .setDescription(`✅ **${target} a été déplacé dans ton salon vocal.**`)
            .setFooter({ text: "ᶜᵉᶰᵗᵉʳ ᵇᵒᵗˢ" })
        ]
      });
    } catch {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2F3136)
            .setDescription("❌ **Impossible de déplacer ce membre.**")
            .setFooter({ text: "ᶜᵉᶰᵗᵉʳ ᵇᵒᵗˢ" })
        ]
      });
    }
  }
};
