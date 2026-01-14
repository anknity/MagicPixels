import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Image state
  currentImage: null,
  processedImage: null,
  imageHistory: [],
  
  // Upload state
  isUploading: false,
  uploadProgress: 0,
  
  // Processing state
  isProcessing: false,
  processingStep: '',
  
  // AI options
  aiOptions: {
    autoEnhance: true,
    removeBackground: false,
    smartCrop: false,
    upscale: false,
  },
  
  // Results
  results: [],
  
  // Actions
  setCurrentImage: (image) => set({ currentImage: image }),
  
  setProcessedImage: (image) => set((state) => ({
    processedImage: image,
    imageHistory: [...state.imageHistory, image],
  })),
  
  clearImages: () => set({
    currentImage: null,
    processedImage: null,
    imageHistory: [],
  }),
  
  setUploading: (status) => set({ isUploading: status }),
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  setProcessing: (status, step = '') => set({
    isProcessing: status,
    processingStep: step,
  }),
  
  setAiOption: (key, value) => set((state) => ({
    aiOptions: { ...state.aiOptions, [key]: value },
  })),
  
  resetAiOptions: () => set({
    aiOptions: {
      autoEnhance: true,
      removeBackground: false,
      smartCrop: false,
      upscale: false,
    },
  }),
  
  addResult: (result) => set((state) => ({
    results: [...state.results, result],
  })),
  
  clearResults: () => set({ results: [] }),
  
  undoLastEdit: () => set((state) => {
    if (state.imageHistory.length > 1) {
      const newHistory = state.imageHistory.slice(0, -1);
      return {
        imageHistory: newHistory,
        processedImage: newHistory[newHistory.length - 1],
      };
    }
    return state;
  }),
}));

export default useStore;
