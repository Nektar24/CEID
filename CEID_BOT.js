const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const config = require("./config.json");
// --------- UPDATE ------------
const sendMail = require('./gmail.js');
// -----------------------------
// ---------- OLD --------------
//const nodemailer = require('nodemailer');
//const configmail = require('./email.json');
// -----------------------------
const jsSHA = require("jssha");
let codes = require("./verification_data_1.json");
let peopleregistered = require("./verification_data_2.json");
let registeredams = require("./verification_data_3.json");
let blacklist = require("./professor_mails.json");
let muted = require("./muted.json");


// --------- UPDATE ------------
const SendEmail = async (front,text) => {
    const options = {
        to: front + "@ceid.upatras.gr",
        subject: 'C.E.I.D. Discord Server',
        text: text,
        textEncoding: 'base64',
        headers: [
        { key: 'X-Application-Developer', value: 'Amit Agarwal' },
        { key: 'X-Application-Version', value: 'v1.0.0.2' },
        ],
    };
    const messageId = await sendMail(options);
    return messageId;
};
// -----------------------------

// ---------- OLD --------------
/*
const transporter = nodemailer.createTransport({
    service: configmail.service,
    auth: {
           user: configmail.user,
           pass: configmail.password
    },
    tls: {
        rejectUnauthorized: false
    }
});

const getMailOptions = (front,text) => ({
    from: configmail.user,
    to: front + "@ceid.upatras.gr",
    subject: 'C.E.I.D. Discord Server',
    text: text
});
*/
// -----------------------------

var args;

bot.on('ready',  () => {
    console.log('Bot is online Nek!');
    bot.channels.cache.get(config.apodoxi_kanonismon_channel).messages.fetch(config.entermessage);
    //setupslashcommands();
})

