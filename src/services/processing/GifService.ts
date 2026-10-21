import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { SessionPhoto, GifSettings } from '@/types';

export class GifService {
  /**
   * Generates an animated GIF from a list of session photos
   */
  static async generateGif(
    photos: SessionPhoto[],
    settings: GifSettings = {
      enabled: true,
      frameDelayMs: 600,
      width: 600,
      height: 400,
      includeBranding: true,
    },
    eventName?: string
  ): Promise<string> {
    if (!photos || photos.length === 0) {
      throw new Error('No photos provided for GIF generation');
    }

    const { width, height, frameDelayMs } = settings;
    const gif = GIFEncoder();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Failed to create canvas context for GIF');

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const img = await this.loadImage(photo.originalDataUrl);

      // Clear frame
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Draw photo with cover-fit
      const imgAspect = img.width / img.height;
      const targetAspect = width / height;
      let drawW = width;
      let drawH = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgAspect > targetAspect) {
        drawW = height * imgAspect;
        offsetX = (width - drawW) / 2;
      } else {
        drawH = width / imgAspect;
        offsetY = (height - drawH) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

      // Event branding footer overlay if enabled
      if (settings.includeBranding && eventName) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, height - 36, width, 36);

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(eventName, width / 2, height - 18);
      }

      // Read RGBA data
      const imageData = ctx.getImageData(0, 0, width, height);
      const rgba = imageData.data;

      // Quantize to 256 colors
      const palette = quantize(rgba, 256);
      const index = applyPalette(rgba, palette);

      // Write frame to gif encoder
      gif.writeFrame(index, width, height, {
        palette,
        delay: frameDelayMs,
      });
    }

    gif.finish();
    const bytes = gif.bytes();
    const blob = new Blob([bytes as any], { type: 'image/gif' });

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
}
