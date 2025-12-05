const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const speedEl = document.getElementById("speed");
const overlay = document.getElementById("overlay");
const startOverlay = document.getElementById("start-overlay");
const restartButton = document.getElementById("restart");
const playButton = document.getElementById("play");
const dPadButtons = Array.from(document.querySelectorAll("[data-dir]"));

const cellSize = 18;
const cols = Math.floor(canvas.width / cellSize);
const rows = Math.floor(canvas.height / cellSize);
const baseInterval = 140; // milliseconds per move at 1x speed

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = direction;
let food = { x: 10, y: 10 };
let score = 0;
let highScore = Number(localStorage.getItem("snake-ii-high-score")) || 0;
let lastStep = 0;
let stepInterval = baseInterval;
let gameState = "idle"; // idle | running | paused | over

function resetGame() {
  snake = [
    { x: Math.floor(cols / 2), y: Math.floor(rows / 2) },
    { x: Math.floor(cols / 2) - 1, y: Math.floor(rows / 2) },
    { x: Math.floor(cols / 2) - 2, y: Math.floor(rows / 2) },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  score = 0;
  gameState = "idle";
  lastStep = 0;
  stepInterval = baseInterval;
  placeFood();
  hideGameOver();
  showStart("Ready to hunt?", "Press Play or hit Space / Enter to begin.");
  updateScore();
  updateSpeed();
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
}

function updateSpeed() {
  const multiplier = Math.max(1, 1 + Math.floor(score / 4) * 0.15);
  stepInterval = baseInterval / multiplier;
  speedEl.textContent = `${multiplier.toFixed(2)}x`;
}

function step() {
  direction = nextDirection;
  const head = snake[0];
  const newHead = { x: head.x + direction.x, y: head.y + direction.y };

  if (isCollision(newHead)) {
    handleGameOver();
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += 1;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snake-ii-high-score", String(highScore));
    }
    placeFood();
    updateScore();
    updateSpeed();
    pulseCanvas();
  } else {
    snake.pop();
  }
}

function isCollision(point) {
  const outsideBounds =
    point.x < 0 || point.x >= cols || point.y < 0 || point.y >= rows;

  if (outsideBounds) return true;

  return snake.some((segment) => segment.x === point.x && segment.y === point.y);
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
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
  snake.forEach((segment, index) => {
    const gradient = ctx.createLinearGradient(
      segment.x * cellSize,
      segment.y * cellSize,
      segment.x * cellSize + cellSize,
      segment.y * cellSize + cellSize
    );
    gradient.addColorStop(0, "#22c55e");
    gradient.addColorStop(1, "#16a34a");

    ctx.fillStyle = index === 0 ? "#34d399" : gradient;
    ctx.strokeStyle = "#052e16";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(
      segment.x * cellSize + 1.5,
      segment.y * cellSize + 1.5,
      cellSize - 3,
      cellSize - 3,
      5
    );
    ctx.fill();
    ctx.stroke();
  });
}

function drawFood() {
  const pulse = 2 + Math.sin(Date.now() / 150) * 1.2;
  ctx.fillStyle = "#f472b6";
  ctx.shadowColor = "#f472b6";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(
    food.x * cellSize + cellSize / 2,
    food.y * cellSize + cellSize / 2,
    cellSize / pulse,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
}

function renderBackground() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "rgba(34, 197, 94, 0.06)");
  gradient.addColorStop(1, "rgba(59, 130, 246, 0.04)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderBackground();
  drawGrid();
  drawFood();
  drawSnake();
}

function loop(timestamp) {
  if (!lastStep) lastStep = timestamp;
  const delta = timestamp - lastStep;

  if (gameState === "running" && delta >= stepInterval) {
    step();
    lastStep = timestamp;
  }

  render();
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
  };

  const next = directions[key];
  if (!next) return;

  const isOpposite = next.x === -direction.x && next.y === -direction.y;
  if (!isOpposite) {
    nextDirection = next;
  }
}

function handleGameOver() {
  gameState = "over";
  overlay.classList.add("visible");
  startOverlay.classList.remove("visible");
}

function hideGameOver() {
  overlay.classList.remove("visible");
}

function showStart(title, subtitle) {
  startOverlay.querySelector("h2").textContent = title;
  startOverlay.querySelector("p").innerHTML = subtitle;
  startOverlay.classList.add("visible");
}

function play() {
  if (gameState === "over") {
    resetGame();
  }
  gameState = "running";
  startOverlay.classList.remove("visible");
  hideGameOver();
  lastStep = performance.now();
}

function togglePause() {
  if (gameState === "running") {
    gameState = "paused";
    showStart("Paused", "Hit Space or Play to keep slithering.");
  } else if (gameState === "paused") {
    play();
  } else if (gameState === "idle") {
    play();
  }
}

function pulseCanvas() {
  canvas.animate(
    [
      { filter: "drop-shadow(0 0 0px rgba(244, 114, 182, 0.0))" },
      { filter: "drop-shadow(0 0 16px rgba(244, 114, 182, 0.4))" },
      { filter: "drop-shadow(0 0 0px rgba(244, 114, 182, 0.0))" },
    ],
    { duration: 260, easing: "ease-out" }
  );
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && gameState === "over") {
    resetGame();
    play();
    return;
  }

  if (event.key === " " || event.key === "Spacebar") {
    event.preventDefault();
    if (gameState === "over") {
      resetGame();
    }
    togglePause();
    return;
  }

  if (event.key === "Enter" && (gameState === "idle" || gameState === "paused")) {
    play();
    return;
  }

  handleDirectionChange(event.key);
});

restartButton.addEventListener("click", () => {
  resetGame();
  play();
});

playButton.addEventListener("click", () => {
  if (gameState === "over") resetGame();
  play();
});

dPadButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    handleDirectionChange(btn.dataset.dir);
    if (gameState === "idle") play();
  });
});

resetGame();
requestAnimationFrame(loop);
