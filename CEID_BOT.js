const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const config = require("./config.json");
const nodemailer = require('nodemailer');
const configmail = require('./email.json');
const jsSHA = require("jssha");
let codes = require("./verification_data_1.json");
let peopleregistered = require("./verification_data_2.json");
let registeredams = require("./verification_data_3.json");

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
const getMailOptions = (AM,text) => ({
    from: configmail.user,
    to: "st" + AM + "@ceid.upatras.gr",
    subject: 'C.E.I.D. Discord Server',
    text: text
});

var args;

bot.on('ready',  () => {
    console.log('Bot is online Nek!');
    setupslashcommands();
})

bot.on('message', message => {
    if (message.channel.type != "dm") {
        if (message.author.bot) {return;}
        if (message.channel.id == config.ideas_channel) { react_with_thumbs(message); }
        switch (message.content.toLocaleLowerCase()){
            case "!nikolos":
                message.channel.send('https://cdn.discordapp.com/attachments/713115995308425276/809152243299254324/f761e8e6926262e1.PNG');
                break;
            case "!giati":
                message.channel.send("https://cdn.discordapp.com/attachments/757334730659332175/853976724467482644/unknown.png");
                break;
            case "!gallopoulos":
                message.channel.send("https://cdn.discordapp.com/attachments/713115995308425276/855069555504578630/psixremia.png");
                break;
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
            description : "Γραψε το ΑΜ σου και θα λάβεις έναν κωδικό επιβεβαίωσης στο @ceid.upatras.gr email σου.",
            options : [
                {
                    name : "am",
                    description : "Γραψε τον ΑΜ σου (μόνο αριθμοί , πχ 1071234).",
                    required : true,
                    type : 4
                }
            ]
        }
    });
    await getApp(config.ceid_server).commands.post({
        data : {
            name : "verify",
            description : "Γραψε τον κωδικό επιβεβαίωσης που έλαβες στον @ceid.upatras.gr email σου.",
            options : [
                {
                    name : "code",
                    description : "checkαρε το email σου",
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
            let AM = interaction.data.options[0].value.toString();
            let shaObj_ΑΜ = new jsSHA("SHA-256", "TEXT", config.salt);
            shaObj_ΑΜ.update(AM);
            let AM_HASHED = shaObj_ΑΜ.getHash("HEX");
            if (AM.length === 7) {
                if (peopleregistered[user_id_hashed] && peopleregistered[user_id_hashed].registered){
                    reply(interaction,"Έχεις ήδη κάνει register");
                    return;
                }
                
                if (peopleregistered[user_id_hashed] && peopleregistered[user_id_hashed].send_mail_tries > 3){
                    reply(interaction,"Δεν έχεις άλλες Προσπάθειες , Παρακαλώ επικοινώνισε με τους διαχειριστές.");
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

                if (registeredams.includes(AM_HASHED)){
                    reply(interaction,"Αυτος ο ΑΜ έχει ήδη μπεί στον server. Δικαιούσε 1 account ανα φοιτητή. Παρακαλώ επικοινώνησε με τους διαχειριστές για τυχόν πρόβλημα.");
                    return;
                }

                reply(interaction,"Στέλνουμε μήνυμα στην διεύθυνση `st" + AM + "@ceid.upatras.gr` ... \nΤσέκαρε το στην ιστοσελίδα https://webmail.ceid.upatras.gr/ για να το δείς πιο γρήγορα (στο gmail αργει να έρθει)");

                do {
                    num = Math.floor(Math.random() * 10000) + 1;
                } while (codes[num]);
                codes[num] = user_id_hashed;
                peopleregistered[user_id_hashed].code = num;

                let text = `Γεια ${user.username}#${user.discriminator}!\n\nΟ κωδικός σου είναι ο : " ${num} ".\n\nΠαρακαλώ γράψε "/verify ${num}" για να δεις τον υπόλοιπο server\n\nΑν δεν γνωρίζεις τι είναι αυτό το email τότε κάποιος χρησιμοποίησε τον AM σου στον Discord Server μας. Παρακαλώ αγνόησε αυτό το email.`;

                transporter.sendMail(getMailOptions(AM,text), function (err, info) {if(err){console.log(err);}});

            } else {reply(interaction,"Σφάλμα. Παρακαλώ Γράψε μόνο το ΑΜ σου (χωρις up ή st ή @ceid). Αν Είσαι παλιός πρέπει να γράψεις το καινούργιο ΑΜ σου.\n\nΠροσπάθησε ξανά.");}
        break;
        case "verify":
            save();
            let code = interaction.data.options[0].value;
            let tries = 10;
            if (!peopleregistered[user_id_hashed]){
                reply(interaction,"Παρακαλώ κάνε /getcode πρώτα , συμπληρόνοντας τον ΑΜ σου");
                return;
            }
            if (peopleregistered[user_id_hashed] && peopleregistered[user_id_hashed].registered){
                reply(interaction,"Έχεις ήδη κάνει register");
                bot.guilds.cache.get(config.ceid_server).members.fetch(user.id).then(member=>{
                    if (member.roles.cache.some(role => role.id === config.muterole)) {return;}
                    if (!member.roles.cache.some(role => role.id === config.ceidas)) {
                        member.roles.add(config.ceidas).catch();
                    }
                });
                return;
            }
            if (peopleregistered[user_id_hashed].tries > tries){
                reply(interaction,"Δεν έχεις άλλες Προσπάθειες , Παρακαλώ επικοινώνισε με τους διαχειριστές.");
                return;
            }
            if (peopleregistered[user_id_hashed].code === code) {
                if (registeredams.includes(peopleregistered[user_id_hashed].am)){
                    reply(interaction,"Αυτος ο ΑΜ έχει ήδη μπεί στον server. Δικαιούσε 1 account ανα φοιτητή. Παρακαλώ επικοινώνησε με τους διαχειριστές για τυχόν πρόβλημα.");
                    return;
                }
                reply(interaction,"Επιτυχές Επαλήθευση ! Καλως είρθες στον server !");
                peopleregistered[user_id_hashed].registered = true;
                registeredams.push(peopleregistered[user_id_hashed].am);
                bot.guilds.cache.get(config.ceid_server).members.fetch(user.id).then(member=>{
                    member.roles.add(config.ceidas).catch();
                });
                return;
            }
            if (peopleregistered[user_id_hashed].code != code){
                peopleregistered[user_id_hashed].tries++
                reply(interaction,`Αυτος δεν είναι ο κωδικός. ${peopleregistered[user_id_hashed].tries}/${tries.toString()} Προσπάθειες`);
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

let hold_save = false;
function save(){
    if (hold_save){ return; }
    hold_save = true;
    setTimeout(function(){
        fs.writeFile("./verification_data_1.json", JSON.stringify(codes), (err) => { if (err) console.log(err) });
        fs.writeFile("./verification_data_2.json", JSON.stringify(peopleregistered), (err) => { if (err) console.log(err) });
        fs.writeFile("./verification_data_3.json", JSON.stringify(registeredams), (err) => { if (err) console.log(err) });
        hold_save = false;
    },1000 * 60);
}

bot.login(config.token);