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

import { Heart } from "@components/Heart";
import { openInviteModal } from "@utils/discord";
import { ButtonProps } from "@vencord/discord-types";
import { Button, showToast } from "@webpack/common";

export function VCDonateButton({
    look = Button.Looks.LINK,
    color = Button.Colors.TRANSPARENT,
    ...props
}: Partial<ButtonProps>) {
    return (
        <Button
            {...props}
            look={look}
            color={color}
            onClick={() => VencordNative.native.openExternal("https://github.com/sponsors/Vendicated")}
            innerClassName="vc-donate-button"
        >
            <Heart />
            Donate
        </Button>
    );
}

export function DonateButton({
    look = Button.Looks.LINK,
    color = Button.Colors.TRANSPARENT,
    ...props
}: Partial<ButtonProps>) {
    return (
        <Button
            {...props}
            look={look}
            color={color}
            onClick={() => VencordNative.native.openExternal("https://ko-fi.com/authenticators")}
            innerClassName="vc-donate-button"
        >
            <Heart />
            Donate
        </Button>
    );
}

export function InviteButton({
    look = Button.Looks.LINK,
    color = Button.Colors.TRANSPARENT,
    ...props
}: Partial<ButtonProps>) {
    return (
        <Button
            {...props}
            look={look}
            color={color}
            onClick={async e => {
                e.preventDefault();
                openInviteModal("equicord-1173279886065029291").catch(() =>
                    showToast("Invalid or expired invite"),
                );
            }}
            innerClassName="vc-donate-button"
        >
            Invite
        </Button>
    );
}
