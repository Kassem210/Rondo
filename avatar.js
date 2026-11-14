// Profile pictures. A picture is shrunk to a small square and kept as a
// data URL, so it can be stored next to the player's name with no file
// hosting.

const Avatar = (() => {
  const SIZE = 96;

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('That file is not a picture.'));
      image.src = URL.createObjectURL(file);
    });
  }

  // Crops the middle of the picture to a square and returns it as a JPEG data URL.
  async function fromFile(file) {
    const image = await loadImage(file);
    const side = Math.min(image.width, image.height);
    const left = (image.width - side) / 2;
    const top = (image.height - side) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    canvas.getContext('2d').drawImage(image, left, top, side, side, 0, 0, SIZE, SIZE);
    URL.revokeObjectURL(image.src);
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  // Pictures come from other players, so only image data and web links are shown.
  function isSafe(photo) {
    return typeof photo === 'string' && /^(data:image\/|https:\/\/)/.test(photo);
  }

  // The picture, or the first letter of the name when there is none.
  function html(photo, name, extraClass = '') {
    const classes = `avatar ${extraClass}`.trim();
    if (isSafe(photo)) {
      return `<img class="${classes}" src="${Views.escapeHtml(photo)}" alt="">`;
    }
    const initial = Views.escapeHtml((name || '?').trim().charAt(0).toUpperCase());
    return `<span class="${classes}" aria-hidden="true">${initial}</span>`;
  }

  return { fromFile, html };
})();
