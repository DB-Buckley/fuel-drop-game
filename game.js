// Mzansi Fuel Drop - Leaderboard + Asset Support
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);

let PLAY_AREA_WIDTH = isMobile ? canvas.width * 0.95 : canvas.width * 0.6;
let PLAY_AREA_LEFT = (canvas.width - PLAY_AREA_WIDTH) / 2;

// Load images
const images = {
  car: new Image(),
  fuel_gold: new Image(),
  fuel_bonus: new Image(),
  fuel_green: new Image(),
  banner_bonus: new Image(),
  banner_increase: new Image(),
  banner_decrease: new Image(),
};

images.car.src = 'assets/car.png';
images.fuel_gold.src = 'assets/fuel_gold.png';
images.fuel_bonus.src = 'assets/fuel_bonus.png';
images.fuel_green.src = 'assets/fuel_green.png';
images.banner_bonus.src = 'assets/banner_bonus.png';
images.banner_increase.src = 'assets/banner_increase.png';
images.banner_decrease.src = 'assets/banner_decrease.png';

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
let lastDropY = -100;
let lastDropBonus = false;
let lastDropGreen = false;
let fuelIncreases = 0;

let score = 0;
let highScore = 0;
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

let nextDifficultyThreshold = 500;

let playerName = "";
let leaderboard = JSON.parse(localStorage.getItem("mzansi_leaderboard") || "[]");

function randomDropX() {
  return PLAY_AREA_LEFT + Math.random() * (PLAY_AREA_WIDTH - 20);
}

function spawnDrop() {
  if (gameOver) return;

  let newY = -20;
  if (Math.abs(newY - lastDropY) < 30) newY -= 30;
  lastDropY = newY;

  const rand = Math.random();
  let drop = {
    x: randomDropX(),
    y: newY,
    radius: 10,
    caught: false,
    bonus: false,
    slowDown: false
  };

  if (!bonusActive && !lastDropBonus && rand < 0.1) {
    drop.bonus = true;
    lastDropBonus = true;
  } else if (!lastDropGreen && fuelIncreases >= 3 && rand >= 0.1 && rand < 0.12) {
    drop.slowDown = true;
    lastDropGreen = true;
  } else {
    lastDropBonus = false;
    lastDropGreen = false;
  }

  drops.push(drop);
}

function drawCar() {
  ctx.drawImage(images.car, car.x, car.y, car.width, car.height);
}

function drawDrop(drop) {
  let img = images.fuel_gold;
  if (drop.bonus) img = images.fuel_bonus;
  else if (drop.slowDown) img = images.fuel_green;
  ctx.drawImage(img, drop.x - drop.radius, drop.y - drop.radius, drop.radius * 2, drop.radius * 2);
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

function drawBanners() {
  if (showBonusBanner) ctx.drawImage(images.banner_bonus, canvas.width / 2 - 150, 100, 300, 50);
  if (showFuelPriceBanner) ctx.drawImage(images.banner_increase, canvas.width / 2 - 150, 160, 300, 50);
  if (showFuelDecreaseBanner) ctx.drawImage(images.banner_decrease, canvas.width / 2 - 150, 220, 300, 50);
}

function drawStartScreen() {
  clearCanvas();
  drawText("Mzansi Fuel Drop", canvas.width / 2, 80, 36, true);
  drawText("Catch golden drops to score points.", canvas.width / 2, 130, 20, true);
  drawText("Avoid missing drops. 10 misses = Game Over.", canvas.width / 2, 160, 18, true);
  drawText("Bonus (blue) = 3x points. Green = slow speed.", canvas.width / 2, 190, 18, true);

  drawText("Enter your name to begin:", canvas.width / 2, 240, 18, true);
  drawText(playerName + "_", canvas.width / 2, 270, 20, true);

  drawText("Top 10 High Scores:", canvas.width / 2, 320, 20, true);
  leaderboard.slice(0, 10).forEach((entry, index) => {
    drawText(`${index + 1}. ${entry.name}: ${entry.score}`, canvas.width / 2, 350 + index * 24, 16, true);
  });
}

function drawGameOver() {
  drawText("Game Over", canvas.width / 2, canvas.height / 2 - 40, 36, true);
  drawText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2, 24, true);
  drawText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30, 24, true);
  drawText("Tap to Retry", canvas.width / 2, canvas.height / 2 + 70, 24, true);
}

