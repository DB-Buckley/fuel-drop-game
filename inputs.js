(function () {
  const s = window.state;
  const canvas = s.canvas;
  const car = s.car;

  let isDragging = false;
  let lastTap = 0;

  const nameInput = document.getElementById("mobile-player-name");
  const mobileControls = document.getElementById("mobile-controls");

  function clampCarPosition() {
    if (car.x < s.PLAY_AREA_LEFT) {
      car.x = s.PLAY_AREA_LEFT;
    } else if (car.x + car.width > s.PLAY_AREA_LEFT + s.PLAY_AREA_WIDTH) {
      car.x = s.PLAY_AREA_LEFT + s.PLAY_AREA_WIDTH - car.width;
    }
  }

  window.clampCarPosition = clampCarPosition;

  function moveLeft() {
    car.x -= car.speed;
    clampCarPosition();
  }

  function moveRight() {
    car.x += car.speed;
    clampCarPosition();
  }

  window.moveLeft = moveLeft;
  window.moveRight = moveRight;

  // === KEYBOARD INPUT (desktop) ===
  document.addEventListener("keydown", (e) => {
    const isTyping = document.activeElement === nameInput;
    const isMobile = s.isMobile;

    if (!s.gameStarted && !s.gameOver && !isMobile && !isTyping) {
      if (/^[a-zA-Z0-9 ]$/.test(e.key) && s.playerName.length < 12) {
        s.playerName += e.key;
        return;
      }
      if (e.key === "Backspace") {
        s.playerName = s.playerName.slice(0, -1);
        return;
      }
      if (e.key === "Enter" && s.playerName.length > 0) {
        window.startGame();
        mobileControls?.classList.add("hidden");
        return;
      }
    }

    if (["ArrowLeft", "a", "A"].includes(e.key)) moveLeft();
    if (["ArrowRight", "d", "D"].includes(e.key)) moveRight();

    if (s.gameOver && e.key === "Enter") {
      window.resetGame();
      window.startGame();
      mobileControls?.classList.add("hidden");
    }

    if ((e.key === "p" || e.key === "Escape") && s.gameStarted) {
      s.paused = !s.paused;
    }
  });

  // === MOUSE INPUT ===
  canvas.addEventListener("mousedown", (e) => {
    if (checkExitClick(e.clientX, e.clientY)) {
      window.resetGame();
      return;
    }
    if (s.gameOver) return; // ❌ prevent auto-restart on game over
    isDragging = true;
    car.x = e.clientX - car.width / 2;
    clampCarPosition();
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
      car.x = e.clientX - car.width / 2;
      clampCarPosition();
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // === TOUCH INPUT ===
  canvas.addEventListener("touchstart", (e) => {
    if (e.target === nameInput || nameInput?.contains(e.target)) return;

    const now = Date.now();
    if (now - lastTap < 300 && s.gameStarted && !s.gameOver) {
      s.paused = !s.paused;
    }
    lastTap = now;

    const touch = e.touches[0];
    if (checkExitClick(touch.clientX, touch.clientY)) {
      window.resetGame();
      return;
    }

    if (s.gameOver) return; // ❌ prevent auto-restart on game over

    isDragging = true;
    car.x = touch.clientX - car.width / 2;
    clampCarPosition();
  });

  canvas.addEventListener("touchmove", (e) => {
    if (
      isDragging &&
      e.target !== nameInput &&
      !nameInput?.contains(e.target)
    ) {
      const touch = e.touches[0];
      car.x = touch.clientX - car.width / 2;
      clampCarPosition();
      e.preventDefault();
    }
  });

  canvas.addEventListener("touchend", () => {
    isDragging = false;
  });

  // === DISABLE TAP TO START / RESTART ON CANVAS (especially mobile) ===
  canvas.addEventListener("click", (e) => {
    if (checkExitClick(e.clientX, e.clientY)) {
      window.resetGame();
      return;
    }

    // ✅ Do not auto-restart on mobile tap
    if (s.isMobile) return;

    // For desktop, allow click-to-restart
    if (s.gameOver) {
      window.resetGame();
      window.startGame();
      mobileControls?.classList.add("hidden");
    }
  });

  // === MOBILE START BUTTON ===
  document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("mobile-start-btn");

    if (startBtn && nameInput) {
      startBtn.addEventListener("click", () => {
        const name = nameInput.value.trim().slice(0, 12);
        if (name.length === 0) {
          alert("Please enter your name to start!");
          return;
        }
        s.playerName = name;
        window.startGame();
        mobileControls?.classList.add("hidden");
      });
    }

    const returnBtn = document.getElementById("return-start-btn");
    if (returnBtn) {
      returnBtn.addEventListener("click", () => {
        window.resetGame();
      });
    }
  });

  // === EXIT BUTTON ZONE CHECK ===
  function checkExitClick(x, y) {
    const { isMobile, canvas } = s;
    const btnW = isMobile ? 40 : 80;
    const btnH = 32;
    const btnX = canvas.width - btnW - 20;
    const btnY = isMobile ? canvas.height - btnH - 20 : 20;

    return x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH;
  }
})();