let failsafe = false;
let tempnumber;
bot.on('message', message => {
    if (message.channel.type != "dm") {
        if (message.author.bot) {return;}
        if (message.member.roles.cache.some(r => config.adminpermissions.includes(r.id))) {
            if (message.content === null) {return;}
            args = message.content.split(" ");
            switch (args[0].toLocaleLowerCase()){
                case ".clear":
                case "/clear":
                    if (args[1] === null) {
                        message.channel.send('Usage : `.clear number-of-messages`');
                        return;
                    }
                    try { tempnumber = parseInt(args[1]); }catch (err) { message.channel.send('Error. Try again.');return; }

                    if (!Number.isInteger(tempnumber)) { message.channel.send('Error. Try again.');return; }

                    if (tempnumber < 2 || tempnumber > 100) { message.channel.send('?????? 2 ???? 100 ?????? ??????');return; }
                    clearchannel(message);
                break;
                case ".reset":
                    let pingedperson = message.guild.member( message.mentions.users.first() );
                    let shaObj_id = new jsSHA("SHA-256", "TEXT", config.salt);
                    let user_id_hashed;
                    if (message.mentions.users.size){
                        shaObj_id.update(pingedperson.id);
                        user_id_hashed = shaObj_id.getHash("HEX");
                    } else if (args[1] && args[1].length == 18) {
                        shaObj_id.update(args[1]);
                        user_id_hashed = shaObj_id.getHash("HEX");
                    } else {
                        message.channel.send("Usage : `.reset <@person>` (admin command)").catch();
                        return;
                    }
                    if (peopleregistered[user_id_hashed]){
                        if (peopleregistered[user_id_hashed].registered){
                            message.channel.send("can't reset him because he has successfully verified so his mail will get softlocked").catch();
                            return;
                        } else {
                            message.channel.send(`I resetted <@${pingedperson.id}>'s tries.`).catch();
                            delete peopleregistered[user_id_hashed];
                            save();
                        }
                    } else {
                        message.channel.send("I can't find that person.").catch();
                    }
                break;
                case ".removeallceid":
                    if (args[1] == "confirm"){
                        if (failsafe) return;
                        failsafe = true;
                        let shaObj_id = new jsSHA("SHA-256", "TEXT", config.salt);
                        let user_id_hashed;
                        message.guild.members.cache.forEach(async member => {
                            if (!member.user.bot) {
                            await shaObj_id.update(member.id);
                            user_id_hashed = shaObj_id.getHash("HEX");
                            if (peopleregistered[user_id_hashed]) {console.log(`skipped ${member.user.username}`);}
                            else {
                            await console.log("removed ceid role from " + member.user.username);
                            await member.roles.remove(config.ceidas);
                            }
                            }
                        });
                        message.channel.send("????! this will take a minute...");
                    } else {
                        message.channel.send("?????????????? ?????? ???????? ceid???? ???? ???????????? ?????? ???????? ?????????? verify (?????? ???????? verified ?????? ?????? ????????????????).\n\n?????? ???????????????????????? ?????????? `/removeallceid confirm`");
                    }
                break;
            }
        }
        if (message.channel.id == config.ideas_channel) { react_with_thumbs(message); }
        switch (message.content.toLocaleLowerCase()){
            case "!nikolos":
                message.channel.send('https://cdn.discordapp.com/attachments/713115995308425276/809152243299254324/f761e8e6926262e1.PNG');
                break;
            case "!nikolos2":
                message.channel.send("https://cdn.discordapp.com/attachments/713115995308425276/888128428199522334/received_3864817429709112.jpg");
                break;
            case "!nikolos3":
                message.channel.send("https://media.discordapp.net/attachments/713115995308425276/891641310786772992/unknown-27.png");
                break;
            case "!giati":
                message.channel.send("https://cdn.discordapp.com/attachments/757334730659332175/853976724467482644/unknown.png");
                break;
            case "!gallopoulos":
                message.channel.send("https://cdn.discordapp.com/attachments/713115995308425276/855069555504578630/psixremia.png");
                break;
            case "!vlachos":
                message.channel.send("https://cdn.discordapp.com/attachments/713115995308425276/859028914491621396/Screenshot_3188.png");
                break;
            case "!vlachos2":
                message.channel.send("https://cdn.discordapp.com/attachments/713115995308425276/859028685331759134/7b9c5d6e1a2307f1.png");
                break;
        }
    } else {
        args = message.content.split(" ");
        if (args[0] == '!send') {
            let wholemessage = message.content.replace(args[0] + ' ', '');
            bot.channels.cache.get(config.anomologita_channel).send(wholemessage)
            .then(function (msg){
                msg.react('731214599730495539');
            });
            message.react('731214599730495539');
        }
    }
})
async function react_with_thumbs(message){
    if (message.content.toLocaleLowerCase().startsWith('-')) {
        await message.react('766327473578442782'); //+1
        await message.react('754299806490296342'); //-1
    }
}

async function setupslashcommands(){

    await getApp(config.ceid_server).commands.get();
    await getApp(config.ceid_server).commands.post({
        data : {
            name : "getcode",
            description : "???????????????? ???????????????????? ???? @ceid.upatras.gr email ??????.",
            options : [
                {
                    name : "mail",
                    description : "?????????? ???? mail ?????? (???????? ???? ?????????????? , ???? st1234567). ?????? ???????????????? ???? ?????????????? st. ???? ?????????? ???????????? ?????????? ???? ?????????? ?????????? ?????? mail.",
                    required : true,
                    type : 3
                }
            ]
        }
    });
    await getApp(config.ceid_server).commands.post({
        data : {
            name : "verify",
            description : "?????????? ?????? ???????????? ???????????????????????? ?????? ???????????? ???????? @ceid.upatras.gr email ??????.",
            options : [
                {
                    name : "code",
                    description : "check?????? ???? email ??????",
                    required : true,
                    type : 4
                }
            ]
        }
    });
}

