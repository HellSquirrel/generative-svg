export const getStub = (width, height, path) =>
  `<svg width="${width}px" height="${height}px" viewBox="0 0 ${width} ${height}"> version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    ${path}
   </svg>`;
