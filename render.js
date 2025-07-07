(function () {
  const state = window.state;
  const ctx = state.ctx;

  function drawParallaxBackground() {
    const layers = state.isMobile
      ? [
          state.images.gbg_mobile_layer3,
          state.images.gbg_mobile_layer2,
          state.images.gbg_mobile_layer1,
        ]
      : [
          state.images.gbg_desktop_layer3,
          state.images.gbg_desktop_layer2,
          state.images.gbg_desktop_layer1,
        ];

    const scroll = state.bgScroll;
    const speed = state.bgSpeed;

    layers.forEach((img, i) => {
      if (!img || !img.complete) return;

      const layerKey = ["layer3X", "layer2X", "layer1X"][i];
      const layerSpeedKey = ["layer3", "layer2", "layer1"][i];

      // Update scroll X (looping)
      scroll[layerKey] -= speed[layerSpeedKey];
      if (scroll[layerKey] <= -img.width) scroll[layerKey] += img.width;

      // Draw two images side by side for seamless loop
      ctx.drawImage(
        img,
        scroll[layerKey],
        0,
        img.width,
        state.canvas.height
      );
      ctx.drawImage(
        img,
        scroll[layerKey] + img.width,
        0,
        img.width,
        state.canvas.height
      );
    });
  }

  function drawNightFilter() {
    if (!state.nightModeActive) return;

    ctx.save();

    ctx.globalAlpha = 0.6;
    ctx.globalCompositeOperation = "color-burn";

    const filter = state.isMobile
      ? state.images.nt_filter_mobile
      : state.images.nt_filter_desktop;

    if (filter && filter.complete) {
      ctx.drawImage(
        filter,
        state.PLAY_AREA_LEFT,
        0,
        state.PLAY_AREA_WIDTH,
        state.canvas.height
      );
    }

    ctx.restore();
  }

  function drawCar() {
    const carImg = state.nightModeActive
      ? state.images.car_night
      : state.images.car;

    if (carImg && carImg.complete) {
      ctx.drawImage(
        carImg,
        state.car.x,
        state.car.y,
        state.car.width,
        state.car.height
      );
    } else {
      // fallback colored rectangle if image not loaded
      ctx.fillStyle = state.bonusActive ? state.car.bonusColor : state.car.baseColor;
      ctx.fillRect(state.car.x, state.car.y, state.car.width, state.car.height);
    }
  }

  function drawDrops() {
    for (const drop of state.drops) {
      let img = null;
      if (drop.bonus) img = state.images.fuel_bonus;
      else if (drop.slowDown) img = state.images.fuel_green;
      else img = state.images.fuel_gold;

      if (img && img.complete) {
        ctx.drawImage(img, drop.x - drop.radius, drop.y - drop.radius, drop.radius * 2, drop.radius * 2);
      } else {
        // fallback circle
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
        ctx.fillStyle = drop.bonus ? "#00CFFF" : drop.slowDown ? "#00FF00" : "#FFD700";
        ctx.fill();
      }
    }
  }

  function drawBanners() {
    const bannerY = 50;
    const bannerX = state.PLAY_AREA_LEFT + state.PLAY_AREA_WIDTH / 2;
    ctx.textAlign = "center";

    if (state.showBonusBanner && state.images.banner_bonus) {
      ctx.drawImage(
        state.images.banner_bonus,
        bannerX - state.images.banner_bonus.width / 2,
        bannerY
      );
    }

    if (state.showFuelPriceBanner && state.images.banner_increase) {
      ctx.drawImage(
        state.images.banner_increase,
        bannerX - state.images.banner_increase.width / 2,
        bannerY
      );
    }

    if (state.showFuelDecreaseBanner && state.images.banner_decrease) {
      ctx.drawImage(
        state.images.banner_decrease,
        bannerX - state.images.banner_decrease.width / 2,
        bannerY
      );
    }
  }

  function drawScore() {
    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${state.score}`, 20, 40);
    ctx.fillText(`Missed: ${state.missedDrops}/${state.maxMisses}`, 20, 70);
  }

  window.render = function () {
    ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);

    drawParallaxBackground();

    drawNightFilter(); // Over background only, before car

    drawCar();

    drawDrops();

    drawBanners();

    drawScore();
  };
})();
