const {
  canvas, ctx, PLAY_AREA_WIDTH, PLAY_AREA_LEFT,
  car, drops, maxMisses, isMobile,
  playerName, leaderboard
} = window.state;

let images = {};
let imagesLoaded = false;

const imagePaths = {
  car: 'assets/car.png',
  fuel_gold: 'assets/fuel_gold.png',
  fuel_bonus: 'assets/fuel_bonus.png',
  fuel_green: 'assets/fuel_green.png',
  banner_bonus: 'assets/banner_bonus.png',
  banner_increase: 'assets/banner_increase.png',
  banner_decrease: 'assets/banner_decrease.png',
};

function loadImages() {
  let loadedCount = 0;
  const total = Object.keys(imagePaths).length;

  for (let key in imagePaths) {
    const img = new Image();
    img.src = imagePaths[key];
    img.onload = () => {
      loadedCount++;
      if (loadedCount === total) {
        imagesLoaded = true;
        requestAnimationFrame(mainLoop);
      }
    };
    images[key] = img;
  }
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

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = window.state.bonusActive ? "#1c63ff" : "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!isMobile) {
    ctx.strokeStyle = window.state.bonusActive ? "#333" : "#666";
    ctx.lineWidth = 4;
    ctx.strokeRect(PLAY_AREA_LEFT, 0, PLAY_AREA_WIDTH, canvas.height);
  }
}

