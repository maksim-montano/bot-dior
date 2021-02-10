const Discord = require('discord.js'); // подключили библиотеку дискорд.джс
const bot = new Discord.Client(); // создание клиента нового
const config = require('./config.json');
const token = config.token;


//писать онли в index.js

/* 

        * Переделать /help на блоки и сделать фукнционал перелистования этих блоков ( messageReactionsAdd )
        * Сделать систему семей (fcreate, fdelete, finvite, fkick, faddzam, fdelzam, fupdate, fsetname, fmenu, fhelp, finfo)
        * Сделать систему рангов и топа (rank, top)
        * Сделать систему взаимодействий ( обнять, поцеловать, погладить )
        * Сделать команду setprefix
        * Сделать команду /user



        
        * Подлючить бд, нормально структурировать все в папке, ну в общем, подготовить к нормальному проекту. По возможности везде добавить коментарии и т.д
        * Нужно сто проц заливать на мейн акк гита, постараться сделать за три дня +-, пока выходные, потом сделать еще и стейка и подучить реакт

*/





bot.on("ready", () => {
    bot.generateInvite("ADMINISTRATOR")
        .then((link) => console.log(link));
    console.log('Бот запущен!');
});




bot.on("message", message => {
    if(message.content.includes("/ping")) {
        return message.reply("я тут!"); 
    }

    if(message.content.includes('/help')) {
        let help__embed = new Discord.MessageEmbed()
        .setTitle('Test Bot | Помощь по командам бота.')
        .addFields(
            {name: 'Система семей', value: `**/createfam** - \`создать семью\`\n**/addzam** - \`добавить заместителя в семью\`\n**/updatefam** - \`улучшение семьи\`\n**/famkick** - \`исключение из семьи\`\n**/faminv** - \`приглашение в семью\`\n**/fmenu** - \`просмотр меню семьи\`\n**/fsetname** - \`установить новое имя семьи\``, inline: true},


            {name: 'Общие системы', value: `**/rank** - \`узнать свою уровень в дискорде\`\n**/top** - \`просмотреть список топ пользователей сервера\`\n**/balance** - \`узнать кол-во вашего баланса\``, inline: true},


            {name: 'Система взаимодействий', value: `**/обнять** - \`обнять пользователя дискорда\`\n**/поцеловать** - \`поцеловать пользователя дискорда\`\n**/ударить** - \`ударить пользователя дискорда\``},


            {name: 'Административные системы', value: `**/setprefix** - \`установить новый префикс\``}
        )
        
        .setFooter('© testbot team')
        .setColor('BLURPLE')
        .setTimestamp()

        return message.reply('', {embed: help__embed})
            .then(msg => msg.delete({timeout: 10000}))
    }
});


bot.on("messageReactionAdd", (reaction, user) => {

})


bot.login(token); 