const screens = Array.from(document.querySelectorAll(".screen"));
const progressBars = document.querySelectorAll(".progress__bar");
let currentScreen = 0;

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
};

document.body.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  const multiSelect = chip?.closest("[data-multi-select]");
  const nextButton = event.target.closest("[data-next]");
  const backButton = event.target.closest("[data-back]");

  if (chip && multiSelect) {
    chip.classList.toggle("is-selected");
    return;
  }

  if (nextButton) {
    showScreen(currentScreen + 1);
  }

  if (backButton) {
    showScreen(currentScreen - 1);
  }
});

updateProgress();
