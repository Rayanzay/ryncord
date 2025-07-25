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

import type * as t from "@vencord/discord-types";
import { filters, mapMangledModuleLazy, waitFor, wreq } from "@webpack";

export const Menu = {} as t.Menu;

// Relies on .name properties added by the MenuItemDemanglerAPI
waitFor(m => m.name === "MenuCheckboxItem", (_, id) => {
    // We have to do this manual require by ID because m in this case is the MenuCheckBoxItem instead of the entire module
    const exports = wreq(id);

    for (const exportKey in exports) {
        // Some exports might have not been initialized yet due to circular imports, so try catch it.
        try {
            var exportValue = exports[exportKey];
        } catch {
            continue;
        }

        if (typeof exportValue === "function" && exportValue.name.startsWith("Menu")) {
            Menu[exportValue.name] = exportValue;
        }
    }
});

waitFor(filters.componentByCode('path:["empty"]'), m => Menu.Menu = m);
waitFor(filters.componentByCode("sliderContainer", "slider", "handleSize:16", "=100"), m => Menu.MenuSliderControl = m);
waitFor(filters.componentByCode('role:"searchbox', "top:2", "query:"), m => Menu.MenuSearchControl = m);

export const ContextMenuApi: t.ContextMenuApi = mapMangledModuleLazy('type:"CONTEXT_MENU_OPEN', {
    closeContextMenu: filters.byCode("CONTEXT_MENU_CLOSE"),
    openContextMenu: filters.byCode("renderLazy:"),
    openContextMenuLazy: e => typeof e === "function" && e.toString().length < 100
});
