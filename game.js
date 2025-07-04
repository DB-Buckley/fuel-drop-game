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
  color: '#F5A623'
};

let drops = [];
let dropSpeed = 2;
let spawnInterval = 1500;
let lastSpawn = performance.now();

let score = 0;
let missedDrops = 0;
const maxMisses = 10;
let highScore = Number(localStorage.getItem("mzansi_fuel_highscore") || 0);
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

let playerName = "";
let leaderboard = JSON.parse(localStorage.getItem("mzansi_leaderboard") || "[]");

let fuelIncreases = 0; // count how many price increases happened

// Helpers
function clearCanvas() {
  // Change background color depending on bonusActive
  if (bonusActive) {
    ctx.fillStyle = '#d0f0ff'; // light blue during bonus
  } else {
    ctx.fillStyle = '#000'; // black normally
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawText(text, x, y, size = 20, center = false, color = "#fff") {
  ctx.fillStyle = color;
  ctx.font = `${size}px Arial`;
  ctx.textAlign = center ? 'center' : 'left';
  ctx.fillText(text, x, y);
}

// Draw frame around play area
function drawFrame() {
  ctx.strokeStyle = bonusActive ? '#004466' : '#333'; // darker blue during bonus
  ctx.lineWidth = 4;
  ctx.strokeRect(PLAY_AREA_LEFT, 0, PLAY_AREA_WIDTH, canvas.height);
}

function drawCar() {
  ctx.fillStyle = bonusActive ? '#00CFFF' : car.color;
  ctx.fillRect(car.x, car.y, car.width, car.height);
}

// Draw drops as simple circles (different colors for bonus and slow)
function drawDrop(drop) {
  ctx.beginPath();
  if (drop.bonus) ctx.fillStyle = '#00CFFF'; // blue bonus
  else if (drop.slowDown) ctx.fillStyle = '#0F0'; // green slow
  else ctx.fillStyle = '#F5A623'; // gold normal

  ctx.arc(drop.x, drop.y, 10, 0, Math.PI * 2);
  ctx.fill();
}

// Top UI with score, high score, and missed drops (10 circles)
function drawTopUI() {
  const textColor = bonusActive ? '#222' : '#fff';
  drawText(`Score: ${score}`, canvas.width / 2, 30, 20, true, textColor);
  drawText(`High Score: ${highScore}`, canvas.width / 2, 60, 16, true, textColor);

  // Draw 10 circles for missed drops at top center
  for (let i = 0; i < maxMisses; i++) {
    let x = canvas.width / 2 - (maxMisses * 20) / 2 + i * 20;
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = textColor;
    if (i < maxMisses - missedDrops) {
      ctx.fillStyle = textColor;
      ctx.arc(x, 90, 8, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.fillStyle = 'transparent';
      ctx.arc(x, 90, 8, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
}

// Draw banners
function drawBanners() {
  if (showBonusBanner) {
    drawText("BONUS ROUND!", canvas.width / 2, 130, 28, true, '#00CFFF');
  }
  if (showFuelPriceBanner) {
    drawText("FUEL PRICE INCREASED!", canvas.width / 2, 170, 28, true, '#F5A623');
  }
  if (showFuelDecreaseBanner) {
    drawText("FUEL PRICE DECREASED!", canvas.width / 2, 210, 28, true, '#0F0');
  }
}

// Start screen with instructions and leaderboard
function drawStartScreen() {
  clearCanvas();
  drawText("Mzansi Fuel Drop", canvas.width / 2, 80, 36, true);
  drawText("Catch golden drops to score points.", canvas.width / 2, 120, 20, true);
  drawText("Miss 10 drops and it's game over.", canvas.width / 2, 150, 20, true);
  drawText("Bonus drops (blue) give 3x points, no bonus drops spawn during bonus.", canvas.width / 2, 180, 18, true);
  drawText("Green drops slow down the game, but only spawn after 3 price increases.", canvas.width / 2, 210, 18, true);

  drawText("Enter your name and press Enter to start:", canvas.width / 2, 260, 20, true);
  drawText(playerName + (Date.now() % 1000 < 500 ? '_' : ''), canvas.width / 2, 290, 28, true);

  drawText("Leaderboard (Top 10):", canvas.width / 2, 340, 24, true);
  leaderboard.slice(0, 10).forEach((entry, i) => {
    drawText(`${i + 1}. ${entry.name}: ${entry.score}`, canvas.width / 2, 370 + i * 24, 20, true);
  });
}

// Game over screen
function drawGameOver() {
  clearCanvas();
  drawText("Game Over", canvas.width / 2, canvas.height / 2 - 40, 36, true);
  drawText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2, 24, true);
  drawText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40, 24, true);
  drawText("Tap / Click to Restart", canvas.width / 2, canvas.height / 2 + 80, 24, true);
}

// Spawn drops with rules
let lastDropBonus = false;
let lastDropGreen = false;
function spawnDrop() {
  if (gameOver) return;
  const rand = Math.random();

  // Don't spawn bonus during bonus round
  let bonus = false;
  let slowDown = false;

  if (!bonusActive && !lastDropBonus && rand < 0.1) {
    bonus = true;
    lastDropBonus = true;
    lastDropGreen = false;
  } else if (!lastDropGreen && fuelIncreases >= 3 && rand >= 0.1 && rand < 0.12) {
    slowDown = true;
    lastDropGreen = true;
    lastDropBonus = false;
  } else {
    lastDropBonus = false;
    lastDropGreen = false;
  }

  drops.push({
    x: PLAY_AREA_LEFT + Math.random() * (PLAY_AREA_WIDTH - 20),
    y: -20,
    bonus,
    slowDown
  });
}

// Update drops position and check collisions
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
      score += drop.bonus ? 30 : 10; // bonus = 3x points
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
      // Green and blue drops missed don't count
      if (!drop.bonus && !drop.slowDown) {
        missedDrops++;
        if (missedDrops >= maxMisses) {
          gameOver = true;
          if (score > highScore) {
            highScore = score;
            localStorage.setItem("mzansi_fuel_highscore", highScore);
            updateLeaderboard();
          }
        }
      }
      drops.splice(i, 1);
    }
  }
}

function updateLeaderboard() {
  leaderboard.push({ name: playerName || "Anon", score });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem("mzansi_leaderboard", JSON.stringify(leaderboard));
}

// Increase difficulty every 500 points
function checkDifficultyIncrease() {
  if (score >= (fuelIncreases + 1) * 500) {
    fuelIncreases++;
    dropSpeed *= 1.15; // +15% speed
    spawnInterval *= 0.9; // -10% spawn interval (more drops)
    showFuelPriceBanner = true;
    fuelPriceBannerTimer = performance.now();
  }
}

// Main loop
function mainLoop() {
  clearCanvas();

  if (!gameStarted) {
    drawStartScreen();
  } else if (gameOver) {
    drawGameOver();
  } else {
    drawFrame();
    drawTopUI();
    drawCar();
    drawBanners();
    drops.forEach(drawDrop);

    if (performance.now() - lastSpawn > spawnInterval) {
      spawnDrop();
      lastSpawn = performance.now();
    }

    updateDrops();
    checkDifficultyIncrease();

    // Bonus timer (8 seconds)
    if (bonusActive && performance.now() - bonusTimer > bonusDuration) {
      bonusActive = false;
      showBonusBanner = false;
    }

    // Banner timers
    if (showFuelPriceBanner && performance.now() - fuelPriceBannerTimer > fuelPriceBannerDuration) {
      showFuelPriceBanner = false;
    }
    if (showFuelDecreaseBanner && performance.now() - fuelDecreaseTimer > fuelDecreaseBannerDuration) {
      showFuelDecreaseBanner = false;
    }
  }

  requestAnimationFrame(mainLoop);
}

// Start game
function startGame() {
  gameStarted = true;
  gameOver = false;
  score = 0;
  missedDrops = 0;
  drops = [];
  dropSpeed = 2;
  spawnInterval = 1500;
  fuelIncreases = 0;
  lastSpawn = performance.now();
  car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH / 2 - car.width / 2;
  showBonusBanner = false;
  showFuelPriceBanner = false;
  showFuelDecreaseBanner = false;
}

// Controls and input
document.addEventListener("keydown", e => {
  if (!gameStarted && !gameOver && /^[a-zA-Z0-9 ]$/.test(e.key)) {
    if (playerName.length < 12) playerName += e.key;
  } else if (!gameStarted && !gameOver && e.key === "Backspace") {
    playerName = playerName.slice(0, -1);
  } else if (!gameStarted && !gameOver && e.key === "Enter" && playerName.length > 0) {
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

// Mouse drag controls
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

// Touch controls for mobile
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
