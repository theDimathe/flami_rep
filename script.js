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
const planCards = Array.from(document.querySelectorAll(".plan-card"));
const metrikaCounterId = 106180606;
let currentScreen = 0;
let activeAudio = null;
let activeVoiceCard = null;
let loadingAnimationFrame = null;
const sentStepGoals = new Set();
const pendingStepGoals = new Set();
let ymFlushTimer = null;
let ymFlushAttempts = 0;
const YM_RETRY_INTERVAL_MS = 350;
const YM_MAX_RETRY_ATTEMPTS = 30;

const DEFAULT_FUNNEL_GOALS_BY_STEP = {
  0: "quiz_step_0",
  1: "quiz_step_1",
  2: "quiz_step_2",
  3: "quiz_step_3",
  4: "quiz_step_4",
  5: "quiz_step_5",
  6: "quiz_step_6",
  7: "quiz_step_7",
  8: "quiz_step_8",
  9: "quiz_step_9",
  10: "quiz_step_10",
  11: "quiz_step_11",
  12: "quiz_step_12",
  13: "quiz_step_13",
};

const searchParams = new URLSearchParams(window.location.search);

const getStepGoalFromQuery = (step) => {
  const stepString = String(step);
  const stepNumber = Number.parseInt(stepString, 10);

  const direct = searchParams.get(`goal_step_${stepString}`);
  if (direct) return direct;

  if (Number.isFinite(stepNumber)) {
    const oneBased = searchParams.get(`goal_step_${stepNumber + 1}`);
    if (oneBased) return oneBased;
  }

  return null;
};

const FUNNEL_GOALS_BY_STEP = Object.keys(DEFAULT_FUNNEL_GOALS_BY_STEP).reduce(
  (acc, step) => {
    acc[step] = getStepGoalFromQuery(step) || DEFAULT_FUNNEL_GOALS_BY_STEP[step];
    return acc;
  },
  {},
);

const isYmReady = () => typeof window.ym === "function";

const flushPendingStepGoals = () => {
  if (!isYmReady()) return false;

  pendingStepGoals.forEach((step) => {
    const goalId = FUNNEL_GOALS_BY_STEP[String(step)] || getStepGoalFromQuery(step);
    if (!goalId || sentStepGoals.has(String(step))) {
      pendingStepGoals.delete(step);
      return;
    }

    window.ym(metrikaCounterId, "reachGoal", goalId, {
      quiz_step: String(step),
    });

    sentStepGoals.add(String(step));
    pendingStepGoals.delete(step);
  });

  return true;
};

const schedulePendingStepGoalsFlush = () => {
  if (ymFlushTimer) return;

  ymFlushTimer = window.setInterval(() => {
    ymFlushAttempts += 1;

    if (flushPendingStepGoals() || ymFlushAttempts >= YM_MAX_RETRY_ATTEMPTS) {
      window.clearInterval(ymFlushTimer);
      ymFlushTimer = null;
      ymFlushAttempts = 0;
    }
  }, YM_RETRY_INTERVAL_MS);
};

const sendStepGoal = (step) => {
  const goalId = FUNNEL_GOALS_BY_STEP[String(step)] || getStepGoalFromQuery(step);
  if (!goalId || sentStepGoals.has(String(step))) return;

  if (!isYmReady()) {
    pendingStepGoals.add(String(step));
    schedulePendingStepGoalsFlush();
    return;
  }

  window.ym(metrikaCounterId, "reachGoal", goalId, {
    quiz_step: String(step),
  });

  sentStepGoals.add(String(step));
  pendingStepGoals.delete(String(step));
};

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

const getSelectedPlanCard = () =>
  planCards.find((card) => card.classList.contains("plan-card--active")) || null;

const getSelectedPlanPrice = () => {
  const selectedCard = getSelectedPlanCard();
  const priceNode = selectedCard?.querySelector(".plan-card__price-new");
  if (!priceNode) return null;
  const parsed = Number.parseFloat(priceNode.textContent.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed.toFixed(2) : null;
};

const setActivePlan = (card) => {
  if (!card) return;
  planCards.forEach((item) => item.classList.toggle("plan-card--active", item === card));
};

const setActiveVoice = (card) => {
  if (!card) return;
  voiceCards.forEach((item) => item.classList.remove("is-selected"));
  card.classList.add("is-selected");
};

const setVoicePlayIcon = (card, isPlaying) => {
  const playIcon = card?.querySelector(".voice-card__play");
  if (!playIcon) return;
  playIcon.textContent = isPlaying ? "⏸" : "▶";
  playIcon.classList.toggle("is-pause", isPlaying);
};

const resetVoicePlayback = () => {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }

  if (activeVoiceCard) {
    setVoicePlayIcon(activeVoiceCard, false);
    activeVoiceCard = null;
  }
};

const playVoiceSample = (card) => {
  const audioSource = card?.dataset.audio;
  if (!audioSource) return;

  if (activeAudio && activeVoiceCard === card) {
    resetVoicePlayback();
    return;
  }

  resetVoicePlayback();

  const audio = new Audio(audioSource);
  activeAudio = audio;
  activeVoiceCard = card;
  setVoicePlayIcon(card, true);

  audio.addEventListener("ended", () => {
    if (activeAudio === audio) {
      resetVoicePlayback();
    }
  });

  audio.play().catch(() => {
    if (activeAudio === audio) {
      resetVoicePlayback();
    }
  });
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
  const step = screens[currentScreen]?.dataset.screen ?? String(currentScreen);
  sendStepGoal(step);
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
  const paypageLink = event.target.closest("[data-paypage-link]");
  const planCard = event.target.closest(".plan-card");

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

  if (planCard) {
    setActivePlan(planCard);
    return;
  }

  if (paypageLink) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("quizStep", String(currentScreen));
    params.set("quiz_step", String(currentScreen));

    const selectedPrice = getSelectedPlanPrice();
    if (selectedPrice) {
      params.set("price", selectedPrice);
    }

    window.location.href = `paypage.html?${params.toString()}`;
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

const initialStep = Number(searchParams.get("step"));

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
const initialScreenStep = screens[currentScreen]?.dataset.screen ?? String(currentScreen);
sendStepGoal(initialScreenStep);
window.addEventListener("load", flushPendingStepGoals);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    flushPendingStepGoals();
  }
});
if (screens[currentScreen] === loadingScreen) {
  startLoadingAnimation();
}