bot.ws.on("INTERACTION_CREATE",async (interaction) => {
    let command = interaction.data.name.toLowerCase();
    let user = interaction.member.user;
    let shaObj_id = new jsSHA("SHA-256", "TEXT", config.salt);
    shaObj_id.update(user.id);
    let user_id_hashed = shaObj_id.getHash("HEX");
    switch (command){
        case "getcode":
            save();
            let mail = interaction.data.options[0].value.toString().toLocaleLowerCase();
            let shaObj_???? = new jsSHA("SHA-256", "TEXT", config.salt);
            shaObj_????.update(mail);
            let AM_HASHED = shaObj_????.getHash("HEX");
            if (peopleregistered[user_id_hashed] && peopleregistered[user_id_hashed].registered){
                reply(interaction,"?????????? ?????? ?????????? register");
                return;
            }
            
            if (peopleregistered[user_id_hashed] && peopleregistered[user_id_hashed].send_mail_tries > 3){
                reply(interaction,"?????? ?????????? ?????????? ?????????????????????? , ???????????????? ???????????????????????? ???? ???????? ????????????????????????.");
                bot.guilds.cache.get(config.ceid_server).members.fetch(user.id).then(member=>{
                    log(member,config.verification_failed_logs,"#ff0000",`???????????????? , ?????????? ????????????????????`);
                });
                return;
            }

            if (!peopleregistered[user_id_hashed]) {
                peopleregistered[user_id_hashed] = {
                    am : AM_HASHED,
                    code : null ,
                    tries : 0 ,
                    send_mail_tries : 0,
                    registered : false
                };
            }else{peopleregistered[user_id_hashed].send_mail_tries++;}

            if (blacklist.includes(mail)){
                reply(interaction,"-_-");
                return;
            }

            if ((/[^a-zA-Z0-9]/.test(mail))){
                reply(interaction,"Character not allowed.");
                return;
            }

            let test4 = mail.match(/\d+/g);
            if (test4){
                if (test4.join("").length != 7){
                    reply(interaction,"Invalid mail");
                    return;
                }
                if (!mail.includes("st")){
                    reply(interaction,"Invalid mail");
                    return;
                }
            }

            if (mail.length <= 3 || mail.length >= 30){
                reply(interaction,"Invalid mail");
                return;
            }

            if (registeredams.includes(AM_HASHED)){
                reply(interaction,"???????? ???? ???? ???????? ?????? ???????????????????????????? ???????? server. ?????????????????? 1 account ?????? ??????????????. ???????????????? ???????????????????????? ???? ???????? ???????????????????????? ?????? ?????????? ????????????????.");
                return;
            }

            reply(interaction,"?????????????????? ???????????? ???????? ?????????????????? `" + mail + "@ceid.upatras.gr` ... \n?????????????? ???? ???????? ???????????????????? https://webmail.ceid.upatras.gr/ ?????? ???? ???? ???????? ?????? ?????????????? (?????? gmail ?????????? ???? ??????????)");

            do {
                num = Math.floor(Math.random() * 10000) + 1;
            } while (codes[num]);
            codes[num] = user_id_hashed;
            peopleregistered[user_id_hashed].code = num;
            peopleregistered[user_id_hashed].am = AM_HASHED;

            let text = `???????? ${user.username}#${user.discriminator}!\n\n?? ?????????????? ?????? ?????????? ?? : " ${num} ".\n\n???????????????? ?????????? "/verify ${num}" ?????? ???? ???????? ?????? ???????????????? server\n\n???? ?????? ?????????????????? ???? ?????????? ???????? ???? email ???????? ?????????????? ?????????????????????????? ?????? AM ?????? ???????? Discord Server ??????. ???????????????? ?????????????? ???????? ???? email.`;

            // --------- UPDATE ------------
            SendEmail(mail,text).then((messageId) => console.log('Message sent successfully:', messageId)).catch((err) => console.error(err));
            // -----------------------------
            // ---------- OLD --------------
            //transporter.sendMail(getMailOptions(mail,text), function (err, info) {if(err){console.log(err);}});
            // -----------------------------
        break;
        case "verify":
            save();
            let code = interaction.data.options[0].value;
            let tries = 10;
            if (!peopleregistered[user_id_hashed]){
                reply(interaction,"???????????????? ???????? /getcode ?????????? , ???????????????????????????? ?????? ???? ??????");
                return;
            }
            if (peopleregistered[user_id_hashed] && peopleregistered[user_id_hashed].registered){
                reply(interaction,"?????????? ?????? ?????????? register");
                bot.guilds.cache.get(config.ceid_server).members.fetch(user.id).then(member=>{
                    if (member.roles.cache.some(role => role.id === config.muterole)) {return;}
                    if (!member.roles.cache.some(role => role.id === config.verified)) {
                        member.roles.add(config.verified).catch();
                        log(member,config.verification_failed_logs,"#800080",`?????????????????? ???? ?????????? ???????? ?????????? ?????? ???????? ?????? ???????? <@&${config.verified}>`);
                    }
                });
                return;
            }
            if (peopleregistered[user_id_hashed].tries > tries){
                reply(interaction,"?????? ?????????? ?????????? ?????????????????????? , ???????????????? ???????????????????????? ???? ???????? ????????????????????????.");
                bot.guilds.cache.get(config.ceid_server).members.fetch(user.id).then(member=>{
                    log(member,config.verification_failed_logs,"#ff0000",`???????????????? , ?????????? ????????????????????`);
                });
                return;
            }
            if (peopleregistered[user_id_hashed].code === code) {
                if (registeredams.includes(peopleregistered[user_id_hashed].am)){
                    reply(interaction,"?????????? ?? ???? ???????? ?????? ???????? ???????? server. ?????????????????? 1 account ?????? ??????????????. ???????????????? ???????????????????????? ???? ???????? ???????????????????????? ?????? ?????????? ????????????????.");
                    return;
                }
                reply(interaction,"???????????????? ???????????????????? ! ?????????? ?????????? ???????? server !");
                peopleregistered[user_id_hashed].registered = true;
                registeredams.push(peopleregistered[user_id_hashed].am);
                bot.guilds.cache.get(config.ceid_server).members.fetch(user.id).then(member=>{
                    member.roles.add(config.ceidas).catch();
                    member.roles.add(config.verified).catch();
                    log(member,config.verification_logs,"#0000FF",`???????????????????? ?????? ???????????????????? ?????? ?????? ?????????? ?????? ???????? <@&${config.ceidas}> ?????? ?????? ???????? <@&${config.verified}>.`);
                });
                return;
            }
            if (peopleregistered[user_id_hashed].code != code){
                peopleregistered[user_id_hashed].tries++
                reply(interaction,`?????????? ?????? ?????????? ?? ??????????????. ${peopleregistered[user_id_hashed].tries}/${tries.toString()} ??????????????????????`);
            }
        break;
    }
})

