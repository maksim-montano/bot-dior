// ====== [ПОДКЛЮЧЕНИЕ ЛИБ] ====== //
require('dotenv').config()
const Discord = require('discord.js'); 
const mongoose = require('mongoose');
const Canvas = require('canvas');
const nekoslife = require('nekos.life');
const neko = new nekoslife();

const bot = new Discord.Client();

// ====== [ПОДКЛЮЧЕНИЕ PRESSETS-FILES / functions] ====== //

const {sendInviteMessage, generateEmbed, generateTopList, getRandomInt, applyText} = require('./assets/pressets/functions.js');
const {objectsEmbeds__help} = require('./assets/pressets/objectEmbeds.js');

// ====== [ПОДКЛЮЧЕНИЕ БД-схем] ====== //

const Family = require('./assets/data/family.js');
const Guilds = require('./assets/data/guilds.js');
const Users = require('./assets/data/users.js');
const BotStatistics = require('./assets/data/botstatistic.js');

// ====== [INDEX.JS] ====== //



bot.on("ready", () => {

    bot.guilds.cache.forEach(guild => {
        Guilds.findOne({guildID: guild.id}, async(err, data__guild) => {
            if(err) console.log(err);
            if(!data__guild) {
                let new__guild = new Guilds({guildID: guild.id, ownerID: guild.ownerID, guildMembersSize: guild.members.cache.size})
                new__guild.save().then(() => console.log('добавлена новая гильдия'))
            }
        })

        guild.members.cache.forEach(member => {
            Users.findOne({userID: member.id}, async(err, data) => {
                if(err) console.log(err);
                if(!data) { //  && !member.user.bot
                    let new__user = new Users({userID: member.id, guildID: guild.id})
                    new__user.save().then(() => console.log('добавлен новый пользователь!'))
                }
            })
        })
    })

    bot.generateInvite(['ADMINISTRATOR'])
        .then((link) => console.log(link));
    console.log(`[SYSTEM] Бот ${bot.user.username} успешно запущен!`);
});

