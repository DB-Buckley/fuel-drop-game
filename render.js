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
    const ctx = state.ctx;
    const { canvas, bonusActive, missedDrops, maxMisses, score, highScore, isMobile } = state;
    ctx.textAlign = "center";

    const color = bonusActive ? "#222" : "#fff";

    // Main Score HUD
    drawText(
      `Score: ${score} | Missed: ${missedDrops}/${maxMisses} | High Score: ${highScore}`,
      canvas.width / 2,
      30,
      20,
      true,
      color
    );

    // Miss markers (dots)
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

    // Pause instructions
    const pauseText = isMobile ? "Double-tap to Pause" : "Press P or Esc to Pause";
    drawText(pauseText, canvas.width / 2, 90, 16, true, "#aaa");

    // Drop Legends (bottom-left)
    drawText("💛 Gold: +10", 20, canvas.height - 80, 16, false, "#f5c400");
    drawText("💙 Blue: 3× Points (8s)", 20, canvas.height - 55, 16, false, "#00CFFF");
    drawText("💚 Green: Slows Drops", 20, canvas.height - 30, 16, false, "#00ff88");

    // Exit Button (top-right)
  const btnW = 70;
  const btnH = 22;
  const btnX = canvas.width - btnW - 20;
  const btnY = state.isMobile ? canvas.height - btnH - 20 : 20;

    ctx.fillStyle = "#ff3b3b";
    ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Exit", btnX + btnW / 2, btnY + btnH / 2);

    // Save exit button bounds for inputs.js
    state.exitButton = { x: btnX, y: btnY, width: btnW, height: btnH };
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

  function drawStartScreen() {
    clearCanvas();

    drawText("Mzansi Fuel Drop", state.canvas.width / 2, 80, 36, true);
    drawText("Catch golden drops to score points.", state.canvas.width / 2, 130, 20, true);
    drawText("Avoid missing drops. 10 misses = Game Over.", state.canvas.width / 2, 160, 18, true);
    drawText("Bonus (blue) = 3x points. Green = slow speed.", state.canvas.width / 2, 190, 18, true);

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (!isMobile) {
      drawText("Enter your name to begin:", state.canvas.width / 2, 240, 18, true);
      drawText(state.playerName + "_", state.canvas.width / 2, 270, 20, true);

      const mobileControls = document.getElementById('mobile-controls');
      if (mobileControls) mobileControls.style.display = 'none';
    } else {
      const mobileControls = document.getElementById('mobile-controls');
      if (mobileControls) {
        mobileControls.style.display = 'block';
        const input = document.getElementById('mobile-player-name');
        if (input) input.value = state.playerName;
      }
    }

    drawText("Top 10 High Scores:", state.canvas.width / 2, 320, 20, true);
    state.leaderboard.slice(0, 10).forEach((entry, index) => {
      drawText(`${index + 1}. ${entry.name}: ${entry.score}`, state.canvas.width / 2, 350 + index * 24, 16, true);
    });
  }

  function drawGameOver() {
    clearCanvas();

    drawText("Game Over", state.canvas.width / 2, state.canvas.height / 2 - 40, 36, true);
    drawText(`Final Score: ${state.score}`, state.canvas.width / 2, state.canvas.height / 2, 24, true);
    drawText(`High Score: ${state.highScore}`, state.canvas.width / 2, state.canvas.height / 2 + 30, 24, true);
    drawText("Tap or press Enter to Retry", state.canvas.width / 2, state.canvas.height / 2 + 70, 24, true);

    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) mobileControls.style.display = 'none';
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