const getApp = (guildId) => {
    return bot.api.applications(bot.user.id).guilds(guildId);
}
const reply = (interaction,response) => {
    bot.api.interactions(interaction.id,interaction.token).callback.post({
        data : {
            type : 4,
            data : {
                content : response,
                flags: 1 << 6
            }
        }
    });
}
const log = (member,log,color,description) => {
    member.guild.channels.cache.get(log).send(
        new Discord.MessageEmbed()
            .setColor(color)
            .setAuthor(`${member.user.username}#${member.user.discriminator}`,member.user.displayAvatarURL({dynamic : true}))
            .setDescription(`<@${member.id}>\n?? ?????????????? ${member.user.username}#${member.user.discriminator} (${member.id})\n`+description)
            .setTimestamp()
    );
}

let hold_save = false;
function save(){
    if (hold_save){ return; }
    hold_save = true;
    setTimeout(function(){
        fs.writeFile("./verification_data_1.json", JSON.stringify(codes), (err) => { if (err) console.log(err) });
        fs.writeFile("./verification_data_2.json", JSON.stringify(peopleregistered), (err) => { if (err) console.log(err) });
        fs.writeFile("./verification_data_3.json", JSON.stringify(registeredams), (err) => { if (err) console.log(err) });
        fs.writeFile("./muted.json", JSON.stringify(muted), (err) => { if (err) console.log(err) });
        hold_save = false;
    },1000 * 60);
}

