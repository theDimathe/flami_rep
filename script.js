const countdownNode = document.getElementById('countdown');
let remainingSeconds = 5 * 60;

const formatTime = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const sec = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${sec}`;
};

const tick = () => {
  countdownNode.textContent = formatTime(remainingSeconds);

  if (remainingSeconds <= 0) {
    clearInterval(timerId);
    return;
  }

  remainingSeconds -= 1;
};

tick();
const timerId = setInterval(tick, 1000);
