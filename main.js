(function () {
  const s = window.state;
  const images = s.images || {};
  s.images = images;

  const imagePaths = {
    car: 'assets/car.png',
    fuel_gold: 'assets/fuel_gold.png',
    fuel_bonus: 'assets/fuel_bonus.png',
    fuel_green: 'assets/fuel_green.png',
    banner_bonus: 'assets/banner_bonus.png',
    banner_increase: 'assets/banner_increase.png',
    banner_decrease: 'assets/banner_decrease.png',
  };

  let imagesLoaded = false;

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
    const { ctx, car } = s;
    ctx.drawImage(images.car, car.x, car.y, car.width, car.height);
  }

  function drawDrop(drop) {
    const { ctx } = s;
    let img = images.fuel_gold;
    if (drop.bonus) img = images.fuel_bonus;
    else if (drop.slowDown) img = images.fuel_green;
    ctx.drawImage(img, drop.x - drop.radius, drop.y - drop.radius, drop.radius * 2, drop.radius * 2);
  }

  function clearCanvas() {
    const { canvas, ctx, bonusActive, isMobile, PLAY_AREA_LEFT, PLAY_AREA_WIDTH } = s;
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
    const { ctx, canvas, score, missedDrops, highScore, maxMisses, bonusActive } = s;
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
    const { canvas, ctx, showBonusBanner, showFuelPriceBanner, showFuelDecreaseBanner } = s;
    if (showBonusBanner) ctx.drawImage(images.banner_bonus, canvas.width / 2 - 150, 100, 300, 50);
    if (showFuelPriceBanner) ctx.drawImage(images.banner_increase, canvas.width / 2 - 150, 160, 300, 50);
    if (showFuelDecreaseBanner) ctx.drawImage(images.banner_decrease, canvas.width / 2 - 150, 220, 300, 50);
  }

  function drawStartScreen() {
    const { canvas, ctx, playerName, leaderboard } = s;
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
    const { canvas, ctx, score, highScore } = s;
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

  // Expose these functions if needed outside
  window.drawCar = drawCar;
  window.drawDrop = drawDrop;
  window.clearCanvas = clearCanvas;
  window.drawTopUI = drawTopUI;
  window.drawBanners = drawBanners;
  window.drawStartScreen = drawStartScreen;
  window.drawGameOver = drawGameOver;

  // Main loop (make sure you have window.mainLoop declared in other file or here)
  // If mainLoop is here, define it, otherwise just start loading images here
  // For this snippet, assuming mainLoop is global:
  
  loadImages();
})();
