/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
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

import "./style.css";

import { addMemberListDecorator, removeMemberListDecorator } from "@api/MemberListDecorators";
import { addMessageDecoration, removeMessageDecoration } from "@api/MessageDecorations";
import { addNicknameIcon, removeNicknameIcon } from "@api/NicknameIcons";
import { definePluginSettings, migratePluginSetting, Settings } from "@api/Settings";
import { Devs } from "@utils/constants";
import { classes } from "@utils/misc";
import definePlugin, { OptionType } from "@utils/types";
import { User } from "@vencord/discord-types";
import { filters, findStoreLazy, mapMangledModuleLazy } from "@webpack";
import { AuthenticationStore, PresenceStore, Tooltip, UserStore, useStateFromStores } from "@webpack/common";

export interface Session {
    sessionId: string;
    status: string;
    active: boolean;
    clientInfo: {
        version: number;
        os: string;
        client: string;
    };
}

const SessionsStore = findStoreLazy("SessionsStore") as {
    getSessions(): Record<string, Session>;
};

const { useStatusFillColor } = mapMangledModuleLazy(".concat(.5625*", {
    useStatusFillColor: filters.byCode(".hex")
});

interface IconFactoryOpts {
    viewBox?: string;
    width?: number;
    height?: number;
}

interface IconProps {
    color: string;
    tooltip: string;
    small?: boolean;
}

function Icon(path: string, opts?: IconFactoryOpts) {
    return ({ color, tooltip, small }: IconProps) => (
        <Tooltip text={tooltip} >
            {tooltipProps => (
                <svg
                    {...tooltipProps}
                    height={(opts?.height ?? 20) - (small ? 3 : 0)}
                    width={(opts?.width ?? 20) - (small ? 3 : 0)}
                    viewBox={opts?.viewBox ?? "0 0 24 24"}
                    fill={color}
                >
                    <path d={path} />
                </svg>
            )}
        </Tooltip>
    );
}

const Icons = {
    desktop: Icon("M4 2.5c-1.103 0-2 .897-2 2v11c0 1.104.897 2 2 2h7v2H7v2h10v-2h-4v-2h7c1.103 0 2-.896 2-2v-11c0-1.103-.897-2-2-2H4Zm16 2v9H4v-9h16Z"),
    web: Icon("M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93Zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39Z"),
    mobile: Icon("M 187 0 L 813 0 C 916.277 0 1000 83.723 1000 187 L 1000 1313 C 1000 1416.277 916.277 1500 813 1500 L 187 1500 C 83.723 1500 0 1416.277 0 1313 L 0 187 C 0 83.723 83.723 0 187 0 Z M 125 1000 L 875 1000 L 875 250 L 125 250 Z M 500 1125 C 430.964 1125 375 1180.964 375 1250 C 375 1319.036 430.964 1375 500 1375 C 569.036 1375 625 1319.036 625 1250 C 625 1180.964 569.036 1125 500 1125 Z", { viewBox: "0 0 1000 1500", height: 17, width: 17 }),
    embedded: Icon("M10.5 3.798v5.02a3 3 0 0 1-.879 2.121l-2.377 2.377a9.845 9.845 0 0 1 5.091 1.013 8.315 8.315 0 0 0 5.713.636l.285-.071-3.954-3.955a3 3 0 0 1-.879-2.121v-5.02a23.614 23.614 0 0 0-3 0Zm4.5.138a.75.75 0 0 0 .093-1.495A24.837 24.837 0 0 0 12 2.25a25.048 25.048 0 0 0-3.093.191A.75.75 0 0 0 9 3.936v4.882a1.5 1.5 0 0 1-.44 1.06l-6.293 6.294c-1.62 1.621-.903 4.475 1.471 4.88 2.686.46 5.447.698 8.262.698 2.816 0 5.576-.239 8.262-.697 2.373-.406 3.092-3.26 1.47-4.881L15.44 9.879A1.5 1.5 0 0 1 15 8.818V3.936Z", { viewBox: "0 0 24 24", height: 20, width: 20 }),
    suncord: Icon("M7 4a6 6 0 00-6 6v4a6 6 0 006 6h10a6 6 0 006-6v-4a6 6 0 00-6-6H7zm0 11a1 1 0 01-1-1v-1H5a1 1 0 010-2h1v-1a1 1 0 012 0v1h1a1 1 0 010 2H8v1a1 1 0 01-1 1zm10-4a1 1 0 100-2 1 1 0 000 2zm1 3a1 1 0 11-2 0 1 1 0 012 0zm0-2a1 1 0 102 0 1 1 0 00-2 0zm-3 1a1 1 0 110-2 1 1 0 010 2z", { viewBox: "0 0 24 24", height: 24, width: 24 }),
    vencord: Icon("M14.8 2.7 9 3.1V47h3.3c1.7 0 6.2.3 10 .7l6.7.6V2l-4.2.2c-2.4.1-6.9.3-10 .5zm1.8 6.4c1 1.7-1.3 3.6-2.7 2.2C12.7 10.1 13.5 8 15 8c.5 0 1.2.5 1.6 1.1zM16 33c0 6-.4 10-1 10s-1-4-1-10 .4-10 1-10 1 4 1 10zm15-8v23.3l3.8-.7c2-.3 4.7-.6 6-.6H43V3h-2.2c-1.3 0-4-.3-6-.6L31 1.7V25z", { viewBox: "0 0 50 50" }),
    ryncord: Icon("M10.5 3.798v5.02a3 3 0 0 1-.879 2.121l-2.377 2.377a9.845 9.845 0 0 1 5.091 1.013 8.315 8.315 0 0 0 5.713.636l.285-.071-3.954-3.955a3 3 0 0 1-.879-2.121v-5.02a23.614 23.614 0 0 0-3 0Zm4.5.138a.75.75 0 0 0 .093-1.495A24.837 24.837 0 0 0 12 2.25a25.048 25.048 0 0 0-3.093.191A.75.75 0 0 0 9 3.936v4.882a1.5 1.5 0 0 1-.44 1.06l-6.293 6.294c-1.62 1.621-.903 4.475 1.471 4.88 2.686.46 5.447.698 8.262.698 2.816 0 5.576-.239 8.262-.697 2.373-.406 3.092-3.26 1.47-4.881L15.44 9.879A1.5 1.5 0 0 1 15 8.818V3.936Z", { viewBox: "0 0 24 24", height: 20, width: 20 }),
};

