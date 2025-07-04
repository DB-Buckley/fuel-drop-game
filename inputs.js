(function () {
  const state = window.state;

  // Keyboard input and mouse/touch handlers
  // (Assuming your existing code here, unchanged except mobile start button handling)

  // Keyboard input
  document.addEventListener("keydown", (e) => {
    if (!state.gameStarted && !state.gameOver && /^[a-zA-Z0-9 ]$/.test(e.key) && state.playerName.length < 12) {
      state.playerName += e.key;
    } else if (!state.gameStarted && !state.gameOver && e.key === "Backspace") {
      state.playerName = state.playerName.slice(0, -1);
    } else if (!state.gameStarted && !state.gameOver && e.key === "Enter" && state.playerName.length > 0) {
      window.startGame();
      // Hide mobile controls after starting game
      const controls = document.getElementById("mobile-controls");
      if (controls) controls.classList.add("hidden");
    }

    if (["ArrowLeft", "a", "A"].includes(e.key)) window.moveLeft?.();
    if (["ArrowRight", "d", "D"].includes(e.key)) window.moveRight?.();

    if (state.gameOver && e.key === "Enter") {
      window.resetGame();
      window.startGame();
      const controls = document.getElementById("mobile-controls");
      if (controls) controls.classList.add("hidden");
    }

    if (e.key === "p" || e.key === "Escape") {
      if (!state.gameStarted) return;
      state.paused = !state.paused;
    }
  });

  // Mouse drag (desktop)
  const canvas = window.state.canvas;
  let isDragging = false;

  canvas.addEventListener("mousedown", (e) => {
    if (state.gameOver) {
      window.resetGame();
      window.startGame();
      const controls = document.getElementById("mobile-controls");
      if (controls) controls.classList.add("hidden");
    } else {
      isDragging = true;
      window.car.x = e.clientX - window.car.width / 2;
      window.clampCarPosition?.();
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
      window.car.x = e.clientX - window.car.width / 2;
      window.clampCarPosition?.();
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Touch drag (mobile)
  canvas.addEventListener("touchstart", (e) => {
    if (state.gameOver) {
      window.resetGame();
      window.startGame();
      const controls = document.getElementById("mobile-controls");
      if (controls) controls.classList.add("hidden");
    } else {
      isDragging = true;
      const touch = e.touches[0];
      window.car.x = touch.clientX - window.car.width / 2;
      window.clampCarPosition?.();
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      window.car.x = touch.clientX - window.car.width / 2;
      window.clampCarPosition?.();
    }
    e.preventDefault(); // Prevent scrolling while dragging
  });

  canvas.addEventListener("touchend", () => {
    isDragging = false;
  });

  // Click to restart game
  canvas.addEventListener("click", () => {
    if (state.gameOver) {
      window.resetGame();
      window.startGame();
      const controls = document.getElementById("mobile-controls");
      if (controls) controls.classList.add("hidden");
    }
  });

  // Mobile Start Button Handler
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
        state.playerName = name;
        window.startGame();

        const controls = document.getElementById("mobile-controls");
        if (controls) {
          controls.classList.add("hidden");
        }
      });
    }
  });
})();
