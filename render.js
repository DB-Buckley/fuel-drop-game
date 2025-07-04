// render.js

(function () {
  const { canvas, ctx, car, isMobile, PLAY_AREA_LEFT, PLAY_AREA_WIDTH } = window.state;

  function drawCar() {
    const img = window.state.images.car;
    ctx.drawImage(img, car.x, car.y, car.width, car.height);
  }

  function drawDrop(drop) {
    let img = window.state.images.fuel_gold;
    if (drop.bonus) img = window.state.images.fuel_bonus;
    else if (drop.slowDown) img = window.state.images.fuel_green;
    ctx.drawImage(img, drop.x - drop.radius, drop.y - drop.radius, drop.radius * 2, drop.radius * 2);
  }

  function drawText(text, x, y, size = 20, center = false, color = "#fff") {
    ctx.fillStyle = color;
    ctx.font = `${size}px Arial`;
    ctx.textAlign = center ? "center" : "left";
    ctx.fillText(text, x, y);
  }

  function drawTopUI() {
    ctx.textAlign = "center";
    const color = window.state.bonusActive ? "#222" : "#fff";
    drawText(
      `Score: ${window.state.score} | Missed: ${window.state.missedDrops}/${window.state.maxMisses} | High Score: ${window.state.highScore}`,
      canvas.width / 2,
      30,
      20,
      true,
      color
    );

    for (let i = 0; i < window.state.maxMisses; i++) {
      ctx.beginPath();
      const x = canvas.width / 2 - 120 + i * 25;
      ctx.arc(x, 60, 8, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.fillStyle = i < (window.state.maxMisses - window.state.missedDrops) ? color : "transparent";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawBanners() {
    if (window.state.showBonusBanner) {
      ctx.drawImage(window.state.images.banner_bonus, canvas.width / 2 - 150, 100, 300, 50);
    }
    if (window.state.showFuelPriceBanner) {
      ctx.drawImage(window.state.images.banner_increase, canvas.width / 2 - 150, 160, 300, 50);
    }
    if (window.state.showFuelDecreaseBanner) {
      ctx.drawImage(window.state.images.banner_decrease, canvas.width / 2 - 150, 220, 300, 50);
    }
  }

  function drawStartScreen() {
    clearCanvas();
    drawText("Mzansi Fuel Drop", canvas.width / 2, 80, 36, true);
    drawText("Catch golden drops to score points.", canvas.width / 2, 130, 20, true);
    drawText("Avoid missing drops. 10 misses = Game Over.", canvas.width / 2, 160, 18, true);
    drawText("Bonus (blue) = 3x points. Green = slow speed.", canvas.width / 2, 190, 18, true);

    drawText("Enter your name to begin:", canvas.width / 2, 240, 18, true);
    drawText(window.state.playerName + "_", canvas.width / 2, 270, 20, true);

    drawText("Top 10 High Scores:", canvas.width / 2, 320, 20, true);
    window.state.leaderboard.slice(0, 10).forEach((entry, index) => {
      drawText(`${index + 1}. ${entry.name}: ${entry.score}`, canvas.width / 2, 350 + index * 24, 16, true);
    });
  }

  function drawGameOver() {
    drawText("Game Over", canvas.width / 2, canvas.height / 2 - 40, 36, true);
    drawText(`Final Score: ${window.state.score}`, canvas.width / 2, canvas.height / 2, 24, true);
    drawText(`High Score: ${window.state.highScore}`, canvas.width / 2, canvas.height / 2 + 30, 24, true);
    drawText("Tap or press Enter to Retry", canvas.width / 2, canvas.height / 2 + 70, 24, true);
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

  window.render = function () {
    clearCanvas();
    drawCar();
    for (let drop of window.state.drops) drawDrop(drop);
    drawTopUI();
    drawBanners();
  };

  window.renderStartScreen = drawStartScreen;
  window.renderGameOver = drawGameOver;
})();
