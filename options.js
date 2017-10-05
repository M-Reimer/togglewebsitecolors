
async function ColorChanged(e) {
  if (e.target.id.match(/([a-z]+_color)_chooser/)) {
    let pref = RegExp.$1;
    let params = {};
    params[pref] = e.target.value;
    await browser.storage.local.set(params);
  }
}

async function CheckboxChanged(e) {
  await browser.storage.local.set({
    auto_disable: e.target.checked
  });
}

function init() {
  /*
  document.querySelector("#imageformat_headline").textContent = browser.i18n.getMessage("imageformat_headline_label");
  document.querySelector("#region_headline").textContent = browser.i18n.getMessage("region_headline_label");
  document.querySelector("#format_manual_label").textContent = browser.i18n.getMessage("select_manually_label");
  document.querySelector("#region_manual_label").textContent = browser.i18n.getMessage("select_manually_label");
  document.querySelector("#region_full_label").textContent = browser.i18n.getMessage("fullpage");
  document.querySelector("#region_viewport_label").textContent = browser.i18n.getMessage("viewport");
  */

  loadOptions();

  let colorchoosers = document.querySelectorAll('input[type="color"]');
  colorchoosers.forEach((chooser) => {
    chooser.addEventListener("change", ColorChanged);
  });
  document.querySelector("#auto_disable_checkbox").addEventListener("change", CheckboxChanged);
}

function loadOptions() {
  browser.storage.local.get().then((result) => {
    let background = result.background_color || "#FFFFFF";
    let text = result.text_color || "#000000";
    let link = result.link_color || "#0000EE";
    let visited = result.link_color || "#551A8B";
    let autodisable = result.auto_disable || false;

    document.querySelector("#background_color_chooser").value = background;
    document.querySelector("#text_color_chooser").value = text;
    document.querySelector("#link_color_chooser").value = link;
    document.querySelector("#visited_color_chooser").value = visited;

    document.querySelector("#auto_disable_checkbox").checked = autodisable;
  });
}

init();
