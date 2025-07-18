/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

export const settings = definePluginSettings({
    dms: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Remove shops above DMs list",
        restartNeeded: true,
    },
    billing: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Remove billing settings",
        restartNeeded: true,
    },
    gift: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Remove gift button",
        restartNeeded: true,
    },
    emojiList: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Remove unavailable categories from the emoji picker",
        restartNeeded: true,
    },
});

export default definePlugin({
    name: "RemoveCrap",
    description: "Remove Discord's bloatware from your client.",
    authors: [Devs.Kyuuhachi],
    settings,

    patches: [
        {
            // Above DMs, mouse nav
            find: 'tutorialId:"direct-messages"',
            replacement: [
                {
                    match: /"premium"\)/,
                    replace: "$&&&undefined",
                },
                {
                    match: /"discord-shop"\)/,
                    replace: "$&&&undefined",
                },
            ],
            predicate: () => settings.store.dms,
        },
        {
            // Above DMs, keyboard nav
            find: ".hasLibraryApplication()&&!",
            replacement: [
                {
                    match: /\i\.\i\.APPLICATION_STORE,/,
                    replace: "/*$&*/",
                },
                {
                    match: /\i\.\i\.COLLECTIBLES_SHOP,/,
                    replace: "/*$&*/",
                },
            ],
            predicate: () => settings.store.dms,
        },
        {
            // Settings, sidebar
            find: "#{intl::BILLING_SETTINGS}",
            replacement: [
                {
                    match: /(?<=#{intl::BILLING_SETTINGS}\),)/,
                    replace: "capitalism:true,"
                },
                {
                    match: /\i\?\i:\i\.toSpliced\(3,0,\i\)/,
                    replace: "($&).filter(e=>!e.capitalism)",
                },
            ],
            predicate: () => settings.store.billing,
        },
        {
            // Gift button
            find: "GIFT_BUTTON)",
            replacement: {
                match: /if\(\i\)return null;/,
                replace: "return null;",
            },
            all: true,
            predicate: () => settings.store.gift,
        },
        {
            // Emoji list
            find: "#{intl::EMOJI_PICKER_CREATE_EMOJI_TITLE}),size:",
            replacement: {
                match: /(\i)=\i\|\|!\i&&\i.\i.isEmojiCategoryNitroLocked\(\{[^}]*\}\);/,
                replace: "$&$1=($1 && $1.isNitroLocked && !$1.isUserAccess);"
            },
            predicate: () => settings.store.emojiList,
        },
        {
            // Emoji category list
            find: "#{intl::EMOJI_CATEGORY_TOP_GUILD_EMOJI},{guildName:",
            replacement: {
                match: /(?<=(\i)\.unshift\((\i)\):)(?=\1\.push\(\2\))/,
                replace: "$2.isNitroLocked && !$2.isUserAccess ||"
            },
            predicate: () => settings.store.emojiList,
        }
    ],
});
