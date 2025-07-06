(function () {
  const s = window.state;

  function toggleMobileControls() {
    const controls = document.getElementById("mobile-controls");
    if (!controls) return;

    if (s.gameStarted && !s.gameOver) {
      controls.classList.add("hidden");
    } else {
      controls.classList.remove("hidden");
    }
  }

  function startGame() {
    s.gameStarted = true;
    s.gameOver = false;
    s.paused = false;
    s.score = 0;
    s.missedDrops = 0;
    s.bonusActive = false;
    s.drops = [];
    s.lastDropBonus = false;
    s.lastDropGreen = false;
    s.lastDropY = -50;
    s.lastSpawn = Date.now();
    s.dropSpeed = 2;
    s.spawnInterval = 1000;
    s.nextDifficultyThreshold = 300;
    s.fuelIncreases = 0;
    s.showBonusBanner = false;
    s.showFuelPriceBanner = false;
    s.showFuelDecreaseBanner = false;

    toggleMobileControls();
  }

  function resetGame() {
    s.gameStarted = false;
    s.gameOver = false;
    s.paused = false;
    s.playerName = "";

    toggleMobileControls();
  }

  function mainLoop() {
    if (!s.gameStarted) {
      window.renderStartScreen();
    } else if (s.gameOver) {
      window.renderGameOver();
      toggleMobileControls();
    } else if (s.paused) {
      window.render();
      const ctx = s.ctx;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, s.canvas.width, s.canvas.height);
      ctx.fillStyle = "#fff";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Paused", s.canvas.width / 2, s.canvas.height / 2);
    } else {
      const now = Date.now();

      if (now - s.lastSpawn > s.spawnInterval) {
        window.spawnDrop();
        s.lastSpawn = now;
      }

      window.updateDrops(16);
      window.updateBonus(16);
      window.updateDifficulty();
      window.render();
    }

    requestAnimationFrame(mainLoop);
  }

  // Expose globally
  window.startGame = startGame;
  window.resetGame = resetGame;
  window.mainLoop = mainLoop;

  // Load images from state.images
  function loadAllImages(callback) {
    const images = s.images;
    let loadedCount = 0;
    const totalImages = Object.keys(images).length;

    for (const key in images) {
      if (!images[key]) {
        loadedCount++;
        continue;
      }

      images[key].onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) callback();
      };

      images[key].onerror = () => {
        console.warn(`Failed to load image: ${key}`);
        loadedCount++;
        if (loadedCount === totalImages) callback();
      };
    }
  }

  // Optional loading screen
  s.ctx.fillStyle = "#000";
  s.ctx.fillRect(0, 0, s.canvas.width, s.canvas.height);
  s.ctx.fillStyle = "#fff";
  s.ctx.font = "32px Arial";
  s.ctx.textAlign = "center";
  s.ctx.fillText("Loading...", s.canvas.width / 2, s.canvas.height / 2);

  loadAllImages(() => {
    resetGame();
    requestAnimationFrame(mainLoop);
  });
})();
