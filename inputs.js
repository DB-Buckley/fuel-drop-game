(function () {
  const canvas = window.state.canvas;
  const car = window.state.car;
  const s = window.state;

  let isDragging = false;
  let lastTap = 0;

  function clampCarPosition() {
    if (car.x < s.PLAY_AREA_LEFT) {
      car.x = s.PLAY_AREA_LEFT;
    } else if (car.x + car.width > s.PLAY_AREA_LEFT + s.PLAY_AREA_WIDTH) {
      car.x = s.PLAY_AREA_LEFT + s.PLAY_AREA_WIDTH - car.width;
    }
  }

  window.clampCarPosition = clampCarPosition; // expose for other uses

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

  // --- KEYBOARD INPUT ---
  document.addEventListener("keydown", (e) => {
    if (!s.gameStarted && !s.gameOver && /^[a-zA-Z0-9 ]$/.test(e.key) && s.playerName.length < 12) {
      s.playerName += e.key;
    } else if (!s.gameStarted && !s.gameOver && e.key === "Backspace") {
      s.playerName = s.playerName.slice(0, -1);
    } else if (!s.gameStarted && !s.gameOver && e.key === "Enter" && s.playerName.length > 0) {
      window.startGame();
      document.getElementById("mobile-controls")?.classList.add("hidden");
    }

    if (["ArrowLeft", "a", "A"].includes(e.key)) moveLeft();
    if (["ArrowRight", "d", "D"].includes(e.key)) moveRight();

    if (s.gameOver && e.key === "Enter") {
      window.resetGame();
      window.startGame();
      document.getElementById("mobile-controls")?.classList.add("hidden");
    }

    if (e.key === "p" || e.key === "Escape") {
      if (!s.gameStarted) return;
      s.paused = !s.paused;
    }
  });

  // --- MOUSE DRAG ---
  canvas.addEventListener("mousedown", (e) => {
    if (s.gameOver) {
      window.resetGame();
      window.startGame();
      document.getElementById("mobile-controls")?.classList.add("hidden");
    } else {
      isDragging = true;
      car.x = e.clientX - car.width / 2;
      clampCarPosition();
    }
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

  // --- TOUCH DRAG ---
  canvas.addEventListener("touchstart", (e) => {
    const now = new Date().getTime();
    const timeDiff = now - lastTap;

    if (timeDiff < 300 && timeDiff > 0) {
      // Double tap to pause
      if (s.gameStarted && !s.gameOver) {
        s.paused = !s.paused;
      }
    }

    lastTap = now;

    if (s.gameOver) {
      window.resetGame();
      window.startGame();
      document.getElementById("mobile-controls")?.classList.add("hidden");
    } else {
      isDragging = true;
      const touch = e.touches[0];
      car.x = touch.clientX - car.width / 2;
      clampCarPosition();
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      car.x = touch.clientX - car.width / 2;
      clampCarPosition();
    }
    e.preventDefault(); // prevent screen scroll
  });

  canvas.addEventListener("touchend", () => {
    isDragging = false;
  });

  // --- CLICK TO RESTART ---
  canvas.addEventListener("click", () => {
    if (s.gameOver) {
      window.resetGame();
      window.startGame();
      document.getElementById("mobile-controls")?.classList.add("hidden");
    }
  });

  // --- MOBILE START BUTTON ---
  document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("mobile-start-btn");
    const nameInput = document.getElementById("mobile-player-name");

    if (startBtn && nameInput) {
      startBtn.addEventListener("click", () => {
        const name = nameInput.value.trim();
        if (name.length === 0) {
          alert("Please enter your name to start!");
          return;
        }
        s.playerName = name;
        window.startGame();
        document.getElementById("mobile-controls")?.classList.add("hidden");
      });
    }
  });
})();