mongoose.connect(process.env.DataBaseUrl, {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.connection.on('connected', () => {
    console.log('[SYSTEM] База данных от бота успешно включена!')
})


bot.on("message", async message => {

    Users.findOne({userID: message.author.id, guildID: message.guild.id}, async(err, data) => {
        if(err) console.log(err);
        if(!data) {
            let new__data = new Users({userID: message.author.id, guildID: message.guild.id})
            return new__data.save()
        }

        data.messages++;
        
        if(data.messages % 2 === 0) {
            data.exp++;
        }

        if(data.exp === data.needleExp) {
            data.rank++;
            data.needleExp += 131;
            data.exp = 0;

            data.save()

            return message.reply(`\`поздравляем, теперь у вас ${data.rank} уровень!\``);
        }

        data.save()
    })



    //  > CMD: setprefix <  //




    Guilds.findOne({guildID: message.guild.id}, async(err, data) => {
        if(err) console.log(err);
        if(!data) {
            let new__guild = Guilds({guildID: message.guild.id, ownerID: message.guild.ownerID})
            return new__guild.save().then(() => {
                if(message.content.startsWith(new__guild.prefix + `setprefix`)) {
                    console.log(new__guild.ownerID)
                    let args = message.content.split(" ");
                    if(!(message.author.id === new__guild.ownerID)) return message.reply(`\`вы не создатель этого сервера!\``);
                    if(!args[1]) return message.reply(`\`ты не указал какой префикс нужно ставить =)\``);
        
                    new__guild.prefix = args[1];
                    new__guild.save().then(() => console.log(`Изменен префикс`));
        
                    message.reply('\`вы успешно сменили префикс на ' + `${args[1]}\``)
                }
            });

        }




        if(message.content.startsWith(`${data.prefix}setprefix`)) {
            let args = message.content.split(" ");
            if(!message.author.id === data.ownerID) return message.reply(`\`вы не создатель этого сервера!\``);
            if(!args[1]) return message.reply(`\`ты не указал какой префикс нужно ставить =)\``);

            data.prefix = args[1];
            data.save().then(() => console.log(`Изменен префикс`));

            return message.reply('\`вы успешно сменили префикс на ' + `${args[1]}\``)
        }

    })







    Guilds.findOne({guildID: message.guild.id}, async(err, data) => {
        if(err) console.log(err);
        if(data) {
            //  > CMD: fcreate <  //
            if(message.content.startsWith(`${data.prefix}fcreate`)) { // /fcreate название
                message.delete()
                const args = message.content.split(' ');
                const mention__user = message.mentions.members.first();
                if(!message.member.hasPermission('ADMINISTRATOR')) return;
                if(!args[1]) return message.reply('вы не указали название семьи').then(msg => msg.delete({timeout: 5000}));
                if(!args[2]) return message.reply('вы не указали создателя семьи').then(msg => msg.delete({timeout: 5000}));
                if(!mention__user) return message.reply("вы указали не правильно пользователя").then(msg => msg.delete({timeout: 5000}));
                
                Family.findOne({FamilyName: args[1]}, async(err, data) => {
                    if(err) console.log(err);
                    if(!data) {
                        let new__family = new Family({CreatorFam: mention__user.id, FamilyName: args[1], guildID: message.guild.id})
                        new__family.save().then(() => console.log('Создана новая семья'));

                        let success__createfamily = new Discord.MessageEmbed()
                        .setTitle('DiorBot | Успешно!')
                        .addFields(
                            {name: `Название семьи`, value: `\`${new__family.FamilyName}\``, inline: true},

                            {name: `Создатель семьи`, value: `\`${message.guild.members.cache.get(new__family.CreatorFam).user.tag}\``, inline: true},

                            {name: `Время создания`, value: `\`${message.createdAt.getUTCHours() + 3}:${message.createdAt.getUTCMinutes()}:${message.createdAt.getUTCSeconds()} МСК\``, inline: true},
                        )
                        .setColor('BLURPLE')
                        .setFooter(`© DiorBot Team`)
                        .setTimestamp()

                        return message.channel.send(`<@${message.guild.members.cache.get(new__family.CreatorFam).id}>, семья успешно создана!`, {embed: success__createfamily}).then(msg => msg.delete({timeout: 7000}))
                    }
                    
                    return message.reply('семья с таким названием уже существует!').then(msg => msg.delete({timeout: 5000}));
                })
            }






            //  > CMD: fdelete <  //
            if(message.content.startsWith(`${data.prefix}fdelete`)) {
                message.delete()
                const args = message.content.split(" ");

                if(!args[1]) return message.reply('\`вы не указали название семьи!\`').then(msg => msg.delete({timeout: 5000}));
                Family.findOne({FamilyName: args[1], guildID: message.guild.id}, async(err, data) => {
                    if(err) console.log(err);
                    if(!data) return message.reply('семьи с таким названеим не существует!').then(msg => msg.delete({timeout: 5000}));

                    if(message.author.id === data.CreatorFam || data.FamilyZams.includes(message.author.id)) { // если удаляет создатель или зам
                        let embed__deletefam = new Discord.MessageEmbed()
                        .setTitle('DiorBot | Удаление семьи')
                        .addFields(
                            {name: `Название семьи`, value: `\`${data.FamilyName}\``, inline: true},

                            {name: `Удалил семью`, value: `<@${message.author.id}>`, inline: true},

                            {name: `Время удадления`, value: `\`${message.createdAt.getUTCHours() + 3}:${message.createdAt.getUTCMinutes()}:${message.createdAt.getUTCSeconds()} МСК\``, inline: true},
                        )
                        .setColor('BLURPLE')
                        .setFooter(`© DiorBot Team`)
                        .setTimestamp()

                        data.remove();

                        return message.channel.send(`<@${message.author.id}>, вы успешно удалили семью!`, {embed: embed__deletefam}).then(msg => msg.delete({timeout: 7000}));

                    } else if(message.member.hasPermission('ADMINISTRATOR')) { // если удалят администратор
                        let embed__deletefam = new Discord.MessageEmbed()
                        .setTitle('DiorBot | Удаление семьи')
                        .addFields(
                            {name: `Название семьи`, value: `\`${data.FamilyName}\``, inline: true},

                            {name: `Удалил семью`, value: `<@${message.author.id}>`, inline: true},

                            {name: `Время удадления`, value: `\`${message.createdAt.getUTCHours() + 3}:${message.createdAt.getUTCMinutes()}:${message.createdAt.getUTCSeconds()} МСК\``, inline: true},
                        )
                        .setColor('BLURPLE')
                        .setFooter(`© DiorBot Team`)
                        .setTimestamp()

                        data.remove();

                        return message.channel.send(`<@${message.author.id}>, вы успешно удалили семью!`, {embed: embed__deletefam}).then(msg => msg.delete({timeout: 7000}));
                    } else {
                        return message.reply('\`вы не являетесь создателем или заместителем семьи!\`').then(msg => msg.delete({timeout: 5000}));
                    }
                })
            }







            //  > CMD: finvite <  //

            if(message.content.startsWith(`${data.prefix}finvite`)) { //        /finvite mention__user famname
                const args = message.content.split(" ");
                const mention__user = message.mentions.users.first();
                const REACTIONS__MESSAGE = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
                message.delete()
                if(!args[1]) return message.reply('вы не указали пользователя!');
                if(!mention__user) return message.reply('вы не верно указали пользователя!');
                if(message.author.id === mention__user.id) return message.reply('видимо ты ошибся пользователем, ты приглашаешь самого себя!').then(msg => msg.delete({timeout: 5000}))

                if(!args[2]) {
                    const families__list = new Discord.MessageEmbed()
                    .setTitle(`DiorBot | Приглашение игрока в семью`)
                    .setDescription(`\`Вас привествует диалоговое окно приглашения пользователя в семью дискорда! Внизу есть список семей, где вы являетесь либо создателем, либо заместителем. Еще ниже - есть реакции - их всего-лишь пять, думаю вы их увидете. При нажатии на какую-то из реакций - вы приглашаете пользователя в семью под этим номером. Не знаете на какую реакцию жать? Все просто: каждая реакция соотвествует номеру семьи в списке выше, значит - ищите в списке семью, которую надо, смотрите на номер и ищите реакцию с таким номером\`\n**Вы приглашаете:** <@${mention__user.id}>`)
                    .setColor('BLURPLE')
                    .setFooter('© DiorBot Team')
                    .setTimestamp()

                    Family.find( {$or: [ {CreatorFam: message.author.id}, {FamilyZams: message.author.id} ] }, async(err, data) => {
                        if(err) console.log(err);
                        if(!data) return message.reply('\`к сожалению ты не являешься создателем/заместитетелем какой-либо семьи!\`').then(msg => msg.delete({timeout: 5000}))

                        for(let i = 0; i < data.length; i++) {
                            families__list.addField(`#0${i + 1}. Название: ${data[i].FamilyName}`, `\`${data[i].FamilyMembers.length} участников | ${data[i].FamilyZams.length} заместителей\``)
                        }

                        message.channel.send(`<@${message.author.id}>, вот ваш список семей:`, {embed: families__list}).then(message__list => {
                            for(let reaction of REACTIONS__MESSAGE) {
                                message__list.react(reaction)
                            }


                            const filter__messageList = (reaction, user) => {
                                return REACTIONS__MESSAGE.includes(reaction.emoji.name) && user.id === message.author.id;
                            };

                            message__list.awaitReactions(filter__messageList, {
                                max: 1,
                                time: 60000,
                                errors: ['time'],
                            }).then(collect__reaction => {
                                let reaction = collect__reaction.first();
                                for(let i = 0; i < REACTIONS__MESSAGE.length; i++) {
                                    if(reaction.emoji.name === REACTIONS__MESSAGE[i]) {
                                        const family_name = reaction.message.embeds[0].fields[i].name.split(`#0${i+1}. Название: `)[1];
                                        sendInviteMessage(Family, family_name, message, message__list);
                                    }
                                }
                            }).catch(() => {
                                return message__list.delete()
                            })
                        })
                    })
                } else {
                    sendInviteMessage(Family, args[2], message);
                }
            }






            // > CMD: help < //

            if(message.content.startsWith(`${data.prefix}help`)) {
                message.delete()
                generateEmbed(0, message.member.user.tag, message);
            }









            // > CMD: user < //

            if(message.content.startsWith(`${data.prefix}user`)) {
                let args = message.content.split(" ");
                let mention__user = message.mentions.users.first();

                if(!args[1]) return message.reply(`\`вы не указали пользователя!\``);
                if(!mention__user) return message.reply(`\`вы не правильно указали пользователя!\``);

                Users.findOne({userID: mention__user.id}, async(err, data) => {
                    if(err) console.log(err);
                    if(!data) {
                        let new__user = new Users({userID: mention__user.id, guildID: message.guild.id})
                        new__user.save().then(() => console.log('Добавлен новый пользователь!'))
                    }
                    Family.findOne({$or: [ {CreatorFam: mention__user.id}, {FamilyZams: mention__user.id} ]}, async(err, data__family) => {
                        if(err) console.log(err);

                        let embed__profile = new Discord.MessageEmbed()
                        .setTitle(`DiorBot | Статистика ${message.guild.members.cache.get(mention__user.id).displayName}`)
                        .setThumbnail(message.guild.members.cache.get(mention__user.id).user.displayAvatarURL())
                        .setColor('BLURPLE')
                        .addFields(
                            {name: `⚙️ \`Имя пользователя на сервере\``, value: message.guild.members.cache.get(mention__user.id).displayName, inline: false},
                            {name: `🔎 \`Тег пользователя в дискорде\``, value: message.guild.members.cache.get(mention__user.id).user.tag, inline: false},
                            {name: `🗓️ \`Дата регитрации аккаунта\``, value: `${message.guild.members.cache.get(mention__user.id).user.createdAt.toLocaleString('ru')}`, inline: false},
                            {name: `🕒 \`Дата входа на сервер\``, value: `${message.guild.members.cache.get(mention__user.id).joinedAt.toLocaleString('ru')}`, inline: false},
                        )

                        data__family ? embed__profile.addField(`👥 \`Создатель/заместитель семьи\``, `\`Название семьи:\` ${data__family.FamilyName}`) : embed__profile.addField(`👥 \`Создатель/заместитель семьи\``, `не является создателем`)

                        embed__profile.addField(`📈 \`Роли пользователя(${message.guild.members.cache.get(mention__user.id).roles.cache.size})\``, `\u200B`)
                        for(let i = 0; i < message.guild.members.cache.get(mention__user.id).roles.cache.size; i++) {
                            if(message.guild.members.cache.get(mention__user.id).roles.cache.array()[i].name === '@everyone') continue;
                            embed__profile.fields[5].value = embed__profile.fields[5].value + `\`${i+1}.\` ${message.guild.members.cache.get(mention__user.id).roles.cache.array()[i]}\n`;
                        }
                        embed__profile.addField(`🔶 \`Высшая роль\``, message.guild.members.cache.get(mention__user.id).roles.highest)
                        return message.channel.send(embed__profile)
                    })
                })
            }





            // > CMD: обнять //
            if(message.content.startsWith(`${data.prefix}обнять`)) {

                let args = message.content.split(" ");
                let mention__user = message.mentions.users.first();

                BotStatistics.findOne({botName: bot.user.username}, async(err, data) => {
                    if(err) console.log(err);
                    if(!data) {
                        let members__size = 0;
                        bot.guilds.cache.forEach(item => {
                            members__size += item.members.cache.size;
                        })

                        let new__bot = new BotStatistics({botName: bot.user.username, botServers: bot.guilds.cache.size, botMembers: members__size})
                        new__bot.save()
                    }

                    if(!args[1]) return message.reply('\`вы не указали пользователя!\`');
                    if(!mention__user) return message.reply('\`вы не правильно указали пользователя!\`');
                    let member = message.guild.members.cache.get(mention__user.id);
                    
                    let gif = (await neko.sfw.hug());

                    async function start() {
                        let interaction__embed = new Discord.MessageEmbed()
                        .setTitle(`DiorBot | ${member.displayName} вас обняли!`)
                        .setImage(gif.url)
                        .setDescription(`<@${member.id}> вас обнял(а) <@${message.author.id}>`)
                        .setFooter(`Взаимодействия бота ${bot.user.username} было использовано ${data.botInteractionUses} раз`, bot.user.displayAvatarURL())
                        .setColor('BLURPLE')
    
                        data.botInteractionUses++;
                        data.save()

                        return message.channel.send(interaction__embed)
                    }
                    start();
                })
            }







            // > CMD: поцеловать < //
            if(message.content.startsWith(`${data.prefix}поцеловать`)) {

                let args = message.content.split(" ");
                let mention__user = message.mentions.users.first();

                BotStatistics.findOne({botName: bot.user.username}, async(err, data) => {
                    if(err) console.log(err);
                    if(!data) {
                        let members__size = 0;
                        bot.guilds.cache.forEach(item => {
                            members__size += item.members.cache.size;
                        })

                        let new__bot = new BotStatistics({botName: bot.user.username, botServers: bot.guilds.cache.size, botMembers: members__size})
                        new__bot.save()
                    }

                    if(!args[1]) return message.reply('\`вы не указали пользователя!\`');
                    if(!mention__user) return message.reply('\`вы не правильно указали пользователя!\`');
                    let member = message.guild.members.cache.get(mention__user.id);
                    
                    let gif = (await neko.sfw.kiss());

                    async function start() {
                        let interaction__embed = new Discord.MessageEmbed()
                        .setTitle(`DiorBot | ${member.displayName} вас поцеловали!`)
                        .setImage(gif.url)
                        .setDescription(`<@${member.id}> вас поцеловал(а) <@${message.author.id}>`)
                        .setFooter(`Взаимодействия бота ${bot.user.username} было использовано ${data.botInteractionUses} раз`, bot.user.displayAvatarURL())
                        .setColor('BLURPLE')
    
                        data.botInteractionUses++;
                        data.save()

                        return message.channel.send(interaction__embed)
                    }
                    start();
                })
            }






            // > CMD: погладить //
            if(message.content.startsWith(`${data.prefix}погладить`)) {

                let args = message.content.split(" ");
                let mention__user = message.mentions.users.first();

                BotStatistics.findOne({botName: bot.user.username}, async(err, data) => {
                    if(err) console.log(err);
                    if(!data) {
                        let members__size = 0;
                        bot.guilds.cache.forEach(item => {
                            members__size += item.members.cache.size;
                        })

                        let new__bot = new BotStatistics({botName: bot.user.username, botServers: bot.guilds.cache.size, botMembers: members__size})
                        new__bot.save()
                    }

                    if(!args[1]) return message.reply('\`вы не указали пользователя!\`');
                    if(!mention__user) return message.reply('\`вы не правильно указали пользователя!\`');
                    let member = message.guild.members.cache.get(mention__user.id);
                    
                    let gif = (await neko.sfw.pat());

                    async function start() {
                        let interaction__embed = new Discord.MessageEmbed()
                        .setTitle(`DiorBot | ${member.displayName} вас погладили!`)
                        .setImage(gif.url)
                        .setDescription(`<@${member.id}> вас погладил(а) <@${message.author.id}>`)
                        .setFooter(`Взаимодействия бота ${bot.user.username} было использовано ${data.botInteractionUses} раз`, bot.user.displayAvatarURL())
                        .setColor('BLURPLE')
    
                        data.botInteractionUses++;
                        data.save()

                        return message.channel.send(interaction__embed)
                    }
                    start();
                })
            }








            // CMD: ударить //
            if(message.content.startsWith(`${data.prefix}ударить`)) {

                let args = message.content.split(" ");
                let mention__user = message.mentions.users.first();

                BotStatistics.findOne({botName: bot.user.username}, async(err, data) => {
                    if(err) console.log(err);
                    if(!data) {
                        let members__size = 0;
                        bot.guilds.cache.forEach(item => {
                            members__size += item.members.cache.size;
                        })

                        let new__bot = new BotStatistics({botName: bot.user.username, botServers: bot.guilds.cache.size, botMembers: members__size})
                        new__bot.save()
                    }

                    if(!args[1]) return message.reply('\`вы не указали пользователя!\`');
                    if(!mention__user) return message.reply('\`вы не правильно указали пользователя!\`');
                    let member = message.guild.members.cache.get(mention__user.id);
                    
                    let gif = (await neko.sfw.slap());

                    async function start() {
                        let interaction__embed = new Discord.MessageEmbed()
                        .setTitle(`DiorBot | ${member.displayName} вас ударили!`)
                        .setImage(gif.url)
                        .setDescription(`<@${member.id}> вас ударил(а) <@${message.author.id}>`)
                        .setFooter(`Взаимодействия бота ${bot.user.username} было использовано ${data.botInteractionUses} раз`, bot.user.displayAvatarURL())
                        .setColor('BLURPLE')
    
                        data.botInteractionUses++;
                        data.save()

                        return message.channel.send(interaction__embed)
                    }
                    start();
                })
            }









            // CMD: тыкнуть //
            if(message.content.startsWith(`${data.prefix}тыкнуть`)) {

                let args = message.content.split(" ");
                let mention__user = message.mentions.users.first();

                BotStatistics.findOne({botName: bot.user.username}, async(err, data) => {
                    if(err) console.log(err);
                    if(!data) {
                        let members__size = 0;
                        bot.guilds.cache.forEach(item => {
                            members__size += item.members.cache.size;
                        })

                        let new__bot = new BotStatistics({botName: bot.user.username, botServers: bot.guilds.cache.size, botMembers: members__size})
                        new__bot.save()
                    }

                    if(!args[1]) return message.reply('\`вы не указали пользователя!\`');
                    if(!mention__user) return message.reply('\`вы не правильно указали пользователя!\`');
                    let member = message.guild.members.cache.get(mention__user.id);
                    
                    let gif = (await neko.sfw.poke());

                    async function start() {
                        let interaction__embed = new Discord.MessageEmbed()
                        .setTitle(`DiorBot | ${member.displayName} вас тыкнули!`)
                        .setImage(gif.url)
                        .setDescription(`<@${member.id}> вас тыкнул(а) <@${message.author.id}>`)
                        .setFooter(`Взаимодействия бота ${bot.user.username} было использовано ${data.botInteractionUses} раз`, bot.user.displayAvatarURL())
                        .setColor('BLURPLE')
    
                        data.botInteractionUses++;
                        data.save()

                        return message.channel.send(interaction__embed)
                    }
                    start();
                })
            }









            // > CMD: top < //
            if(message.content.startsWith(`${data.prefix}top`)) {
                let args = message.content.split(" ");
                if(!args[1]) return message.reply(`\`ты не указал какой топ нужно отправить!\``);
                if(args[1].includes('coins')) {
                    generateTopList(message, message.member.user.tag, 1)
                }
            }


            if(message.content.startsWith(`${data.prefix}ранг`)) {
                let args = message.content.split(" ");
                let mention__user = message.mentions.users.first();
                const canvas = Canvas.createCanvas(900, 200);
                const ctx = canvas.getContext('2d');

                if(!args[1]) {
                    Users.findOne({userID: message.author.id, guildID: message.guild.id}, async(err, data) => {
                        if(err) console.log(err);
                        if(!data) {
                            let new__user = new Users({userID: message.author.id, guildID: message.guild.id});
                            new__user.save()
                        }
                        ctx.strokeStyle = "#74037b";
                        const background = await Canvas.loadImage('assets/media/background__canvas.jpg');
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                        ctx.strokeRect(0, 0, canvas.width, canvas.height);


                        ctx.font = applyText(canvas, `${message.member.displayName}`, 'Verdana', 45);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(message.member.displayName, canvas.width / 4.4, canvas.height / 3.2);

                        ctx.beginPath();
                        ctx.globalAlpha = 0.6;
                        ctx.rect(200, 160, 660, 3);
                        ctx.fillStyle = 'transparent';
                        ctx.fill();
                        ctx.strokeStyle = '#5e5e5e';
                        ctx.lineJoin = 'round';
                        ctx.lineWidth = 35;
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                        ctx.closePath()

    
                        ctx.beginPath();
                        ctx.globalAlpha = 0.6;
                        ctx.rect(200, 160, ( (100 / (data.rank * data.needleExp) ) * data.exp) * 6.6, 3);
                        ctx.fillStyle = 'transparent';
                        ctx.fill();
                        ctx.strokeStyle = '#b54200'; //ctx.strokeStyle = '#fa9600';
                        ctx.lineJoin = 'round';
                        ctx.lineWidth = 35;
                        ctx.stroke();
                        ctx.closePath()
                        ctx.globalAlpha = 1;

                        ctx.font = applyText(canvas, `УР`, 'sans', 23);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText('УР', canvas.width / 4.4, canvas.height / 1.44);

                        ctx.font = applyText(canvas, `${data.rank}`, 'sans', 50);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(`${data.rank}`, canvas.width / 3.7, canvas.height / 1.46);

                        ctx.font = applyText(canvas, `${data.exp}`, 'sans', 30);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(`${data.exp} / ${data.needleExp} EXP`, canvas.width - 240, canvas.height / 1.5);


                        ctx.beginPath();
                        ctx.arc(100, 100, 80, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.clip();

                        const avatar = await Canvas.loadImage(message.member.user.displayAvatarURL({ format: 'jpg' }));
                        ctx.drawImage(avatar, 10, 0, 180, 180);


                        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'rank-card.jpg');

                        message.channel.send(attachment);
                    })
                } else if(args[1] && mention__user) {}
            }
        }
    })
});


bot.on("messageReactionAdd", (reaction, user) => {
    if(user.bot) return;
    if(reaction.message.embeds[0].title.includes('DiorBot | Помощь по командам бота >')) {
        if(user.id !== reaction.message.guild.members.cache.find(m => m.user.tag === reaction.message.embeds[0].footer.text.split("|")[1].split(" ")[2]).id) return;
        let currentPageIndex = reaction.message.embeds[0].footer.text.split("|")[2].match(/\d/)[0];

        if(reaction.emoji.name === "⬅️") {
            if(+currentPageIndex === 1) return;
            generateEmbed(+currentPageIndex-2, reaction.message.guild.members.cache.find(m => m.id === reaction.message.embeds[0].footer.iconURL.split('/')[4]).user.tag, reaction);
        }

        if(reaction.emoji.name === "➡️") {
            if(+currentPageIndex === objectsEmbeds__help.length) return;
            
            generateEmbed(+currentPageIndex, reaction.message.guild.members.cache.find(m => m.id === reaction.message.embeds[0].footer.iconURL.split('/')[4]).user.tag, reaction);
        }

        if(reaction.emoji.name === "❌") return reaction.message.delete();
    }

    if(reaction.message.embeds[0].title.includes('DiorBot | Список топа по coins')) {
        if(user.id !== reaction.message.guild.members.cache.find(m => m.user.tag === reaction.message.embeds[0].footer.text.split("|")[1].split(" ")[2]).id) return;
        if(reaction.emoji.name === "⬅️") {
            let currentPage = reaction.message.embeds[0].footer.text.split("|")[2].split(" ")[2].split('/')[0];
            // // let currentPage = reaction.message.embeds[0].footer.text.split("|")[1].match(/\d/)[0];
            // // let firstField = reaction.message.embeds[0].fields[0].name.split(". ")[0]; // 10
            // // let lastField = reaction.message.embeds[0].fields[reaction.message.embeds[0].fields.length-1].name.split(". ")[0]; 


            // console.log("-" + " " + +currentPage)
            
            // if(+currentPage-1 === 1) return;

            generateTopList(reaction, reaction.message.guild.members.cache.find(m => m.id === reaction.message.embeds[0].footer.iconURL.split('/')[4]).user.tag, +currentPage - 1) // generateTopList(reaction, +firstField - 10, +lastField - 10, +currentPage - 1)
        }

        if(reaction.emoji.name === "➡️") {
            if(user.id !== reaction.message.guild.members.cache.find(m => m.user.tag === reaction.message.embeds[0].footer.text.split("|")[1].split(" ")[2]).id) return;

            let currentPage = reaction.message.embeds[0].footer.text.split("|")[2].split(" ")[2].split('/')[0];
            // let maxPage = reaction.message.embeds[0].footer.text.split("|")[2].split(" ")[2].split('/')[1];

            // console.log("+" + " " + +currentPage)
            // let firstField = reaction.message.embeds[0].fields[0].name.split(". ")[0];
            // let lastField = reaction.message.embeds[0].fields[reaction.message.embeds[0].fields.length-1].name.split(". ")[0];

            // if(+currentPage === +maxPage) return;

            generateTopList(reaction, reaction.message.guild.members.cache.find(m => m.id === reaction.message.embeds[0].footer.iconURL.split('/')[4]).user.tag, +currentPage + 1); // +firstField + 10, +lastField + 10
        }

        if(reaction.emoji.name === "❌") return reaction.message.delete();
    }
})


bot.login(process.env.TOKEN);


/* 

        * Сделать систему семей (_, _, _, fkick, faddzam, fdelzam, fupdate(?), fsetname(?), fmenu, finfo)
        * Сделать систему рангов и топа (_, _, top rank, top family)
        * Сделать Invite, bot info
*/




/* 


ЮЗЕРЫ

const const mongoose = require('mongoose');
const schema = mongoose.Schema({
    userID: String,
    guildID: String,
    coins: String,
});
module.exports = mongoose.model("users", schema)


гильдии
const mongoose = require('mongoose');
const schema = mongoose.Schema({
    guildID: String,
    ownerID: String,
    prefix: String,
});
module.exports = mongoose.model("guilds", schema)

*/