type Platform = keyof typeof Icons;

interface PlatformIconProps {
    platform: Platform;
    status: string;
    small?: boolean;
    isProfile?: boolean;
}

const PlatformIcon = ({ platform, status, small }: PlatformIconProps) => {
    const tooltip = platform === "embedded"
        ? "Possible ryncord User"
        : platform[0].toUpperCase() + platform.slice(1);
    let Icon = Icons[platform] ?? Icons.desktop;
    const { ConsoleIcon } = settings.store;
    if (platform === "embedded" && ConsoleIcon === "vencord") {
        Icon = Icons.vencord;
    }
    if (platform === "embedded" && ConsoleIcon === "suncord") {
        Icon = Icons.suncord;
    }
    if (platform === "embedded" && ConsoleIcon === "ryncord") {
        Icon = Icons.ryncord;
    }

    return <Icon color={useStatusFillColor(status)} tooltip={tooltip} small={small} />;
};

function useEnsureOwnStatus(user: User) {
    if (user.id !== AuthenticationStore.getId()) {
        return;
    }

    const sessions = useStateFromStores([SessionsStore], () => SessionsStore.getSessions());
    if (typeof sessions !== "object") return null;
    const sortedSessions = Object.values(sessions).sort(({ status: a }, { status: b }) => {
        if (a === b) return 0;
        if (a === "online") return 1;
        if (b === "online") return -1;
        if (a === "idle") return 1;
        if (b === "idle") return -1;
        return 0;
    });

    const ownStatus = Object.values(sortedSessions).reduce((acc, curr) => {
        if (curr.clientInfo.client !== "unknown")
            acc[curr.clientInfo.client] = curr.status;
        return acc;
    }, {} as Record<string, string>);

    // For Ryncord users, also add embedded status alongside desktop
    if (ownStatus.desktop) {
        ownStatus.embedded = ownStatus.desktop;
    }

    const { clientStatuses } = PresenceStore.getState();
    clientStatuses[UserStore.getCurrentUser().id] = ownStatus;
}

interface PlatformIndicatorProps {
    user: User;
    isProfile?: boolean;
    isMessage?: boolean;
    isMemberList?: boolean;
}

const PlatformIndicator = ({ user, isProfile, isMessage, isMemberList }: PlatformIndicatorProps) => {
    if (user == null || (user.bot && !Settings.plugins.PlatformIndicators.showBots)) return null;
    useEnsureOwnStatus(user);

    const status: Record<Platform, string> | undefined = useStateFromStores([PresenceStore], () => PresenceStore.getState()?.clientStatuses?.[user.id]);
    if (status == null) {
        return null;
    }

    // Don't show platform indicators if user is invisible
    const userStatus = PresenceStore.getStatus(user.id);
    if (userStatus === "invisible") {
        return null;
    }

    const icons = Array.from(Object.entries(status), ([platform, status]) => (
        <PlatformIcon
            key={platform}
            platform={platform as Platform}
            status={status}
            small={isProfile || isMemberList}
        />
    ));

    if (!icons.length) {
        return null;
    }

    return (
        <div
            className={classes("vc-platform-indicator", isProfile && "vc-platform-indicator-profile", isMessage && "vc-platform-indicator-message")}
            style={{ marginLeft: isMemberList ? "4px" : undefined }}
        >
            {icons}
        </div>
    );
};

