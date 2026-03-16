const thickness = document.getElementById("thickness");
const thicknessVal = document.getElementById("thickness-val");
const pulse = document.getElementById("pulse");
const enabled = document.getElementById("enabled");
const save = document.getElementById("save");

function updateLabel() {
  thicknessVal.textContent = `${thickness.value}px`;
}
thickness.addEventListener("input", updateLabel);

async function load() {
  const { settings = {} } = await chrome.storage.sync.get("settings");
  thickness.value = settings.thickness ?? 8;
  pulse.checked = settings.pulse ?? false;
  enabled.checked = settings.enabled ?? true;
  updateLabel();
}

save.addEventListener("click", async () => {
  const settings = {
    thickness: Number(thickness.value),
    pulse: pulse.checked,
    enabled: enabled.checked
  };
  await chrome.storage.sync.set({ settings });
});

load();
