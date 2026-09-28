import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Función para establecer el isotipo LUXPROC con fondo 100% transparente
const setupFavicon = () => {
  try {
    // Imagen PNG 32x32 con fondo transparente, hexágono LP y circuitos en alta definición
    const transparentFavicon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC1klEQVR4Ae3BPY8bVRiG4fvdsb3x7rHzK5CJaChoadNRByq6oaCk4DcgIVEgFDISBTSIGokiiAJBlSIVzdDylQUJKZ5jz4xnznk4cqyVGe1mPygostfFjRsvPOM/cKUXO37hjGs44H9mXIMrvTiDXzjjiowrcKUXzyNQgNUrzrikAy7JlV7s8Qtn7PiFMwkUgA6OHlU6+rESlzDiAq70Yo9fOGOf2Fq97Izk6FElWlAD068r1W/MjOcwLuBKLwb8whnJ8U9eRGADq9ecsTN9WIkaVAtVoAaIoEZ079829hww4EovV3ox4BfOGOqBFtSK6XeVpt9UIqnvziz+LVSBIijA+NcZ45M5QyPO4UovBhSBwKnVq86OfqikFqhBrTj8Yika0BLUQ/fe3Eg6IMulLJdIQmFGMnKlF2fwC2ckrvRCPNMCgX9Zvz4zkltfLaUGtAZaGP82I/bQAVkucY4R53CllyKoByJbagQ9p259uVTz1txImntzG3/wVCSTv+Zs1qAIWS6RhMKMPVkukYz8whk7rvQiUYTVHWckx4+9iDyzBnWcUgOTB0tpDZPfZ+hPiB30EWLPVijMslzKcokzjEhc6cW+CMePvdQJ1YLAljyoFYefL9W+PTdVoA4mJzPCBmIPitDdN8tyiSTLJXZCYcZOlkskI3YUYXXHGQPTh5UIbGktVINqGH/4VONfZsQe+h5CBxKEB2YMhMKMJMslklCYhcKMZESiCES2jr6vRAD1UN+dmVZAIw4/W6p5c26Tj5dSI8ZP5nQ1xAj9p2bsyXKJPVkucQ5jYPptJQLQghqhNRBBK5j8MSM0UH9kNnlXCh1boTBjJ8slBkJhRpLlEkkozNgZMbQBbYAgmntzm9xfSg0cnswIDfQtZLm0+cQsyyV2slxiTyjMGAiFGQPGFWTv6CXEz1wgFGZcknENWS5xhlCYcUXGNWW5xJ5QmHENB9y48aL7BxeOmWB2HchfAAAAAElFTkSuQmCC";
    
    const links = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
    if (links.length > 0) {
      links.forEach((link) => {
        link.href = transparentFavicon;
      });
    } else {
      const link = document.createElement("link");
      link.type = "image/png";
      link.rel = "shortcut icon";
      link.href = transparentFavicon;
      document.head.appendChild(link);
    }
  } catch (e) {
    console.warn("Error al actualizar favicon:", e);
  }
};

// Invocar al inicio de la aplicación
setupFavicon();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

