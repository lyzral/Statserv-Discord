const fs = require("fs");
const path = require("path");
const { isOwner } = require("../utils/auth");

// Anti-double réponse (même machine) : lock par interaction.id dans /tmp
const DEDUPE_DIR = "/tmp/lbvc_interactions";
function tryLockInteraction(interactionId) {
  try {
    if (!fs.existsSync(DEDUPE_DIR)) fs.mkdirSync(DEDUPE_DIR, { recursive: true });
    const file = path.join(DEDUPE_DIR, `${interactionId}.lock`);
    const fd = fs.openSync(file, "wx"); // échoue si existe déjà
    fs.closeSync(fd);
    return true;
  } catch {
    return false;
  }
}

async function handleInteractions(client, interaction) {
  // Empêche 2 instances (sur la même VPS) de répondre à la même interaction
  if (!tryLockInteraction(interaction.id)) return;

  try {
    // Slash commands
    if (interaction.isChatInputCommand()) {
      // Restriction globale : seulement SYS + owners
      if (!isOwner(interaction.user.id)) {
        return interaction.reply({ content: "❌ Tu n'as pas la permission d'utiliser ce bot.", ephemeral: true });
      }

      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;

      await cmd.execute(client, interaction);
      return;
    }

    // Components (boutons/menus) -> laisser gérer par la commande concernée (ex: /compteur)
    const compteur = client.commands.get("compteur");
    if (compteur?.onComponent) {
      await compteur.onComponent(client, interaction);
    }
  } catch (e) {
    if (interaction.isRepliable()) {
      await interaction.reply({ content: "❌ Erreur interne.", ephemeral: true }).catch(() => {});
    }
  }
}

module.exports = { handleInteractions };
