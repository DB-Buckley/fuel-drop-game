(function () {
  const canvas = window.state.canvas;
  const car = window.state.car;
  const PLAY_AREA_LEFT = window.state.PLAY_AREA_LEFT;
  const PLAY_AREA_WIDTH = window.state.PLAY_AREA_WIDTH;

  let isDragging = false;
  let lastTapTime = 0;
  const DOUBLE_TAP_DELAY = 300; // ms

  function clampCarPosition() {
    if (car.x < PLAY_AREA_LEFT) {
      car.x = PLAY_AREA_LEFT;
    } else if (car.x + car.width > PLAY_AREA_LEFT + PLAY_AREA_WIDTH) {
      car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH - car.width;
    }
  }

  function moveLeft() {
    car.x -= car.speed;
    clampCarPosition();
  }

  function moveRight() {
    car.x += car.speed;
    clampCarPosition();
  }

  // Keyboard input
  document.addEventListener("keydown", (e) => {
    const state = window.state;

    // Toggle pause on P or Escape key
    if (e.key === "p" || e.key === "P" || e.key === "Escape") {
      if (state.gameStarted && !state.gameOver) {
        state.paused = !state.paused;
      }
    }

    if (!state.paused) {
      if (!state.gameStarted && !state.gameOver && /^[a-zA-Z0-9 ]$/.test(e.key) && state.playerName.length < 12) {
        state.playerName += e.key;
      } else if (!state.gameStarted && !state.gameOver && e.key === "Backspace") {
        state.playerName = state.playerName.slice(0, -1);
      } else if (!state.gameStarted && !state.gameOver && e.key === "Enter" && state.playerName.length > 0) {
        window.startGame();
      }

      if (["ArrowLeft", "a", "A"].includes(e.key)) moveLeft();
      if (["ArrowRight", "d", "D"].includes(e.key)) moveRight();
    }

    if (state.gameOver && e.key === "Enter") {
      window.resetGame();
      window.startGame();
    }
  });

  // Mouse drag (desktop)
  canvas.addEventListener("mousedown", (e) => {
    const state = window.state;
    if (state.gameOver) {
      window.resetGame();
      window.startGame();
    } else {
      isDragging = true;
      car.x = e.clientX - car.width / 2;
      clampCarPosition();
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDragging && !window.state.paused) {
      car.x = e.clientX - car.width / 2;
      clampCarPosition();
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Touch drag (mobile) + pause toggle on two-finger tap or double tap
  canvas.addEventListener("touchstart", (e) => {
    const state = window.state;

    if (e.touches.length === 2) {
      // Two-finger tap toggles pause
      if (state.gameStarted && !state.gameOver) {
        state.paused = !state.paused;
      }
      e.preventDefault();
      return;
    }

    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapTime < DOUBLE_TAP_DELAY) {
        if (state.gameStarted && !state.gameOver) {
          state.paused = !state.paused;
        }
        e.preventDefault();
      }
      lastTapTime = now;
    }

    if (state.gameOver) {
      window.resetGame();
      window.startGame();
    } else if (!state.paused) {
      isDragging = true;
      const touch = e.touches[0];
      car.x = touch.clientX - car.width / 2;
      clampCarPosition();
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    if (isDragging && !window.state.paused) {
      const touch = e.touches[0];
      car.x = touch.clientX - car.width / 2;
      clampCarPosition();
    }
    e.preventDefault(); // Prevent scrolling while dragging
  });

  canvas.addEventListener("touchend", () => {
    isDragging = false;
  });

  // Click to restart game
  canvas.addEventListener("click", () => {
    const state = window.state;
    if (state.gameOver) {
      window.resetGame();
      window.startGame();
    }
  });
})();
