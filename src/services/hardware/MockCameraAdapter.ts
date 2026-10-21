import { CameraAdapter, CameraDevice } from '@/types';

export class MockCameraAdapter implements CameraAdapter {
  id = 'mock-camera-adapter';
  name = 'Virtual Studio DSLR (Demo Simulator)';
  type: 'mock' = 'mock';
  private connected = true;
  private captureCount = 0;

  async discover(): Promise<CameraDevice[]> {
    return [
      {
        id: 'mock-dslr-1',
        name: 'Canon EOS R6 Mark II (Virtual Studio)',
        type: 'mock',
        status: this.connected ? 'connected' : 'disconnected',
        driverInfo: 'Simulated EDSDK v13.17 / DirectShow',
        batteryLevel: 94,
      },
      {
        id: 'mock-sony-1',
        name: 'Sony Alpha 7 IV (Virtual Studio)',
        type: 'mock',
        status: 'disconnected',
        driverInfo: 'Simulated Sony Remote SDK v1.11',
        batteryLevel: 80,
      },
    ];
  }

  async connect(_deviceId: string): Promise<boolean> {
    this.connected = true;
    return true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  getStatus(): CameraDevice['status'] {
    return this.connected ? 'connected' : 'disconnected';
  }

  isLiveFeedSupported(): boolean {
    return true;
  }

  // Generates a crisp, photorealistic sample studio capture on an offscreen canvas
  async capture(): Promise<string> {
    this.captureCount++;
    const canvas = document.createElement('canvas');
    canvas.width = 1800;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas 2D context');

    // Studio backdrop gradient
    const gradients = [
      ['#1e1b4b', '#312e81', '#4338ca'], // deep indigo studio
      ['#18181b', '#27272a', '#3f3f46'], // modern graphite backdrop
      ['#3b0764', '#581c87', '#7e22ce'], // party neon violet
      ['#0f172a', '#1e293b', '#334155'], // slate classic
    ];
    const gradColors = gradients[(this.captureCount - 1) % gradients.length];
    const bg = ctx.createRadialGradient(900, 600, 100, 900, 600, 1000);
    bg.addColorStop(0, gradColors[1]);
    bg.addColorStop(0.6, gradColors[0]);
    bg.addColorStop(1, '#000000');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1800, 1200);

    // Subtle bokeh particles
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      const bx = (Math.sin(i * 99 + this.captureCount) * 0.5 + 0.5) * 1800;
      const by = (Math.cos(i * 47 + this.captureCount) * 0.5 + 0.5) * 1200;
      const radius = 20 + (i % 5) * 15;
      ctx.arc(bx, by, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.03 + (i % 3) * 0.02})`;
      ctx.fill();
    }

    // Studio vignette
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 16;
    ctx.strokeRect(30, 30, 1740, 1140);

    // Subject silhouette / photobooth avatar graphic
    const poses = ['✌️ Big Smile!', '😎 Party Vibes', '🎉 Best Friends', '💖 Love & Cheers'];
    const currentPose = poses[(this.captureCount - 1) % poses.length];

    // Portrait card in center
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.roundRect(500, 250, 800, 700, 32);
    ctx.fill();
    ctx.restore();

    // Subject Icon / Art
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 120px sans-serif';
    ctx.fillText('📸', 900, 480);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(currentPose, 900, 650);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '32px "JetBrains Mono", monospace';
    ctx.fillText(`CAPTURE #${this.captureCount} • RAW 300 DPI SIMULATED`, 900, 720);

    // Timestamp & watermark
    ctx.textAlign = 'right';
    ctx.font = '24px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(new Date().toLocaleTimeString(), 1720, 1130);

    ctx.textAlign = 'left';
    ctx.fillText('PHOTOBOOTH STUDIO OS • DEMO ADAPTER', 80, 1130);

    return canvas.toDataURL('image/jpeg', 0.95);
  }
}
