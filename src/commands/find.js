const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const BRAND = "ᶜᵉᶰᵗᵉʳ ᵇᵒᵗˢ";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("find")
    .setDescription("Voir où se trouve un utilisateur en vocal")
    .addUserOption(opt =>
      opt.setName("membre")
        .setDescription("Utilisateur à localiser")
        .setRequired(true)
    ),

  async execute(client, interaction) {
    const member = interaction.options.getMember("membre");

    // fallback si pas en cache (gros serveurs)
    let guildMember = member;
    if (!guildMember) {
      const user = interaction.options.getUser("membre");
      guildMember = await interaction.guild.members.fetch(user.id).catch(() => null);
    }

    if (!guildMember) {
      return interaction.reply({
        content: "❌ Impossible de trouver ce membre.",
        ephemeral: true
      });
    }

    const voice = guildMember.voice;
    const now = Math.floor(Date.now() / 1000);

    if (voice && voice.channel) {
      const e = new EmbedBuilder()
        .setColor(0x2F3136)
        .setAuthor({
          name: interaction.guild?.name ?? "Serveur",
          iconURL: interaction.guild?.iconURL({ size: 128 }) ?? undefined
        })
        .setDescription(`➡️ **État vocal de** ${guildMember} (${guildMember.id})\n\n` +
          `• **Salon :** 🔊 ${voice.channel} (${voice.channel.id})\n` +
          `• **Depuis :** <t:${now}:R>`
        )
        .setFooter({ text: BRAND });

      return interaction.reply({ embeds: [e] });
    }

    const e = new EmbedBuilder()
      .setColor(0x2F3136)
      .setAuthor({
        name: interaction.guild?.name ?? "Serveur",
        iconURL: interaction.guild?.iconURL({ size: 128 }) ?? undefined
      })
      .setDescription("⚠️ **Ce membre n'est pas connecté à un salon vocal.**")
      .setFooter({ text: BRAND });

    return interaction.reply({ embeds: [e] });
  }
};
