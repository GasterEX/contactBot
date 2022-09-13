const { channel } = require('diagnostics_channel');
const { ChannelType } = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client({
  intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"]
});
const DISCORD_BOT_TOKEN = 'MTAwNDIwMzM0MTY5OTYyMDk0NA.GaOTNc.YlUgBe7Eh7LJaBFTAzaUUnwJ56vSiPZKDvcv48';
console.log('ready!');
var fs = require("fs");
var MessageDatas = [];
fs.readFile("log.json", "utf-8", function (err, data) {
  MessageDatas.push(JSON.parse(data));
})

client.on('messageCreate', async message => {
  if (message.content.startsWith("!setup")) {
    const tic1 = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder().setCustomId("contact")
      .setStyle(Discord.ButtonStyle.Primary)
      .setLabel("問い合わせ"))
    await message.channel.send({
      content: "相談窓口",
      components: [tic1]
    });
    await message.guild.channels.create({
      name: `お問い合わせ`,
      type:Discord.ChannelType.GuildCategory
    });
  }else{
    let contactCategory = message.guild.channels.cache.find(channel => channel.name == `お問い合わせ`);
    if (message.content.startsWith("!fin") && message.channel.parentId == contactCategory){
      message.channel.delete();
    }else if(message.channel.parentId == contactCategory && !message.author.bot){
      let operationRole = message.guild.roles.cache.find(role=> role.name == `admin`);
      await message.channel.send({
        content: `メッセージを受け取りました。運営の対応をお待ちください。${operationRole}`
      })
    }
  } 
});

client.on('interactionCreate', async(interaction) => {
  let guild = interaction.guild;
  let targetPlayer = interaction.user;
  if (interaction.customId === "contact") {
    const everyoneRole = guild.roles.everyone;
    let contactCategory = guild.channels.cache.find(channel => channel.name == `お問い合わせ`);

    let targetChannel = await guild.channels.create({
      name: '相談窓口',
      type:Discord.ChannelType.GuildText,
      parent:contactCategory.id,
      permissionOverwrites: [{
        id: client.user.id,
        allow: [Discord.PermissionFlagsBits.ViewChannel],
      }, {
        id: targetPlayer.id,
        allow: [Discord.PermissionFlagsBits.ViewChannel]
      }, {
        id: everyoneRole.id,
        deny: [Discord.PermissionFlagsBits.ViewChannel]
      }],
    }).catch(console.error);
    client.channels.cache.get(targetChannel.id).send(`${targetPlayer}さんの窓口を開設しました。ご用件をお伺いいたします\n**終了する際には!finコマンドを実行してください**`);
    
  }
});
client.login(DISCORD_BOT_TOKEN);