function toggleMemberListDecorators(enabled: boolean) {
    if (enabled) {
        addMemberListDecorator("PlatformIndicators", props => <PlatformIndicator user={props.user} isMemberList />);
    } else {
        removeMemberListDecorator("PlatformIndicators");
    }
}

function toggleNicknameIcons(enabled: boolean) {
    if (enabled) {
        addNicknameIcon("PlatformIndicators", props => <PlatformIndicator user={UserStore.getUser(props.userId)} isProfile />, 1);
    } else {
        removeNicknameIcon("PlatformIndicators");
    }
}

function toggleMessageDecorators(enabled: boolean) {
    if (enabled) {
        addMessageDecoration("PlatformIndicators", props => <PlatformIndicator user={props.message?.author} isMessage />);
    } else {
        removeMessageDecoration("PlatformIndicators");
    }
}

migratePluginSetting("PlatformIndicators", "profiles", "badges");
const settings = definePluginSettings({
    list: {
        type: OptionType.BOOLEAN,
        description: "Show indicators in the member list",
        default: true,
        onChange: toggleMemberListDecorators
    },
    profiles: {
        type: OptionType.BOOLEAN,
        description: "Show indicators in user profiles",
        default: true,
        onChange: toggleNicknameIcons
    },
    messages: {
        type: OptionType.BOOLEAN,
        description: "Show indicators inside messages",
        default: true,
        onChange: toggleMessageDecorators
    },
    colorMobileIndicator: {
        type: OptionType.BOOLEAN,
        description: "Whether to make the mobile indicator match the color of the user status.",
        default: true,
        restartNeeded: true
    },
    showBots: {
        type: OptionType.BOOLEAN,
        description: "Whether to show platform indicators on bots",
        default: false,
        restartNeeded: false
    },
    ConsoleIcon: {
        type: OptionType.SELECT,
        description: "What console icon to use",
        restartNeeded: true,
        options: [
            {
                label: "Equicord",
                value: "equicord",
                default: true
            },
            {
                label: "Suncord",
                value: "suncord",
            },
            {
                label: "Vencord",
                value: "vencord",
            },
            {
                label: "Ryncord",
                value: "ryncord",
            },
        ],
    }
});

export default definePlugin({
    name: "PlatformIndicators",
    description: "Adds platform indicators (Desktop, Mobile, Web...) to users",
    authors: [Devs.kemo, Devs.TheSun, Devs.Nuckyz, Devs.Ven],
    dependencies: ["MemberListDecoratorsAPI", "NicknameIconsAPI", "MessageDecorationsAPI"],
    settings,

    start() {
        if (settings.store.list) toggleMemberListDecorators(true);
        if (settings.store.profiles) toggleNicknameIcons(true);
        if (settings.store.messages) toggleMessageDecorators(true);
    },

    stop() {
        if (settings.store.list) toggleMemberListDecorators(false);
        if (settings.store.profiles) toggleNicknameIcons;
        if (settings.store.messages) toggleMessageDecorators(false);
    },

    patches: [
        {
            find: ".Masks.STATUS_ONLINE_MOBILE",
            predicate: () => settings.store.colorMobileIndicator,
            replacement: [
                {
                    // Return the STATUS_ONLINE_MOBILE mask if the user is on mobile, no matter the status
                    match: /\.STATUS_TYPING;switch(?=.+?(if\(\i\)return \i\.\i\.Masks\.STATUS_ONLINE_MOBILE))/,
                    replace: ".STATUS_TYPING;$1;switch"
                },
                {
                    // Return the STATUS_ONLINE_MOBILE mask if the user is on mobile, no matter the status
                    match: /switch\(\i\)\{case \i\.\i\.ONLINE:(if\(\i\)return\{[^}]+\})/,
                    replace: "$1;$&"
                }
            ]
        },
        {
            find: ".AVATAR_STATUS_MOBILE_16;",
            predicate: () => settings.store.colorMobileIndicator,
            replacement: [
                {
                    // Return the AVATAR_STATUS_MOBILE size mask if the user is on mobile, no matter the status
                    match: /\i===\i\.\i\.ONLINE&&(?=.{0,70}\.AVATAR_STATUS_MOBILE_16;)/,
                    replace: ""
                },
                {
                    // Fix sizes for mobile indicators which aren't online
                    match: /(?<=\(\i\.status,)(\i)(?=,(\i),\i\))/,
                    replace: (_, userStatus, isMobile) => `${isMobile}?"online":${userStatus}`
                },
                {
                    // Make isMobile true no matter the status
                    match: /(?<=\i&&!\i)&&\i===\i\.\i\.ONLINE/,
                    replace: ""
                }
            ]
        },
        {
            find: "}isMobileOnline(",
            predicate: () => settings.store.colorMobileIndicator,
            replacement: {
                // Make isMobileOnline return true no matter what is the user status
                match: /(?<=\i\[\i\.\i\.MOBILE\])===\i\.\i\.ONLINE/,
                replace: "!= null"
            }
        }
    ]
});
