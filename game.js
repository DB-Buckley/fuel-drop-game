// Mzansi Fuel Drop - Basic Working Version (No images, no leaderboard)
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
  speed: 7,
  dx: 0,
  color: '#F5A623'
};

let drops = [];
let dropSpeed = 2;
let spawnInterval = 1500;
let lastSpawn = performance.now();

let score = 0;
let missedDrops = 0;
const maxMisses = 10;
let gameOver = false;
let gameStarted = false;

let bonusActive = false;
let bonusTimer = 0;
const bonusDuration = 8000;

let showBonusBanner = false;
let showFuelPriceBanner = false;
let fuelPriceBannerTimer = 0;
const fuelPriceBannerDuration = 3000;

let showFuelDecreaseBanner = false;
let fuelDecreaseTimer = 0;
const fuelDecreaseBannerDuration = 2000;

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawText(text, x, y, size = 20, center = false, color = "#fff") {
  ctx.fillStyle = color;
  ctx.font = `${size}px Arial`;
  ctx.textAlign = center ? 'center' : 'left';
  ctx.fillText(text, x, y);
}

function drawCar() {
  ctx.fillStyle = car.color;
  ctx.fillRect(car.x, car.y, car.width, car.height);
}

function drawDrop(drop) {
  ctx.beginPath();
  ctx.fillStyle = drop.bonus ? '#00CFFF' : drop.slowDown ? '#0F0' : '#F5A623';
  ctx.moveTo(drop.x, drop.y);
  ctx.bezierCurveTo(drop.x + 10, drop.y + 15, drop.x - 10, drop.y + 15, drop.x, drop.y);
  ctx.arc(drop.x, drop.y + 10, 10, Math.PI, 0, false);
  ctx.fill();
}

function drawTopUI() {
  drawText(`Score: ${score}`, canvas.width / 2, 30, 20, true);
  drawText(`Missed: ${missedDrops}/${maxMisses}`, canvas.width / 2, 60, 20, true);
}

function drawBanners() {
  if (showBonusBanner) drawText("Bonus Round Active!", canvas.width / 2, 100, 24, true, '#00CFFF');
  if (showFuelPriceBanner) drawText("Fuel Price Increased!", canvas.width / 2, 130, 24, true, '#F5A623');
  if (showFuelDecreaseBanner) drawText("Fuel Price Decreased!", canvas.width / 2, 160, 24, true, '#0F0');
}

function spawnDrop() {
  if (gameOver) return;

  drops.push({
    x: PLAY_AREA_LEFT + Math.random() * (PLAY_AREA_WIDTH - 20),
    y: -20,
    bonus: Math.random() < 0.1 && !bonusActive,
    slowDown: Math.random() >= 0.1 && Math.random() < 0.12
  });
}

function updateDrops() {
  for (let i = drops.length - 1; i >= 0; i--) {
    const drop = drops[i];
    drop.y += dropSpeed;

    // Check collision with car
    if (
      drop.y + 10 > car.y &&
      drop.y - 10 < car.y + car.height &&
      drop.x > car.x &&
      drop.x < car.x + car.width
    ) {
      score += drop.bonus ? 30 : 10;
      if (drop.slowDown) {
        dropSpeed = Math.max(dropSpeed * 0.9, 1);
        showFuelDecreaseBanner = true;
        fuelDecreaseTimer = performance.now();
      }
      if (drop.bonus) {
        bonusActive = true;
        bonusTimer = performance.now();
        showBonusBanner = true;
      }
      drops.splice(i, 1);
    } else if (drop.y > canvas.height) {
      if (!drop.bonus && !drop.slowDown) {
        missedDrops++;
        if (missedDrops >= maxMisses) {
          gameOver = true;
        }
      }
      drops.splice(i, 1);
    }
  }
}

function mainLoop() {
  clearCanvas();

  if (!gameStarted) {
    drawText("Mzansi Fuel Drop", canvas.width / 2, 100, 36, true);
    drawText("Press Enter to Start", canvas.width / 2, 140, 24, true);
  } else if (gameOver) {
    drawText("Game Over", canvas.width / 2, canvas.height / 2 - 40, 36, true);
    drawText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2, 24, true);
    drawText("Click to Restart", canvas.width / 2, canvas.height / 2 + 40, 24, true);
  } else {
    drawTopUI();
    drawCar();
    drawBanners();

    drops.forEach(drawDrop);

    if (performance.now() - lastSpawn > spawnInterval) {
      spawnDrop();
      lastSpawn = performance.now();
    }

    updateDrops();

    // Bonus timer
    if (bonusActive && performance.now() - bonusTimer > 8000) {
      bonusActive = false;
      showBonusBanner = false;
    }

    // Banner timers
    if (showFuelPriceBanner && performance.now() - fuelPriceBannerTimer > 3000) {
      showFuelPriceBanner = false;
    }

    if (showFuelDecreaseBanner && performance.now() - fuelDecreaseTimer > 2000) {
      showFuelDecreaseBanner = false;
    }
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
  dropSpeed = 2;
  car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH / 2 - car.width / 2;
}

// Controls
document.addEventListener("keydown", e => {
  if (!gameStarted && e.key === "Enter") {
    startGame();
  }

  if (gameStarted && !gameOver) {
    if (["ArrowLeft", "a", "A"].includes(e.key)) {
      car.x -= car.speed;
    }
    if (["ArrowRight", "d", "D"].includes(e.key)) {
      car.x += car.speed;
    }
    car.x = Math.max(PLAY_AREA_LEFT, Math.min(car.x, PLAY_AREA_LEFT + PLAY_AREA_WIDTH - car.width));
  }
});

canvas.addEventListener("click", () => {
  if (gameOver) startGame();
});

let isDragging = false;
let dragOffsetX = 0;

canvas.addEventListener("mousedown", e => {
  if (!gameStarted || gameOver) return;
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  if (mouseX >= car.x && mouseX <= car.x + car.width && mouseY >= car.y && mouseY <= car.y + car.height) {
    isDragging = true;
    dragOffsetX = mouseX - car.x;
  }
});

canvas.addEventListener("mousemove", e => {
  if (isDragging) {
    car.x = e.clientX - dragOffsetX;
    car.x = Math.max(PLAY_AREA_LEFT, Math.min(car.x, PLAY_AREA_LEFT + PLAY_AREA_WIDTH - car.width));
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
});

canvas.addEventListener("touchstart", e => {
  if (!gameStarted || gameOver) return;
  const touch = e.touches[0];
  const touchX = touch.clientX;
  const touchY = touch.clientY;
  if (touchX >= car.x && touchX <= car.x + car.width && touchY >= car.y && touchY <= car.y + car.height) {
    isDragging = true;
    dragOffsetX = touchX - car.x;
  }
});

canvas.addEventListener("touchmove", e => {
  if (isDragging) {
    const touch = e.touches[0];
    car.x = touch.clientX - dragOffsetX;
    car.x = Math.max(PLAY_AREA_LEFT, Math.min(car.x, PLAY_AREA_LEFT + PLAY_AREA_WIDTH - car.width));
  }
});

canvas.addEventListener("touchend", () => {
  isDragging = false;
});

mainLoop();
