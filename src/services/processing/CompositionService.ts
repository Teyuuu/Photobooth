import { Template, SessionPhoto } from '@/types';

export class CompositionService {
  /**
   * Renders the session photos onto the template canvas at exact 300 DPI print resolution
   */
  static async renderComposition(template: Template, photos: SessionPhoto[]): Promise<string> {
    // 300 DPI Calculation: 1 inch = 25.4 mm.
    // Width in pixels = (widthMm / 25.4) * DPI
    const widthPx = Math.round((template.widthMm / 25.4) * (template.dpi || 300));
    const heightPx = Math.round((template.heightMm / 25.4) * (template.dpi || 300));

    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to initialize 2D canvas context for composition');

    // 1. Draw Background
    ctx.fillStyle = template.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, widthPx, heightPx);

    // Optional Background Image
    if (template.backgroundImageUrl) {
      try {
        const bgImg = await this.loadImage(template.backgroundImageUrl);
        ctx.drawImage(bgImg, 0, 0, widthPx, heightPx);
      } catch (err) {
        console.warn('Failed to load background image:', err);
      }
    }

    // Scale factor from template mm coordinates to pixel canvas
    const scaleX = widthPx / template.widthMm;
    const scaleY = heightPx / template.heightMm;

    // 2. Sort elements by zIndex
    const sortedElements = [...template.elements].sort((a, b) => a.zIndex - b.zIndex);

    // 3. Render each element
    for (const el of sortedElements) {
      const elX = el.x * scaleX;
      const elY = el.y * scaleY;
      const elW = el.width * scaleX;
      const elH = el.height * scaleY;

      ctx.save();
      if (el.opacity !== undefined) {
        ctx.globalAlpha = el.opacity;
      }

      if (el.rotation) {
        ctx.translate(elX + elW / 2, elY + elH / 2);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.translate(-(elX + elW / 2), -(elY + elH / 2));
      }

      if (el.type === 'photo') {
        const photoIdx = el.photoIndex ?? 0;
        const photo = photos[photoIdx];

        // Draw photo frame placeholder background
        ctx.fillStyle = el.backgroundColor || '#0a0d17';
        if (el.borderRadius) {
          this.drawRoundedRect(ctx, elX, elY, elW, elH, el.borderRadius * scaleX);
          ctx.fill();
        } else {
          ctx.fillRect(elX, elY, elW, elH);
        }

        if (photo && photo.originalDataUrl) {
          try {
            const img = await this.loadImage(photo.originalDataUrl);

            ctx.save();
            if (el.borderRadius) {
              this.drawRoundedRect(ctx, elX, elY, elW, elH, el.borderRadius * scaleX);
              ctx.clip();
            }

            // Cover fit calculation (aspect ratio preserved, center cropped)
            const imgAspect = img.width / img.height;
            const targetAspect = elW / elH;
            let drawW = elW;
            let drawH = elH;
            let offsetX = elX;
            let offsetY = elY;

            if (imgAspect > targetAspect) {
              drawW = elH * imgAspect;
              offsetX = elX - (drawW - elW) / 2;
            } else {
              drawH = elW / imgAspect;
              offsetY = elY - (drawH - elH) / 2;
            }

            ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
            ctx.restore();
          } catch (err) {
            console.error('Error drawing photo element:', err);
          }
        }

        // Draw border if defined
        if (el.borderWidth && el.borderColor) {
          ctx.strokeStyle = el.borderColor;
          ctx.lineWidth = el.borderWidth * scaleX;
          if (el.borderRadius) {
            this.drawRoundedRect(ctx, elX, elY, elW, elH, el.borderRadius * scaleX);
            ctx.stroke();
          } else {
            ctx.strokeRect(elX, elY, elW, elH);
          }
        }
      } else if (el.type === 'text') {
        ctx.fillStyle = el.color || '#000000';
        const fontSizePx = (el.fontSize || 16) * scaleX;
        ctx.font = `${el.fontWeight || '600'} ${fontSizePx}px ${el.fontFamily || '"Plus Jakarta Sans", sans-serif'}`;
        ctx.textBaseline = 'middle';

        if (el.textAlign === 'center') {
          ctx.textAlign = 'center';
          ctx.fillText(el.text || '', elX + elW / 2, elY + elH / 2);
        } else if (el.textAlign === 'right') {
          ctx.textAlign = 'right';
          ctx.fillText(el.text || '', elX + elW, elY + elH / 2);
        } else {
          ctx.textAlign = 'left';
          ctx.fillText(el.text || '', elX, elY + elH / 2);
        }
      } else if (el.type === 'shape') {
        ctx.fillStyle = el.backgroundColor || '#ffffff';
        if (el.borderRadius) {
          this.drawRoundedRect(ctx, elX, elY, elW, elH, el.borderRadius * scaleX);
          ctx.fill();
        } else {
          ctx.fillRect(elX, elY, elW, elH);
        }
      } else if (el.type === 'image' && el.src) {
        try {
          const img = await this.loadImage(el.src);
          ctx.drawImage(img, elX, elY, elW, elH);
        } catch (err) {
          console.warn('Failed to load element image:', err);
        }
      }

      ctx.restore();
    }

    return canvas.toDataURL('image/jpeg', 0.96);
  }

  private static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  }

  private static drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
