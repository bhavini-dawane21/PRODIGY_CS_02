# CipherPixel

A polished browser-based image encryption and decryption app using pixel manipulation.

## Features

- Upload PNG, JPG, WEBP, BMP images
- Encrypt / decrypt modes
- XOR cipher, bit shift, channel swap, and combo mode
- Optional noise layer, channel inversion, and row shuffle
- Live processing terminal log
- Before / after comparison slider
- Responsive animated UI with custom cursor, 3D cube, and particle effects
- No build tools required

## Run locally

1. Open the `image-encryption` folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and select **Open with Live Server**.
4. The app should open in your browser at `http://127.0.0.1:5500` or similar.

## Files

- `index.html` — app structure and UI
- `css/style.css` — styling, layout, animations, responsive design
- `js/app.js` — image loading, encryption engine, UI interactions

## Usage

1. Upload an image using drag-and-drop or the browse button.
2. Enter a secure key or generate one automatically.
3. Select an encryption method and optional layers.
4. Click **Encrypt Image** or **Decrypt Image**.
5. Download the processed PNG output.

## Notes

- The key is required for both encryption and decryption.
- For decryption, use the same key and method options that were used during encryption.
- This app works fully in the browser with no dependencies.
