const discord = require("discord.js");
const client = new discord.Client()
const { token, prefix, ServerID } = require("./config.json")

client.on("ready", () => {
console.log("I am ready to receive and Send Mails :D")


client.user.setActivity("Watching My Dm's :D")
})

client.on("channelDelete", (channel) => {
    if(channel.parentID == channel.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {
        const person = channel.guild.members.cache.find((x) => x.id == channel.name)

        if(!person) return;

        let yembed = new discord.MessageEmbed()
        .setAuthor("MAIL DELETED", client.user.displayAvatarURL())
        .setColor('RED')
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription("Your mail is deleted by moderator and if you have any problem with that han you can open mail again by sending message here.")
    return person.send(yembed)
    
    }


})


client.on("message", async message => {
  if(message.author.bot) return;

  let args = message.content.slice(prefix.length).split(' ');
  let command = args.shift().toLowerCase();


  if(message.guild) {
      if(command == "setup") {
          if(!message.member.hasPermission("ADMINISTRATOR")) {
              return message.channel.send("You need Admin Permissions to setup the modmail system!")
          }

          let role = message.guild.roles.cache.find((x) => x.name == "SUPPORTER")
          let everyone = message.guild.roles.cache.find((x) => x.name == "@everyone")

          if(!role) {
              role = await message.guild.roles.create({
                  data: {
                      name: "SUPPORTER",
                      color: "GREEN"
                  },
                  reason: "Role needed for ModMail System"
              })
          }

          await message.guild.channels.create("MODMAIL", {
              type: "category",
              topic: "All the mail will be here :D",
              permissionOverwrites: [
                  {
                      id: role.id,
                      allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                  }, 
                  {
                      id: everyone.id,
                      deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                  }
              ]
          })


          return message.channel.send("Setup is Completed :D")

      } else if(command == "close") {


        if(message.channel.parentID == message.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {
            
            const person = message.guild.members.cache.get(message.channel.name)

            if(!person) {
                return message.channel.send("I am Unable to close the channel and this error is coming because probaly channel name is changed.")
            }

            await message.channel.delete()

            let yembed = new discord.MessageEmbed()
            .setAuthor("MAIL CLOSED", client.user.displayAvatarURL())
            .setColor("RED")
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter("Mail is closed by " + message.author.username)
            if(args[0]) yembed.setDescription(args.join(" "))

            return person.send(yembed)

        }
      } else if(command == "open") {
          const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")

          if(!category) {
              return message.channel.send("Moderation system is not setuped in this server, use " + prefix + "setup")
          }

          if(!message.member.roles.cache.find((x) => x.name == "SUPPORTER")) {
              return message.channel.send("You need supporter role to use this command")
          }

          if(isNaN(args[0]) || !args.length) {
              return message.channel.send("Please Give the ID of the person")
          }

          const target = message.guild.members.cache.find((x) => x.id === args[0])

          if(!target) {
              return message.channel.send("Unable to find this person.")
          }


          const channel = await message.guild.channels.create(target.id, {
              type: "text",
            parent: category.id,
            topic: "Mail is Direct Opened by **" + message.author.username + "** to make contact with " + message.author.tag
          })

          let nembed = new discord.MessageEmbed()
          .setAuthor("DETAILS", target.user.displayAvatarURL({dynamic: true}))
          .setColor("BLUE")
          .setThumbnail(target.user.displayAvatarURL({dynamic: true}))
          .setDescription(message.content)
          .addField("Name", target.user.username)
          .addField("Account Creation Date", target.user.createdAt)
          .addField("Direct Contact", "Yes(it means this mail is opened by a supporter)");

          channel.send(nembed)

          let uembed = new discord.MessageEmbed()
          .setAuthor("DIRECT MAIL OPENED")
          .setColor("GREEN")
          .setThumbnail(client.user.displayAvatarURL())
          .setDescription("You have been contacted by Supporter of **" + message.guild.name + "**, Please wait until he send another message to you!");
          
          
          target.send(uembed);

          let newEmbed = new discord.MessageEmbed()
          .setDescription("Opened The Mail: <#" + channel + ">")
          .setColor("GREEN");

          return message.channel.send(newEmbed);
      } else if(command == "help") {
          let embed = new discord.MessageEmbed()
          .setAuthor('MODMAIL BOT', client.user.displayAvatarURL())
          .setColor("GREEN")
          
        .setDescription("This bot is made by CTK WARRIOR, You can remove credits :D")
        .addField(prefix + "setup", "Setup the modmail system(This is not for multiple server.)", true)
  
        .addField(prefix + "open", 'Let you open the mail to contact anyone with his ID', true)
        .setThumbnail(client.user.displayAvatarURL())
                    .addField(prefix + "close", "Close the mail in which you use this command.", true);

                    return message.channel.send(embed)
          
      }
  } 
  
  
  
  
  
  
  
  if(message.channel.parentID) {

    const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")
    
    if(message.channel.parentID == category.id) {
        let member = message.guild.members.cache.get(message.channel.name)
    
        if(!member) return message.channel.send('Unable To Send Message')
    
        let lembed = new discord.MessageEmbed()
        .setColor("GREEN")
        .setFooter(message.author.username, message.author.displayAvatarURL({dynamic: true}))
        .setDescription(message.content)
    
        return member.send(lembed)
    }
    
    
      } 
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  if(!message.guild) {
      const guild = await client.guilds.cache.get(ServerID);
      if(!guild) return;

      const main = guild.channels.cache.find((x) => x.name == message.author.id)
      const category = guild.channels.cache.find((x) => x.name == "MODMAIL")


      if(!main) {
          let mx = await guild.channels.create(message.author.id, {
              type: "text",
              parent: category.id,
              topic: "This mail is created for helping  **" + message.author.tag + " **"
          })

          let sembed = new discord.MessageEmbed()
          .setAuthor("MAIN OPENED")
          .setColor("GREEN")
          .setThumbnail(client.user.displayAvatarURL())
          .setDescription("Conversation is now started, you will be contacted by supporters soon :D")

          message.author.send(sembed)


          let eembed = new discord.MessageEmbed()
          .setAuthor("DETAILS", message.author.displayAvatarURL({dynamic: true}))
          .setColor("BLUE")
          .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
          .setDescription(message.content)
          .addField("Name", message.author.username)
          .addField("Account Creation Date", message.author.createdAt)
          .addField("Direct Contact", "No(it means this mail is opened by person not a supporter)")


        return mx.send(eembed)
      }

      let xembed = new discord.MessageEmbed()
      .setColor("YELLOW")
      .setFooter(message.author.tag, message.author.displayAvatarURL({dynamic: true}))
      .setDescription(message.content)


      main.send(xembed)

  } 
  
  
  
 
})


client.login(token)