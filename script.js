const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const lengthEl = document.getElementById("length");
const speedEl = document.getElementById("speed");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const restartButton = document.getElementById("restart");
const touchButtons = document.querySelectorAll(".touch-button");

const cellSize = 18;
const cols = Math.floor(canvas.width / cellSize);
const rows = Math.floor(canvas.height / cellSize);
const baseInterval = 140; // milliseconds per move at speed 1.0
const intervalStep = 6; // decrease per ramp
const intervalRampEvery = 4; // points per ramp
const minInterval = 70;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = direction;
let food = { x: 10, y: 10 };
let score = 0;
let highScore = Number(localStorage.getItem("snake-ii-high-score")) || 0;
let lastStep = 0;
let state = "idle"; // idle | running | paused | gameover
let shakeUntil = 0;

function resetGame() {
  snake = [
    { x: Math.floor(cols / 2), y: Math.floor(rows / 2) },
    { x: Math.floor(cols / 2) - 1, y: Math.floor(rows / 2) },
    { x: Math.floor(cols / 2) - 2, y: Math.floor(rows / 2) },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  score = 0;
  state = "idle";
  lastStep = 0;
  shakeUntil = 0;
  placeFood();
  updateScore();
  showOverlay("Ready?", "Press Space, Enter, or tap to begin.", true);
}

function placeFood() {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
  let x;
  let y;
  do {
    x = Math.floor(Math.random() * cols);
    y = Math.floor(Math.random() * rows);
  } while (occupied.has(`${x},${y}`));
  food = { x, y };
}

function updateScore() {
  scoreEl.textContent = score.toString();
  highScoreEl.textContent = highScore.toString();
  lengthEl.textContent = snake.length.toString();
  speedEl.textContent = `${getSpeedMultiplier().toFixed(1)}x`;
}

function getSpeedMultiplier() {
  return baseInterval / getCurrentInterval();
}

function getCurrentInterval() {
  const ramps = Math.floor(score / intervalRampEvery);
  const reduction = ramps * intervalStep;
  return Math.max(baseInterval - reduction, minInterval);
}

function step() {
  direction = nextDirection;
  const head = snake[0];
  const newHead = { x: head.x + direction.x, y: head.y + direction.y };
  const willGrow = newHead.x === food.x && newHead.y === food.y;

  if (isCollision(newHead, willGrow)) {
    handleGameOver();
    return;
  }

  snake.unshift(newHead);

  if (willGrow) {
    score += 1;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snake-ii-high-score", String(highScore));
    }
    placeFood();
  } else {
    snake.pop();
  }

  updateScore();
}

function isCollision(point, willGrow) {
  const outsideBounds =
    point.x < 0 || point.x >= cols || point.y < 0 || point.y >= rows;

  if (outsideBounds) return true;

  const segmentsToCheck = willGrow ? snake : snake.slice(0, -1);
  return segmentsToCheck.some((segment) => segment.x === point.x && segment.y === point.y);
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize + 0.5, 0);
    ctx.lineTo(x * cellSize + 0.5, rows * cellSize);
    ctx.stroke();
  }
  for (let y = 0; y <= rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize + 0.5);
    ctx.lineTo(cols * cellSize, y * cellSize + 0.5);
    ctx.stroke();
  }
}

function drawSnake() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#22c55e");
  gradient.addColorStop(1, "#16a34a");

  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#34d399" : gradient;
    ctx.strokeStyle = "#052e16";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(
      segment.x * cellSize + 1.5,
      segment.y * cellSize + 1.5,
      cellSize - 3,
      cellSize - 3,
      4
    );
    ctx.fill();
    ctx.stroke();
  });
}

function drawFood(timestamp) {
  const pulse = (Math.sin(timestamp / 200) + 1) / 2; // 0..1
  const radius = cellSize / 3 + pulse * 2;
  ctx.fillStyle = "#f472b6";
  ctx.shadowColor = "#f472b6";
  ctx.shadowBlur = 12 + pulse * 10;
  ctx.beginPath();
  ctx.arc(
    food.x * cellSize + cellSize / 2,
    food.y * cellSize + cellSize / 2,
    radius,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
}

function render(timestamp = 0) {
  ctx.save();
  if (shakeUntil && timestamp < shakeUntil) {
    const intensity = 3;
    const offsetX = (Math.random() - 0.5) * intensity;
    const offsetY = (Math.random() - 0.5) * intensity;
    ctx.translate(offsetX, offsetY);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood(timestamp);
  drawSnake();
  ctx.restore();
}

function loop(timestamp) {
  if (!lastStep) lastStep = timestamp;
  const delta = timestamp - lastStep;

  if (state === "running" && delta >= getCurrentInterval()) {
    step();
    lastStep = timestamp;
  }

  render(timestamp);
  requestAnimationFrame(loop);
}

function handleDirectionChange(key) {
  const directions = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  const next = directions[key];
  if (!next) return;

  const isOpposite = next.x === -direction.x && next.y === -direction.y;
  if (!isOpposite) {
    nextDirection = next;
    if (state === "idle") startGame();
    if (state === "paused") togglePause();
  }
}

function handleGameOver() {
  state = "gameover";
  shakeUntil = performance.now() + 300;
  showOverlay("Game Over", `Score ${score} • Length ${snake.length}`, true);
}

function startGame() {
  state = "running";
  overlay.classList.remove("visible");
}

function togglePause() {
  if (state === "running") {
    state = "paused";
    showOverlay("Paused", "Press Space to resume.", true);
  } else if (state === "paused") {
    state = "running";
    overlay.classList.remove("visible");
  }
}

function restart() {
  resetGame();
}

function showOverlay(title, text, visible) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.toggle("visible", visible);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (state === "gameover") {
      restart();
    } else if (state === "idle") {
      startGame();
    }
    return;
  }

  if (event.key === " " && state !== "idle") {
    togglePause();
    return;
  }

  handleDirectionChange(event.key);
});

canvas.addEventListener("click", () => {
  if (state === "idle") {
    startGame();
  } else if (state === "gameover") {
    restart();
  }
});

restartButton.addEventListener("click", () => {
  restart();
});

touchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const dir = button.dataset.dir;
    handleDirectionChange(dir || "");
  });
});

resetGame();
requestAnimationFrame(loop);
