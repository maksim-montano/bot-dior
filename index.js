// ====== [ПОДКЛЮЧЕНИЕ ЛИБ] ====== //
require('dotenv').config()
const Discord = require('discord.js'); 
const mongoose = require('mongoose');

const bot = new Discord.Client();

// ====== [ПОДКЛЮЧЕНИЕ PRESSETS-FILES / functions] ====== //

const {sendInviteMessage, generateEmbed, generateTopList} = require('./assets/pressets/functions.js');
const {objectsEmbeds__help} = require('./assets/pressets/objectEmbeds.js');

// ====== [ПОДКЛЮЧЕНИЕ БД-схем] ====== //

const Family = require('./assets/data/family.js');
const Guilds = require('./assets/data/guilds.js');
const Users = require('./assets/data/users.js');


// ====== [INDEX.JS] ====== //
bot.on("ready", () => {
    bot.generateInvite(['ADMINISTRATOR'])
        .then((link) => console.log(link));
    console.log(`[SYSTEM] Бот ${bot.user.username} успешно запущен!`);
});

mongoose.connect(process.env.DataBaseUrl, {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.connection.on('connected', () => {
    console.log('[SYSTEM] База данных от бота успешно включена!')
})


bot.on("message", message => {
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

            if(message.content.startsWith(`${data.prefix}top`)) { //            !top coins, !top rank, !top family
                let args = message.content.split(" ");

                if(!args[1]) return message.reply(`\`ты не указал какой топ нужно отправить!\``);
                if(args[1].includes('coins')) {
                    generateTopList(message, 0, 10, 1) // currentPage + 1, message.member.user.tag, 0+10, 10+10, message
                }
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
        if(reaction.emoji.name === "➡️") {
            if(user.id !== reaction.message.guild.members.cache.find(m => m.user.tag === reaction.message.embeds[0].footer.text.split("|")[1].split(" ")[2]).id) return;

            let currentPage = reaction.message.embeds[0].footer.text.split("|")[1].match(/\d/)[0];
            let maxPage = reaction.message.embeds[0].footer.text.split("|")[1].match(/\d/g)[1];
            let firstField = reaction.message.embeds[0].fields[0].name.split(". ")[0];
            let lastField = reaction.message.embeds[0].fields[reaction.message.embeds[0].fields.length-1].name.split(". ")[0];

            if(+currentPage === +maxPage) return;

            generateTopList(reaction, +firstField + 10, +lastField + 10, +currentPage + 1);
        }

        if(reaction.emoji.name === "⬅️") {
            let currentPage = reaction.message.embeds[0].footer.text.split("|")[1].match(/\d/)[0];
            let firstField = reaction.message.embeds[0].fields[0].name.split(". ")[0]; // 10
            let lastField = reaction.message.embeds[0].fields[reaction.message.embeds[0].fields.length-1].name.split(". ")[0]; 

            if(+currentPage === 1) return;

            generateTopList(reaction, +firstField - 10, +lastField - 10, +currentPage - 1)
        }

        if(reaction.emoji.name === "❌") return reaction.message.delete();
    }
})


bot.login(process.env.TOKEN);


/* 

        * Сделать систему семей (_, _, _, fkick, faddzam, fdelzam, fupdate(?), fsetname(?), fmenu, finfo)
        * Сделать систему рангов и топа (rank, top)
        * Сделать систему взаимодействий ( обнять, поцеловать, погладить )

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