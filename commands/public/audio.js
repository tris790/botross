"use strict";
const Config = require("./../../config.json");

function Install(bot) {
    var playCommand = bot.registerCommand("play", (msg, args) => {
        if (args.length > 0) {
            var fileName = args.join(" ");
            bot.joinVoiceChannel(msg.member.voiceState.channelID).catch((err) => {
                bot.createMessage(msg.channel.id, "Error joining voice channel: " + err.message);
                console.log(err);
            }).then((connection) => {
                if (connection.playing) {
                    connection.stopPlaying();
                }
                connection.play(`./audio/${fileName}`, {
                    encoderArgs: ["-af", `volume=${Config.Volume}`]
                });
                bot.createMessage(msg.channel.id, `Now playing **${fileName}**`);
                connection.once("end", () => {
                    bot.createMessage(msg.channel.id, `Finished **${fileName}**`);
                });
            });
        }
    }, {
        description: "Play a audio file.",
        fullDescription: "Play a audio file.",
        usage: "<AudioFileName.Extension>"
    });
    var test = bot.registerCommand("record", (msg, args) => {
        try {
            var t = bot.joinVoiceChannel(msg.member.voiceState.channelID).catch((err) => {
                bot.createMessage(msg.channel.id, "Error joining voice channel: " + err.message);
                console.log(err);
            }).then((connection) => {
                var data = connection.receive("pcm");
                console.log(data.data);
            });
        } catch (e) {
            console.log(e);
        };
    }, {});
    var stop = bot.registerCommand("stop", (msg, args) => {
        bot.voiceConnections.get(msg.guild.id).stopPlaying();
        bot.createMessage(msg.channel.id, "Audio stopped.");
    }, {});
    var resume = bot.registerCommand("resume", (msg, args) => {
        bot.voiceConnections.get(msg.guild.id).resume();
        bot.createMessage(msg.channel.id, "Audio resumed.");
    }, {});
    var pause = bot.registerCommand("pause", (msg, args) => {
        bot.voiceConnections.get(msg.guild.id).pause();
        bot.createMessage(msg.channel.id, "Audio paused.");
    }, {});
    var volume = bot.registerCommand("volume", (msg, args) => {
        const vol = parseFloat(args[0]);
        if (vol <= 2 && vol >= 0) {
            Config.Volume = vol;
            bot.createMessage(msg.channel.id, `Volume set to ${vol}.`);
        }
    }, {});
    var audioDl = bot.registerCommand("dl", (msg, args) => {
        try {
            const fs = require('fs');
            const youtubedl = require('youtube-dl');
            let isBig = false;
            if (!fs.existsSync("./audio")) {
                fs.mkdirSync("./audio");
            }
            youtubedl.getInfo(args[0], ['-f', '(mp3/bestaudio)'], function(err, info) {
                if (err || !info)
                {
                    console.log(err);
                    return err;
                }
                if (info.filesize > 10000000 && info.filesize != null) {
                    bot.createMessage(msg.channel.id, `File too big (${Math.round(info.filesize / 1000000)}MB), 10MB max.`)
                    isBig = true;
                } else {
                    bot.createMessage(msg.channel.id, "Download started!");
                    const download = youtubedl(args[0], ['-f', 'mp3/bestaudio'], {}, function(err, a) {
                        console.log(err);
                    });
                    download.on("info", info => {
                        var writter = download.pipe(fs.createWriteStream(`audio/${info.title}.${info.ext}`));
                        writter.once("close", function() {
                            bot.createMessage(msg.channel.id, `Download finished!\n${info.title}.${info.ext}`);
                        });
                    });
                }
            });

        } catch (error) {
            console.log(error);
        }
    }, {});
    var extractors = bot.registerCommand("extractors", (msg, args) => {
        var youtubedl = require('youtube-dl');
        youtubedl.getExtractors(true, function(err, list) {
            console.log('Found ' + list.length + ' extractors');
            for (var i = 0; i < list.length; i++) {
                console.log(list[i]);
            }
        });
    }, {});
}
module.exports.Install = Install;
