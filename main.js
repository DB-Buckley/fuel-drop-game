// main.js

const { canvas, ctx, car, ... } = window.state;
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
  if (state.bonusActive) {
    ctx.fillStyle = "#1c63ff"; // updated bonus background color
  } else {
    ctx.fillStyle = "#111";
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!isMobile) {
    ctx.strokeStyle = state.bonusActive ? "#333" : "#666";
    ctx.lineWidth = 4;
    ctx.strokeRect(PLAY_AREA_LEFT, 0, PLAY_AREA_WIDTH, canvas.height);
  }
}

function drawTopUI() {
  ctx.textAlign = "center";
  const color = state.bonusActive ? "#222" : "#fff";
  ctx.fillStyle = color;
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${state.score} | Missed: ${state.missedDrops}/${maxMisses} | High Score: ${state.highScore}`, canvas.width / 2, 30);

  // Draw missed circles
  for (let i = 0; i < maxMisses; i++) {
    ctx.beginPath();
    const x = canvas.width / 2 - 120 + i * 25;
    ctx.arc(x, 60, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.fillStyle = i < (maxMisses - state.missedDrops) ? color : "transparent";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }
}

function drawBanners() {
  if (state.showBonusBanner) ctx.drawImage(images.banner_bonus, canvas.width / 2 - 150, 100, 300, 50);
  if (state.showFuelPriceBanner) ctx.drawImage(images.banner_increase, canvas.width / 2 - 150, 160, 300, 50);
  if (state.showFuelDecreaseBanner) ctx.drawImage(images.banner_decrease, canvas.width / 2 - 150, 220, 300, 50);
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
  ctx.fillText(state.playerName + "_", canvas.width / 2, 270);

  ctx.fillText("Top 10 High Scores:", canvas.width / 2, 320);
  ctx.font = "16px Arial";
  state.leaderboard.slice(0, 10).forEach((entry, index) => {
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
  ctx.fillText(`Final Score: ${state.score}`, canvas.width / 2, canvas.height / 2);
  ctx.fillText(`High Score: ${state.highScore}`, canvas.width / 2, canvas.height / 2 + 30);
  ctx.fillText("Tap or Press Enter to Retry", canvas.width / 2, canvas.height / 2 + 70);
}

function spawnDrop() {
  if (state.gameOver) return;

  let newY = -20;
  if (Math.abs(newY - state.lastDropY) < 30) newY -= 30;
  state.lastDropY = newY;

  const rand = Math.random();
  let drop = {
    x: PLAY_AREA_LEFT + Math.random() * (PLAY_AREA_WIDTH - 20),
    y: newY,
    radius: 10,
    caught: false,
    bonus: false,
    slowDown: false,
  };

  if (!state.bonusActive && !state.lastDropBonus && rand < 0.1) {
    drop.bonus = true;
    state.lastDropBonus = true;
  } else if (!state.lastDropGreen && state.fuelIncreases >= 3 && rand >= 0.1 && rand < 0.12) {
    drop.slowDown = true;
    state.lastDropGreen = true;
  } else {
    state.lastDropBonus = false;
    state.lastDropGreen = false;
  }

  state.drops.push(drop);
}

function updateDrops(deltaTime) {
  for (let drop of state.drops) {
    drop.y += state.dropSpeed * (deltaTime / 16);
    if (!drop.caught && drop.y + drop.radius >= car.y && drop.y < car.y + car.height &&
        drop.x >= car.x && drop.x <= car.x + car.width) {
      drop.caught = true;

      if (drop.bonus) {
        state.bonusActive = true;
        state.bonusTimer = state.bonusDuration;
        state.showBonusBanner = true;
        setTimeout(() => state.showBonusBanner = false, state.bonusDuration);
      } else if (drop.slowDown) {
        state.dropSpeed *= 0.95;
        state.showFuelDecreaseBanner = true;
        state.fuelDecreaseTimer = state.fuelDecreaseBannerDuration;
        setTimeout(() => state.showFuelDecreaseBanner = false, state.fuelDecreaseBannerDuration);
      } else {
        state.score += state.bonusActive ? 30 : 10;
      }
    }

    if (!drop.caught && drop.y > canvas.height) {
      if (!drop.bonus && !drop.slowDown) {
        state.missedDrops++;
        if (state.missedDrops >= maxMisses) {
          state.gameOver = true;
          updateLeaderboard();
        }
      }
      drop.caught = true;
    }
  }

  state.drops = state.drops.filter(drop => !drop.caught || drop.y <= canvas.height);
}

function updateLeaderboard() {
  state.leaderboard.push({ name: state.playerName || "Anon", score: state.score });
  state.leaderboard.sort((a, b) => b.score - a.score);
  state.leaderboard = state.leaderboard.slice(0, 10);
  localStorage.setItem("mzansi_leaderboard", JSON.stringify(state.leaderboard));
}

function mainLoop(timestamp = 0) {
  if (!imagesLoaded) return;

  if (!state.gameStarted) {
    drawStartScreen();
  } else if (state.gameOver) {
    drawGameOver();
  } else {
    const now = Date.now();

    if (now - state.lastSpawn > state.spawnInterval) {
      spawnDrop();
      state.lastSpawn = now;
    }

    clearCanvas();
    updateDrops(16);
    drawCar();
    for (let drop of state.drops) drawDrop(drop);
    drawTopUI();
    drawBanners();

    // Bonus timer
    if (state.bonusActive) {
      state.bonusTimer -= 16;
      if (state.bonusTimer <= 0) {
        state.bonusActive = false;
      }
    }

    // Fuel price increase logic
    if (state.score >= state.nextDifficultyThreshold) {
      state.fuelIncreases++;
      state.dropSpeed *= 1.2;
      state.spawnInterval *= 0.9;
      state.showFuelPriceBanner = true;
      state.fuelPriceBannerTimer = state.fuelPriceBannerDuration;
      setTimeout(() => state.showFuelPriceBanner = false, state.fuelPriceBannerDuration);
      state.nextDifficultyThreshold += 300;
    }
  }

  requestAnimationFrame(mainLoop);
}

function setupInputs() {
  // Keyboard input
  document.addEventListener("keydown", (e) => {
    if (!state.gameStarted && !state.gameOver && /^[a-zA-Z0-9 ]$/.test(e.key) && state.playerName.length < 12) {
      state.playerName += e.key;
    } else if (!state.gameStarted && !state.gameOver && e.key === "Backspace") {
      state.playerName = state.playerName.slice(0, -1);
    } else if (!state.gameStarted && !state.gameOver && e.key === "Enter" && state.playerName.length > 0) {
      startGame();
    }

    if (["ArrowLeft", "a", "A"].includes(e.key)) moveLeft();
    if (["ArrowRight", "d", "D"].includes(e.key)) moveRight();

    if (state.gameOver && e.key === "Enter") {
      resetGame();
      startGame();
    }
  });

  // Mouse and touch drag for car
  let isDragging = false;

  canvas.addEventListener("mousedown", (e) => {
    if (state.gameOver) {
      resetGame();
      startGame();
    } else {
      isDragging = true;
      state.car.x = e.clientX - state.car.width / 2;
      clampCarPosition();
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
      state.car.x = e.clientX - state.car.width / 2;
      clampCarPosition();
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
  });

  canvas.addEventListener("touchstart", (e) => {
    if (state.gameOver) {
      resetGame();
      startGame();
    } else {
      isDragging = true;
      const touch = e.touches[0];
      state.car.x = touch.clientX - state.car.width / 2;
      clampCarPosition();
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      state.car.x = touch.clientX - state.car.width / 2;
      clampCarPosition();
    }
    e.preventDefault(); // Prevent scrolling while dragging
  });

  canvas.addEventListener("touchend", () => {
    isDragging = false;
  });

  // Click canvas to restart if game over
  canvas.addEventListener("click", () => {
    if (state.gameOver) {
      resetGame();
      startGame();
    }
  });
}

function clampCarPosition() {
  if (state.car.x < PLAY_AREA_LEFT) {
    state.car.x = PLAY_AREA_LEFT;
  } else if (state.car.x + state.car.width > PLAY_AREA_LEFT + PLAY_AREA_WIDTH) {
    state.car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH - state.car.width;
  }
}

function moveLeft() {
  state.car.x -= state.car.speed;
  clampCarPosition();
}

function moveRight() {
  state.car.x += state.car.speed;
  clampCarPosition();
}

// Start the game setup
loadImages();
setupInputs();
