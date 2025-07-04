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
  const { ctx, car } = window.state;
  ctx.drawImage(images.car, car.x, car.y, car.width, car.height);
}

function drawDrop(drop) {
  const { ctx } = window.state;
  let img = images.fuel_gold;
  if (drop.bonus) img = images.fuel_bonus;
  else if (drop.slowDown) img = images.fuel_green;
  ctx.drawImage(img, drop.x - drop.radius, drop.y - drop.radius, drop.radius * 2, drop.radius * 2);
}

function clearCanvas() {
  const { canvas, ctx, bonusActive, isMobile, PLAY_AREA_LEFT, PLAY_AREA_WIDTH } = window.state;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = bonusActive ? "#1c63ff" : "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!isMobile) {
    ctx.strokeStyle = bonusActive ? "#333" : "#666";
    ctx.lineWidth = 4;
    ctx.strokeRect(PLAY_AREA_LEFT, 0, PLAY_AREA_WIDTH, canvas.height);
  }
}

function drawTopUI() {
  const { ctx, canvas, score, missedDrops, highScore, maxMisses, bonusActive } = window.state;
  ctx.textAlign = "center";
  const color = bonusActive ? "#222" : "#fff";
  ctx.fillStyle = color;
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score} | Missed: ${missedDrops}/${maxMisses} | High Score: ${highScore}`, canvas.width / 2, 30);

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
  const { canvas, ctx, showBonusBanner, showFuelPriceBanner, showFuelDecreaseBanner } = window.state;
  if (showBonusBanner) ctx.drawImage(images.banner_bonus, canvas.width / 2 - 150, 100, 300, 50);
  if (showFuelPriceBanner) ctx.drawImage(images.banner_increase, canvas.width / 2 - 150, 160, 300, 50);
  if (showFuelDecreaseBanner) ctx.drawImage(images.banner_decrease, canvas.width / 2 - 150, 220, 300, 50);
}

function drawStartScreen() {
  const { canvas, ctx, playerName, leaderboard } = window.state;
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
  ctx.fillText(playerName + "_", canvas.width / 2, 270);

  ctx.fillText("Top 10 High Scores:", canvas.width / 2, 320);
  ctx.font = "16px Arial";
  leaderboard.slice(0, 10).forEach((entry, index) => {
    ctx.fillText(`${index + 1}. ${entry.name}: ${entry.score}`, canvas.width / 2, 350 + index * 24);
  });
}

function drawGameOver() {
  const { canvas, ctx, score, highScore } = window.state;
  clearCanvas();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "36px Arial";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 40);
  ctx.font = "24px Arial";
  ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
  ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30);
  ctx.fillText("Tap or Press Enter to Retry", canvas.width / 2, canvas.height / 2 + 70);
}

function spawnDrop() {
  const s = window.state;
  if (s.gameOver) return;

  let newY = -20;
  if (Math.abs(newY - s.lastDropY) < 30) newY -= 30;
  s.lastDropY = newY;

  const rand = Math.random();
  let drop = {
    x: s.PLAY_AREA_LEFT + Math.random() * (s.PLAY_AREA_WIDTH - 20),
    y: newY,
    radius: 10,
    caught: false,
    bonus: false,
    slowDown: false,
  };

  if (!s.bonusActive && !s.lastDropBonus && rand < 0.1) {
    drop.bonus = true;
    s.lastDropBonus = true;
  } else if (!s.lastDropGreen && s.fuelIncreases >= 3 && rand >= 0.1 && rand < 0.12) {
    drop.slowDown = true;
    s.lastDropGreen = true;
  } else {
    s.lastDropBonus = false;
    s.lastDropGreen = false;
  }

  s.drops.push(drop);
}

function updateDrops(deltaTime) {
  const s = window.state;
  for (let drop of s.drops) {
    drop.y += s.dropSpeed * (deltaTime / 16);
    if (!drop.caught && drop.y + drop.radius >= s.car.y && drop.y < s.car.y + s.car.height &&
        drop.x >= s.car.x && drop.x <= s.car.x + s.car.width) {
      drop.caught = true;

      if (drop.bonus) {
        s.bonusActive = true;
        s.bonusTimer = s.bonusDuration;
        s.showBonusBanner = true;
        setTimeout(() => s.showBonusBanner = false, s.bonusDuration);
      } else if (drop.slowDown) {
        s.dropSpeed *= 0.95;
        s.showFuelDecreaseBanner = true;
        s.fuelDecreaseTimer = s.fuelDecreaseBannerDuration;
        setTimeout(() => s.showFuelDecreaseBanner = false, s.fuelDecreaseBannerDuration);
      } else {
        s.score += s.bonusActive ? 30 : 10;
      }
    }

    if (!drop.caught && drop.y > s.canvas.height) {
      if (!drop.bonus && !drop.slowDown) {
        s.missedDrops++;
        if (s.missedDrops >= s.maxMisses) {
          s.gameOver = true;
          updateLeaderboard();
        }
      }
      drop.caught = true;
    }
  }

  s.drops = s.drops.filter(drop => !drop.caught || drop.y <= s.canvas.height);
}

function updateLeaderboard() {
  const s = window.state;
  s.leaderboard.push({ name: s.playerName || "Anon", score: s.score });
  s.leaderboard.sort((a, b) => b.score - a.score);
  s.leaderboard = s.leaderboard.slice(0, 10);
  localStorage.setItem("mzansi_leaderboard", JSON.stringify(s.leaderboard));
}

function mainLoop(timestamp = 0) {
  const s = window.state;
  if (!imagesLoaded) return;

  if (!s.gameStarted) {
    drawStartScreen();
  } else if (s.gameOver) {
    drawGameOver();
  } else {
    const now = Date.now();

    if (now - s.lastSpawn > s.spawnInterval) {
      spawnDrop();
      s.lastSpawn = now;
    }

    clearCanvas();
    updateDrops(16);
    drawCar();
    for (let drop of s.drops) drawDrop(drop);
    drawTopUI();
    drawBanners();

    if (s.bonusActive) {
      s.bonusTimer -= 16;
      if (s.bonusTimer <= 0) {
        s.bonusActive = false;
      }
    }

    if (s.score >= s.nextDifficultyThreshold) {
      s.fuelIncreases++;
      s.dropSpeed *= 1.2;
      s.spawnInterval *= 0.9;
      s.showFuelPriceBanner = true;
      s.fuelPriceBannerTimer = s.fuelPriceBannerDuration;
      setTimeout(() => s.showFuelPriceBanner = false, s.fuelPriceBannerDuration);
      s.nextDifficultyThreshold += 300;
    }
  }

  requestAnimationFrame(mainLoop);
}

// Kick off
loadImages();
