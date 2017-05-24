/*
    Firefox addon "Toggle Website Colors"
    Copyright (C) 2017  Manuel Reimer <manuel.reimer@gmx.de>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
 * Tab CSS handling
 */

// Global information store. Stores "CSS applied" status for tabs.
var gTabHasCSS = {};

// Function to apply our CSS to the given tab.
function InsertCSS(aID) {
  browser.tabs.insertCSS(aID, {
    allFrames: true,
    cssOrigin: "user",
    file: "/nocolors.css"
  });
  gTabHasCSS[aID] = true;
}

// Function to remove our CSS from the given tab.
function RemoveCSS(aID) {
  browser.tabs.removeCSS(aID, {
    allFrames: true,
    cssOrigin: "user",
    file: "/nocolors.css"
  });
  gTabHasCSS[aID] = false;
}

// Returns true if the passed tab has our CSS aplied. False otherwise.
function HasCSS(aID) {
  if (gTabHasCSS[aID])
    return true;
  return false;
}

/*
 * Event listeners
 */

// Fired if the checkbox in context menu is clicked.
function ContextMenuClicked(aInfo, aTab) {
  if (!HasCSS(aTab.id))
    InsertCSS(aTab.id);
  else
    RemoveCSS(aTab.id);
}

// Fired if tab is updated (page reload or link click). CSS is not reapplied
// in this case. As we want the CSS to stay, reload it.
function TabUpdated(aID, aChangeInfo, aTab) {
  if (HasCSS(aTab.id))
    InsertCSS(aTab.id);
}

// Fired if a new tab is activated.
function TabActivated(aActiveInfo) {
  browser.contextMenus.update("toggle-colors-menu", {
   checked: !HasCSS(aActiveInfo.tabId)
  });
}

/*
 * Initialization
 */

// Register event listeners
browser.contextMenus.onClicked.addListener(ContextMenuClicked);
browser.tabs.onUpdated.addListener(TabUpdated);
browser.tabs.onActivated.addListener(TabActivated);

// Create our context menu
browser.contextMenus.create({
  id: "toggle-colors-menu",
  type: "checkbox",
  title: browser.i18n.getMessage("contextMenuWebsiteColors"),
  contexts: ["page"],
  checked: true
});
