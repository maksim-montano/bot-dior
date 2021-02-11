// ====== [ПОДКЛЮЧЕНИЕ ЛИБ] ====== //
require('dotenv').config()
const Discord = require('discord.js'); // подключили библиотеку дискорд.джс
const mongoose = require('mongoose');


const bot = new Discord.Client(); // создание клиента нового

// ====== [ПОДКЛЮЧЕНИЕ PRESSETS FILES / functions] ====== //


// ====== [ПОДКЛЮЧЕНИЕ БД-схем] ====== //

const Family = require('./assets/data/family.js');




// ====== [INDEX.JS] ====== //
bot.on("ready", () => {
    bot.generateInvite("ADMINISTRATOR")
        .then((link) => console.log(link));
    console.log(`[SYSTEM] Бот ${bot.user.username} успешно запущен!`);
});

mongoose.connect(process.env.DataBaseUrl, {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.connection.on('connected', () => {
    console.log('[SYSTEM] База данных от бота успешно включена!')
})


bot.on("message", message => {
    
    //  > CMD FCREATE <  //
    if(message.content.startsWith('/fcreate')) { // /fcreate название
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
    if(message.content.startsWith('/fdelete')) {
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


    if(message.content.startsWith('/finvite')) { //        /finvite mention__user famname
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

                                Family.findOne({FamilyName: family_name}, async(err, data__family) => {
                                    if(err) console.log(err);
                                    if(!data__family) return message.reply('\`произошла критическая ошибка, обратитесь к разработчику бота!\`');
                                    
                                    if(data__family.FamilyZams.includes(mention__user.id)) return message.reply('\`пользователь, которого вы хотите пригласить - является заместителем этой семьи\`');
                                    if(data__family.FamilyMembers.includes(mention__user.id)) return message.reply('\`пользователь уже состоит в вашей семье!\`');

                                    let embed__invitefam = new Discord.MessageEmbed()
                                    .setTitle('DiorBot | Вас приглашают в семью!')
                                    .addFields(
                                        {name: 'Приглашает:', value: `<@${message.author.id}>`, inline: true},
                                        {name: 'Название семьи:', value: `\`${data__family.FamilyName}\``, inline: true},
                                        {name: 'Количество участников семьи:', value: `\`${data__family.FamilyMembers.length}\``, inline: true}
                                    )
                                    .setColor('BLURPLE')
                                    .setFooter('© DiorBot Team')
                                    .setTimestamp()
                                    
                                    message.channel.send(`<@${mention__user.id}>, вас приглашают в семью!`, {embed: embed__invitefam}).then(message__invite => {
                                        message__list.delete()
                                        message__invite.react("✔️");
                                        message__invite.react("❌");

                                        const filter__messageInvite = (reaction, user) => {
                                            return ["✔️", "❌"].includes(reaction.emoji.name) && user.id === mention__user.id;
                                        };

                                        message__invite.awaitReactions(filter__messageInvite, {
                                            max: 1,
                                            time: 70000,
                                            errors: ['time'],
                                        }).then(collctedRecations__invite => {
                                            const reaction = collctedRecations__invite.first()

                                            if(reaction.emoji.name === "✔️") {
                                                data__family.FamilyMembers.push(mention__user.id);
                                                data__family.FamilyMembersDescr.push(`<@${mention__user.id}>`);

                                                data__family.save().then(() => console.log(`Пользователь был добавлен в семью!`));
                                                return message__invite.delete();
                                            }

                                            if(reaction.emoji.name === "❌") {
                                                return message__invite.delete();
                                            }
                                        }).catch(() => {
                                            return message__invite.delete();
                                        })
                                    })
                                });
                            }
                        }
                    }).catch(() => {
                        return message__list.delete()
                    })
                })
            })
        } else {
            Family.findOne({FamilyName: args[2]}, async(err, data__family) => {
                if(err) console.log(err);
                if(!data__family) return message.reply('\`указаная вами семья - несуществует\`');
                
                if(data__family.FamilyZams.includes(mention__user.id)) return message.reply('\`пользователь, которого вы хотите пригласить - является заместителем этой семьи\`');
                if(data__family.FamilyMembers.includes(mention__user.id)) return message.reply('\`пользователь уже состоит в вашей семье!\`');

                let embed__invitefam = new Discord.MessageEmbed()
                .setTitle('DiorBot | Вас приглашают в семью!')
                .addFields(
                    {name: 'Приглашает:', value: `<@${message.author.id}>`, inline: true},
                    {name: 'Название семьи:', value: `\`${data__family.FamilyName}\``, inline: true},
                    {name: 'Количество участников семьи:', value: `\`${data__family.FamilyMembers.length}\``, inline: true}
                )
                .setColor('BLURPLE')
                .setFooter('© DiorBot Team')
                .setTimestamp()

                message.channel.send(`<@${mention__user.id}>, вас приглашают в семью!`, {embed: embed__invitefam}).then(message__invite => {
                    message__invite.react("✔️");
                    message__invite.react("❌");

                    const filter__messageInvite = (reaction, user) => {
                        return ["✔️", "❌"].includes(reaction.emoji.name) && user.id === mention__user.id;
                    };

                    message__invite.awaitReactions(filter__messageInvite, {
                        max: 1,
                        time: 70000,
                        errors: ['time'],
                    }).then(collctedRecations__invite => {
                        const reaction = collctedRecations__invite.first()

                        if(reaction.emoji.name === "✔️") {
                            data__family.FamilyMembers.push(mention__user.id);
                            data__family.FamilyMembersDescr.push(`<@${mention__user.id}>`);

                            data__family.save().then(() => console.log(`Пользователь был добавлен в семью!`));
                            return message__invite.delete();
                        }

                        if(reaction.emoji.name === "❌") {
                            return message__invite.delete();
                        }
                    }).catch(() => {
                        return message__invite.delete();
                    })
                })
            });
        }
    }



    // > CMD: help < //

    if(message.content.startsWith('/help')) {
        message.delete()
        let help__embed = new Discord.MessageEmbed()
        .setTitle('Test Bot | Помощь по командам бота.')
        .addFields(
            {name: 'Система семей', value: `**/createfam** - \`создать семью\`\n**/addzam** - \`добавить заместителя в семью\`\n**/updatefam** - \`улучшение семьи\`\n**/famkick** - \`исключение из семьи\`\n**/faminv** - \`приглашение в семью\`\n**/fmenu** - \`просмотр меню семьи\`\n**/fsetname** - \`установить новое имя семьи\``, inline: true},


            {name: 'Общие системы', value: `**/rank** - \`узнать свою уровень в дискорде\`\n**/top** - \`просмотреть список топ пользователей сервера\`\n**/balance** - \`узнать кол-во вашего баланса\``, inline: true},


            {name: 'Система взаимодействий', value: `**/обнять** - \`обнять пользователя дискорда\`\n**/поцеловать** - \`поцеловать пользователя дискорда\`\n**/ударить** - \`ударить пользователя дискорда\``},


            {name: 'Административные системы', value: `**/setprefix** - \`установить новый префикс\``}
        )
        
        .setFooter('© DiorBot Team')
        .setColor('BLURPLE')
        .setTimestamp()

        return message.reply('', {embed: help__embed})
            .then(msg => msg.delete({timeout: 10000}))
    }
});


bot.on("messageReactionAdd", (reaction, user) => {
    
})


bot.login(process.env.TOKEN); 



/* 

        * Сделать систему семей (_, _, _, fkick, faddzam, fdelzam, fupdate, fsetname, fmenu, fhelp, finfo)
        * Переделать /help на блоки и сделать фукнционал перелистования этих блоков ( messageReactionsAdd )
        * Сделать систему рангов и топа (rank, top)
        * Сделать систему взаимодействий ( обнять, поцеловать, погладить )
        * Сделать команду setprefix
        * Сделать команду /user

*/