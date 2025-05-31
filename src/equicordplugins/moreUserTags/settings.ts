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
    }
});
