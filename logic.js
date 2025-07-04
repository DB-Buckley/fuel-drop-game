// logic.js

(function () {
  const {
    drops, car, canvas,
    dropSpeed, spawnInterval,
    lastSpawn, lastDropY, lastDropBonus, lastDropGreen,
    bonusActive, bonusTimer, bonusDuration,
    fuelIncreases, nextDifficultyThreshold,
    score, missedDrops, maxMisses,
    showBonusBanner, showFuelPriceBanner, showFuelDecreaseBanner,
    fuelPriceBannerTimer, fuelPriceBannerDuration,
    fuelDecreaseTimer, fuelDecreaseBannerDuration,
    leaderboard, playerName,
    PLAY_AREA_LEFT, PLAY_AREA_WIDTH,
    gameOver
  } = window.state;

  function randomDropX() {
    return PLAY_AREA_LEFT + Math.random() * (PLAY_AREA_WIDTH - 20);
  }

  window.spawnDrop = function () {
    if (window.state.gameOver) return;

    let newY = -20;
    if (Math.abs(newY - window.state.lastDropY) < 30) newY -= 30;
    window.state.lastDropY = newY;

    const rand = Math.random();
    let drop = {
      x: randomDropX(),
      y: newY,
      radius: 10,
      caught: false,
      bonus: false,
      slowDown: false
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
  };

  window.updateDrops = function (deltaTime) {
    const state = window.state;

    for (let drop of state.drops) {
      drop.y += state.dropSpeed * (deltaTime / 16);

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
          state.bonusTimer = bonusDuration;
          state.showBonusBanner = true;
          setTimeout(() => state.showBonusBanner = false, bonusDuration);
        } else if (drop.slowDown) {
          state.dropSpeed *= 0.95;
          state.showFuelDecreaseBanner = true;
          state.fuelDecreaseTimer = fuelDecreaseBannerDuration;
          setTimeout(() => state.showFuelDecreaseBanner = false, fuelDecreaseBannerDuration);
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
  };

  function updateLeaderboard() {
    const state = window.state;
    state.leaderboard.push({ name: state.playerName || "Anon", score: state.score });
    state.leaderboard.sort((a, b) => b.score - a.score);
    state.leaderboard = state.leaderboard.slice(0, 10);
    localStorage.setItem("mzansi_leaderboard", JSON.stringify(state.leaderboard));
  }

  window.updateBonus = function (deltaTime) {
    const state = window.state;

    if (state.bonusActive) {
      state.bonusTimer -= deltaTime;
      if (state.bonusTimer <= 0) {
        state.bonusActive = false;
      }
    }
  };

  window.updateDifficulty = function () {
    const state = window.state;

    if (state.score >= state.nextDifficultyThreshold) {
      state.fuelIncreases++;
      state.dropSpeed *= 1.2;
      state.spawnInterval *= 0.9;
      state.showFuelPriceBanner = true;
      setTimeout(() => state.showFuelPriceBanner = false, state.fuelPriceBannerDuration);
      state.nextDifficultyThreshold += 300;
    }
  };
})();
