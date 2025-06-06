/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EquicordDevs } from "@utils/constants";

import definePlugin from "../../utils/types";

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function fetchReddit(sub: string) {
    const res = await fetch(`https://www.reddit.com/r/${sub}/top.json?limit=100&t=all`);
    const resp = await res.json();
    try {
        const { children } = resp.data;
        const r = rand(0, children.length - 1);
        return children[r].data.url;
    } catch (err) {
        console.error(resp);
        console.error(err);
    }
    return "";
}

export default definePlugin({
    name: "Memes",
    authors: [EquicordDevs.ShadyGoat],
    description: "Add a command to send Reddit memes in the chat",
    commands: [{
        name: "memes",
        description: "Send Reddit memes",

        async execute(args) {
            let sub = "memes";
            if (args.length > 0) {
                const v = args[0].value as any as boolean;
                if (v) {
                    sub = "memes";
                }
            }

            return {
                content: await fetchReddit(sub),
            };
        },
    }]
});
