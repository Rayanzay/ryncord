/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const settings = definePluginSettings({
    specialUsers: {
        type: OptionType.STRING,
        description: "List of special user IDs (comma separated)",
        default: "878151241769820173",
    },
    specialTag: {
        type: OptionType.STRING,
        description: "Text to display for special users",
        default: "Special",
    },
    dontShowBotTag: {
        type: OptionType.BOOLEAN,
        description: "Don't show bot tag",
        default: false
    },
    dontShowForBots: {
        type: OptionType.BOOLEAN,
        description: "Don't show tags for bots",
        default: false
    },
    tagSettings: {
        type: OptionType.COMPONENT,
        description: "Tag Settings",
        component: () => null // This will be handled by the SettingsComponent in settings.tsx
    }
});
