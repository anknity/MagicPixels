import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for image processing
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Upload API
export const uploadApi = {
  single: (file, onProgress) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(progress);
      },
    });
  },
  
  multiple: (files, onProgress) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(progress);
      },
    });
  },
  
  base64: (imageData, filename) => {
    return api.post('/upload/base64', { image: imageData, filename });
  },
};

// Resize API
export const resizeApi = {
  resize: (file, options) => {
    const formData = new FormData();
    formData.append('image', file);
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    return api.post('/resize', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  batch: (file, sizes) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('sizes', JSON.stringify(sizes));
    
    return api.post('/resize/batch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  presets: (file, preset) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('preset', preset);
    
    return api.post('/resize/presets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Compress API
export const compressApi = {
  compress: (file, options = {}) => {
    const formData = new FormData();
    formData.append('image', file);
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    return api.post('/compress', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  auto: (file, targetSize) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('targetSize', targetSize);
    
    return api.post('/compress/auto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Convert API
export const convertApi = {
  convert: (file, format, quality = 90) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('format', format);
    formData.append('quality', quality);
    
    return api.post('/convert', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  multiFormat: (file, formats) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('formats', JSON.stringify(formats));
    
    return api.post('/convert/multi-format', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getFormats: () => api.get('/convert/formats'),
};

// PDF API
export const pdfApi = {
  fromImages: async (files, options = {}) => {
    // Validate files before sending
    if (!files || !Array.isArray(files) || files.length === 0) {
      return Promise.reject(new Error('No image files provided. Please select at least one image.'));
    }
    
    const formData = new FormData();
    let validFileCount = 0;
    
    files.forEach((file) => {
      if (file && file.size > 0) {
        formData.append('images', file);
        validFileCount++;
      }
    });
    
    // Check if any valid files were added
    if (validFileCount === 0) {
      return Promise.reject(new Error('No valid image files to upload.'));
    }
    
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Try direct download first (more reliable)
    try {
      const response = await fetch(`${API_BASE_URL}/pdf/from-images-direct`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const blob = await response.blob();
        if (blob.size > 0) {
          // Create a URL for the blob and return it
          const blobUrl = URL.createObjectURL(blob);
          return {
            success: true,
            data: {
              url: blobUrl,
              size: blob.size,
              pageCount: validFileCount,
              pageSize: options.pageSize || 'A4',
              isBlob: true,
            },
          };
        }
      }
    } catch (directError) {
      console.log('Direct PDF download failed, trying Cloudinary...', directError);
    }
    
    // Fallback to Cloudinary upload
    return api.post('/pdf/from-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  merge: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('pdfs', file));
    
    return api.post('/pdf/merge', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  split: (file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    return api.post('/pdf/split', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  watermark: (file, text, options = {}) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('text', text);
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    return api.post('/pdf/watermark', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Background Remove API
export const backgroundApi = {
  remove: (file, options = {}) => {
    const formData = new FormData();
    formData.append('image', file);
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    return api.post('/background-remove', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  replace: (file, backgroundColor) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('backgroundColor', backgroundColor);
    
    return api.post('/background-remove/replace', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// AI Enhance API
export const aiEnhanceApi = {
  enhance: (file, autoApply = false) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('autoApply', autoApply);
    
    return api.post('/ai-enhance', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  manual: (file, settings) => {
    const formData = new FormData();
    formData.append('image', file);
    Object.entries(settings).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    return api.post('/ai-enhance/manual', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  altText: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return api.post('/ai-enhance/alt-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  detect: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return api.post('/ai-enhance/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// AI Edit API
export const aiEditApi = {
  edit: (file, prompt) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('prompt', prompt);
    
    return api.post('/ai-edit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  analyze: (file, prompt) => {
    const formData = new FormData();
    formData.append('image', file);
    if (prompt) formData.append('prompt', prompt);
    
    return api.post('/ai-edit/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  ideas: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return api.post('/ai-edit/ideas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  batch: (file, edits) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('edits', JSON.stringify(edits));
    
    return api.post('/ai-edit/batch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Cloudinary AI Tools API
export const cloudinaryApi = {
  // Background removal with AI
  removeBackground: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/cloudinary/bg-remove', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Replace background with color
  replaceBackground: (file, backgroundColor) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('backgroundColor', backgroundColor);
    return api.post('/cloudinary/bg-replace', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // AI Enhance
  enhance: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/cloudinary/enhance', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // AI Upscale
  upscale: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/cloudinary/upscale', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Generative Fill - extend image
  generativeFill: (file, width, height, gravity = 'center') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('gravity', gravity);
    return api.post('/cloudinary/gen-fill', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Generative Remove - remove objects
  generativeRemove: (file, prompt) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('prompt', prompt);
    return api.post('/cloudinary/gen-remove', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Generative Recolor - change colors
  generativeRecolor: (file, prompt, toColor) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('prompt', prompt);
    formData.append('toColor', toColor);
    return api.post('/cloudinary/gen-recolor', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Artistic filters
  applyFilter: (file, filter) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('filter', filter);
    return api.post('/cloudinary/artistic-filter', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Get available filters
  getFilters: () => api.get('/cloudinary/filters'),

  // Smart crop
  smartCrop: (file, width, height, gravity = 'auto') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('gravity', gravity);
    return api.post('/cloudinary/smart-crop', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Blur faces
  blurFaces: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/cloudinary/blur-faces', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Pixelate faces
  pixelateFaces: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/cloudinary/pixelate-faces', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Adjust colors
  adjustColors: (file, adjustments) => {
    const formData = new FormData();
    formData.append('image', file);
    Object.entries(adjustments).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value);
    });
    return api.post('/cloudinary/adjust-colors', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Auto improve
  autoImprove: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/cloudinary/auto-improve', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Track download (returns download URL)
  download: (publicId, format = 'png') => {
    return api.post('/cloudinary/download', { publicId, format });
  },

  // Get download status
  getStatus: (publicId) => api.get(`/cloudinary/status/${encodeURIComponent(publicId)}`),
};

// Health check
export const healthCheck = () => api.get('/health');

// Crop API
export const cropApi = {
  crop: (file, coords) => {
    const formData = new FormData();
    formData.append('image', file);
    Object.entries(coords).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return api.post('/crop', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  aspectRatio: (file, ratio, gravity = 'center') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('ratio', ratio);
    formData.append('gravity', gravity);
    return api.post('/crop/aspect-ratio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  circle: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/crop/circle', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  freeform: (file, options) => {
    const formData = new FormData();
    formData.append('image', file);
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return api.post('/crop/freeform', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  presets: () => api.get('/crop/presets'),
};

// Watermark Remove API
export const watermarkApi = {
  remove: (file, options = {}) => {
    const formData = new FormData();
    formData.append('image', file);
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return api.post('/watermark-remove', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  detect: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/watermark-remove/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// PDF extended methods
export const pdfExtendedApi = {
  toImages: (file, options = {}) => {
    const formData = new FormData();
    formData.append('pdf', file);
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return api.post('/pdf/to-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  addPageNumbers: (file, options = {}) => {
    const formData = new FormData();
    formData.append('pdf', file);
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return api.post('/pdf/add-page-numbers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  rotate: (file, rotation = 90) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('rotation', rotation);
    return api.post('/pdf/rotate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
