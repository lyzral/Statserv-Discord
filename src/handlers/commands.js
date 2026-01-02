const fs = require("fs");
const path = require("path");

function loadCommands(client) {
  const dir = path.join(__dirname, "..", "commands");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

  client.commands = new Map();
  for (const file of files) {
    const cmd = require(path.join(dir, file));
    client.commands.set(cmd.data.name, cmd);
  }
}

module.exports = { loadCommands };
