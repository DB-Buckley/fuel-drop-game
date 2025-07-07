(() => {
  const s = window.state;

  const imagePaths = {
    // UI and game assets
    car: 'assets/car.png',
    fuel_gold: 'assets/fuel_gold.png',
    fuel_bonus: 'assets/fuel_bonus.png',
    fuel_green: 'assets/fuel_green.png',
    banner_bonus: 'assets/banner_bonus.png',
    banner_increase: 'assets/banner_increase.png',
    banner_decrease: 'assets/banner_decrease.png',
    mzansiLogo: 'assets/mzansi_logo.png',
    splash_desktop: 'assets/splash_desktop.png',
    splash_mobile: 'assets/splash_mobile.png',

    // 🌄 Parallax background layers – desktop
    gbg_desktop_layer1: 'assets/games_screen/gbg_desktop_layer1.png', // road (front)
    gbg_desktop_layer2: 'assets/games_screen/gbg_desktop_layer2.png', // trees (middle)
    gbg_desktop_layer3: 'assets/games_screen/gbg_desktop_layer3.png', // mountains (back)

    // 📱 Parallax background layers – mobile
    gbg_mobile_layer1: 'assets/games_screen/gbg_mobile_layer1.png',
    gbg_mobile_layer2: 'assets/games_screen/gbg_mobile_layer2.png',
    gbg_mobile_layer3: 'assets/games_screen/gbg_mobile_layer3.png',

    // 🌙 Nighttime filters
    nt_filter_desktop: 'assets/games_screen/nt_filter_desktop.png',
    nt_filter_mobile: 'assets/games_screen/nt_filter_mobile.png',
  };

  const images = {};
  s.images = images;

  function loadImages(callback) {
    const keys = Object.keys(imagePaths);
    let loaded = 0;

    keys.forEach((key) => {
      const img = new Image();
      img.src = imagePaths[key];
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === keys.length) callback?.();
      };
      images[key] = img;
    });
  }

  loadImages(() => {
    requestAnimationFrame(window.mainLoop);
  });
})();
