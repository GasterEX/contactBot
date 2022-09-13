const Discord = require('discord.js');
const {
  create
} = require('domain');
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
  //フォームの送信
  sendForm(message);
  //終了コマンド
  finCommand(message);
  //メッセージ受け取り確認
  sendCheckMessage(message);
});
client.on('interactionCreate', async(interaction) => {
  //プライベートチャンネル作成
  createPrivateChannel(interaction);
});

async function sendForm(message) {
  //メッセージが!setupだったら
  if (message.content.startsWith("!setup")) {
    //ボタン設置
    sendButton(message, "お問い合わせ", "相談窓口");
    //カテゴリの作成
    createCategory(message, "お問い合わせ");
  }
  async function sendButton(message, label, content) {
    //ボタンの作成
    const tic1 = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
    .setCustomId("contact")
    .setStyle(Discord.ButtonStyle.Primary)
    .setLabel(label))
    //ボタンの送信
    await message.channel.send({
      content: content,
      components: [tic1]
    });
  }
  async function createCategory(message, categoryName) {
    //カテゴリを作成
    await message.guild.channels.create({
      name: categoryName,
      type: Discord.ChannelType.GuildCategory
    });
  }
}
async function finCommand(message) {
  //お問い合わせのカテゴリーを取得
  let contactCategory = message.guild.channels.cache.find(channel => channel.name == `お問い合わせ`);
  //送信されたメッセージが!finだったら
  if (message.content.startsWith("!fin") && message.channel.parentId == contactCategory) {
    //チャンネルを小今日する
    message.channel.delete();
  }
}
async function sendCheckMessage(message) {
  //お問い合わせのカテゴリー取得
  let contactCategory = message.guild.channels.cache.find(channel => channel.name == `お問い合わせ`);
  //送信されたメッセージがお問い合わせのカテゴリー内だった場合
  if (message.channel.parentId == contactCategory && !message.author.bot) {
    //管理者のロールを取得
    let operationRole = message.guild.roles.cache.find(role => role.name == `admin`);
    //メッセージを送信
    await message.channel.send({
      content: `メッセージを受け取りました。運営の対応をお待ちください。${operationRole}`
    })
  }
}
async function createPrivateChannel(interaction) {
  //インタラクションがお問い合わせのボタンだったら
  if (interaction.customId === "contact") {
    //お問い合わせのカテゴリーを取得
    let contactCategory = interaction.guild.channels.cache.find(channel => channel.name == `お問い合わせ`);
    //プライベートチャンネル作成
    let targetChannel = await interaction.guild.channels.create({
      name: '相談窓口',
      type: Discord.ChannelType.GuildText,
      parent: contactCategory.id,
      permissionOverwrites: [{
        id: client.user.id,
        allow: [Discord.PermissionFlagsBits.ViewChannel],
      }, {
        id: interaction.user.id,
        allow: [Discord.PermissionFlagsBits.ViewChannel]
      }, {
        id: interaction.guild.roles.everyone.id,
        deny: [Discord.PermissionFlagsBits.ViewChannel]
      }],
    }).catch(console.error);
    //メッセージを送信
    client.channels.cache.get(targetChannel.id).send(`${interaction.user}さんの窓口を開設しました。ご用件をお伺いいたします\n**終了する際には!finコマンドを実行してください**`);
  }
}
client.login(DISCORD_BOT_TOKEN);