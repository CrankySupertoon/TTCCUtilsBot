"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Eris = require("eris");
var axios_1 = require("axios");
var fs = require("fs");
var bot = new Eris.CommandClient("NDY4MjEwNzUxODI0NDYxODQ0.Di12wg.ZFQTgQCdkQvQklNfCc_sL8S5ayY", {}, {
    description: "Various tools and alerts for TT:CC. Source: https://github.com/Time6628/TTCCBot",
    name: "TTCC Utils Bot",
    owner: "<@71371505652477952>",
    prefix: "t>"
});
if (!fs.existsSync("channels.json")) {
    fs.writeFileSync("channels.json", JSON.stringify(["469146479546597396"]));
}
var channels = JSON.parse(fs.readFileSync("channels.json", "utf8"));
var invasions = new Map();
var invasionAlerts = new Map();
bot.on("ready", function () {
    setInterval(function () {
        axios_1.default.get("https://corporateclash.net/api/v1/districts/").then(function (response) {
            // for each district returned from the api
            for (var index in response.data) {
                // check if there is an invasion
                if (response.data[index].invasion_online === true) {
                    // say there is an invasion
                    console.log("Invasion in " + response.data[index].name + " time remaining " + response.data[index].remaining_time);
                    // add the district info to the invasions
                    invasions.set(response.data[index].name, response.data[index]);
                    sendAlerts();
                }
                // if there is an invasion stored but the invasion has ended, update the messages
                if (invasions.has(response.data[index].name) && response.data[index].invasion_online === false) {
                    endAlerts(response.data[index].name);
                }
            }
        });
    }, 20000);
    setInterval(function () {
        invasions.forEach(function (value) {
            value.remaining_time = value.remaining_time - 3;
        });
        invasionAlerts.forEach(function (value, key) {
            value.forEach(function (value1) {
                value1.edit({
                    embed: {
                        title: ":rotating_light: INVASION ALERT :rotating_light:",
                        description: "There is a cog invasion in " + invasions.get(key).name + "! Save us Toons!",
                        color: 0x9494b8,
                        fields: [
                            {
                                name: "Cog Type",
                                value: invasions.get(key).cogs_attacking,
                                inline: true
                            },
                            {
                                name: "Cogs Defeated",
                                value: invasions.get(key).count_defeated,
                                inline: true
                            },
                            {
                                name: "Cogs Remaining",
                                value: invasions.get(key).count_total - invasions.get(key).count_defeated,
                                inline: true
                            },
                            {
                                name: "Cogs Total",
                                value: invasions.get(key).count_total,
                                inline: true
                            },
                            {
                                name: "Toons Online",
                                value: invasions.get(key).population,
                                inline: true
                            },
                            {
                                name: "Time Remaining",
                                value: invasions.get(key).remaining_time.toString().toHHMMSS(),
                                inline: true
                            }
                        ]
                    }
                }).catch(function (reason) { return console.log(reason); });
            });
        });
    }, 3000);
});
bot.registerCommand("ialert", function (msg) {
    if (channels.indexOf(msg.channel.id) > -1) {
        channels = channels.filter(function (channel) { return channel != msg.channel.id; });
        msg.channel.createMessage("Channel will no longer be used for invasion alerts.").then(function () {
            fs.writeFileSync("channels.json", JSON.stringify(channels));
        }).catch(function (reason) {
            console.log(reason);
        });
    }
    else {
        channels.push(msg.channel.id);
        msg.channel.createMessage("Channel will now receive invasion alerts.").then(function () {
            fs.writeFileSync("channels.json", JSON.stringify(channels));
        }).catch(function (reason) {
            console.log(reason);
        });
    }
}, {
    description: "Adds the channel this command is executed in to the list of channels that will receive alerts.",
    requirements: {
        permissions: {
            "administrator": true
        }
    }
});
function sendAlerts() {
    // for each invasion
    invasions.forEach(function (value, key) {
        if (invasionAlerts.has(key))
            return;
        var msgs = [];
        for (var i in channels) {
            bot.createMessage(channels[i], {
                embed: {
                    title: ":rotating_light: INVASION ALERT :rotating_light:",
                    description: "There is a cog invasion in " + value.name + "! Save us Toons!",
                    color: 0x9494b8,
                    fields: [
                        {
                            name: "Cog Type",
                            value: value.cogs_attacking,
                            inline: true
                        },
                        {
                            name: "Cogs Defeated",
                            value: value.count_defeated,
                            inline: true
                        },
                        {
                            name: "Cogs Remaining",
                            value: value.count_total - value.count_defeated,
                            inline: true
                        },
                        {
                            name: "Cogs Total",
                            value: value.count_total,
                            inline: true
                        },
                        {
                            name: "Toons Online",
                            value: value.population,
                            inline: true
                        },
                        {
                            name: "Time Remaining",
                            value: value.remaining_time.toString().toHHMMSS(),
                            inline: true
                        }
                    ]
                }
            }).then(function (msg) {
                msgs.push(msg);
            }).catch(function (reason) { return console.log(reason); });
        }
        invasionAlerts.set(key, msgs);
    });
}
function endAlerts(name) {
    invasionAlerts.get(name).forEach(function (value) {
        value.edit({
            embed: {
                title: "INVASION ENDED",
                description: "The invasion in " + invasions.get(name).name + " has ended! Awesome work Toons!",
                color: 0x0ff8080
            }
        }).catch(function (reason) { return console.log(reason); });
    });
    invasionAlerts.delete(name);
    invasions.delete(name);
}
String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
};
bot.connect();
