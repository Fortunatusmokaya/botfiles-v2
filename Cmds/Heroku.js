const dreaded = global.dreaded;
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
const axios = require("axios");
const { herokuAppName, herokuApiKey } = require("../Env/settings");

dreaded({
  pattern: "allvar",
  desc: "Allvar command",
  category: "Heroku",
  filename: __filename
}, async (context) => {
   
      await ownerMiddleware(context, async () => {
          const { client, m, text, Owner } = context;
  
          if (!herokuAppName || !herokuApiKey) {
              await m.reply("It looks like the Heroku app name or API key is not set. Please make sure you have set the `HEROKU_APP_NAME` and `HEROKU_API_KEY` environment variables.");
              return;
          }
  
          async function getHerokuConfigVars() {
              try {
                  const response = await axios.get(
                      `https://api.heroku.com/apps/${herokuAppName}/config-vars`,
                      {
                          headers: {
                              Authorization: `Bearer ${herokuApiKey}`,
                              Accept: "application/vnd.heroku+json; version=3",
                          },
                      }
                  );
  
                  const configVars = response.data;
                  let configMessage = "";
  
                  if (configVars && Object.keys(configVars).length > 0) {
                      configMessage = "⚙️ Current Heroku Config Vars\n\n";
                      for (const [key, value] of Object.entries(configVars)) {
                          configMessage += `${key}: ${value}\n\n`;  
                      }
  
                      if (m.isGroup) {
                          await client.sendMessage(m.sender, { text: configMessage }, { quoted: m });
                          await m.reply("For security reasons, the vars have been sent to your inbox.");
                      } else {
                          await m.reply(configMessage);
                      }
                  } else {
                      await m.reply("No config vars found for your Heroku app.");
                  }
              } catch (error) {
                  const errorMessage = error.response?.data || error.message;
                  await m.reply(`Failed to retrieve config vars. ${errorMessage}`);
                  console.error("Error fetching Heroku config vars:", errorMessage);
              }
          }
  
          await getHerokuConfigVars();
      });
});


dreaded({
  pattern: "getvar",
  desc: "Getvar command",
  category: "Heroku",
  filename: __filename
}, async (context) => {
   
  
      await ownerMiddleware(context, async () => {
          const { client, m, text, Owner, prefix } = context;
  
          if (!herokuAppName || !herokuApiKey) {
              await m.reply("It looks like the Heroku app name or API key is not set. Please make sure you have set the `HEROKU_APP_NAME` and `HEROKU_API_KEY` environment variables.");
              return;
          }
  
          if (!text) {
              await m.reply(`Please enter the var name to get in the format: \`${prefix}getvar VAR_NAME\`\n\nExample: \`${prefix}getvar MYCODE\``);
              return;
          }
  
          const varName = text.split(" ")[0].trim();
  
          async function getHerokuConfigVar(varName) {
              try {
                  const response = await axios.get(
                      `https://api.heroku.com/apps/${herokuAppName}/config-vars`,
                      {
                          headers: {
                              Authorization: `Bearer ${herokuApiKey}`,
                              Accept: "application/vnd.heroku+json; version=3",
                          },
                      }
                  );
  
                  const configVars = response.data;
                  const varValue = configVars[varName];
  
                  if (varValue) {
                      if (m.isGroup) {
                          await m.reply("It is recommended to use this command in inbox to prevent exposing sensitive info like session and APIs.");
                      }
                      await m.reply(`Config var \`${varName}\` is set to ${varValue}.`);
                  } else {
                      await m.reply(`Config var \`${varName}\` does not exist.`);
                  }
              } catch (error) {
                  const errorMessage = error.response?.data || error.message;
                  await m.reply(`Failed to retrieve the config var. ${errorMessage}`);
                  console.error("Error fetching config var:", errorMessage);
              }
          }
  
          if (m.isGroup) {
              await getHerokuConfigVar(varName);
          } else {
              await getHerokuConfigVar(varName);
          }
      });
});


dreaded({
  pattern: "setvar",
  desc: "Setvar command",
  category: "Heroku",
  filename: __filename
}, async (context) => {
  
  
   
  
  
      await ownerMiddleware(context, async () => {
          const { client, m, text, Owner, prefix } = context;
  
          if (!herokuAppName || !herokuApiKey) {
              await m.reply("It looks like the Heroku app name or API key is not set. Please make sure you have set the `HEROKU_APP_NAME` and `HEROKU_API_KEY` environment variables.");
              return;
          }
  
          if (!text) {
              await m.reply(`Please enter the var to modify and its new value in this format: \`${prefix}setvar VAR_NAME=VALUE\`\nExample: \`${prefix}setvar MYCODE=254\``);
              return;
          }
  
          async function setHerokuConfigVar(varName, value) {
              try {
                  const response = await axios.patch(
                      `https://api.heroku.com/apps/${herokuAppName}/config-vars`,
                      {
                          [varName]: value
                      },
                      {
                          headers: {
                              Authorization: `Bearer ${herokuApiKey}`,
                              Accept: "application/vnd.heroku+json; version=3",
                          },
                      }
                  );
  
                  if (response.status === 200) {
                      await m.reply(`Config var \`${varName}\` has been successfully updated to \`${value}\`. Wait 2min for change to effect as bot restarts.`);
                  } else {
                      await m.reply("Failed to update the config var. Please try again.");
                  }
              } catch (error) {
                  const errorMessage = error.response?.data || error.message;
                  await m.reply(`Failed to set the config var. ${errorMessage}`);
                  console.error("Error updating config var:", errorMessage);
              }
          }
  
          const parts = text.split("=");
          if (parts.length !== 2) {
              await m.reply(`Invalid format. Please make sure to enter the var name and value in this format: \`${prefix}setvar VAR_NAME=VALUE\`\nExample: \`${prefix}setvar MYCODE=254\``);
              return;
          }
  
          const varName = parts[0].trim();
          const value = parts[1].trim();
  
          await setHerokuConfigVar(varName, value);
      });
});

