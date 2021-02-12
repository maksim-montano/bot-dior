const Discord = require('discord.js');
const mongoose = require('mongoose');
const {objectsEmbeds__help} = require('./objectEmbeds.js');

module.exports = {
    sendInviteMessage: function(collection, search, message, msg) {
        const mention__user = message.mentions.users.first();
        collection.findOne({FamilyName: search}, async(err, data__family) => {
            if(err) console.log(err);
            if(!data__family) return message.reply('\`произошла критическая ошибка, обратитесь к разработчику бота, либо указанная вами семья не существует!\`');
            
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
                msg.delete()
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
    },


    generateEmbed: function(pageNum, author, opt) {
        let emebed__help = new Discord.MessageEmbed()
        let keys = Object.keys(objectsEmbeds__help[pageNum]);
        for(let key of keys) {
            if(typeof objectsEmbeds__help[pageNum][`${key}`] === 'object') {
                for(let k = 0; k < objectsEmbeds__help[pageNum][`${key}`].length; k++) {
                    emebed__help.addFields(objectsEmbeds__help[pageNum][`${key}`][k]);
                }
            }

            if(key === 'title') emebed__help.setTitle(objectsEmbeds__help[pageNum][`${key}`]);
            if(key === 'description') emebed__help.setDescription(objectsEmbeds__help[pageNum][`${key}`]);
            if(key === 'color') emebed__help.setColor(objectsEmbeds__help[pageNum][`${key}`]);
            if(key === 'footer') opt.__proto__ === Discord.Message.prototype ? emebed__help.setFooter(`${objectsEmbeds__help[pageNum][`${key}`]} Запросил: ${author} | Страница: ${pageNum + 1}/${objectsEmbeds__help.length}`, opt.guild.members.cache.find(member => member.user.tag === author).user.displayAvatarURL()) : emebed__help.setFooter(`${objectsEmbeds__help[pageNum][`${key}`]} Запросил: ${author} | Страница: ${pageNum + 1}/${objectsEmbeds__help.length}`, opt.message.guild.members.cache.find(member => member.user.tag === author).user.displayAvatarURL());
            if(key === 'timeStamp' && objectsEmbeds__help[pageNum][`${key}`] === true) emebed__help.setTimestamp();
        }

        return opt.__proto__ === Discord.Message.prototype ? opt.channel.send('', {embed: emebed__help}).then(message__help => {
            message__help.react('⬅️');
            message__help.react('➡️');
            message__help.react('❌');
        }) : opt.message.edit(emebed__help);
    }
}