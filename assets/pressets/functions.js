const Discord = require('discord.js');
const mongoose = require('mongoose');
const Users = require('../data/users.js');
const {objectsEmbeds__help} = require('./objectEmbeds.js');

module.exports = {
    getRandomInt: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
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
    },


    generateTopList: function(message, author, numPage) {
        if(message.__proto__ === Discord.Message.prototype) {
            Users.find({guildID: message.guild.id}).sort([
                ['coins', 'descending']
            ]).exec((err, res) => {
                if(err) console.log(err);

                // console.log(res)
                let args = message.content.split(" ");
                let num = 0;
                let toplist__embed = new Discord.MessageEmbed()
                .setTitle(`DiorBot | Список топа по ${args[1]}`)
                .setColor('BLURPLE')
                .setFooter(`© DiorBot Team | Запросил: ${author} | Страница: ${numPage}/${Math.ceil(res.length / 10)}`, message.guild.members.cache.find(member => member.user.tag === author).user.displayAvatarURL())

                if(res.length === 0) return message.reply('\`никого еще нету в топе!\`');
                else if(res.length < 10) {
                    for(let i = 0; i < res.length; i++) {
                        message.guild.members.cache.get(res[i].userID) ? toplist__embed.addField(`${num+1}. ${message.guild.members.cache.get(res[i].userID).displayName}`, `Кол-во коинов: ${res[i].coins}`) : toplist__embed.addField(`${i + 1}. Пользователь вышел`, `Кол-во коинов: ${res[i].coins}`)
                        num++;
                    }
                } else {
                    for(let i = 0; i < 10; i++) {
                        message.guild.members.cache.get(res[i].userID) ? toplist__embed.addField(`${num+1}. ${message.guild.members.cache.get(res[i].userID).displayName}`, `Кол-во коинов: ${res[i].coins}`) : toplist__embed.addField(`${num + 1}. Пользователь вышел`, `Кол-во коинов: ${res[i].coins}`)
                        num++;
                    }
                }

                return message.channel.send(toplist__embed).then(message__toplist => {
                    message__toplist.react('⬅️');
                    message__toplist.react('➡️');
                    message__toplist.react('❌');
                })
            })

        } else {
            Users.find({guildID: message.message.guild.id}).sort([
                ['coins', 'descending']
            ]).exec((err, res) => {
                // console.log(res)
                if(err) console.log(err);
                let args = message.message.content.split(" ");
                let toplist__embed = new Discord.MessageEmbed()
                .setTitle(`DiorBot | Список топа по coins`)
                .setColor('BLURPLE')
                .setFooter(`© DiorBot Team | Запросил: ${author} | Страница: ${numPage}/${Math.ceil(res.length / 10)}`, message.message.guild.members.cache.find(member => member.user.tag === author).user.displayAvatarURL())
                if(message.emoji.name === "➡️") {
                    let maxPage = message.message.embeds[0].footer.text.split("|")[2].split(" ")[2].split('/')[1];
                    if(numPage === +maxPage + 1) return;

                    
                    // console.log("+" + " " + +currentPage)
                    let lastField = message.message.embeds[0].fields[message.message.embeds[0].fields.length - 1].name.split(". ")[0];
                    let num = +lastField;

                    if(res.slice(+lastField).length === 0) return;
                    else if(res.slice(+lastField).length < 10) {
                        for(let i = 0; i < res.slice(+lastField).length; i++) {
                            message.message.guild.members.cache.get(res.slice(+lastField)[i].userID) ? toplist__embed.addField(`${num+1}. ${message.message.guild.members.cache.get(res.slice(+lastField)[i].userID).displayName}`, `Кол-во коинов: ${res.slice(+lastField)[i].coins}`) : toplist__embed.addField(`${num + 1}. Пользователь вышел`, `Кол-во коинов: ${res.slice(+lastField)[i].coins}`)
                            num++;
                        }
                    } else {
                        for(let i = 0; i < 10; i++) {
                            message.message.guild.members.cache.get(res.slice(+lastField)[i].userID) ? toplist__embed.addField(`${num+1}. ${message.message.guild.members.cache.get(res.slice(+lastField)[i].userID).displayName}`, `Кол-во коинов: ${res.slice(+lastField)[i].coins}`) : toplist__embed.addField(`${num + 1}. Пользователь вышел`, `Кол-во коинов: ${res.slice(+lastField)[i].coins}`)
                            num++;
                        }
                    }
    
                    return message.message.edit(toplist__embed)
                }

                if(message.emoji.name === "⬅️") {
                    let firstField = message.message.embeds[0].fields[0].name.split(". ")[0];
                    let num = +firstField;
                    if(numPage === 0) return;

                    if(res.slice(+firstField).length === 0) return;
                    else if(res.slice(+firstField-11).length < 10) {
                        for(let i = 0; i < res.slice(+firstField-11).length; i++) {
                            message.message.guild.members.cache.get(res.slice(+firstField-11)[i].userID) ? toplist__embed.addField(`${num-10}. ${message.message.guild.members.cache.get(res.slice(+firstField-11)[i].userID).displayName}`, `Кол-во коинов: ${res.slice(+firstField-11)[i].coins}`) : toplist__embed.addField(`${num - 10}. Пользователь вышел`, `Кол-во коинов: ${res.slice(+firstField-11)[i].coins}`)
                            num++;
                        }
                    } else {
                        for(let i = 0; i < 10; i++) {
                            message.message.guild.members.cache.get(res.slice(+firstField-11)[i].userID) ? toplist__embed.addField(`${num-10}. ${message.message.guild.members.cache.get(res.slice(+firstField-11)[i].userID).displayName}`, `Кол-во коинов: ${res.slice(+firstField-11)[i].coins}`) : toplist__embed.addField(`${num - 10}. Пользователь вышел`, `Кол-во коинов: ${res.slice(+firstField-11)[i].coins}`)
                            num++;
                        }
                    }
    
                    return message.message.edit(toplist__embed)
                }


                // Users.findOne({userID: member.id}, async(err, user__data) => {
                //     if(err) console.log(err);
                //     if(user__data) {
                        
                        
                //         console.log()




                //         // 0, 10, 1

                //         // 10, 20, 2




                //         // for(let i = 0; i < res.length; i++) {
                //         //     console.log(res[i])
                //         // }
                //         /* 
                        
                //         else {
                //             console.log('123')
                //             Users.find({guildID: message.message.guild.id}).sort([
                //                 ['coins', 'descending']
                //             ]).exec((err, res) => {
                //                 if(err) console.log(err);
                //                 console.log(res.slice())
                //                 let indexLastData = res.indexOf(res[res.length - 1]);
                //                 console.log(res.slice(indexLastData).length)
                //             })
                //         }
                        
                //         */

                //     }
                // })
            })
        }


        // if(message.__proto__ === Discord.Message.prototype) {
        //     Users.find().sort([
        //         ['coins', 'descending']
        //     ]).exec((err, res) => {
        //         if(err) console.log(err);
        //         // console.log(res.slice(0, 10))
        //         let num = 0;
        //         let args = message.content.split(' ');
        //         let toplist = new Discord.MessageEmbed()
        //         .setTitle(`DiorBot | Список топа по ${args[1]}`)
        //         .setColor('BLURPLE')
        //         .setFooter(`© DiorBot Team | Запросил: ${message.member.user.tag} | Страница: ${numPage}/${Math.ceil(res.length / 10)}`, message.guild.members.cache.get(message.member.id).user.displayAvatarURL())
        //         if(res.length === 0) return message.reply('\`к сожалению никого в топе пока нету!\`')
        //         else if(res.length < 10) {
        //             for(i = 0; i < res.length; i++) {
        //                 if(!(message.guild.id === res[i].guildID)) {num-1; continue;}
    
        //                 message.guild.members.cache.get(res[i].userID) ? toplist.addField(`${num+1}. ${message.guild.members.cache.get(res[i].userID).displayName}`, `Кол-во коинов: ${res[i].coins}`) : toplist.addField(`${i + 1}. Пользователь вышел`, `Кол-во коинов: ${res[i].coins}`)
        //                 num++;
        //             }
        //         } else {
        //             for(i = 0; i < res.length; i++) {
        //                 if(!(message.guild.id === res[i].guildID)) {num-1; continue;}
    
        //                 message.guild.members.cache.get(res[i].userID) ? toplist.addField(`${num+1}. ${message.guild.members.cache.get(res[i].userID).displayName}`, `Кол-во коинов: ${res[i].coins}`) : toplist.addField(`${num + 1}. Пользователь вышел`, `Кол-во коинов: ${res[i].coins}`)
        //                 num++;
        //             }
        //         }
        
        //         return message.channel.send(toplist).then(message__toplist => {
        //                 message__toplist.react('⬅️');
        //                 message__toplist.react('➡️');
        //                 message__toplist.react('❌');
        //             // if(res.length < 10) return message__toplist.react('❌');
        //             // if(res.length >= 10) {
        //             //     message__toplist.react('⬅️');
        //             //     message__toplist.react('➡️');
        //             //     message__toplist.react('❌');
        //             // }
        //         })
        //     })
        // } else {
        //     Users.find().sort([
        //         ['coins', 'descending']
        //     ]).exec((err, res) => {
        //         if(err) console.log(err);
        //         console.log(res.slice(currentNumSlice-1))
        //     })
        // }
    }
}



















