function updateLeaderboard() {
  leaderboard.push({ name: playerName || "Anon", score });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem("mzansi_leaderboard", JSON.stringify(leaderboard));
}

function updateDrops() {
  if (gameOver) return;
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
        dropSpeed *= 0.95;
        showFuelDecreaseBanner = true;
        fuelDecreaseTimer = Date.now();
      }
      score += bonusActive ? 30 : 10;

      if (score >= nextDifficultyThreshold) {
        dropSpeed *= 1.15;
        spawnInterval *= 0.85;
        nextDifficultyThreshold += 500;
        fuelIncreases++;
        showFuelPriceBanner = true;
        fuelPriceBannerTimer = Date.now();
      }
    }

    if (drop.y > canvas.height && !drop.caught) {
      drop.caught = true;
      if (!drop.bonus && !drop.slowDown) {
        missedDrops++;
        if (missedDrops >= maxMisses) {
          gameOver = true;
          updateLeaderboard();
        }
      }
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

  if (showFuelDecreaseBanner && Date.now() - fuelDecreaseTimer > fuelDecreaseBannerDuration) {
    showFuelDecreaseBanner = false;
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

  if (gameOver) {
    drawGameOver();
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

  if (score > highScore) highScore = score;
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
  drops = [];
  dropSpeed = 2;
  spawnInterval = 1500;
  nextDifficultyThreshold = 500;
  car.color = car.baseColor;
  bonusActive = false;
  showBonusBanner = false;
  showFuelPriceBanner = false;
  showFuelDecreaseBanner = false;
  gameOver = false;
  fuelIncreases = 0;
  lastDropBonus = false;
  lastDropGreen = false;
  spawnDrop();
}

function startGame() {
  if (!playerName) return;
  gameStarted = true;
  resetGame();
}

function moveLeft() { car.dx = -car.speed; }
function moveRight() { car.dx = car.speed; }
function stopMove() { car.dx = 0; }

document.addEventListener("keydown", e => {
  if (!gameStarted && !gameOver && playerName.length < 12 && /^[a-zA-Z0-9 ]$/.test(e.key)) {
    playerName += e.key;
  } else if (!gameStarted && !gameOver && e.key === "Backspace") {
    playerName = playerName.slice(0, -1);
  }

  if (["ArrowLeft", "a", "A"].includes(e.key)) moveLeft();
  if (["ArrowRight", "d", "D"].includes(e.key)) moveRight();
});
document.addEventListener("keyup", e => {
  if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(e.key)) stopMove();
});

let isDragging = false;
canvas.addEventListener("touchstart", e => {
  if (!gameStarted && playerName) return startGame();
  if (gameOver) return resetGame();
  const x = e.touches[0].clientX;
  car.x = x - car.width / 2;
});
canvas.addEventListener("touchmove", e => {
  const x = e.touches[0].clientX;
  car.x = x - car.width / 2;
});
canvas.addEventListener("mousedown", e => {
  if (!gameStarted && playerName) return startGame();
  if (gameOver) return resetGame();
  isDragging = true;
  car.x = e.clientX - car.width / 2;
});
canvas.addEventListener("mousemove", e => {
  if (isDragging) car.x = e.clientX - car.width / 2;
});
canvas.addEventListener("mouseup", () => { isDragging = false; stopMove(); });
canvas.addEventListener("click", () => {
  if (!gameStarted && playerName) return startGame();
  if (gameOver) return resetGame();
});

mainLoop();
