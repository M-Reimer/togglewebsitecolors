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

async function ColorChanged(e) {
  if (e.target.id.match(/([a-z]+_color)_chooser/)) {
    let pref = RegExp.$1;
    let params = {};
    params[pref] = e.target.value;
    await Storage.set(params);
  }
}

async function CheckboxChanged(e) {
  if (e.target.id.match(/([a-z_]+)_checkbox/)) {
    let pref = RegExp.$1;
    let params = {};
    params[pref] = e.target.checked;
    await Storage.set(params);
  }
}

function init() {
  [
    "general_headline",
    "auto_disable_label",
    "textcolors_headline",
    "text_color_label",
    "background_color_label",
    "linkcolors_headline",
    "link_color_label",
    "visited_color_label"
  ].forEach((id) => {
    document.querySelector("#" + id).textContent = browser.i18n.getMessage(id);
  });

  loadOptions();

  let colorchoosers = document.querySelectorAll('input[type="color"]');
  colorchoosers.forEach((chooser) => {
    chooser.addEventListener("change", ColorChanged);
  });
  document.querySelector("#auto_disable_checkbox").addEventListener("change", CheckboxChanged);
}

function loadOptions() {
  Storage.get().then((prefs) => {
    document.querySelector("#background_color_chooser").value = prefs.background_color;
    document.querySelector("#text_color_chooser").value = prefs.text_color;
    document.querySelector("#link_color_chooser").value = prefs.link_color;
    document.querySelector("#visited_color_chooser").value = prefs.visited_color;

    document.querySelector("#auto_disable_checkbox").checked = prefs.auto_disable;
  });
}

init();
