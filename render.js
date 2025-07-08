(function () {
  const state = window.state;

  function drawText(text, x, y, size = 20, center = false, color = "#fff") {
    const ctx = state.ctx;
    ctx.fillStyle = color;
    ctx.font = `${size}px Arial`;
    ctx.textAlign = center ? "center" : "left";
    ctx.fillText(text, x, y);
  }

  function drawParallaxLayer(image, scrollX, speed, y, height) {
    const { ctx, PLAY_AREA_LEFT, PLAY_AREA_WIDTH } = state;
    scrollX -= speed;
    if (scrollX <= -PLAY_AREA_WIDTH) scrollX = 0;

    const x1 = Math.floor(PLAY_AREA_LEFT + scrollX);
    const x2 = Math.floor(x1 + PLAY_AREA_WIDTH) - 1;

    ctx.drawImage(image, x1, y, PLAY_AREA_WIDTH, height);
    ctx.drawImage(image, x2, y, PLAY_AREA_WIDTH, height);

    return scrollX;
  }

  function clearCanvas() {
    const {
      ctx,
      canvas,
      PLAY_AREA_LEFT,
      PLAY_AREA_WIDTH,
      PLAY_AREA_HEIGHT,
      isMobile,
      images,
      bgScroll,
      bgSpeed,
      bonusActive,
      nightModeActive,
    } = state;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.beginPath();
    ctx.rect(PLAY_AREA_LEFT, 0, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
    ctx.clip();

    const prefix = isMobile ? "gbg_mobile_layer" : "gbg_desktop_layer";

    const layerHeights = {
      layer3: PLAY_AREA_HEIGHT,
      layer2: PLAY_AREA_HEIGHT,
      layer1: PLAY_AREA_HEIGHT,
    };

    const layer3 = images[`${prefix}3`];
    if (layer3?.complete) {
      bgScroll.layer3X = drawParallaxLayer(
        layer3,
        bgScroll.layer3X,
        bgSpeed.layer3,
        PLAY_AREA_HEIGHT - layerHeights.layer3,
        layerHeights.layer3
      );
    }

    const layer2 = images[`${prefix}2`];
    if (layer2?.complete) {
      bgScroll.layer2X = drawParallaxLayer(
        layer2,
        bgScroll.layer2X,
        bgSpeed.layer2,
        PLAY_AREA_HEIGHT - layerHeights.layer2,
        layerHeights.layer2
      );
    }

    const layer1 = images[`${prefix}1`];
    if (layer1?.complete) {
      bgScroll.layer1X = drawParallaxLayer(
        layer1,
        bgScroll.layer1X,
        bgSpeed.layer1,
        PLAY_AREA_HEIGHT - layerHeights.layer1,
        layerHeights.layer1
      );
    }

   if (nightModeActive) {
  const forceDesktopNightFilter = true;

  const filterImg = (isMobile && forceDesktopNightFilter)
    ? images.nt_filter_desktop
    : isMobile
      ? images.nt_filter_mobile
      : images.nt_filter_desktop;

  if (filterImg?.complete) {
    ctx.save();
    ctx.globalAlpha = state.nightFilterAlpha;
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(filterImg, PLAY_AREA_LEFT, 0, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
    ctx.restore();
  }
}
  ctx.restore();
  }

  function drawCar() {
    const ctx = state.ctx;
    const { nightModeActive, images, car, isMobile } = state;

    const img = nightModeActive ? images.car_night : images.car;

    if (!img?.complete) return;

    // Default size
    let width = car.width;
    let height = car.height;

    // Custom adjustment for car_night width due to beam
    if (nightModeActive) {
      const beamOffset = isMobile ? 30 : 40; // adjust beam stretch based on platform
      width += beamOffset;
    }

    ctx.drawImage(img, car.x, car.y, width, height);
  }

  function drawDrop(drop) {
    let img = state.images.fuel_gold;
    if (drop.bonus) img = state.images.fuel_bonus;
    else if (drop.slowDown) img = state.images.fuel_green;

    if (img?.complete) {
      state.ctx.drawImage(
        img,
        drop.x - drop.radius,
        drop.y - drop.radius,
        drop.radius * 2,
        drop.radius * 2
      );
    }
  }

  function drawTopUI() {
    const ctx = state.ctx;
    const { canvas, bonusActive, missedDrops, maxMisses, score, highScore, isMobile } = state;
    const color = bonusActive ? "#fff" : "#fff";

    drawText(`Score: ${score} | Missed: ${missedDrops}/${maxMisses} | High Score: ${highScore}`, canvas.width / 2, 30, 20, true, color);

    for (let i = 0; i < maxMisses; i++) {
      ctx.beginPath();
      const x = canvas.width / 2 - 120 + i * 25;
      ctx.arc(x, 60, 8, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.fillStyle = i < maxMisses - missedDrops ? color : "transparent";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    }

    drawText(isMobile ? "Double-tap to Pause" : "Press P or Esc to Pause", canvas.width / 2, 90, 16, true, "#aaa");

    if (isMobile) {
      const legends = [
        { img: state.images.fuel_gold, text: "+10" },
        { img: state.images.fuel_bonus, text: "3×" },
        { img: state.images.fuel_green, text: "Slow" },
      ];
      const totalWidth = legends.length * 64 + (legends.length - 1) * 20;
      let startX = (canvas.width - totalWidth) / 2;
      const legendY = canvas.height - 30;

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
    const { isMobile, ctx, canvas } = state;
    const btnW = isMobile ? 40 : 80;
    const btnH = 32;
    const btnX = canvas.width - btnW - 20;
    const btnY = isMobile ? canvas.height - btnH - 20 : 20;

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

  function drawBanners() {
    const { ctx, images, canvas } = state;
    if (state.showBonusBanner) ctx.drawImage(images.banner_bonus, canvas.width / 2 - 150, 100, 300, 50);
    if (state.showFuelPriceBanner) ctx.drawImage(images.banner_increase, canvas.width / 2 - 150, 160, 300, 50);
    if (state.showFuelDecreaseBanner) ctx.drawImage(images.banner_decrease, canvas.width / 2 - 150, 220, 300, 50);
  }

  function drawStartScreen() {
    const { ctx, canvas, isMobile, images } = state;
    const splash = isMobile ? images.splash_mobile : images.splash_desktop;

    if (splash?.complete) {
      ctx.drawImage(splash, 0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const mobileControls = document.getElementById("mobile-controls");

    if (!isMobile) {
      const offsetX = canvas.width / 2 + 180;

      drawText("Catch gold drops to score points. Don't Miss!", offsetX, 270, 20);
      drawText("Enter your name to begin:", offsetX, 210, 18);
      drawText(state.playerName + "_", offsetX, 240, 20);
      drawText("Top 10 High Scores:", offsetX, 290, 20);

      state.leaderboard.slice(0, 10).forEach((entry, index) => {
        drawText(`${index + 1}. ${entry.name}: ${entry.score}`, offsetX, 350 + index * 24, 16);
      });

      const box = document.getElementById("leaderboard-box");
      if (box) {
        box.style.left = `${offsetX - 10}px`;
        box.style.top = "280px";
        box.style.display = "block";
      }

      if (mobileControls) mobileControls.style.display = "none";
    } else {
      drawText("Catch golden drops to score points. Don't Miss", canvas.width / 2, 230, 18, true);

      if (mobileControls) {
        mobileControls.style.display = "block";
        mobileControls.style.position = "absolute";
        mobileControls.style.left = "50%";
        mobileControls.style.top = "45%";
        mobileControls.style.transform = "translate(-50%, -50%)";
        mobileControls.style.textAlign = "center";
      }

      const lbX = canvas.width / 2 - 130;
      const lbY = canvas.height - 280;
      const lbWidth = 260;
      const lbHeight = 240;

      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(lbX, lbY, lbWidth, lbHeight);

      drawText("Top 10 High Scores:", canvas.width / 2, lbY + 40, 20, true);
      state.leaderboard.slice(0, 10).forEach((entry, index) => {
        drawText(`${index + 1}. ${entry.name}: ${entry.score}`, canvas.width / 2, lbY + 70 + index * 20, 16, true);
      });

      const box = document.getElementById("leaderboard-box");
      if (box) box.style.display = "none";
    }
  }

  function drawGameOver() {
    clearCanvas();

    const { canvas, ctx, score, highScore, isMobile } = state;

    drawText("Game Over", canvas.width / 2, canvas.height / 2 - 60, 36, true);
    drawText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 - 20, 24, true);
    drawText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 10, 24, true);
    drawText("Tap or press Enter to Retry", canvas.width / 2, canvas.height / 2 + 50, 20, true);

    // Show return button
    const returnBtn = document.getElementById("return-start-btn");
    if (returnBtn) {
      returnBtn.style.display = "block";
      returnBtn.style.position = "absolute";
      returnBtn.style.left = "50%";
      returnBtn.style.top = "50%";
      returnBtn.style.transform = "translate(-50%, -50%)";
      returnBtn.style.padding = "12px 24px";
      returnBtn.style.fontSize = "18px";
      returnBtn.style.background = "#1c63ff";
      returnBtn.style.color = "#fff";
      returnBtn.style.border = "none";
      returnBtn.style.borderRadius = "6px";
      returnBtn.style.cursor = "pointer";
      returnBtn.style.zIndex = "1000";
    }

    // Hide mobile controls during game over
    const mobileControls = document.getElementById("mobile-controls");
    if (mobileControls) mobileControls.style.display = "none";

    // Draw legends and exit button on game over screen
    drawTopUI();
    drawExitButton();
  }

  window.renderStartScreen = drawStartScreen;
  window.renderGameOver = drawGameOver;
  window.render = function () {
    clearCanvas();
    drawCar();
    for (let drop of state.drops) drawDrop(drop);
    drawTopUI();
    drawBanners();
    drawExitButton();
  };

  function positionLeaderboardBox() {
    const box = document.getElementById("leaderboard-box");
    if (!box || window.innerWidth < 768) return;
    const offsetX = window.innerWidth / 2 + 180;
    box.style.left = `${offsetX - 10}px`;
    box.style.top = "280px";
  }

  window.addEventListener("resize", positionLeaderboardBox);
  window.addEventListener("load", positionLeaderboardBox);
})();
