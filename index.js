const fs = require("fs");
const yaml = require("js-yaml");
const colors = require("colors");
const { status } = require("./utils/status.js");
const { format } = require("./utils/format.js");
const {
  Client,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const config = yaml.load(fs.readFileSync("config.yml"));
const messages = yaml.load(
  fs.readFileSync(`./translations/${config.lang}.yml`)
);

client.on("ready", () => {
  console.log(messages.login.replace("{bot}", client.user.tag).blue);
  setInterval(() => {
    status(config.server)
      .then((result) => {
        display(result);
      })
      .catch((error) => {
        display(false);
      });
  }, config.interval);
});

let message;
let last;
const display = async (status) => {
  let content;
  if (status) {
    if (last != true) {
      last = true;
      console.log(
        `${messages.online.green} [${new Date().toLocaleString().gray}]`
      );
    }
    content = format(messages.status, status);
  } else {
    if (last != false) {
      last = false;
      console.log(
        `${messages.offline.red} [${new Date().toLocaleString().gray}]`
      );
    }
    content = messages.offline;
  }

// Say  
  client.on("message", message => {
    if(message.content.startsWith(".say")){
      if(!message.member.hasPermission("ADMINISTRATOR")){
        return message.channel.send("No Tienes permiso para utilizar este comando.");
      }
  
      let texto = message.content.slice(4);
      console.log(texto);
  
    }
  });

  // Status
  if (config.status.enabled) {
    client.user.setPresence({
      activities: [{ name: content, type: ActivityType.Playing }],
      status: status ? "online" : "dnd",
    });
  }

  // Message
  if (config.message.enabled) {
    let embed;
    if (status) {
      embed = {
        files: [
          {
            attachment: status.favicon
              ? Buffer.from(status.favicon, "base64")
              : "https://i.imgur.com/TkVqhJs.png",
            name: "favicon.png",
          },
        ],
        embeds: [
          new EmbedBuilder()
            .setColor("#00ff13")
            .setThumbnail("attachment://favicon.png")
            .setAuthor({
              name: `${config.name}`,
              iconURL: "https://i.imgur.com/TkVqhJs.png",
            })
            .addFields(
              {
                name: messages.players,
                value: `${status.players.online} / ${status.players.max}`,
                inline: true,
              },
              {
                name: messages.version,
                value: `${status.version.name}`,
                inline: true,
              },
              {
                name: messages.ping,
                value: `${status.roundTripLatency}ms`,
                //value: `120ms`,
                inline: true,
              },
              {
                name: '\u200B', 
                value: '\u200B',
                inline: false,
              },
              {
                name: messages.link,
                value: `connect [cfx/192.168.0.1](https://192.168.0.1)`,
                inline: false,
              }
            )
            .setTimestamp()
            .setFooter({ text: messages.update }),
        ],
      };
    } else {
      embed = {
        embeds: [
          new EmbedBuilder()
            .setColor("#ff0004")
            .setThumbnail("attachment://favicon.png")
            .setAuthor({
              name: `${config.name}`,
              iconURL: "https://i.imgur.com/TkVqhJs.png",
            })
            .setDescription(content)
            .setTimestamp()
            .setFooter({ text: messages.update }),
        ],
      };
    }
    if (!message) {
      message = await client.channels.cache
        .get(config.message.channel)
        .send(embed);
    } else {
      message.edit(embed);
    }
  }
};

client.login(config.token);
