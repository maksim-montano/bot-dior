// ====== [ПОДКЛЮЧЕНИЕ ЛИБ] ====== //
require('dotenv').config()
const Discord = require('discord.js'); // подключили библиотеку дискорд.джс
const mongoose = require('mongoose');


const bot = new Discord.Client(); // создание клиента нового

// ====== [ПОДКЛЮЧЕНИЕ PRESSETS FILES] ====== //

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

        if(!args[1]) return message.reply('вы не указали название семьи!').then(msg => msg.delete({timeout: 5000}));
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
                return message.reply('вы не являетесь создателем или заместителем семьи!').then(msg => msg.delete({timeout: 5000}));
            }
        })
    }

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

        * Сделать систему семей (_, fdelete, finvite, fkick, faddzam, fdelzam, fupdate, fsetname, fmenu, fhelp, finfo)
        * Переделать /help на блоки и сделать фукнционал перелистования этих блоков ( messageReactionsAdd )
        * Сделать систему рангов и топа (rank, top)
        * Сделать систему взаимодействий ( обнять, поцеловать, погладить )
        * Сделать команду setprefix
        * Сделать команду /user



        
        * Подлючить бд, нормально структурировать все в папке, ну в общем, подготовить к нормальному проекту. По возможности везде добавить коментарии и т.д
        * Нужно сто проц заливать на мейн акк гита, постараться сделать за три дня +-, пока выходные, потом сделать еще и стейка и подучить реакт

*/
