const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vc")
    .setDescription("Envoyer les statistiques vocales du serveur"),

  async execute(client, interaction) {
    const guild = interaction.guild;

    const members = guild.memberCount;
    const online = guild.members.cache.filter(m => m.presence && m.presence.status !== "offline").size;
    const inVoice = guild.members.cache.filter(m => m.voice.channel).size;
    const streaming = guild.members.cache.filter(m => m.voice.channel && m.voice.streaming).size;
    const boosts = guild.premiumSubscriptionCount ?? 0;

    const embed = new EmbedBuilder()
      .setColor(0x2F3136)
      .setAuthor({
        name: `${guild.name} — Statistiques !`,
        iconURL: guild.iconURL({ size: 128 })
      })
      .setThumbnail(guild.iconURL({ size: 256 }))
      .setDescription(
        `**Membres :** ${members}
` +
        `**En ligne :** ${online}
` +
        `**En vocal :** ${inVoice}
` +
        `**En stream :** ${streaming}
` +
        `**Boost :** ${boosts}`
      )
      .setFooter({ text: "ᶜᵉᶰᵗᵉʳ ᵇᵒᵗˢ" });

    await interaction.reply({ embeds: [embed] });
  }
};
