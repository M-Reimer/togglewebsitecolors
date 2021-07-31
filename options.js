
async function ColorChanged(e) {
  if (e.target.id.match(/([a-z]+_color)_chooser/)) {
    let pref = RegExp.$1;
    let params = {};
    params[pref] = e.target.value;
    await browser.storage.local.set(params);
  }
}

async function CheckboxChanged(e) {
  if (e.target.id.match(/([a-z_]+)_checkbox/)) {
    let pref = RegExp.$1;
    let params = {};
    params[pref] = e.target.checked;
    await browser.storage.local.set(params);
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
  browser.storage.local.get().then((result) => {
    const background = result.background_color || "#FFFFFF";
    const text = result.text_color || "#000000";
    const link = result.link_color || "#0000EE";
    const visited = result.visited_color || "#551A8B";
    const autodisable = result.auto_disable || false;

    document.querySelector("#background_color_chooser").value = background;
    document.querySelector("#text_color_chooser").value = text;
    document.querySelector("#link_color_chooser").value = link;
    document.querySelector("#visited_color_chooser").value = visited;

    document.querySelector("#auto_disable_checkbox").checked = autodisable;
  });
}

init();
