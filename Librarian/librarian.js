// .env Variables
require('dotenv').config({path: '../.env'});

// Node Modules
const Discord = require('discord.js');
const client = new Discord.Client();
const cron = require('node-cron');

// Bot Modules
const dataRequest = require('../modules/dataRequest');
const calcRandom = require('../modules/calcRandom');

// State Machine (Uncomment if needed)
var BotEnumState = {
    WAITING: 0,
    ACTIVE: 1
}
var botState = BotEnumState.ACTIVE;

const playingMessage = 'Scribe of the Codex';
const breakMessage = "Taking a break..."

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', async () => {
    // Generates invite link
    try {
        let link = await client.generateInvite(["ADMINISTRATOR"]);
        console.log("Invite Link: " + link);
    } catch(e) {
        console.log(e.stack);
    }

    // You can set status to 'online', 'invisible', 'away', or 'dnd' (do not disturb)
    client.user.setStatus('online');
    // Sets your "Playing"
    client.user.setActivity(playingMessage);
    console.log(`Connected! \
    \nLogged in as: ${client.user.username} - (${client.user.id})`);
});

// Create an event listener for messages
client.on('message', async message => {
    // Ignores ALL bot messages
    if (message.author.bot) return;
    // Message has to be in Outskirts (should be edited later)
    if (!(message.channel.id === process.env.TAVERN_CHANNEL_ID
        || message.channel.id === process.env.TEST_CHANNEL_ID)) return;
    // Has to be (prefix)command
    if (message.content.indexOf(process.env.PREFIX) !== 0) return;

    // "This is the best way to define args. Trust me."
    // - Some tutorial dude on the internet
    const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    switch (command) {
        case "ping":
            if (isAdmin(message.author.id))
                message.reply("Pong!");
            break;
        case "summon":
            if (isAdmin(message.author.id)) {
                console.log("Summon the bot!");
                BotTurnOnline(process.env.TAVERN_CHANNEL_ID);
            }
            break;
        case "vanish":
            if (isAdmin(message.author.id)) {
                BotTurnOffline(process.env.TAVERN_CHANNEL_ID);
            }
            break;
    }
});

client.on('error', console.error);

// Turn online and turn offline
function BotTurnOnline(channel) {
    sendMessage(channel, `Insert Online Message here. \
    \n\n***SOME BOLD AND ITALIC TEXT***`);
    client.user.setStatus('online');
    client.user.setActivity(playingMessage);
    botState = BotEnumState.ACTIVE;
}

function BotTurnOffline(channel) {
    sendMessage(channel, `Insert Offline Message here. \
    \n\n***SOME BOLD AND ITALIC TEXT***`);
    client.user.setStatus('invisible');
    client.user.setActivity('');
    botState = BotEnumState.WAITING;
}

// You may use cron normally
cron.schedule('* * * * Saturday', function() {
    console.log('Saturday join.');
});

// Async Waiting
function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    });
}

// Gets if user has an Overseers rank
function isAdmin(userID) {
    var guild = client.guilds.get(process.env.SANCTUM_ID);
    return guild.members.get(userID).roles.find(role => role.name === "Overseers");
}

// Send message handler
function sendMessage(userID, channelID, message) {
    // Handle optional first argument (so much for default arugments in node)
    if (message === undefined) {
        message = channelID;
        channelID = userID;
        userID = null;
    }

    // Utility trick (@userID with an optional argument)
    if (userID != null) {
        message = "<@" + userID + "> " + message;
    }
    
    // Sends message (needs client var, therefore I think external script won't work)
    client.channels.get(channelID).send(message);
}

// Log our bot in (change the token by looking into the .env file)
client.login(process.env.LIBRARIAN_TOKEN);