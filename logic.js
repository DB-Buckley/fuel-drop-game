(function () {
  const state = window.state;

  function randomDropX() {
    return state.PLAY_AREA_LEFT + Math.random() * (state.PLAY_AREA_WIDTH - 20);
  }

  window.spawnDrop = function () {
    if (state.gameOver) return;

    // Uncomment to debug spawning:
    // console.log("Spawning a drop");

    let newY = -20;

    // Initialize lastDropY if undefined
    if (typeof state.lastDropY === "undefined") {
      state.lastDropY = newY - 50; // ensure spacing first time
    }

    // Prevent drops too close vertically
    if (Math.abs(newY - state.lastDropY) < 30) newY -= 30;
    state.lastDropY = newY;

    const rand = Math.random();
    let drop = {
      x: randomDropX(),
      y: newY,
      radius: 10,
      caught: false,
      bonus: false,
      slowDown: false,
      speed: 2 + Math.random() * 2.5, // Speed between 2 and 4.5
    };

    if (!state.bonusActive && !state.lastDropBonus && rand < 0.1) {
      drop.bonus = true;
      state.lastDropBonus = true;
    } else if (!state.lastDropGreen && state.fuelIncreases >= 3 && rand >= 0.1 && rand < 0.2) {
      drop.slowDown = true;
      state.lastDropGreen = true;
    } else {
      state.lastDropBonus = false;
      state.lastDropGreen = false;
    }

    state.drops.push(drop);
  };

  window.updateDrops = function (deltaTime) {
    for (let drop of state.drops) {
      drop.y += drop.speed * (deltaTime / 16);

      const collides =
        !drop.caught &&
        drop.y + drop.radius >= state.car.y &&
        drop.y < state.car.y + state.car.height &&
        drop.x + drop.radius >= state.car.x &&
        drop.x - drop.radius <= state.car.x + state.car.width;

      if (collides) {
        drop.caught = true;

        if (drop.bonus) {
          state.bonusActive = true;
          state.bonusTimer = state.bonusDuration;
          state.showBonusBanner = true;
          setTimeout(() => (state.showBonusBanner = false), state.bonusDuration);
        } else if (drop.slowDown) {
          state.dropSpeed *= 0.95;
          state.showFuelDecreaseBanner = true;
          state.fuelDecreaseTimer = state.fuelDecreaseBannerDuration;
          setTimeout(() => (state.showFuelDecreaseBanner = false), state.fuelDecreaseBannerDuration);
        } else {
          state.score += state.bonusActive ? 30 : 10;
        }
      }

      if (!drop.caught && drop.y > state.canvas.height) {
        if (!drop.bonus && !drop.slowDown) {
          state.missedDrops++;
          if (state.missedDrops >= state.maxMisses) {
            state.gameOver = true;
            updateLeaderboard();
          }
        }
        drop.caught = true;
      }
    }

    // Remove caught drops
    state.drops = state.drops.filter((drop) => !drop.caught);
  };

  function updateLeaderboard() {
    const playerName = (state.playerName || "Anon").trim().slice(0, 12);
    state.leaderboard.push({ name: playerName, score: state.score });
    state.leaderboard.sort((a, b) => b.score - a.score);
    state.leaderboard = state.leaderboard.slice(0, 10);
    localStorage.setItem("mzansi_leaderboard", JSON.stringify(state.leaderboard));
  }

  window.updateBonus = function (deltaTime) {
    if (state.bonusActive) {
      state.bonusTimer -= deltaTime;
      if (state.bonusTimer <= 0) {
        state.bonusActive = false;
      }
    }
  };

  window.updateDifficulty = function () {
    if (state.score >= state.nextDifficultyThreshold) {
      state.fuelIncreases++;
      state.dropSpeed *= 1.2;
      state.spawnInterval *= 0.9;
      state.showFuelPriceBanner = true;
      setTimeout(() => (state.showFuelPriceBanner = false), state.fuelPriceBannerDuration);
      state.nextDifficultyThreshold += 300;
    }
  };

  window.updateDayNightCycle = function (deltaTime) {
    if (typeof state.nightCycleTimer === "undefined") {
      state.nightCycleTimer = 0;
      state.nightModeActive = false;
    }

    state.nightCycleTimer += deltaTime;

    if (state.nightCycleTimer >= 90000) {
      state.nightCycleTimer = 0;
    }

    state.nightModeActive = state.nightCycleTimer >= 45000;
  };

  // Main update function called every frame with deltaTime (ms)
  window.update = function (deltaTime) {
    if (state.gameOver) return;

    // Fix deltaTime default to 16ms if missing or zero
    deltaTime = deltaTime || 16;

    const now = Date.now();

    // Setup lastSpawn if missing (to avoid first spawn delay)
    if (!state.lastSpawn) {
      state.lastSpawn = now;
    }

    if (now - state.lastSpawn > state.spawnInterval) {
      window.spawnDrop();
      state.lastSpawn = now;
    }

    window.updateDrops(deltaTime);
    window.updateBonus(deltaTime);
    window.updateDifficulty();
    window.updateDayNightCycle(deltaTime);
  };
})();
