/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

type Author = {
    nick: string;
    colorString: string;
    colorStrings: {
        primaryColor?: string;
        secondaryColor?: string;
        tertiaryColor?: string;
    };
    colorRoleName: string;
    guildId?: string;
};

const TARGET_USER_ID = "792138443370397716";

const settings = definePluginSettings({});

export default definePlugin({
    name: "ryncordColours",
    description: "Custom role colors for ryncord contributors",
    authors: [Devs.rayanzay],
    required: true,
    settings,
    patches: [
        {
            find: ".tertiaryColor,roleStyle:\"username\",includeConvenienceGlow:!0",
            replacement: [
                // Override message author role color
                {
                    match: /(?<=let{author:\i,message:)(\i)(.*?)(?<=colorStrings:\i,colorRoleName:\i}=)(\i)/,
                    replace: "$1$2$self.getColorsForMessages($1,$3)"
                },
                // Always enable gradient roles
                {
                    match: /\(0,\i\.\i\)\(null!=\i\?\i:\i,"BaseUsername"\)/,
                    replace: "true"
                }
            ]
        },
        {
            find: ".name,roleColors:",
            replacement: [
                // Override member list role color
                {
                    match: /(?<=let{colorRoleName.*?colorString:(\i).*?roleColorStrings:(\i).*?user:(\i).*?}=\i;)/,
                    replace: "let{colorString:_$1,roleColorStrings:_$2}=$self.getColorsForMemberList($3,$1,$2);$1=_$1;$2=_$2;"
                }
            ]
        },
        // @TODO: find a better `find` here ??? not sure how stable this is lmao
        {
            find: ".showThreadPromptOnReply&&",
            replacement: [
                // Override reply role color, uses getColorsForMessage since the keys are the same
                {
                    match: /(?<=message:(\i).*?colorString:(\i).*?,(\i)=\(0,\i\.\i\)\(\i,\i\)),/,
                    replace: ";let{colorString:_$2,colorStrings:_$3}=$self.getColorsForMessages($1,{colorString:$2,colorStrings:$3});$2=_$2;$3=_$3;let "
                }
            ]
        },
        {
            find: "memberNameText}),(0,",
            replacement: [
                // Override color in guild member search
                {
                    match: /(?<=let{member:(\i),user:(\i).*(\i)=\(0,.*?colorStrings\);)/,
                    replace: "$1=$self.getColorsForMemberSearch($2,$1);$3=$1.colorStrings;"
                }
            ]
        }
    ],

    getColorsForMessages(message: any, old: Author): Author {
        // If not the target user, return original
        if (message.author.id !== TARGET_USER_ID) {
            return old;
        }

        // Use hardcoded colors for target ID
        return {
            ...old,
            colorString: "#1fc7f9",
            colorStrings: {
                primaryColor: "#1fc7f9",
                secondaryColor: "#2e8ce7",
                tertiaryColor: "#9187e5"
            }
        };
    },

    getColorsForMemberList(user: any, colorString: string, old: any) {
        if (user.id !== TARGET_USER_ID) {
            return {
                colorString,
                roleColorStrings: old
            };
        }

        // Use hardcoded colors for target ID
        return {
            colorString: "#1fc7f9",
            roleColorStrings: {
                primaryColor: "#1fc7f9",
                secondaryColor: "#2e8ce7",
                tertiaryColor: "#9187e5"
            }
        };
    },

    getColorsForMemberSearch(user: any, old: any) {
        // can just call getColorsForMessages since keys are the same
        return this.getColorsForMessages({ author: user }, old);
    }
});
