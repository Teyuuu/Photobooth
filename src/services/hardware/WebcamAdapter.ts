import { CameraAdapter, CameraDevice } from '@/types';

export class WebcamAdapter implements CameraAdapter {
  id = 'webcam-adapter';
  name = 'DirectShow / USB Webcam Adapter';
  type: 'webcam' = 'webcam';
  private stream: MediaStream | null = null;
  private status: CameraDevice['status'] = 'disconnected';
  private videoElement: HTMLVideoElement | null = null;

  async discover(): Promise<CameraDevice[]> {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      return videoInputs.map((d, index) => ({
        id: d.deviceId,
        name: d.label || `Camera ${index + 1} (DirectShow / USB)`,
        type: 'webcam',
        status: this.stream ? 'connected' : 'disconnected',
        driverInfo: 'Windows Media Foundation / DirectShow',
      }));
    } catch (err) {
      console.error('Failed to discover video devices:', err);
      return [];
    }
  }

  async connect(deviceId?: string): Promise<boolean> {
    try {
      this.status = 'busy';
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Hidden video element to read frames from
      if (!this.videoElement) {
        this.videoElement = document.createElement('video');
        this.videoElement.autoplay = true;
        this.videoElement.playsInline = true;
        this.videoElement.muted = true;
        this.videoElement.style.display = 'none';
        document.body.appendChild(this.videoElement);
      }

      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      this.status = 'connected';
      return true;
    } catch (err) {
      console.error('Failed to connect webcam:', err);
      this.status = 'error';
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.status = 'disconnected';
  }

  getLiveStream(): MediaStream | null {
    return this.stream;
  }

  getStatus(): CameraDevice['status'] {
    return this.status;
  }

  isLiveFeedSupported(): boolean {
    return true;
  }

  async capture(): Promise<string> {
    if (!this.videoElement || !this.stream) {
      throw new Error('Camera is not connected or streaming');
    }

    const video = this.videoElement;
    const width = video.videoWidth || 1920;
    const height = video.videoHeight || 1080;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not initialize canvas context');

    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.95);
  }
}
