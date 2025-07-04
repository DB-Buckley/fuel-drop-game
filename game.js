const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
let PLAY_AREA_WIDTH = isMobile ? canvas.width * 0.95 : canvas.width * 0.6;
let PLAY_AREA_LEFT = (canvas.width - PLAY_AREA_WIDTH) / 2;

let car = {
  x: PLAY_AREA_LEFT + PLAY_AREA_WIDTH / 2 - 30,
  y: canvas.height - 100,
  width: 60,
  height: 30,
  speed: 7
};

let drops = [];
let dropSpeed = 2;
let spawnInterval = 1500;
let lastSpawn = performance.now();

let score = 0;
let missedDrops = 0;
let gameOver = false;
let gameStarted = false;
let playerName = "";
let highScore = 0;

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawText(text, x, y, size = 20, center = false, color = "#fff") {
  ctx.fillStyle = color;
  ctx.font = `${size}px Arial`;
  ctx.textAlign = center ? "center" : "left";
  ctx.fillText(text, x, y);
}

function drawCar() {
  ctx.fillStyle = "yellow";
  ctx.fillRect(car.x, car.y, car.width, car.height);
}

function drawDrop(drop) {
  ctx.beginPath();
  ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
  ctx.fillStyle = drop.bonus ? "blue" : drop.slowDown ? "green" : "red";
  ctx.fill();
}

function drawTopUI() {
  drawText(`Score: ${score}`, 20, 30);
  drawText(`Missed: ${missedDrops}`, 20, 60);
}

function drawPlayAreaFrame() {
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 2;
  ctx.strokeRect(PLAY_AREA_LEFT, 0, PLAY_AREA_WIDTH, canvas.height);
}

function drawStartScreen() {
  clearCanvas();
  drawText("Mzansi Fuel Drop", canvas.width / 2, 100, 32, true);
  drawText("Enter your name to begin:", canvas.width / 2, 160, 20, true);
  drawText(playerName + "_", canvas.width / 2, 200, 24, true);
}

function drawGameOver() {
  drawText("Game Over", canvas.width / 2, canvas.height / 2 - 40, 36, true);
  drawText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2, 24, true);
  drawText(`Tap to Retry`, canvas.width / 2, canvas.height / 2 + 40, 24, true);
}

function spawnDrop() {
  console.log("Drop spawned");

  const rand = Math.random();
  drops.push({
    x: PLAY_AREA_LEFT + Math.random() * (PLAY_AREA_WIDTH - 20),
    y: -20,
    radius: 10,
    bonus: rand < 0.1,
    slowDown: rand >= 0.1 && rand < 0.12
  });
}

function updateDrops() {
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.y += dropSpeed;

    if (
      d.y + d.radius > car.y &&
      d.y - d.radius < car.y + car.height &&
      d.x > car.x &&
      d.x < car.x + car.width
    ) {
      score += d.bonus ? 30 : 10;
      drops.splice(i, 1);
    } else if (d.y > canvas.height) {
      missedDrops++;
      drops.splice(i, 1);
      if (missedDrops >= 10) {
        gameOver = true;
        if (score > highScore) highScore = score;
      }
    }
  }
}

function mainLoop() {
  clearCanvas();

  if (!gameStarted) {
    drawStartScreen();
  } else if (gameOver) {
    drawGameOver();
  } else {
    drawPlayAreaFrame();
    drawTopUI();
    drawCar();
    drops.forEach(drawDrop);

    if (performance.now() - lastSpawn > spawnInterval) {
      spawnDrop();
      lastSpawn = performance.now();
    }

    updateDrops();
  }

  requestAnimationFrame(mainLoop);
}

function startGame() {
  gameStarted = true;
  gameOver = false;
  score = 0;
  missedDrops = 0;
  drops = [];
  lastSpawn = performance.now();
  car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH / 2 - car.width / 2;
}

// INPUT
document.addEventListener("keydown", e => {
  if (!gameStarted && !gameOver && /^[a-zA-Z0-9 ]$/.test(e.key)) {
    if (playerName.length < 12) playerName += e.key;
  } else if (!gameStarted && !gameOver && e.key === "Backspace") {
    playerName = playerName.slice(0, -1);
  } else if (!gameStarted && !gameOver && e.key === "Enter" && playerName.length > 0) {
    startGame();
  }

  if (["ArrowLeft", "a", "A"].includes(e.key)) car.x -= car.speed;
  if (["ArrowRight", "d", "D"].includes(e.key)) car.x += car.speed;
});

canvas.addEventListener("click", () => {
  if (gameOver) startGame();
});

mainLoop();

let isDragging = false;
let dragOffsetX = 0;

canvas.addEventListener("mousedown", (e) => {
  if (!gameStarted || gameOver) return;

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  if (
    mouseX >= car.x &&
    mouseX <= car.x + car.width &&
    mouseY >= car.y &&
    mouseY <= car.y + car.height
  ) {
    isDragging = true;
    dragOffsetX = mouseX - car.x;
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    car.x = e.clientX - dragOffsetX;
    // Keep within bounds
    car.x = Math.max(PLAY_AREA_LEFT, Math.min(car.x, PLAY_AREA_LEFT + PLAY_AREA_WIDTH - car.width));
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
});

// 🟦 Touch controls for mobile
canvas.addEventListener("touchstart", (e) => {
  if (!gameStarted || gameOver) return;
  const touch = e.touches[0];
  const touchX = touch.clientX;
  const touchY = touch.clientY;

  if (
    touchX >= car.x &&
    touchX <= car.x + car.width &&
    touchY >= car.y &&
    touchY <= car.y + car.height
  ) {
    isDragging = true;
    dragOffsetX = touchX - car.x;
  }
});

canvas.addEventListener("touchmove", (e) => {
  if (isDragging) {
    const touch = e.touches[0];
    car.x = touch.clientX - dragOffsetX;
    car.x = Math.max(PLAY_AREA_LEFT, Math.min(car.x, PLAY_AREA_LEFT + PLAY_AREA_WIDTH - car.width));
  }
});

canvas.addEventListener("touchend", () => {
  isDragging = false;
});

