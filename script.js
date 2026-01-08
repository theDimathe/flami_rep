const screens = Array.from(document.querySelectorAll(".screen"));
const progressBars = document.querySelectorAll(".progress__bar");
const topicContinueButton = document.querySelector("[data-topic-continue]");
const nameInput = document.querySelector("[data-name-input]");
const nameContinueButton = document.querySelector("[data-name-continue]");
const randomNameButton = document.querySelector("[data-random-name]");
const voiceCards = Array.from(document.querySelectorAll("[data-voice-option]"));
const loadingScreen = document.querySelector("[data-loading-screen]");
const loadingItems = Array.from(document.querySelectorAll(".loading-item"));
const resultModal = document.querySelector("[data-result-modal]");
let currentScreen = 0;
let activeAudio = null;
let loadingAnimationFrame = null;

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

const setActiveVoice = (card) => {
  if (!card) return;
  voiceCards.forEach((item) => item.classList.remove("is-selected"));
  card.classList.add("is-selected");
};

const playVoiceSample = (card) => {
  const audioSource = card?.dataset.audio;
  if (!audioSource) return;

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }

  const audio = new Audio(audioSource);
  activeAudio = audio;
  audio.play().catch(() => {});
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

const resetLoadingItems = () => {
  loadingItems.forEach((item) => {
    const bar = item.querySelector(".loading-item__bar span");
    const percent = item.querySelector(".loading-item__percent");
    item.classList.remove("is-complete");
    if (bar) bar.style.width = "0%";
    if (percent) percent.textContent = "0%";
    if (bar) {
      bar.style.animation = "none";
      bar.offsetHeight;
      bar.style.animation = "";
    }
  });
};

const startLoadingAnimation = () => {
  if (!loadingItems.length) return;
  if (loadingAnimationFrame) {
    cancelAnimationFrame(loadingAnimationFrame);
  }

  resetLoadingItems();
  if (resultModal) {
    resultModal.classList.remove("is-visible");
  }

  const configs = [
    { duration: 4200, easing: (t) => 1 - Math.pow(1 - t, 3) },
    { duration: 5600, easing: (t) => 1 - Math.pow(1 - t, 4) },
    { duration: 6700, easing: (t) => (1 - Math.cos(Math.PI * t)) / 2 },
  ];

  const startTime = performance.now();
  const maxDuration = Math.max(...configs.map((config) => config.duration));
  let completedCount = 0;

  const tick = (now) => {
    const elapsed = now - startTime;
    loadingItems.forEach((item, index) => {
      const config = configs[index] || configs[configs.length - 1];
      const bar = item.querySelector(".loading-item__bar span");
      const percent = item.querySelector(".loading-item__percent");
      const progress = Math.min(elapsed / config.duration, 1);
      const eased = config.easing(progress);
      const percentValue = Math.round(eased * 100);
      if (bar) bar.style.width = `${percentValue}%`;
      if (percent) percent.textContent = `${percentValue}%`;
      if (progress >= 1 && !item.classList.contains("is-complete")) {
        item.classList.add("is-complete");
        completedCount += 1;
        if (completedCount === loadingItems.length && resultModal) {
          resultModal.classList.add("is-visible");
        }
      }
    });

    if (elapsed < maxDuration) {
      loadingAnimationFrame = requestAnimationFrame(tick);
    } else {
      loadingAnimationFrame = null;
    }
  };

  loadingAnimationFrame = requestAnimationFrame(tick);
};

const showScreen = (index) => {
  screens[currentScreen].classList.remove("screen--active");
  currentScreen = Math.max(0, Math.min(index, screens.length - 1));
  screens[currentScreen].classList.add("screen--active");
  updateProgress();
  updateStepParam();
  if (screens[currentScreen] === loadingScreen) {
    startLoadingAnimation();
  }
};

document.body.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  const multiSelect = chip?.closest("[data-multi-select]");
  const nextButton = event.target.closest("[data-next]");
  const backButton = event.target.closest("[data-back]");
  const randomButton = event.target.closest("[data-random-name]");
  const voiceOption = event.target.closest("[data-voice-option]");
  const modalNext = event.target.closest("[data-modal-next]");

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

  if (voiceOption) {
    setActiveVoice(voiceOption);
    playVoiceSample(voiceOption);
    return;
  }

  if (modalNext) {
    if (resultModal) {
      resultModal.classList.remove("is-visible");
    }
    showScreen(currentScreen + 1);
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
if (screens[currentScreen] === loadingScreen) {
  startLoadingAnimation();
}
