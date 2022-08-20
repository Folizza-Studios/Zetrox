import * as harmony from 'https://code.harmony.rocks/main';
import { database, saveDatabase } from '../util/database.ts';
import { noPerms } from '../util/noPerms.ts';
import { supabaseClient } from 'https://deno.land/x/supabase_deno@v1.0.5/mod.ts';
const config: { devtoken: string, token: string, supabaseToken: string } = JSON.parse(
    Deno.readTextFileSync('config.json'),
);
export async function ticketCreate(
    i: harmony.Interaction,
    client: harmony.Client,
) {
    try {
        if (i.member && i.channel && i.guild && i.isMessageComponent()) {
            const ticketdb = database('tickets.json');
            const sbclient: supabaseClient = new supabaseClient(
                'https://lvqcvchccfkvuihmdbiu.supabase.co',
                config.supabaseToken,
            );
            const table = sbclient.tables().get('guild_settings');
            const item = (await table.items().get('id', i.guild.id))[0];
            if (item != undefined) {
                for (const ticket of ticketdb.tickets) {
                    if (ticket.msg == i.message.id) {
                        let catopen = await client.channels.get(ticket.catopen);
                        if (catopen == undefined) {
                            catopen = await client.channels.resolve(
                                ticket.catopen,
                            );
                        }
                        let catclose = await client.channels.get(
                            ticket.catclose,
                        );
                        if (catopen == undefined) {
                            catclose = await client.channels.resolve(
                                ticket.catclose,
                            );
                        }
                        if (
                            catclose != undefined && catopen != undefined &&
                            catopen.isCategory() && catclose.isCategory()
                        ) {
                            let role = await i.guild.roles.get(item.teamRole);
                            if (role == undefined) {
                                role = await i.guild.roles.resolve(
                                    item.teamRole,
                                );
                            }
                            if (role != undefined) {
                                const channel = await i.guild.createChannel({
                                    name: 'open-' + i.member.user.username,
                                    parent: catopen,
                                    permissionOverwrites: [{
                                        id: i.guild.id,
                                        type: harmony.OverwriteType.ROLE,
                                        allow: '0',
                                        deny: '68608',
                                    }, {
                                        id: i.member.id,
                                        type: harmony.OverwriteType.USER,
                                        allow: '68608',
                                        deny: '0',
                                    }, {
                                        id: role.id,
                                        type: harmony.OverwriteType.ROLE,
                                        allow: '68608',
                                        deny: '0',
                                    }],
                                });
                                const ticketcontrol:
                                    harmony.MessageComponentData[] = [
                                        {
                                            type: harmony.MessageComponentType
                                                .ACTION_ROW,
                                            components: [
                                                {
                                                    type: harmony
                                                        .MessageComponentType
                                                        .BUTTON,
                                                    style: harmony.ButtonStyle
                                                        .DANGER,
                                                    customID: 'ticket-close',
                                                    label: 'Ticket schließen',
                                                    emoji: { name: '🔐' },
                                                },
                                            ],
                                        },
                                    ];
                                if (channel.isText()) {
                                    channel.send({
                                        embeds: [
                                            {
                                                'title':
                                                    `Ticket von ${i.member.user.username} `,
                                                'description':
                                                    'Ein Teammitglied wird sich gleich um dich kümmern.\nBitte Beschreibe schon mal dein Problem!',
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
                                            },
                                        ],
                                        components: ticketcontrol,
                                    });
                                    const ticketopendb = database(
                                        'ticketopen.json',
                                    );
                                    ticketopendb[channel.id] = {
                                        owner: i.user.id,
                                        catopen: catopen.id,
                                        catclose: catclose.id,
                                    };
                                    saveDatabase(
                                        'ticketopen.json',
                                        ticketopendb,
                                    );
                                    i.respond({
                                        content:
                                            `✅ Dein Ticket wurde erfolgreich erstellt! ${channel.mention} ✅`,
                                        ephemeral: true,
                                    });
                                }
                            } else {
                                await i.respond({
                                    content:
                                        '<:icons_Wrong:947468536492752906> Der Server Administrator hat noch keine Team Rolle festgelegt. <:icons_Wrong:947468536492752906>\n*(`/einstellungen teamrole <rolle>`)*',
                                    ephemeral: true,
                                });
                            }
                        } else {
                            await i.respond({
                                content:
                                    '<:icons_Wrong:947468536492752906> Dieses Ticket System ist kaputt. <:icons_Wrong:947468536492752906> \n*Bitte Frage den Server Administrator ob er das aktuelle löschen und ein neues erstellen kann.*',
                            });
                        }
                    }
                }
            } else {
                await i.respond({
                    content:
                        '<:icons_Wrong:947468536492752906> Der Server Administrator hat noch keine Team Rolle festgelegt. <:icons_Wrong:947468536492752906>\n*(`/einstellungen teamrole <rolle>`)*',
                    ephemeral: true,
                });
            }
        }
    } catch (err) {
        console.log(err);
        noPerms(i);
    }
}
