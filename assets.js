// assets.js

const images = {
  car: new Image(),
  fuel_gold: new Image(),
  fuel_bonus: new Image(),
  fuel_green: new Image(),
  banner_bonus: new Image(),
  banner_increase: new Image(),
  banner_decrease: new Image(),
};

const imagePaths = {
  car: 'assets/car.png',
  fuel_gold: 'assets/fuel_gold.png',
  fuel_bonus: 'assets/fuel_bonus.png',
  fuel_green: 'assets/fuel_green.png',
  banner_bonus: 'assets/banner_bonus.png',
  banner_increase: 'assets/banner_increase.png',
  banner_decrease: 'assets/banner_decrease.png',
};

let imagesLoaded = 0;
const totalImages = Object.keys(imagePaths).length;
let onAssetsLoaded = null;

function loadImages(callback) {
  onAssetsLoaded = callback;
  for (let key in imagePaths) {
    images[key].src = imagePaths[key];
    images[key].onload = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages && onAssetsLoaded) {
        onAssetsLoaded();
      }
    };
  }
}

// Make available to other scripts
window.images = images;
window.loadImages = loadImages;
