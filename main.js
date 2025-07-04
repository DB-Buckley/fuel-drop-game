(function () {
  const s = window.state;
  let lastFrameTime = performance.now();

  function gameLoop(timestamp) {
    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    if (!s.gameStarted) {
      window.renderStartScreen();
    } else if (s.gameOver) {
      window.renderGameOver();
    } else {
      // Game running
      if (timestamp - s.lastSpawn > s.spawnInterval) {
        window.spawnDrop();
        s.lastSpawn = timestamp;
      }

      window.updateDrops(deltaTime);
      window.updateBonus(deltaTime);
      window.updateDifficulty();

      window.render();
    }

    requestAnimationFrame(gameLoop);
  }

  // Ensure all assets are loaded before starting
  function preloadAssets(callback) {
    const imagePaths = {
      car: 'assets/car.png',
      fuel_gold: 'assets/fuel_gold.png',
      fuel_bonus: 'assets/fuel_bonus.png',
      fuel_green: 'assets/fuel_green.png',
      banner_bonus: 'assets/banner_bonus.png',
      banner_increase: 'assets/banner_increase.png',
      banner_decrease: 'assets/banner_decrease.png',
    };

    const images = {};
    let loaded = 0;
    const total = Object.keys(imagePaths).length;

    for (const key in imagePaths) {
      const img = new Image();
      img.src = imagePaths[key];
      img.onload = () => {
        images[key] = img;
        loaded++;
        if (loaded === total) {
          s.images = images;
          callback();
        }
      };
      img.onerror = () => {
        console.error("Failed to load image:", imagePaths[key]);
        loaded++;
        if (loaded === total) {
          s.images = images;
          callback();
        }
      };
    }
  }

  // Start the game
  preloadAssets(() => {
    requestAnimationFrame(gameLoop);
  });
})();
