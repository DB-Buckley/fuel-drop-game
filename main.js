(function () {
  const s = window.state;

  function startGame() {
    s.gameStarted = true;
    s.gameOver = false;
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
  }

  function resetGame() {
    s.gameStarted = false;
    s.gameOver = false;
    s.playerName = "";
  }

  function mainLoop(timestamp = 0) {
    if (!s.gameStarted) {
      window.renderStartScreen();
    } else if (s.gameOver) {
      window.renderGameOver();
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

  // Expose functions globally for other scripts to use
  window.startGame = startGame;
  window.resetGame = resetGame;
  window.mainLoop = mainLoop;
})();
