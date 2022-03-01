const config: {startcmd:string,token:string,watch:string} = JSON.parse(Deno.readTextFileSync("botstart.config.json"))
let latestpr = Deno.run({
    cmd:config.startcmd.split(" "),
})

import * as harmony from "http://code.harmony.rocks/main/mod.ts";
const client = new harmony.Client()
client.on("presenceUpdate", (presence) => {
    if(presence.status == "offline" && presence.user.id == config.watch){
        latestpr.close()
        setTimeout(() => {
            latestpr = Deno.run({
            cmd:config.startcmd.split(" "),
            })
        }, 5000)
    }
})
client.connect(config.token,[harmony.GatewayIntents.GUILDS,harmony.GatewayIntents.GUILD_MEMBERS,harmony.GatewayIntents.GUILD_PRESENCES])
