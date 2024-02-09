const express = require("express");
const path = require("path");
const fs = require("fs");
const { WebhookClient, EmbedBuilder } = require("discord.js");
const app = express();
const bodyParser = require("body-parser");
const webhookLogger = process.env.CONTACT_US ? new WebhookClient({ url: process.env.CONTACT_US }) : undefined;
const router = express.Router();
const dir = path.join(__dirname, "views");
const files = fs.readdirSync(dir);
module.exports = {
  loadWebsite: (client) => {
    const authenticateToken = (req, res, next) => {
      const token = req.header("Authorization").split(" ")[1];
      if (token === process.env.AUTH_TOKEN) {
        next();
      } else {
        res.status(401).send("Unauthorized: Invalid Authorization Token");
      }
    };
    app
      .use(bodyParser.json())
      .use(bodyParser.urlencoded({ extended: true }))
      .engine("html", require("ejs").renderFile) // Set the engine to html (for ejs template)
      .set("views", path.join(__dirname, "views"))
      .set("view engine", "ejs")
      .use("/", express.static(path.join(__dirname, "views")))

      // getting bot stats from database
      .use(async (req, res, next) => {
        try {
          const { botSettings } = require("@schemas/botStats");
          const settings = await botSettings(client);
          const stats = settings.data;
          res.locals.stats = stats;
          next();
        } catch (err) {
          console.error(err);
          res.locals.stats = null;
          next();
        }
      })
      // loading file names for dynamic header rules
      .use((req, res, next) => {
        res.locals.filename = req.originalUrl;
        res.locals.authToken = process.env.AUTH_TOKEN;
        next();
      })
      .get("/", (req, res) => {
        res.render("index");
      })
      .get("/commands.html", (req, res) => {
        res.render("commands");
      })
      .get("/vote", (req, res) => {
        res.redirect("https://top.gg/bot/1121541967730450574/vote");
      })
      .get("/invite", (req, res) => {
        res.redirect(
          "https://discord.com/api/oauth2/authorize?client_id=1121541967730450574&permissions=412854114496&scope=bot+applications.commands"
        );
      });
    // creating a route for every files in 'views' dir
    files.forEach((file) => {
      const fileName = path.parse(file).name;
      app.get(`/${fileName}`, (req, res) => {
        res.render(file);
      });
    });

    app
      .use(router)

      // handling 'contact-us' form
      .post("/submit", authenticateToken, (req, res) => {
        const { name, email, message, discordUsername, reason } = req.body;
        try {
          const icon = discordUsername
            ? client.users.cache.find((u) => u.username === discordUsername)?.displayAvatarURL()
            : undefined;

          const embed = new EmbedBuilder()
            .setColor("Green")
            .setAuthor({ name: name || "Not Provided", iconURL: icon })
            .addFields(
              { name: "Email", value: email || "Not Provided" },
              { name: "Username", value: discordUsername || "Not Provided" },
              { name: "Reason", value: reason || "Not Provided" },
              { name: "Message", value: message }
            );

          if (webhookLogger) {
            webhookLogger
              .send({
                username: "Contact Us Logs",
                avatarURL: client.user.displayAvatarURL(),
                embeds: [embed],
              })
              .catch(() => {});
          }

          res.status(200).send("Submission successful");
        } catch (err) {
          console.error(err);
          res.status(500).send("Server Error");
        }
      })
      .use((req, res) => {
        res.status(404).render("404");
      })
      .use((err, req, res, next) => {
        client.logger.error(err.stack);
        res.status(500).render("500");
      })
      .listen(client.config.DASHBOARD.port, () => {
        client.logger.log(`Server started running on port ${client.config.DASHBOARD.port}`);
      });
  },
  timeRoute: (path, content) => {
    router.get(`/${path}`, (req, res) => {
      res.send(content);
    });
  },
};
