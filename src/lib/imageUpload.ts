/**
 * imgbb.com Image Upload Service for Library X
 * Direct client-side upload to ImgBB API with key persistence and fallback.
 */

const STORAGE_KEY_IMGBB = 'jaystarbliss_imgbb_api_key';

export function getImgbbApiKey(): string {
  // 1. Check Vite environment variable
  const envKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_IMGBB_API_KEY;
  if (envKey && envKey.trim() !== '') {
    return envKey.trim();
  }

  // 2. Check locally saved API key set by author in Admin settings/modal
  try {
    const localKey = localStorage.getItem(STORAGE_KEY_IMGBB);
    if (localKey && localKey.trim() !== '') {
      return localKey.trim();
    }
  } catch (e) {
    console.warn('Unable to read imgbb key from storage:', e);
  }

  return '';
}

export function saveImgbbApiKey(key: string): void {
  try {
    if (key && key.trim()) {
      localStorage.setItem(STORAGE_KEY_IMGBB, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_IMGBB);
    }
  } catch (e) {
    console.warn('Unable to save imgbb key to storage:', e);
  }
}

export interface ImgbbUploadResult {
  success: boolean;
  url?: string;
  displayUrl?: string;
  thumbUrl?: string;
  error?: string;
}

export async function uploadToImgbb(
  file: File,
  providedKey?: string
): Promise<ImgbbUploadResult> {
  const apiKey = (providedKey && providedKey.trim()) || getImgbbApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'ImgBB API key is required. Please enter your API key to upload cover art.'
    };
  }

  // Validate that the file is an image
  if (!file.type.startsWith('image/')) {
    return {
      success: false,
      error: 'Selected file must be an image (PNG, JPG, WEBP, GIF, SVG).'
    };
  }

  // 32MB ImgBB upload limit
  if (file.size > 32 * 1024 * 1024) {
    return {
      success: false,
      error: 'Image file size must be less than 32MB.'
    };
  }

  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', file.name.replace(/\.[^/.]+$/, ''));

    const uploadUrl = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      let errMsg = `Upload failed with HTTP status ${response.status}`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error?.message) {
          errMsg = parsed.error.message;
        }
      } catch {
        // use default
      }
      return { success: false, error: errMsg };
    }

    const data = await response.json();

    if (data && data.success && data.data) {
      // Return high resolution image URL
      const finalUrl = data.data.display_url || data.data.url || data.data.image?.url;
      const thumb = data.data.thumb?.url;

      return {
        success: true,
        url: finalUrl,
        displayUrl: finalUrl,
        thumbUrl: thumb
      };
    } else {
      return {
        success: false,
        error: data?.error?.message || 'ImgBB upload returned unsuccessful response.'
      };
    }
  } catch (err: unknown) {
    console.error('ImgBB upload exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error during ImgBB upload.'
    };
  }
}
