// Mzansi Fuel Drop - PNG Asset Version
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);

let PLAY_AREA_WIDTH = isMobile ? canvas.width * 0.95 : canvas.width * 0.6;
let PLAY_AREA_LEFT = (canvas.width - PLAY_AREA_WIDTH) / 2;

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

let imagesLoaded = 0;
const totalImages = Object.keys(images).length;
for (let key in images) {
  images[key].onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
      mainLoop();
    }
  };
}

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

let nextDifficultyThreshold = 300;

let playerName = "";
let leaderboard = JSON.parse(localStorage.getItem("mzansi_leaderboard") || "[]");

function randomDropX() {
  return PLAY_AREA_LEFT + Math.random() * (PLAY_AREA_WIDTH - 20);
}

// To avoid drops spawning too close vertically
function validDropY(newY) {
  for (let drop of drops) {
    if (Math.abs(drop.y - newY) < 40) return false;
  }
  return true;
}

function spawnDrop() {
  if (gameOver) return;

  let newY = -20;
  // Try finding a newY that doesn't collide vertically with other drops
  let attempts = 0;
  while (!validDropY(newY) && attempts < 10) {
    newY -= 30;
    attempts++;
  }

  const rand = Math.random();
  let drop = {
    x: randomDropX(),
    y: newY,
    radius: 10,
    caught: false,
    bonus: false,
    slowDown: false
  };

  // Determine drop type with rules:
  // - No blue bonus during bonusActive, only one blue drop at a time
  // - Green drops only after 3 price increases, 2% spawn chance, no consecutive greens
  // - Only one green drop at a time
  if (!bonusActive && !lastDropBonus && rand < 0.15) {
    drop.bonus = true;
    lastDropBonus = true;
    lastDropGreen = false;
  } else if (fuelIncreases >= 3 && !lastDropGreen && rand >= 0.15 && rand < 0.17) {
    drop.slowDown = true;
    lastDropGreen = true;
    lastDropBonus = false;
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

document.addEventListener("keydown", e => {
  if (!gameStarted && !gameOver && playerName.length < 12 && /^[a-zA-Z0-9 ]$/.test(e.key)) {
    playerName += e.key;
  } else if (!gameStarted && !gameOver && e.key === "Backspace") {
    playerName = playerName.slice(0, -1);
  } else if (!gameStarted && !gameOver && e.key === "Enter" && playerName.length > 0) {
    startGame();
  }

  if (["ArrowLeft", "a", "A"].includes(e.key)) moveLeft();
  if (["ArrowRight", "d", "D"].includes(e.key)) moveRight();

  // Restart game on Enter after game over
  if (gameOver && e.key === "Enter") {
    resetGame();
    startGame();
  }
});

canvas.addEventListener("click", () => {
  if (gameOver) {
    resetGame();
    startGame();
  }
});

// Mouse drag for desktop
let dragging = false;
canvas.addEventListener("mousedown", (e) => {
  if (!gameOver && gameStarted && !isMobile) {
    dragging = true;
    moveCarToEvent(e);
  }
});
canvas.addEventListener("mousemove", (e) => {
  if (dragging && !gameOver && gameStarted && !isMobile) {
    moveCarToEvent(e);
  }
});
canvas.addEventListener("mouseup", () => {
  dragging = false;
});

// Touch drag for mobile
canvas.addEventListener("touchstart", (e) => {
  if (!gameOver && gameStarted && isMobile) {
    moveCarToEvent(e.touches[0]);
  }
});
canvas.addEventListener("touchmove", (e) => {
  if (!gameOver && gameStarted && isMobile) {
    moveCarToEvent(e.touches[0]);
  }
});

function moveCarToEvent(e) {
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left - car.width / 2;
  if (x < PLAY_AREA_LEFT) x = PLAY_AREA_LEFT;
  if (x + car.width > PLAY_AREA_LEFT + PLAY_AREA_WIDTH) x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH - car.width;
  car.x = x;
}

function moveLeft() {
  car.x -= car.speed;
  if (car.x < PLAY_AREA_LEFT) car.x = PLAY_AREA_LEFT;
}

function moveRight() {
  car.x += car.speed;
  if (car.x + car.width > PLAY_AREA_LEFT + PLAY_AREA_WIDTH)
    car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH - car.width;
}

function resetGame() {
  drops = [];
  score = 0;
  missedDrops = 0;
  dropSpeed = 2;
  spawnInterval = 1500;
  lastSpawn = 0;
  lastDropY = -100;
  lastDropBonus = false;
  lastDropGreen = false;
  gameOver = false;
  bonusActive = false;
  showBonusBanner = false;
  showFuelPriceBanner = false;
  showFuelDecreaseBanner = false;
  fuelPriceBannerTimer = 0;
  fuelDecreaseTimer = 0;
  bonusTimer = 0;
  fuelIncreases = 0;
  nextDifficultyThreshold = 300;
  car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH / 2 - car.width / 2;
}

function startGame() {
  gameStarted = true;
  resetGame();
  if (score > highScore) highScore = score;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (bonusActive) {
    ctx.fillStyle = "#b3f0ff"; // light blue during bonus
  } else {
    ctx.fillStyle = "#111"; // dark background
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Frame
  if (!isMobile) {
    ctx.strokeStyle = bonusActive ? "#333" : "#666";
    ctx.lineWidth = 4;
    ctx.strokeRect(PLAY_AREA_LEFT, 0, PLAY_AREA_WIDTH, canvas.height);
  }
}

function updateDrops(deltaTime) {
  for (let drop of drops) {
    drop.y += dropSpeed * (deltaTime / 16);
    if (!drop.caught &&
        drop.y + drop.radius >= car.y &&
        drop.y < car.y + car.height &&
        drop.x >= car.x &&
        drop.x <= car.x + car.width) {
      drop.caught = true;

      if (drop.bonus) {
        bonusActive = true;
        bonusTimer = bonusDuration;
        showBonusBanner = true;
        setTimeout(() => showBonusBanner = false, bonusDuration);
      } else if (drop.slowDown) {
        dropSpeed *= 0.95;
        showFuelDecreaseBanner = true;
        fuelDecreaseTimer = fuelDecreaseBannerDuration;
        setTimeout(() => showFuelDecreaseBanner = false, fuelDecreaseBannerDuration);
      } else {
        score += bonusActive ? 30 : 10;
      }
    }

    // Drop missed
    if (!drop.caught && drop.y > canvas.height) {
      if (!drop.bonus && !drop.slowDown) {
        missedDrops++;
        if (missedDrops >= maxMisses) {
          gameOver = true;
          updateLeaderboard();
        }
      }
      drop.caught = true;
    }
  }

  // Remove caught drops immediately
  drops = drops.filter(drop => !drop.caught);
}

function mainLoop(timestamp = 0) {
  if (!gameStarted) {
    drawStartScreen();
    requestAnimationFrame(mainLoop);
    return;
  }

  const now = Date.now();
  if (now - lastSpawn > spawnInterval) {
    spawnDrop();
    lastSpawn = now;
  }

  clearCanvas();
  updateDrops(16);
  drawCar();
  for (let drop of drops) drawDrop(drop);
  drawTopUI();
  drawBanners();

  // Bonus timer
  if (bonusActive) {
    bonusTimer -= 16;
    if (bonusTimer <= 0) {
      bonusActive = false;
    }
  }

  // Fuel price increase logic
  if (score >= nextDifficultyThreshold) {
    fuelIncreases++;
    dropSpeed *= 1.2;
    spawnInterval *= 0.9;
    showFuelPriceBanner = true;
    fuelPriceBannerTimer = fuelPriceBannerDuration;
    setTimeout(() => showFuelPriceBanner = false, fuelPriceBannerDuration);
    nextDifficultyThreshold += 300;
  }

  if (!gameOver) {
    requestAnimationFrame(mainLoop);
  } else {
    drawGameOver();
  }
}