/* 


            if(message.__proto__ === Discord.Message.prototype) {
                let num = 0;
                let args = message.content.split(' ');
                let toplist = new Discord.MessageEmbed()
                .setTitle(`DiorBot | Список топа по ${args[1]}`)
                .setColor('BLURPLE')
                .setFooter(`© DiorBot Team | Запросил: ${message.member.user.tag} | Страница: ${numPage}/${Math.ceil(res.length / 10)}`, message.guild.members.cache.get(message.member.id).user.displayAvatarURL())
                if(res.length === 0) return message.reply('\`к сожалению никого в топе пока нету!\`')
                else if(res.length < maxNumSlice) {
                    for(i = 0; i < res.length; i++) {
                        if(!(message.guild.id === res[i].guildID)) {num-1; continue;}

                        message.guild.members.cache.get(res[i].userID) ? toplist.addField(`${num+1}. ${message.guild.members.cache.get(res[i].userID).displayName}`, `Кол-во коинов: ${res[i].coins}`) : toplist.addField(`${i + 1}. Пользователь вышел`, `Кол-во коинов: ${res[i].coins}`)
                        num++;
                    }
                } else {
                    for(i = currentNumSlice; i < res.length; i++) {
                        if(!(message.guild.id === res[i].guildID)) {num-1; continue;}

                        message.guild.members.cache.get(res[i].userID) ? toplist.addField(`${num+1}. ${message.guild.members.cache.get(res[i].userID).displayName}`, `Кол-во коинов: ${res[i].coins}`) : toplist.addField(`${num + 1}. Пользователь вышел`, `Кол-во коинов: ${res[i].coins}`)
                        num++;
                    }
                }
        
                return message.channel.send(toplist).then(message__toplist => {
                        message__toplist.react('⬅️');
                        message__toplist.react('➡️');
                        message__toplist.react('❌');
                    // if(res.length < 10) return message__toplist.react('❌');
                    // if(res.length >= 10) {
                    //     message__toplist.react('⬅️');
                    //     message__toplist.react('➡️');
                    //     message__toplist.react('❌');
                    // }
                })
            } 



*/





