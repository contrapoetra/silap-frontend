const MAX_WIDTH = 1920;
const QUALITY = 0.8;

const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm', 'video/x-m4v'];

function isVideo(file: File): boolean {
  return VIDEO_TYPES.includes(file.type) || /\.(mov|mp4|avi|mkv|webm|m4v)$/i.test(file.name);
}

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > MAX_WIDTH) {
        h = Math.round(h * MAX_WIDTH / w);
        w = MAX_WIDTH;
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Compression failed'));
      }, 'image/jpeg', QUALITY);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadToS3(file: File, onProgress?: (pct: number) => void): Promise<string> {
  const isVideoFile = isVideo(file);
  const body = isVideoFile ? file : await compressImage(file);
  const fileName = file.name.replace(/\.[^.]+$/, '') + (isVideoFile ? '.mp4' : '.jpg');
  const fileType = isVideoFile ? 'video/mp4' : 'image/jpeg';

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, fileType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get upload URL');
  }

  const { uploadUrl, publicUrl } = await res.json();

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', fileType);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(body instanceof Blob ? body : body);
  });

  return publicUrl;
}
