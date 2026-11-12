import React from 'react';

export interface PickImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  fallbackInputRef?: React.RefObject<HTMLInputElement | null>;
}

export interface PickedImageResult {
  dataUrl: string;
  fileName: string;
  mimeType: string;
}

export function compressFileToDataUrl(
  file: File,
  maxWidth = 900,
  maxHeight = 900,
  quality = 0.88
): Promise<PickedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      if (!rawDataUrl || !rawDataUrl.startsWith('data:')) {
        reject(new Error('Invalid image data.'));
        return;
      }
      // Keep SVG as-is
      if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
        resolve({
          dataUrl: rawDataUrl,
          fileName: file.name,
          mimeType: 'image/svg+xml',
        });
        return;
      }

      const img = new Image();
      img.onerror = () =>
        resolve({
          dataUrl: rawDataUrl,
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
        });
      img.onload = () => {
        try {
          let w = img.width || 400;
          let h = img.height || 400;
          if (w > maxWidth || h > maxHeight) {
            const ratio = Math.min(maxWidth / w, maxHeight / h);
            w = Math.max(1, Math.round(w * ratio));
            h = Math.max(1, Math.round(h * ratio));
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({
              dataUrl: rawDataUrl,
              fileName: file.name,
              mimeType: file.type || 'image/jpeg',
            });
            return;
          }
          const isPngOrWebp =
            file.type === 'image/png' ||
            file.type === 'image/webp' ||
            /\.(png|webp)$/i.test(file.name);
          if (!isPngOrWebp) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, w, h);
          }
          ctx.drawImage(img, 0, 0, w, h);
          const outMime = isPngOrWebp ? 'image/png' : 'image/jpeg';
          const compressed = canvas.toDataURL(outMime, quality);
          resolve({
            dataUrl: compressed,
            fileName: file.name,
            mimeType: outMime,
          });
        } catch {
          resolve({
            dataUrl: rawDataUrl,
            fileName: file.name,
            mimeType: file.type || 'image/jpeg',
          });
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export async function pickImageFromAndroidOrWeb(
  options: PickImageOptions = {}
): Promise<PickedImageResult | null> {
  const { maxWidth = 900, maxHeight = 900, quality = 0.88, fallbackInputRef } = options;

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/svg+xml,image/*';
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.style.opacity = '0';
    document.body.appendChild(input);

    let settled = false;
    const cleanup = () => {
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };

    input.onchange = async () => {
      if (settled) return;
      settled = true;
      const file = input.files?.[0];
      cleanup();
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const res = await compressFileToDataUrl(file, maxWidth, maxHeight, quality);
        resolve(res);
      } catch {
        resolve(null);
      }
    };

    try {
      input.click();
    } catch {
      cleanup();
      if (fallbackInputRef?.current) {
        fallbackInputRef.current.click();
      }
      resolve(null);
    }
  });
}
