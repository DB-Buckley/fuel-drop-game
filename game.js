// Mzansi Fuel Drop - Full Gameplay Logic
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

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function moveLeft() {
  if (car.x > PLAY_AREA_LEFT) {
    car.x -= car.speed;
  }
}

function moveRight() {
  if (car.x + car.width < PLAY_AREA_LEFT + PLAY_AREA_WIDTH) {
    car.x += car.speed;
  }
}

function spawnDrop() {
  if (gameOver) return;
  let newY = -20;
  if (Math.abs(newY - lastDropY) < 30) newY -= 30;
  lastDropY = newY;

  const rand = Math.random();
  let drop = {
    x: PLAY_AREA_LEFT + Math.random() * (PLAY_AREA_WIDTH - 20),
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

function updateDrops(delta) {
  drops.forEach((drop, index) => {
    drop.y += dropSpeed * (delta / 16);

    // Check catch
    if (!drop.caught &&
        drop.y + drop.radius > car.y &&
        drop.y - drop.radius < car.y + car.height &&
        drop.x > car.x &&
        drop.x < car.x + car.width) {
      drop.caught = true;

      if (drop.bonus) {
        bonusActive = true;
        bonusTimer = bonusDuration;
        showBonusBanner = true;
        score += 30;
      } else if (drop.slowDown) {
        dropSpeed *= 0.95;
        showFuelDecreaseBanner = true;
        fuelDecreaseTimer = fuelDecreaseBannerDuration;
        score += 10;
      } else {
        score += bonusActive ? 30 : 10;
      }

      if (score >= nextDifficultyThreshold) {
        dropSpeed *= 1.15;
        spawnInterval *= 0.85;
        fuelIncreases++;
        nextDifficultyThreshold += 500;
        showFuelPriceBanner = true;
        fuelPriceBannerTimer = fuelPriceBannerDuration;
      }
    }

    // Missed
    if (!drop.caught && drop.y > canvas.height) {
      if (!drop.bonus && !drop.slowDown) {
        missedDrops++;
        if (missedDrops >= maxMisses) {
          endGame();
        }
      }
      drops.splice(index, 1);
    }
  });
}

function endGame() {
  gameOver = true;
  bonusActive = false;
  updateLeaderboard();
  if (score > highScore) highScore = score;
}

function mainLoop(timestamp) {
  clearCanvas();

  if (!gameStarted) {
    drawStartScreen();
  } else if (gameOver) {
    drawGameOver();
  } else {
    drawTopUI();
    drawBanners();
    drawCar();
    drops.forEach(drawDrop);

    const now = performance.now();
    if (now - lastSpawn > spawnInterval) {
      spawnDrop();
      lastSpawn = now;
    }

    let delta = 16;
    updateDrops(delta);

    if (bonusActive) {
      bonusTimer -= delta;
      if (bonusTimer <= 0) {
        bonusActive = false;
        showBonusBanner = false;
      }
    }

    if (showFuelPriceBanner) {
      fuelPriceBannerTimer -= delta;
      if (fuelPriceBannerTimer <= 0) showFuelPriceBanner = false;
    }

    if (showFuelDecreaseBanner) {
      fuelDecreaseTimer -= delta;
      if (fuelDecreaseTimer <= 0) showFuelDecreaseBanner = false;
    }
  }
  requestAnimationFrame(mainLoop);
}

function startGame() {
  gameStarted = true;
  gameOver = false;
  drops = [];
  dropSpeed = 2;
  spawnInterval = 1500;
  score = 0;
  missedDrops = 0;
  fuelIncreases = 0;
  bonusActive = false;
  nextDifficultyThreshold = 500;
  car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH / 2 - car.width / 2;
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
});

mainLoop();
