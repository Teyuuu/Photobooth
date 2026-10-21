import QRCode from 'qrcode';

export class QrService {
  /**
   * Generates a high-contrast QR code Data URL from a gallery URL
   */
  static async generateQrCodeDataUrl(url: string): Promise<string> {
    try {
      return await QRCode.toDataURL(url, {
        width: 480,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      throw err;
    }
  }

  /**
   * Generates a secure, unguessable random gallery session token
   */
  static generateGalleryToken(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
}
