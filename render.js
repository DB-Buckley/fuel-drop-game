(function () {
  const state = window.state;

  function drawCar() {
    const img = state.images.car;
    state.ctx.drawImage(img, state.car.x, state.car.y, state.car.width, state.car.height);
  }

  function drawDrop(drop) {
    let img = state.images.fuel_gold;
    if (drop.bonus) img = state.images.fuel_bonus;
    else if (drop.slowDown) img = state.images.fuel_green;
    state.ctx.drawImage(img, drop.x - drop.radius, drop.y - drop.radius, drop.radius * 2, drop.radius * 2);
  }

  function drawText(text, x, y, size = 20, center = false, color = "#fff") {
    state.ctx.fillStyle = color;
    state.ctx.font = `${size}px Arial`;
    state.ctx.textAlign = center ? "center" : "left";
    state.ctx.fillText(text, x, y);
  }

  function drawTopUI() {
    state.ctx.textAlign = "center";
    const color = state.bonusActive ? "#222" : "#fff";
    drawText(
      `Score: ${state.score} | Missed: ${state.missedDrops}/${state.maxMisses} | High Score: ${state.highScore}`,
      state.canvas.width / 2,
      30,
      20,
      true,
      color
    );

    for (let i = 0; i < state.maxMisses; i++) {
      state.ctx.beginPath();
      const x = state.canvas.width / 2 - 120 + i * 25;
      state.ctx.arc(x, 60, 8, 0, 2 * Math.PI);
      state.ctx.strokeStyle = color;
      state.ctx.fillStyle = i < (state.maxMisses - state.missedDrops) ? color : "transparent";
      state.ctx.lineWidth = 2;
      state.ctx.fill();
      state.ctx.stroke();
    }
  }

  function drawBanners() {
    if (state.showBonusBanner) {
      state.ctx.drawImage(state.images.banner_bonus, state.canvas.width / 2 - 150, 100, 300, 50);
    }
    if (state.showFuelPriceBanner) {
      state.ctx.drawImage(state.images.banner_increase, state.canvas.width / 2 - 150, 160, 300, 50);
    }
    if (state.showFuelDecreaseBanner) {
      state.ctx.drawImage(state.images.banner_decrease, state.canvas.width / 2 - 150, 220, 300, 50);
    }
  }

  function drawStartScreen() {
    clearCanvas();
    drawText("Mzansi Fuel Drop", state.canvas.width / 2, 80, 36, true);
    drawText("Catch golden drops to score points.", state.canvas.width / 2, 130, 20, true);
    drawText("Avoid missing drops. 10 misses = Game Over.", state.canvas.width / 2, 160, 18, true);
    drawText("Bonus (blue) = 3x points. Green = slow speed.", state.canvas.width / 2, 190, 18, true);

    drawText("Enter your name to begin:", state.canvas.width / 2, 240, 18, true);
    drawText(state.playerName + "_", state.canvas.width / 2, 270, 20, true);

    drawText("Top 10 High Scores:", state.canvas.width / 2, 320, 20, true);
    state.leaderboard.slice(0, 10).forEach((entry, index) => {
      drawText(`${index + 1}. ${entry.name}: ${entry.score}`, state.canvas.width / 2, 350 + index * 24, 16, true);
    });
  }

  function drawGameOver() {
    drawText("Game Over", state.canvas.width / 2, state.canvas.height / 2 - 40, 36, true);
    drawText(`Final Score: ${state.score}`, state.canvas.width / 2, state.canvas.height / 2, 24, true);
    drawText(`High Score: ${state.highScore}`, state.canvas.width / 2, state.canvas.height / 2 + 30, 24, true);
    drawText("Tap or press Enter to Retry", state.canvas.width / 2, state.canvas.height / 2 + 70, 24, true);
  }

  function clearCanvas() {
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    state.ctx.fillStyle = state.bonusActive ? "#1c63ff" : "#111";
    state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);

    if (!state.isMobile) {
      state.ctx.strokeStyle = state.bonusActive ? "#333" : "#666";
      state.ctx.lineWidth = 4;
      state.ctx.strokeRect(state.PLAY_AREA_LEFT, 0, state.PLAY_AREA_WIDTH, state.canvas.height);
    }
  }

  window.render = function () {
    clearCanvas();
    drawCar();
    for (let drop of state.drops) drawDrop(drop);
    drawTopUI();
    drawBanners();
  };

  window.renderStartScreen = drawStartScreen;
  window.renderGameOver = drawGameOver;
})();
