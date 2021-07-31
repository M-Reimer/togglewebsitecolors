/*
    Firefox addon "Toggle Website Colors"
    Copyright (C) 2021  Manuel Reimer <manuel.reimer@gmx.de>

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
"use strict";

/*
 * Tab CSS handling
 */

// Global information store. Stores "CSS applied" status for tabs.
var gTabHasCSS = {};

// Function to apply our CSS to the given tab.
async function InsertCSS(aID) {
  let css = await (await fetch(browser.runtime.getURL('/nocolors.css'))).text();

  const prefs = await Storage.get();
  css = css.replace(/\$TEXTCOLOR/g, prefs.text_color);
  css = css.replace(/\$BACKGROUNDCOLOR/g, prefs.background_color);
  css = css.replace(/\$LINKCOLOR/g, prefs.link_color);
  css = css.replace(/\$VISITEDCOLOR/g, prefs.visited_color);

  await browser.tabs.insertCSS(aID, {
    allFrames: true,
    cssOrigin: "user",
    code: css
  });
  gTabHasCSS[aID] = css;

  await UpdateUI(aID);
}

// Function to remove our CSS from the given tab.
async function RemoveCSS(aID) {
  if (!gTabHasCSS[aID])
    return;

  await browser.tabs.removeCSS(aID, {
    allFrames: true,
    cssOrigin: "user",
    code: gTabHasCSS[aID]
  });
  gTabHasCSS[aID] = false;

  await UpdateUI(aID);
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

// Fired if the page action is clicked.
function PageActionClicked(aTab) {
  ToggleCSS(aTab.id);
}

// Fired if tab is updated (page reload or link click). CSS is not reapplied
// in this case. As we want the CSS to stay, reload it.
async function TabUpdated(aID, aChangeInfo, aTab) {
  if (HasCSS(aTab.id))
    await InsertCSS(aTab.id);
  await CheckForAutoDisable(aTab.id);
  await UpdateUI(aTab.id);
}

// Fired if a new tab is activated.
async function TabActivated(aActiveInfo) {
  await CheckForAutoDisable(aActiveInfo.tabId);
  await UpdateUI(aActiveInfo.tabId);
}

// Checks if the given tab still is not registered in our "database"
// If so, and "auto-disable" is enabled, apply our CSS to this tab.
async function CheckForAutoDisable(aID) {
  const prefs = await Storage.get();
  if (HasCSS(aID) === undefined && prefs.auto_disable)
    await InsertCSS(aID);
}

// Updates user interface based on setting for the given tab id.
async function UpdateUI(aID) {
  let title = browser.i18n.getMessage("labelDisableWebsiteColors");
  let icon = "icons/colors_on.svg";
  if (HasCSS(aID)) {
    title = browser.i18n.getMessage("labelEnableWebsiteColors");
    icon = "icons/colors_off.svg";
  }

  if (browser.contextMenus !== undefined) // If not on Android
    await browser.contextMenus.update("toggle-colors-menu", {title: title});
  if (browser.pageAction.setIcon !== undefined) // If not on Android
    await browser.pageAction.setIcon({path: icon, tabId: aID});
  if (browser.pageAction.setTitle !== undefined) // If not on Android
    await browser.pageAction.setTitle({title: title, tabId: aID});
  await browser.pageAction.show(aID);
}

/*
 * Initialization
 */

// Register event listeners
browser.pageAction.onClicked.addListener(PageActionClicked);
browser.tabs.onUpdated.addListener(TabUpdated);
browser.tabs.onActivated.addListener(TabActivated);
browser.tabs.query({active: true, currentWindow: true}).then((aTabs) => {
  TabActivated({tabId: aTabs[0].id});
});

// Create our context menu
if (browser.contextMenus !== undefined) { // If not on Android
  browser.contextMenus.onClicked.addListener(ContextMenuClicked);

  browser.contextMenus.create({
    id: "toggle-colors-menu",
    title: browser.i18n.getMessage("labelDisableWebsiteColors"),
    contexts: ["page"]
  });
}