function drawTopUI() {
  ctx.textAlign = "center";
  const color = window.state.bonusActive ? "#222" : "#fff";
  ctx.fillStyle = color;
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${window.state.score} | Missed: ${window.state.missedDrops}/${maxMisses} | High Score: ${window.state.highScore}`, canvas.width / 2, 30);

  for (let i = 0; i < maxMisses; i++) {
    ctx.beginPath();
    const x = canvas.width / 2 - 120 + i * 25;
    ctx.arc(x, 60, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.fillStyle = i < (maxMisses - window.state.missedDrops) ? color : "transparent";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }
}

function drawBanners() {
  if (window.state.showBonusBanner) ctx.drawImage(images.banner_bonus, canvas.width / 2 - 150, 100, 300, 50);
  if (window.state.showFuelPriceBanner) ctx.drawImage(images.banner_increase, canvas.width / 2 - 150, 160, 300, 50);
  if (window.state.showFuelDecreaseBanner) ctx.drawImage(images.banner_decrease, canvas.width / 2 - 150, 220, 300, 50);
}

function drawStartScreen() {
  clearCanvas();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "36px Arial";
  ctx.fillText("Mzansi Fuel Drop", canvas.width / 2, 80);
  ctx.font = "20px Arial";
  ctx.fillText("Catch golden drops to score points.", canvas.width / 2, 130);
  ctx.fillText("Avoid missing drops. 10 misses = Game Over.", canvas.width / 2, 160);
  ctx.fillText("Bonus (blue) = 3x points. Green = slow speed.", canvas.width / 2, 190);

  ctx.fillText("Enter your name to begin:", canvas.width / 2, 240);
  ctx.fillText(window.state.playerName + "_", canvas.width / 2, 270);

  ctx.fillText("Top 10 High Scores:", canvas.width / 2, 320);
  ctx.font = "16px Arial";
  window.state.leaderboard.slice(0, 10).forEach((entry, index) => {
    ctx.fillText(`${index + 1}. ${entry.name}: ${entry.score}`, canvas.width / 2, 350 + index * 24);
  });
}

function drawGameOver() {
  clearCanvas();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "36px Arial";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 40);
  ctx.font = "24px Arial";
  ctx.fillText(`Final Score: ${window.state.score}`, canvas.width / 2, canvas.height / 2);
  ctx.fillText(`High Score: ${window.state.highScore}`, canvas.width / 2, canvas.height / 2 + 30);
  ctx.fillText("Tap or Press Enter to Retry", canvas.width / 2, canvas.height / 2 + 70);
}

function spawnDrop() {
  if (window.state.gameOver) return;

  let newY = -20;
  if (Math.abs(newY - window.state.lastDropY) < 30) newY -= 30;
  window.state.lastDropY = newY;

  const rand = Math.random();
  let drop = {
    x: PLAY_AREA_LEFT + Math.random() * (PLAY_AREA_WIDTH - 20),
    y: newY,
    radius: 10,
    caught: false,
    bonus: false,
    slowDown: false,
  };

  if (!window.state.bonusActive && !window.state.lastDropBonus && rand < 0.1) {
    drop.bonus = true;
    window.state.lastDropBonus = true;
  } else if (!window.state.lastDropGreen && window.state.fuelIncreases >= 3 && rand >= 0.1 && rand < 0.12) {
    drop.slowDown = true;
    window.state.lastDropGreen = true;
  } else {
    window.state.lastDropBonus = false;
    window.state.lastDropGreen = false;
  }

  window.state.drops.push(drop);
}

function updateDrops(deltaTime) {
  for (let drop of window.state.drops) {
    drop.y += window.state.dropSpeed * (deltaTime / 16);
    if (!drop.caught && drop.y + drop.radius >= car.y && drop.y < car.y + car.height &&
        drop.x >= car.x && drop.x <= car.x + car.width) {
      drop.caught = true;

      if (drop.bonus) {
        window.state.bonusActive = true;
        window.state.bonusTimer = window.state.bonusDuration;
        window.state.showBonusBanner = true;
        setTimeout(() => window.state.showBonusBanner = false, window.state.bonusDuration);
      } else if (drop.slowDown) {
        window.state.dropSpeed *= 0.95;
        window.state.showFuelDecreaseBanner = true;
        window.state.fuelDecreaseTimer = window.state.fuelDecreaseBannerDuration;
        setTimeout(() => window.state.showFuelDecreaseBanner = false, window.state.fuelDecreaseBannerDuration);
      } else {
        window.state.score += window.state.bonusActive ? 30 : 10;
      }
    }

    if (!drop.caught && drop.y > canvas.height) {
      if (!drop.bonus && !drop.slowDown) {
        window.state.missedDrops++;
        if (window.state.missedDrops >= maxMisses) {
          window.state.gameOver = true;
          updateLeaderboard();
        }
      }
      drop.caught = true;
    }
  }

  window.state.drops = window.state.drops.filter(drop => !drop.caught || drop.y <= canvas.height);
}

function updateLeaderboard() {
  window.state.leaderboard.push({ name: window.state.playerName || "Anon", score: window.state.score });
  window.state.leaderboard.sort((a, b) => b.score - a.score);
  window.state.leaderboard = window.state.leaderboard.slice(0, 10);
  localStorage.setItem("mzansi_leaderboard", JSON.stringify(window.state.leaderboard));
}

function mainLoop(timestamp = 0) {
  if (!imagesLoaded) return;

  if (!window.state.gameStarted) {
    drawStartScreen();
  } else if (window.state.gameOver) {
    drawGameOver();
  } else {
    const now = Date.now();

    if (now - window.state.lastSpawn > window.state.spawnInterval) {
      spawnDrop();
      window.state.lastSpawn = now;
    }

    clearCanvas();
    updateDrops(16);
    drawCar();
    for (let drop of window.state.drops) drawDrop(drop);
    drawTopUI();
    drawBanners();

    // Bonus timer
    if (window.state.bonusActive) {
      window.state.bonusTimer -= 16;
      if (window.state.bonusTimer <= 0) {
        window.state.bonusActive = false;
      }
    }

    // Fuel price increase logic
    if (window.state.score >= window.state.nextDifficultyThreshold) {
      window.state.fuelIncreases++;
      window.state.dropSpeed *= 1.2;
      window.state.spawnInterval *= 0.9;
      window.state.showFuelPriceBanner = true;
      window.state.fuelPriceBannerTimer = window.state.fuelPriceBannerDuration;
      setTimeout(() => window.state.showFuelPriceBanner = false, window.state.fuelPriceBannerDuration);
      window.state.nextDifficultyThreshold += 300;
    }
  }

  requestAnimationFrame(mainLoop);
}

function setupInputs() {
  // This function is usually in inputs.js, but you can call it here or keep separate
  // Assuming inputs.js calls startGame() and resetGame() that are global.

  // Add event listeners here if you want to keep inputs.js minimal
}

// Start the game
loadImages();
// setupInputs() should be called from inputs.js or here if you prefer
