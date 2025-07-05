(function () {
  const state = window.state;

  // === Helpers ===
  function drawText(text, x, y, size = 20, center = false, color = "#fff") {
    const ctx = state.ctx;
    ctx.fillStyle = color;
    ctx.font = `${size}px Arial`;
    ctx.textAlign = center ? "center" : "left";
    ctx.fillText(text, x, y);
  }

  function clearCanvas() {
    const { ctx, canvas, bonusActive, isMobile, PLAY_AREA_LEFT, PLAY_AREA_WIDTH } = state;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bonusActive ? "#1c63ff" : "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!isMobile) {
      ctx.strokeStyle = bonusActive ? "#333" : "#666";
      ctx.lineWidth = 4;
      ctx.strokeRect(PLAY_AREA_LEFT, 0, PLAY_AREA_WIDTH, canvas.height);
    }
  }

  // === Game Rendering ===
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

  function drawTopUI() {
    const ctx = state.ctx;
    const { canvas, bonusActive, missedDrops, maxMisses, score, highScore, isMobile } = state;
    const color = bonusActive ? "#222" : "#fff";

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

    drawText(isMobile ? "Double-tap to Pause" : "Press P or Esc to Pause", canvas.width / 2, 90, 16, true, "#aaa");

    // Legends
    if (isMobile) {
      const legends = [
        { img: state.images.fuel_gold, text: "+10" },
        { img: state.images.fuel_bonus, text: "3×" },
        { img: state.images.fuel_green, text: "Slow" },
      ];
      const totalWidth = legends.length * 64 + (legends.length - 1) * 20;
      let startX = (canvas.width - totalWidth) / 2;
      const legendY = canvas.height - 40;

      ctx.globalAlpha = 0.75;
      legends.forEach(({ img, text }) => {
        ctx.drawImage(img, startX, legendY - 24, 32, 32);
        drawText(text, startX + 16, legendY + 18, 14, true, "#fff");
        startX += 64;
      });
      ctx.globalAlpha = 1;
    } else {
      const legendX = 20;
      let legendY = canvas.height - 130;
      const imgSize = 24;
      const spacing = 8;

      function drawLegend(img, label) {
        ctx.drawImage(img, legendX, legendY, imgSize, imgSize);
        drawText(label, legendX + imgSize + spacing, legendY + imgSize - 6, 16, false, "#fff");
        legendY += imgSize + 10;
      }

      drawLegend(state.images.fuel_gold, "+10 Points");
      drawLegend(state.images.fuel_bonus, "3× Points (8s)");
      drawLegend(state.images.fuel_green, "Slows Drops");
    }
  }

  function drawExitButton() {
    const isMobile = state.isMobile;
    const ctx = state.ctx;
    const btnW = isMobile ? 40 : 80;
    const btnH = 32;
    const btnX = state.canvas.width - btnW - 20;
    const btnY = isMobile ? state.canvas.height - btnH - 20 : 20;

    ctx.fillStyle = "rgba(50, 50, 50, 0.7)";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.strokeRect(btnX, btnY, btnW, btnH);

    ctx.fillStyle = "#fff";
    ctx.font = `${isMobile ? 28 : 18}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isMobile ? "×" : "Exit", btnX + btnW / 2, btnY + btnH / 2);
  }

  function drawLogo() {
    if (state.isMobile || !state.images.mzansiLogo) return;
    const size = 128;
    const padding = 20;
    const x = state.canvas.width - size - padding;
    const y = padding;
    state.ctx.drawImage(state.images.mzansiLogo, x, y, size, size);
  }

  function drawBanners() {
    const { ctx, images, canvas } = state;
    if (state.showBonusBanner) ctx.drawImage(images.banner_bonus, canvas.width / 2 - 150, 100, 300, 50);
    if (state.showFuelPriceBanner) ctx.drawImage(images.banner_increase, canvas.width / 2 - 150, 160, 300, 50);
    if (state.showFuelDecreaseBanner) ctx.drawImage(images.banner_decrease, canvas.width / 2 - 150, 220, 300, 50);
  }

  // === Start & End Screens ===
  function drawStartScreen() {
    const { ctx, canvas, isMobile, images } = state;
    const splash = isMobile ? images.splash_mobile : images.splash_desktop;
    ctx.drawImage(splash, 0, 0, canvas.width, canvas.height);

    drawText("Mzansi Fuel Drop", canvas.width / 2, 80, 36, true);
    drawText("Catch golden drops to score points.", canvas.width / 2, 130, 20, true);
    drawText("Avoid missing drops. 10 misses = Game Over.", canvas.width / 2, 160, 18, true);
    drawText("Bonus (blue) = 3x points. Green = slow speed.", canvas.width / 2, 190, 18, true);

    const mobileControls = document.getElementById("mobile-controls");

    if (!isMobile) {
      drawText("Enter your name to begin:", canvas.width / 2, 240, 18, true);
      drawText(state.playerName + "_", canvas.width / 2, 270, 20, true);
      if (mobileControls) mobileControls.style.display = "none";
    } else {
      if (mobileControls) {
        mobileControls.style.display = "block";
        const input = document.getElementById("mobile-player-name");
        if (input) {
          input.value = state.playerName;
          input.addEventListener("touchstart", () => setTimeout(() => input.focus(), 100), { once: true });
        }
      }
    }

    drawText("Top 10 High Scores:", canvas.width / 2, 320, 20, true);
    state.leaderboard.slice(0, 10).forEach((entry, index) => {
      drawText(`${index + 1}. ${entry.name}: ${entry.score}`, canvas.width / 2, 350 + index * 24, 16, true);
    });

    drawLogo();
  }

  function drawGameOver() {
    clearCanvas();
    drawText("Game Over", state.canvas.width / 2, state.canvas.height / 2 - 40, 36, true);
    drawText(`Final Score: ${state.score}`, state.canvas.width / 2, state.canvas.height / 2, 24, true);
    drawText(`High Score: ${state.highScore}`, state.canvas.width / 2, state.canvas.height / 2 + 30, 24, true);
    drawText("Tap or press Enter to Retry", state.canvas.width / 2, state.canvas.height / 2 + 70, 24, true);

    const mobileControls = document.getElementById("mobile-controls");
    if (mobileControls) mobileControls.style.display = "none";

    drawLogo();
  }

  // === Exported Functions ===
  window.render = function () {
    clearCanvas();
    drawCar();
    for (let drop of state.drops) drawDrop(drop);
    drawTopUI();
    drawBanners();
    drawExitButton();
    drawLogo();
  };

  window.renderStartScreen = drawStartScreen;
  window.renderGameOver = drawGameOver;
})();
