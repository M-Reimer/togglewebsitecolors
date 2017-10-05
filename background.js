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
async function InsertCSS(aID) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", chrome.extension.getURL('/nocolors.css'), false);
  xhr.send();
  let css = xhr.responseText

  const prefs = await browser.storage.local.get();
  const background = prefs.background_color || "#FFFFFF";
  const text = prefs.text_color || "#000000";
  const link = prefs.link_color || "#0000EE";
  const visited = prefs.link_color || "#551A8B";

  css = css.replace(/\$TEXTCOLOR/g, text);
  css = css.replace(/\$BACKGROUNDCOLOR/g, background);
  css = css.replace(/\$LINKCOLOR/g, link);
  css = css.replace(/\$VISITEDCOLOR/g, visited);

  await browser.tabs.insertCSS(aID, {
    allFrames: true,
    cssOrigin: "user",
    code: css
  });
  gTabHasCSS[aID] = css;
}

// Function to remove our CSS from the given tab.
function RemoveCSS(aID) {
  if (!gTabHasCSS[aID])
    return;
  browser.tabs.removeCSS(aID, {
    allFrames: true,
    cssOrigin: "user",
    code: gTabHasCSS[aID]
  });
  gTabHasCSS[aID] = false;
}

// Returns true if the passed tab has our CSS aplied. False otherwise.
function HasCSS(aID) {
  return (gTabHasCSS[aID]);
}

// Toggles our CSS for the given tab id
function ToggleCSS(aID) {
  if (!HasCSS(aID))
    InsertCSS(aID);
  else
    RemoveCSS(aID);
}

/*
 * Event listeners
 */

// Fired if the checkbox in context menu is clicked.
function ContextMenuClicked(aInfo, aTab) {
  ToggleCSS(aTab.id);
}

// Fired if tab is updated (page reload or link click). CSS is not reapplied
// in this case. As we want the CSS to stay, reload it.
function TabUpdated(aID, aChangeInfo, aTab) {
  if (HasCSS(aTab.id))
    InsertCSS(aTab.id);
}

// Fired if a new tab is activated.
async function TabActivated(aActiveInfo) {
  await CheckForAutoDisable(aActiveInfo.tabId);
  browser.contextMenus.update("toggle-colors-menu", {
    checked: !HasCSS(aActiveInfo.tabId)
  });
}

// Checks if the given tab still is not registered in our "database"
// If so, and "auto-disable" is enabled, apply our CSS to this tab.
async function CheckForAutoDisable(aID) {
  const prefs = await browser.storage.local.get("auto_disable");
  const autodisable = prefs.auto_disable || false;
  if (HasCSS(aID) === undefined && autodisable)
    await InsertCSS(aID);
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
