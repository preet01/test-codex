const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const overlay = document.getElementById("overlay");
const restartButton = document.getElementById("restart");

const cellSize = 18;
const cols = Math.floor(canvas.width / cellSize);
const rows = Math.floor(canvas.height / cellSize);
const stepInterval = 130; // milliseconds per move

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = direction;
let food = { x: 10, y: 10 };
let score = 0;
let highScore = Number(localStorage.getItem("snake-ii-high-score")) || 0;
let lastStep = 0;
let gameOver = false;

function resetGame() {
  snake = [
    { x: Math.floor(cols / 2), y: Math.floor(rows / 2) },
    { x: Math.floor(cols / 2) - 1, y: Math.floor(rows / 2) },
    { x: Math.floor(cols / 2) - 2, y: Math.floor(rows / 2) },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  score = 0;
  gameOver = false;
  lastStep = 0;
  placeFood();
  overlay.classList.remove("visible");
  updateScore();
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

function drawFood() {
  ctx.fillStyle = "#f472b6";
  ctx.shadowColor = "#f472b6";
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(
    food.x * cellSize + cellSize / 2,
    food.y * cellSize + cellSize / 2,
    cellSize / 3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  drawSnake();
}

function loop(timestamp) {
  if (!lastStep) lastStep = timestamp;
  const delta = timestamp - lastStep;

  if (!gameOver && delta >= stepInterval) {
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
  gameOver = true;
  overlay.classList.add("visible");
}

function restart() {
  resetGame();
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && gameOver) {
    restart();
    return;
  }

  handleDirectionChange(event.key);
});

restartButton.addEventListener("click", restart);

resetGame();
requestAnimationFrame(loop);