//
// function for logging the messages that a moderator clears using the /clear command
async function clearchannel(message){
    let args = message.content.split(" ");
    try {
        await message.delete();
        let object = await message.channel.messages.fetch({limit:args[1]});
        let array = [];
        let people = [];
        // the function .fetch gives us an object. So we first put the items of the object in an array
        object.forEach(msg=>{
            array.push(msg);
            if (!people.includes(msg.author.id)) {people.push(msg.author.id);}
        });
        array.reverse();
        let formated = '';
        // here we create the txt. Change later in order to make it look better.
        // we check if the array has the new line character , because line characters are stored differently in .txt files.
        for (i in array){
            let content = array[i].content.replace(/(\r\n|\n|\r)/gm,'\n' + array[i].author.tag + ' : ');
            formated += array[i].author.tag + ' : ' + content + '\n';
        }
        let ppl = '';
        for (i in people){
            ppl += `<@${people[i]}> , `;
        }
        ppl = ppl.slice(0, -2);
        var d = new Date();
        // here we create the log message
        let output = new Discord.MessageEmbed().setTitle('Cleared Messages').setDescription(`Cleared **${array.length} messages** by moderator <@${message.author.id}> (${message.author.tag} , ${message.author.id})\n\nAt ${d.toLocaleString()}\n\nOn the channel <#${message.channel.id}>\nPeople involved : ${ppl}`);
        d = d.toLocaleDateString();
        d = d.replace(/\//g,'_');
        fs.writeFile("Messages_Cleared_Logs/"+message.channel.name + '_' + d + '.txt', formated, (err) => {if (err) throw err;});
        await message.channel.bulkDelete(args[1]).then(() => {
            message.channel.send("Deleted "+ args[1] +" messages.").then(msg => msg.delete( {timeout: 3000}));
            bot.channels.cache.get(config.cleared_messages_channel).send({embed:output,files:["Messages_Cleared_Logs/"+message.channel.name + '_' + d + '.txt']});
        });
    } catch(error) {console.log(error);}
}
//----------------------------------

/*
let acceptablemessages = [entermessage];
bot.on('messageReactionAdd', (reaction,user)=>{
    if (reaction.message.channel.type == 'dm') {return;}
    if (acceptablemessages.includes(reaction.message.id)){
        const {message,emoji} = reaction;
        let Reactor = message.guild.member(user);
        if (reaction.message.id === entermessage){
            if (emoji.name === '???'){
                try {
                Reactor.roles.add(config.ceidas);
                } catch(err){message.channel.send(err.toString()).then(msg => msg.delete( {timeout: 6000}));}
            }
        }
    }
})
*/
/*
bot.on('messageReactionRemove', (reaction,user)=>{
    if (reaction.message.channel.type == 'dm') {return;}
    if (acceptablemessages.includes(reaction.message.id)){
        const {message,emoji} = reaction;
        let Reactor = message.guild.member(user);
        if (reaction.message.id === entermessage){
            if (emoji.name === '???'){
                if (Reactor) {
                    Reactor.roles.remove(config.ceidas);
                }
            }
        }
    }
})
*/

bot.on("message",message=>{
    if (message.channel.id === "852907441217994773"){
        let id;
        for(var i = 0; i < message.embeds.length; i++) {
            if(in_title(message,i,"Role removed")) {
                if (in_desk(message,i,config.muterole)){
                    id = get_id(message,i);
                    if (muted[id]){
                        delete muted[id];
                        save();
                    }
                }
            } else if (in_title(message,i,"Role added")){
                if (in_desk(message,i,config.muterole)){
                    id = get_id(message,i);
                    muted[id] = true;
                    save();
                }
            } else if (in_title(message,i,"Roles updated")){
                if (in_desk(message,i,`**Added:** <@${config.muterole}>`)){
                    id = get_id(message,i);
                    muted[id] = true;
                    save();
                } else if (in_desk(message,i,`**Removed:** <@${config.muterole}>`)){
                    id = get_id(message,i);
                    if (muted[id]){
                        delete muted[id];
                        save();
                    }
                }
            }
        }
    }
})

const in_title = (message,i,msg) =>{
    if (message.embeds[i].title.includes(msg))return true;
    else return false;
}

const in_desk = (message,i,msg) =>{
    if (message.embeds[i].description.includes(msg))return true;
    else return false;
}

const get_id = (message,i) => {
    return message.embeds[i].footer.text.slice(4,22);
}

bot.login(config.token);
