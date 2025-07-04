(() => {
  const s = window.state;

  const images = {
    car: new Image(),
    fuel_gold: new Image(),
    fuel_bonus: new Image(),
    fuel_green: new Image(),
    banner_bonus: new Image(),
    banner_increase: new Image(),
    banner_decrease: new Image(),
    mzansiLogo: new Image(),  // <-- Add logo here
  };

  const imagePaths = {
    car: 'assets/car.png',
    fuel_gold: 'assets/fuel_gold.png',
    fuel_bonus: 'assets/fuel_bonus.png',
    fuel_green: 'assets/fuel_green.png',
    banner_bonus: 'assets/banner_bonus.png',
    banner_increase: 'assets/banner_increase.png',
    banner_decrease: 'assets/banner_decrease.png',
    mzansiLogo: 'assets/mzansi_logo.png',  // <-- Add your logo file path here
  };

  function loadImages(callback) {
    let imagesLoaded = 0;
    const totalImages = Object.keys(imagePaths).length;

    for (const key in imagePaths) {
      images[key].src = imagePaths[key];
      images[key].onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
          callback?.(); // ✅ Start game after all images loaded
        }
      };
      images[key].onerror = () => {
        console.warn(`Failed to load image: ${imagePaths[key]}`);
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
          callback?.();
        }
      };
    }
  }

  // Attach images to game state
  s.images = images;

  // Load images and start game loop only after that
  loadImages(() => {
    requestAnimationFrame(window.mainLoop);
  });
})();
