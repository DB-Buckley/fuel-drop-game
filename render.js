function drawStartScreen() {
  const { ctx, canvas, isMobile, images } = state;
  const splash = isMobile ? images.splash_mobile : images.splash_desktop;
  ctx.drawImage(splash, 0, 0, canvas.width, canvas.height);

  // Slightly darken background for readability
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const mobileControls = document.getElementById("mobile-controls");

  if (!isMobile) {
    // DESKTOP LAYOUT
    const offsetX = canvas.width / 2 + 180;

    drawText("Catch the fuel drops. Don’t miss.", offsetX, 100, 20);

    // Create desktop name input (once)
    let nameInput = document.getElementById("desktop-player-name");
    if (!nameInput) {
      nameInput = document.createElement("input");
      nameInput.id = "desktop-player-name";
      nameInput.type = "text";
      nameInput.maxLength = 12;
      nameInput.placeholder = "Enter your name";
      nameInput.style.position = "absolute";
      nameInput.style.left = `${offsetX - 60}px`;
      nameInput.style.top = "140px";
      nameInput.style.padding = "10px";
      nameInput.style.fontSize = "16px";
      nameInput.style.borderRadius = "5px";
      nameInput.style.border = "1px solid #ccc";
      nameInput.style.zIndex = 10;
      nameInput.style.width = "200px";
      nameInput.style.textAlign = "center";
      nameInput.autocomplete = "off";
      document.body.appendChild(nameInput);

      nameInput.addEventListener("input", () => {
        state.playerName = nameInput.value.slice(0, 12);
      });
    }

    // Leaderboard
    drawText("Top 10 High Scores:", offsetX, 200, 20);
    state.leaderboard.slice(0, 10).forEach((entry, index) => {
      drawText(`${index + 1}. ${entry.name}: ${entry.score}`, offsetX, 230 + index * 22, 16);
    });

    if (mobileControls) mobileControls.style.display = "none";

  } else {
    // MOBILE LAYOUT
    drawText("Catch the fuel drops. Don’t miss.", canvas.width / 2, 130, 20, true);

    if (mobileControls) {
      mobileControls.style.display = "block";
      mobileControls.style.position = "absolute";
      mobileControls.style.left = "50%";
      mobileControls.style.top = "45%"; // Raised higher
      mobileControls.style.transform = "translate(-50%, -50%)";
      mobileControls.style.textAlign = "center";

      const input = document.getElementById("mobile-player-name");
      if (input) {
        input.value = state.playerName;
        input.addEventListener("touchstart", () => setTimeout(() => input.focus(), 100), { once: true });
      }
    }

    // Leaderboard
    drawText("Top 10 High Scores:", canvas.width / 2, canvas.height - 180, 20, true);
    state.leaderboard.slice(0, 10).forEach((entry, index) => {
      drawText(`${index + 1}. ${entry.name}: ${entry.score}`, canvas.width / 2, canvas.height - 150 + index * 20, 16, true);
    });
  }
}
