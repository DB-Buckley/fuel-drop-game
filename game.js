// Mzansi Fuel Drop - Updated July 4, 2025
// Features: Bonus color fix, collision fix, mouse drag, mobile keyboard fix, restart logic

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
  speed: 7
};

let drops = [], score = 0, highScore = 0, missedDrops = 0;
const maxMisses = 10;
let gameOver = false, gameStarted = false;
let dropSpeed = 2, spawnInterval = 1500, lastSpawn = 0;
let bonusActive = false, bonusTimer = 0, fuelIncreases = 0;
let bonusDuration = 8000;
let lastDropY = -100, lastDropBonus = false, lastDropGreen = false;
let showBonusBanner = false, showFuelPriceBanner = false, showFuelDecreaseBanner = false;
let nextDifficultyThreshold = 300;

let playerName = "";
let leaderboard = JSON.parse(localStorage.getItem("mzansi_leaderboard") || "[]");

const input = document.createElement("input");
input.type = "text";
input.style.position = "absolute";
input.style.opacity = 0;
input.autocapitalize = "off";
input.autocomplete = "off";
document.body.appendChild(input);

function focusInput() {
  input.focus();
}

function drawText(text, x, y, size = 20, center = false, color = "#fff") {
  ctx.fillStyle = color;
  ctx.font = `${size}px Arial`;
  ctx.textAlign = center ? "center" : "left";
  ctx.fillText(text, x, y);
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
  leaderboard.slice(0, 10).forEach((entry, i) =>
    drawText(`${i + 1}. ${entry.name}: ${entry.score}`, canvas.width / 2, 350 + i * 24, 16, true)
  );
}

function drawGameOver() {
  drawText("Game Over", canvas.width / 2, canvas.height / 2 - 40, 36, true);
  drawText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2, 24, true);
  drawText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30, 24, true);
  drawText("Tap or press Enter to Restart", canvas.width / 2, canvas.height / 2 + 70, 20, true);
}

function drawTopUI() {
  const color = bonusActive ? "#fff" : "#fff";
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

function drawCar() {
  ctx.drawImage(images.car, car.x, car.y, car.width, car.height);
}

function drawDrop(drop) {
  let img = images.fuel_gold;
  if (drop.bonus) img = images.fuel_bonus;
  if (drop.slowDown) img = images.fuel_green;
  ctx.drawImage(img, drop.x - drop.radius, drop.y - drop.radius, drop.radius * 2, drop.radius * 2);
}

function spawnDrop() {
  let y = -20;
  if (Math.abs(y - lastDropY) < 30) y -= 30;
  lastDropY = y;

  let rand = Math.random();
  let drop = {
    x: PLAY_AREA_LEFT + Math.random() * (PLAY_AREA_WIDTH - 20),
    y: y,
    radius: 10,
    bonus: false,
    slowDown: false,
    caught: false
  };

  if (!bonusActive && !lastDropBonus && rand < 0.15) {
    drop.bonus = true;
    lastDropBonus = true;
  } else if (!lastDropGreen && fuelIncreases >= 3 && rand >= 0.15 && rand < 0.17) {
    drop.slowDown = true;
    lastDropGreen = true;
  } else {
    lastDropBonus = false;
    lastDropGreen = false;
  }

  drops.push(drop);
}

function updateDrops(dt) {
  for (let drop of drops) {
    drop.y += dropSpeed * (dt / 16);

    let collided = drop.x >= car.x && drop.x <= car.x + car.width &&
                   drop.y + drop.radius >= car.y && drop.y < car.y + car.height;

    if (!drop.caught && collided) {
      drop.caught = true;

      if (drop.bonus) {
        bonusActive = true;
        bonusTimer = bonusDuration;
        showBonusBanner = true;
        setTimeout(() => showBonusBanner = false, bonusDuration);
      } else if (drop.slowDown) {
        dropSpeed *= 0.95;
        showFuelDecreaseBanner = true;
        setTimeout(() => showFuelDecreaseBanner = false, 2000);
      } else {
        score += bonusActive ? 30 : 10;
      }
    }

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

  drops = drops.filter(d => !d.caught || d.y <= canvas.height);
}

function clearCanvas() {
  ctx.fillStyle = bonusActive ? "#1c63ff" : "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!isMobile) {
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 4;
    ctx.strokeRect(PLAY_AREA_LEFT, 0, PLAY_AREA_WIDTH, canvas.height);
  }
}

function updateLeaderboard() {
  leaderboard.push({ name: playerName || "Anon", score });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem("mzansi_leaderboard", JSON.stringify(leaderboard));
}

function resetGame() {
  drops = [];
  score = 0;
  missedDrops = 0;
  dropSpeed = 2;
  spawnInterval = 1500;
  lastSpawn = 0;
  bonusActive = false;
  bonusTimer = 0;
  fuelIncreases = 0;
  gameOver = false;
  showBonusBanner = false;
  car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH / 2 - car.width / 2;
}

function startGame() {
  gameStarted = true;
  resetGame();
  focusInput();
}

function mainLoop() {
  if (!gameStarted) {
    drawStartScreen();
    requestAnimationFrame(mainLoop);
    return;
  }

  let now = Date.now();
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

  if (bonusActive) {
    bonusTimer -= 16;
    if (bonusTimer <= 0) bonusActive = false;
  }

  if (score >= nextDifficultyThreshold) {
    fuelIncreases++;
    dropSpeed *= 1.2;
    spawnInterval *= 0.9;
    showFuelPriceBanner = true;
    setTimeout(() => showFuelPriceBanner = false, 3000);
    nextDifficultyThreshold += 300;
  }

  if (!gameOver) requestAnimationFrame(mainLoop);
  else drawGameOver();
}

// Controls
document.addEventListener("keydown", e => {
  if (!gameStarted && /^[a-zA-Z0-9 ]$/.test(e.key)) {
    playerName += e.key;
  } else if (!gameStarted && e.key === "Backspace") {
    playerName = playerName.slice(0, -1);
  } else if (!gameStarted && e.key === "Enter" && playerName.length > 0) {
    startGame();
  } else if (gameOver && e.key === "Enter") {
    resetGame();
    startGame();
  }

  if (["ArrowLeft", "a", "A"].includes(e.key)) car.x -= car.speed;
  if (["ArrowRight", "d", "D"].includes(e.key)) car.x += car.speed;
});

canvas.addEventListener("mousedown", e => {
  if (gameOver) {
    resetGame();
    startGame();
  } else {
    const rect = canvas.getBoundingClientRect();
    car.x = e.clientX - rect.left - car.width / 2;
  }
});

canvas.addEventListener("touchstart", e => {
  if (gameOver) {
    resetGame();
    startGame();
  } else {
    const touch = e.touches[0];
    car.x = touch.clientX - car.width / 2;
  }
});

canvas.addEventListener("touchmove", e => {
  const touch = e.touches[0];
  car.x = touch.clientX - car.width / 2;
});
