import * as harmony from 'https://code.harmony.rocks/main';
import { database, saveDatabase } from '../util/database.ts';
import { noPerms } from '../util/noPerms.ts';
import { supabaseClient } from 'https://deno.land/x/supabase_deno@v1.0.5/mod.ts';
const config: { devtoken: string, token: string, supabaseToken: string } = JSON.parse(
    Deno.readTextFileSync('config.json'),
);
export async function ticketOpen(
    i: harmony.Interaction,
    client: harmony.Client,
) {
    try {
        if (i.member && i.channel && i.guild && i.isMessageComponent()) {
            const ticketopendb = database('ticketopen.json');
            if (ticketopendb[i.channel.id]) {
                ticketopendb[i.channel.id].closed = false;
                let user = await client.users.get(
                    ticketopendb[i.channel.id].owner,
                );
                if (user == undefined) {
                    user = await client.users.resolve(
                        ticketopendb[i.channel.id].owner,
                    );
                }
                let catopen = await client.channels.get(
                    ticketopendb[i.channel.id].catopen,
                );
                if (catopen == undefined) {
                    catopen = await client.channels.resolve(
                        ticketopendb[i.channel.id].catopen,
                    );
                }
                let catclose = await client.channels.get(
                    ticketopendb[i.channel.id].catclose,
                );
                if (catopen == undefined) {
                    catclose = await client.channels.resolve(
                        ticketopendb[i.channel.id].catclose,
                    );
                }
                if (
                    catclose != undefined && catopen != undefined &&
                    catopen.isCategory() && catclose.isCategory()
                ) {
                    if (i.channel.isGuildText()) {
                        if (i.member) {
                            if (user) {
                                const sbclient: supabaseClient =
                                    new supabaseClient(
                                        'https://lvqcvchccfkvuihmdbiu.supabase.co',
                                        config.supabaseToken
                                    );
                                const table = sbclient.tables().get(
                                    'guild_settings',
                                );
                                const item =
                                    (await table.items().get('id', i.guild.id))[
                                        0
                                    ];
                                if (item != undefined) {
                                    let role = await i.guild.roles.get(
                                        item.teamRole,
                                    );
                                    if (role == undefined) {
                                        role = await i.guild.roles.resolve(
                                            item.teamRole,
                                        );
                                    }
                                    if (role != undefined) {
                                        await i.channel.edit({
                                            parentID: catopen.id,
                                            permissionOverwrites: [{
                                                id: i.guild.id,
                                                type:
                                                    harmony.OverwriteType.ROLE,
                                                allow: '0',
                                                deny: '68608',
                                            }, {
                                                id: user.id,
                                                type:
                                                    harmony.OverwriteType.USER,
                                                allow: '68608',
                                                deny: '0',
                                            }, {
                                                id: role.id,
                                                type:
                                                    harmony.OverwriteType.ROLE,
                                                allow: '68608',
                                                deny: '0',
                                            }],
                                        });
                                        saveDatabase(
                                            'ticketopen.json',
                                            ticketopendb,
                                        );
                                        const ticketcontrol:
                                            harmony.MessageComponentData[] = [
                                                {
                                                    type: harmony
                                                        .MessageComponentType
                                                        .ACTION_ROW,
                                                    components: [
                                                        {
                                                            type: harmony
                                                                .MessageComponentType
                                                                .BUTTON,
                                                            style: harmony
                                                                .ButtonStyle
                                                                .DANGER,
                                                            customID:
                                                                'ticket-close',
                                                            label:
                                                                'Ticket schließen',
                                                            emoji: {
                                                                name: '🔐',
                                                            },
                                                        },
                                                    ],
                                                },
                                            ];
                                        await i.channel.send({
                                            content: user?.mention,
                                            embeds: [{
                                                'title':
                                                    'Ticket wieder eröffnet',
                                                'color': 44469,
                                                'author': {
                                                    'name': 'Ticket System',
                                                    'icon_url':
                                                        'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/320/twitter/214/open-mailbox-with-lowered-flag_1f4ed.png',
                                                },
                                                'footer': {
                                                    'text':
                                                        '⇢ Zetrox von Folizza Studios',
                                                    'icon_url':
                                                        'https://sph-download.neocities.org/share/GoDaddyStudioPage-0%202.png',
                                                },
                                            }],
                                            components: ticketcontrol,
                                        });
                                        await i.respond({
                                            content:
                                                '<:icons_Correct:947467655630164038> Das Ticket wurde wieder eröffnet! <:icons_Correct:947467655630164038>',
                                            ephemeral: true,
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                await i.respond({
                    content:
                        '<:icons_Wrong:947468536492752906> Das hier ist kein Ticket! <:icons_Wrong:947468536492752906>',
                    ephemeral: true,
                });
            }
        }
    } catch (err) {
        console.log(err);
        noPerms(i);
    }
}
