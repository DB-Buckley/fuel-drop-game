// Mzansi Fuel Drop - With Updated Game Mechanics & UI Enhancements
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
  baseColor: "#F5A623",
  bonusColor: "#00CFFF",
  color: "#F5A623",
  speed: 7,
  dx: 0
};

let drops = [];
let dropSpeed = 2;
let spawnInterval = 1500;
let lastSpawn = 0;

let score = 0;
let highScore = 0;
let missedDrops = 0;
const maxMisses = 10;
let gameOver = false;
let gameStarted = false;

let bonusActive = false;
let bonusTimer = 0;
const bonusDuration = 15000;
let showBonusBanner = false;

let speedLevel = 0;
let showFuelPriceBanner = false;
let fuelPriceBannerTimer = 0;
const fuelPriceBannerDuration = 3000;

if (localStorage.getItem("mzansi_highscore")) {
  highScore = parseInt(localStorage.getItem("mzansi_highscore"));
}

function randomDropX() {
  return PLAY_AREA_LEFT + Math.random() * (PLAY_AREA_WIDTH - 20);
}

function spawnDrop() {
  const rand = Math.random();
  let drop = {
    x: randomDropX(),
    y: -20,
    radius: 10,
    caught: false,
    bonus: false,
    slowDown: false
  };

  if (!bonusActive && rand < 0.1) {
    drop.bonus = true;
  } else if (rand < 0.15) {
    drop.slowDown = true;
  }
  drops.push(drop);
}

function drawCar() {
  ctx.fillStyle = car.color;
  ctx.fillRect(car.x, car.y, car.width, car.height);
}

function drawDrop(drop) {
  ctx.beginPath();
  ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
  if (drop.bonus) ctx.fillStyle = "#00CFFF";
  else if (drop.slowDown) ctx.fillStyle = "#7ED957";
  else ctx.fillStyle = "gold";
  ctx.fill();
  ctx.closePath();
}

function drawText(text, x, y, size = 20, center = false, color = "#fff") {
  ctx.fillStyle = color;
  ctx.font = `${size}px Arial`;
  ctx.textAlign = center ? "center" : "left";
  ctx.fillText(text, x, y);
}

function drawTopUI() {
  ctx.textAlign = "center";
  const color = bonusActive ? "#222" : "#fff";
  drawText(`Score: ${score} | Missed: ${missedDrops}/${maxMisses} | High Score: ${highScore}`, canvas.width / 2, 30, 20, true, color);

  for (let i = 0; i < maxMisses; i++) {
    ctx.beginPath();
    const x = canvas.width / 2 - 120 + i * 25;
    ctx.arc(x, 60, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.fillStyle = i < (maxMisses - missedDrops) ? color : "transparent";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }
}

function drawHighScore() {
  localStorage.setItem("mzansi_highscore", highScore);
}

function drawBanners() {
  if (showBonusBanner) drawText("BONUS ROUND!", canvas.width / 2, 100, 28, true, "#003344");
  if (showFuelPriceBanner) drawText("FUEL PRICE INCREASE!", canvas.width / 2, 140, 26, true, "#FF4444");
}

function drawStartScreen() {
  clearCanvas();
  drawText("Mzansi Fuel Drop", canvas.width / 2, canvas.height / 2 - 80, 36, true);
  drawText("Catch golden drops to score points.", canvas.width / 2, canvas.height / 2 - 40, 22, true);
  drawText("Avoid missing drops. 10 misses = Game Over.", canvas.width / 2, canvas.height / 2 - 10, 20, true);
  drawText("Catch light blue drops for BONUS. Green drops slow speed.", canvas.width / 2, canvas.height / 2 + 20, 18, true);
  drawText("Tap to Start", canvas.width / 2, canvas.height / 2 + 70, 24, true);
}

function drawGameOver() {
  drawText("Game Over", canvas.width / 2, canvas.height / 2 - 40, 36, true);
  drawText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2, 24, true);
  drawText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30, 24, true);
  drawText("Tap to Retry", canvas.width / 2, canvas.height / 2 + 70, 24, true);
}