/* 


else if(message.message.__proto__ === Discord.MessageReaction.prototype) {
                let args = message.message.message.content.split(' ');
                let toplist = new Discord.MessageEmbed()
                .setTitle(`DiorBot | Список топа по ${args[1]}`)
                .setColor('BLURPLE')
                .setFooter(`© DiorBot Team | Запросил: ${message.member.user.tag} | Страница: ${numPage}/${Math.ceil(res.length / 10)}`, message.message.guild.members.cache.get(message.message.member.id).user.displayAvatarURL())
    
                if(res.length === 0) return message.message.reply('\`к сожалению никого в топе пока нету!\`')
                else if(res.length < maxNumSlice) {
                    for(let i = 0; i < res.length; i++) {
                        // if(!(message.message.guild.id === res[i].guildID)) {num-1; continue;}

                        message.message.guild.members.cache.get(res[i].userID) ? toplist.addField(`${num + 1}. ${message.message.guild.members.cache.get(res[i].userID).displayName}`, `Кол-во коинов: ${res[i].coins}`) : toplist.addField(`${num + 1}. Пользователь вышел`, `Кол-во коинов: ${res[i].coins}`)
                    }
                } else {
                    for(let i = currentNumSlice; i < maxNumSlice; i++) {
                        // if(!(message.message.guild.id === res[i].guildID)) {num-1; continue;}

                        message.message.guild.members.cache.get(res[i].userID) ? toplist.addField(`${num + 1}. ${message.message.guild.members.cache.get(res[i].userID).displayName}`, `Кол-во коинов: ${res[i].coins}`) : toplist.addField(`${num + 1}. Пользователь вышел`, `Кол-во коинов: ${res[i].coins}`)
                    }
                }
    
                return message.message.edit(toplist);
            }


*/