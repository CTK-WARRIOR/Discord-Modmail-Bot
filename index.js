/**
 * Require Modules
 */
 const { MessageEmbed } = require("discord.js")
 const { Intents, Client } = require("discord.js")
 const { token, prefix, colors, modmail } = require("./settings.json")
 const translate = require("./tools/translate")
 
 const client = new Client({
     intents: [
         Intents.FLAGS.GUILDS,
         Intents.FLAGS.GUILD_MESSAGES,
         Intents.FLAGS.GUILD_MEMBERS,
         Intents.FLAGS.GUILD_MESSAGES,
         Intents.FLAGS.DIRECT_MESSAGES,
     ], partials: ["CHANNEL"]
 })
 
 
 client.log = function (content) {
     console.log(`${new Date().toLocaleString()} : ${content}`)
 }
 
 client.on("ready", async () => {
     const guild = client.guilds.cache.get(modmail.server_id)
 
     if (!guild?.me.permissions.has("ADMINISTRATOR")) {
         client.log(translate("startup.PERMISSION_REQUIRED"))
         return process.kill(process.pid);
     } else if (!modmail.role_ids.length) {
         client.log(translate("startup.MISSING_ROLE_IDS"))
         return process.kill(process.pid);
     } else if (!guild.channels.cache.find(x => x.name === "Mod Mail")) {
         client.log(translate("startup.SETUP_MESSAGE_1"))
 
         await guild.channels.create('Mod Mail', {
             type: "GUILD_CATEGORY",
             position: guild.channels.length + 1,
             permissionOverwrites: modmail.role_ids.map(role => {
                 return { id: role, allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"] }
             }).concat({
                 id: guild.roles.everyone.id,
                 deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
             })
         })
 
         client.log(translate("startup.SETUP_MESSAGE_2"))
     }
 
     client.log(translate("startup.CONNECTED", { name: client.user.username, memberCount: guild.memberCount }))
 })
 
 /**
  * Main Part
  */
 
 client.on("messageCreate", async (message) => {
     if (message.author.bot) return;
     if (!message.guild) {
         const guild = client.guilds.cache.get(modmail.server_id) || await client.guilds.fetch(modmail.server_id).catch(m => { })
         const member = guild?.members.cache.get(message.author.id) || await guild?.members.fetch(message.author.id).catch(err => { })
 
 
         if (!member) return client.log(translate("system.MEMBER_NOT_FOUND", { member: message.author.tag }))
 
         const category = guild.channels.cache.find((x) => x.name == "Mod Mail")
         if (!category) return client.log(translate("system.PARENT_MISSING"))
 
         let channel = guild.channels.cache.find((x) => x.name == message.author.id && x.parentId === category.id)
 
         if (!channel) {
             channel = await guild.channels.create(message.author.id, {
                 type: "text",
                 parent: category.id,
                 topic: translate("system.CHANNEL_TOPIC", { member: message.author.tag })
             })
 
             let success_embed = new MessageEmbed()
                 .setAuthor(translate("system.SUCCESS_EMBED.AUTHOR"))
                 .setColor("GREEN")
                 .setThumbnail(client.user.displayAvatarURL())
                 .setDescription(translate("system.SUCCESS_EMBED.DESCRIPTION"))
 
             message.author.send({ embeds: [success_embed] })
 
 
             let details_embed = new MessageEmbed()
                 .setAuthor(translate("system.DETAILS_EMBED.AUTHOR"), message.author.displayAvatarURL({
                     dynamic: true
                 }))
                 .setColor("BLUE")
                 .setThumbnail(message.author.displayAvatarURL({
                     dynamic: true
                 }))
                 .setDescription(translate("system.DETAILS_EMBED.DESCRIPTION", { content: message.content }))
                 .addField("Name", message.author.username)
                 .addField("Account Creation Date", message.author.createdAt.toString())
                 .addField("Direct Contact", "No(it means this mail is opened by person not a supporter)")
 
 
             return channel.send({ embeds: [details_embed] })
         }
 
         let content_embed = new MessageEmbed()
             .setColor("YELLOW")
             .setFooter(message.author.tag, message.author.displayAvatarURL({
                 dynamic: true
             }))
             .setDescription(message.content)
 
         if (message.attachments.size) content_embed.setImage(message.attachments.map(x => x)[0].proxyURL)
         channel.send({ embeds: [content_embed] })
 
     } else if (message.channel.parentId) {
         const category = message.guild.channels.cache.find((x) => x.name == "Mod Mail")
         if (!category) return client.log(translate("system.PARENT_MISSING"))
 
         if (message.channel.parentId === category.id) {
             let member = message.guild.members.cache.get(message.author.id) || await message.guild.members.fetch(message.author.id).catch(err => { })
             if (!member) return message.channel.send(translate("system.MEMBER_NOT_FOUND", { member: message.author.tag }))
 
             let content_embed = new MessageEmbed()
                 .setColor("GREEN")
                 .setFooter(message.author.username, message.author.displayAvatarURL({
                     dynamic: true
                 }))
                 .setDescription(translate("system.DETAILS_EMBED.DESCRIPTION", { content: message.content }))
 
             if (message.attachments.size) content_embed.setImage(message.attachments.map(x => x)[0].proxyURL)
             return member.send({ embeds: [content_embed] })
         }
     }
 })
 
 
 
 /**
  * Mail Closing system
  */
 client.on("channelDelete", async (channel) => {
     const category = channel.guild.channels.cache.find((x) => x.name == "Mod Mail")
     if (!category) return client.log(translate("system.PARENT_MISSING"))
 
     const member = channel.guild.members.cache.get(channel.name) || await channel.guild.members.fetch(channel.name).catch(err => { })
     if (!member) return client.log(translate("system.MEMBER_NOT_FOUND", { member: "XXX" }))
 
     const embed = new MessageEmbed()
         .setAuthor(translate("system.DELETE_EMBED.AUTHOR"), client.user.displayAvatarURL())
         .setColor('RED')
         .setThumbnail(client.user.displayAvatarURL())
         .setDescription(translate("system.DELETE_EMBED.DESCRIPTION"))
 
     return member.send({ embeds: [embed] }).catch(err => { })
 })
 
 client.login(token)
 
 