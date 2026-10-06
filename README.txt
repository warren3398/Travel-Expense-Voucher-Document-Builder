TEV GitHub Pages AI Document Detection v1.0

Upload these EXTRACTED files to the root of your GitHub repository. Do not upload only the ZIP.
Enable Settings > Pages > Deploy from a branch > main / (root).

The site reads PDF/JPG/PNG Travel Orders entirely in the browser using PDF.js + Tesseract.js. No Python or Render is required. Internet access is required on first load because OCR libraries are loaded from CDN.

AI Document Detection workflow: PDF render -> image enhancement -> dual OCR passes -> BSWM field/context parser -> review.