function updateDrops() {
  for (let drop of drops) {
    drop.y += dropSpeed;

    if (
      drop.y + drop.radius > car.y &&
      drop.x > car.x &&
      drop.x < car.x + car.width &&
      drop.y < car.y + car.height
    ) {
      drop.caught = true;
      if (drop.bonus) {
        bonusActive = true;
        bonusTimer = Date.now();
        showBonusBanner = true;
        car.color = car.bonusColor;
      } else if (drop.slowDown) {
        dropSpeed *= 0.9;
      }
      score += bonusActive ? 25 : 5;

      if (score >= (speedLevel + 1) * 250) {
        dropSpeed *= 1.15;
        speedLevel++;
        showFuelPriceBanner = true;
        fuelPriceBannerTimer = Date.now();
      }
    }

    if (drop.y > canvas.height && !drop.caught) {
      missedDrops++;
      drop.caught = true;
      if (missedDrops >= maxMisses) gameOver = true;
    }
  }
  drops = drops.filter(d => !d.caught);

  if (!gameOver && Date.now() - lastSpawn > spawnInterval) {
    spawnDrop();
    lastSpawn = Date.now();
  }

  if (bonusActive && Date.now() - bonusTimer > bonusDuration) {
    bonusActive = false;
    car.color = car.baseColor;
    showBonusBanner = false;
  }

  if (showFuelPriceBanner && Date.now() - fuelPriceBannerTimer > fuelPriceBannerDuration) {
    showFuelPriceBanner = false;
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = bonusActive ? "#e0f7ff" : "#333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!isMobile) {
    ctx.strokeStyle = bonusActive ? "#111" : "#888";
    ctx.lineWidth = 5;
    ctx.strokeRect(PLAY_AREA_LEFT, 0, PLAY_AREA_WIDTH, canvas.height);
  }
}

function update() {
  if (!gameStarted) {
    drawStartScreen();
    return;
  }

  car.x += car.dx;
  if (car.x < PLAY_AREA_LEFT) car.x = PLAY_AREA_LEFT;
  if (car.x + car.width > PLAY_AREA_LEFT + PLAY_AREA_WIDTH)
    car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH - car.width;

  clearCanvas();
  drawCar();
  updateDrops();
  for (let drop of drops) drawDrop(drop);
  drawTopUI();
  drawBanners();

  if (gameOver) {
    if (score > highScore) {
      highScore = score;
      drawHighScore();
    }
    drawGameOver();
    return;
  }
}

function mainLoop() {
  requestAnimationFrame(() => {
    update();
    mainLoop();
  });
}

function resetGame() {
  score = 0;
  missedDrops = 0;
  speedLevel = 0;
  drops = [];
  dropSpeed = 2;
  car.color = car.baseColor;
  bonusActive = false;
  showBonusBanner = false;
  showFuelPriceBanner = false;
  gameOver = false;
  spawnDrop();
}

function startGame() {
  gameStarted = true;
  resetGame();
}

function moveLeft() { car.dx = -car.speed; }
function moveRight() { car.dx = car.speed; }
function stopMove() { car.dx = 0; }

document.addEventListener("keydown", e => {
  if (["ArrowLeft", "a", "A"].includes(e.key)) moveLeft();
  if (["ArrowRight", "d", "D"].includes(e.key)) moveRight();
});
document.addEventListener("keyup", e => {
  if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(e.key)) stopMove();
});

let isDragging = false;
canvas.addEventListener("touchstart", e => {
  if (!gameStarted) return startGame();
  if (gameOver) return resetGame();
  const x = e.touches[0].clientX;
  car.x = x - car.width / 2;
});
canvas.addEventListener("touchmove", e => {
  const x = e.touches[0].clientX;
  car.x = x - car.width / 2;
});
canvas.addEventListener("mousedown", e => {
  if (!gameStarted) return startGame();
  if (gameOver) return resetGame();
  isDragging = true;
  car.x = e.clientX - car.width / 2;
});
canvas.addEventListener("mousemove", e => {
  if (isDragging) car.x = e.clientX - car.width / 2;
});
canvas.addEventListener("mouseup", () => { isDragging = false; stopMove(); });
canvas.addEventListener("click", () => {
  if (!gameStarted) return startGame();
  if (gameOver) return resetGame();
});

mainLoop();
