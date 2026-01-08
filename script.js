const screens = Array.from(document.querySelectorAll(".screen"));
const progressBars = document.querySelectorAll(".progress__bar");
const topicContinueButton = document.querySelector("[data-topic-continue]");
const nameInput = document.querySelector("[data-name-input]");
const nameContinueButton = document.querySelector("[data-name-continue]");
const randomNameButton = document.querySelector("[data-random-name]");
let currentScreen = 0;

const randomNames = [
  "Sofia",
  "Mila",
  "Aria",
  "Luna",
  "Nora",
  "Chloe",
  "Aurora",
  "Ivy",
  "Lila",
  "Eva",
  "Zara",
  "Freya",
  "Maya",
  "Elara",
  "Amara",
  "Sage",
  "Nova",
  "Tessa",
  "Lyra",
  "Naomi",
  "Ariana",
  "Isla",
  "Stella",
  "Gia",
  "Hazel",
  "Vera",
  "Phoebe",
  "Cleo",
  "Selene",
  "Yara",
  "Rhea",
];

const updateStepParam = () => {
  const url = new URL(window.location.href);
  url.searchParams.set("step", String(currentScreen));
  window.history.replaceState({}, "", url);
};

const setButtonEnabled = (button, enabled) => {
  if (!button) return;
  button.disabled = !enabled;
  button.classList.toggle("primary-button--muted", !enabled);
};

const updateTopicContinue = () => {
  if (!topicContinueButton) return;
  const hasSelection =
    document.querySelectorAll("[data-multi-select] .chip.is-selected").length > 0;
  setButtonEnabled(topicContinueButton, hasSelection);
};

const updateNameContinue = () => {
  if (!nameInput || !nameContinueButton) return;
  const hasName = nameInput.value.trim().length > 0;
  setButtonEnabled(nameContinueButton, hasName);
};

const updateProgress = () => {
  const screen = screens[currentScreen];
  const progress = screen.dataset.progress;
  progressBars.forEach((bar) => {
    if (!progress) {
      bar.style.width = "0%";
    } else {
      bar.style.width = `${Math.round(Number(progress) * 100)}%`;
    }
  });
};

const showScreen = (index) => {
  screens[currentScreen].classList.remove("screen--active");
  currentScreen = Math.max(0, Math.min(index, screens.length - 1));
  screens[currentScreen].classList.add("screen--active");
  updateProgress();
  updateStepParam();
};

document.body.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  const multiSelect = chip?.closest("[data-multi-select]");
  const nextButton = event.target.closest("[data-next]");
  const backButton = event.target.closest("[data-back]");
  const randomButton = event.target.closest("[data-random-name]");

  if (chip && multiSelect) {
    chip.classList.toggle("is-selected");
    updateTopicContinue();
    return;
  }

  if (randomButton && nameInput) {
    const randomName =
      randomNames[Math.floor(Math.random() * randomNames.length)];
    nameInput.value = randomName;
    nameInput.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }

  if (nextButton) {
    showScreen(currentScreen + 1);
  }

  if (backButton) {
    showScreen(currentScreen - 1);
  }
});

const initialStep = Number(new URLSearchParams(window.location.search).get("step"));

if (!Number.isNaN(initialStep)) {
  currentScreen = Math.max(0, Math.min(initialStep, screens.length - 1));
  screens.forEach((screen) => screen.classList.remove("screen--active"));
  screens[currentScreen].classList.add("screen--active");
}

if (nameInput) {
  nameInput.addEventListener("input", updateNameContinue);
}

updateProgress();
updateStepParam();
updateTopicContinue();
updateNameContinue();
