import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wand2, Sparkles, Send, Lightbulb, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader';
import ToggleSwitch from '../components/ToggleSwitch';
import ProcessingOverlay from '../components/ProcessingOverlay';
import useStore from '../store/useStore';
import { aiEditApi, aiEnhanceApi } from '../services/api';

const promptSuggestions = [
  'Make it look more vibrant and colorful',
  'Convert to black and white with high contrast',
  'Crop to 16:9 aspect ratio',
  'Make it look like a vintage photo',
  'Sharpen and enhance details',
  'Add a warm, golden hour effect',
];

function AIToolPage() {
  const navigate = useNavigate();
  const { 
    currentImage, 
    setCurrentImage, 
    setProcessedImage,
    aiOptions,
    setAiOption,
    isProcessing,
    setProcessing,
    isUploading,
    setUploading,
    uploadProgress,
    setUploadProgress,
  } = useStore();

  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState(null);

  const handleUpload = (uploadedFile) => {
    setFile(uploadedFile);
    setCurrentImage(URL.createObjectURL(uploadedFile));
  };

  const handleRemoveImage = () => {
    setFile(null);
    setCurrentImage(null);
  };

  const handleGenerate = async () => {
    if (!file) {
      toast.error('Please upload an image first');
      return;
    }

    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setProcessing(true, 'Analyzing your image...');

    try {
      // Process with AI
      setProcessing(true, 'Applying AI transformations...');
      const result = await aiEditApi.edit(file, prompt);

      if (result.success) {
        setProcessedImage({
          url: result.data.url,
          metadata: {
            width: result.data.width,
            height: result.data.height,
            size: result.data.size,
            format: result.data.format || 'png',
          },
          aiInstructions: result.data.aiInstructions,
          actionsApplied: result.data.actionsApplied,
        });

        // Check if fallback was used (AI quota exceeded)
        if (result.data.aiInstructions?.usedFallback) {
          toast('⚠️ AI service busy - Used smart preset processing instead', {
            icon: '🔄',
            duration: 5000,
            style: {
              background: '#fef3c7',
              color: '#92400e',
            },
          });
        } else {
          toast.success('Image processed successfully!');
        }
        navigate('/result');
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to process image');
    } finally {
      setProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setPrompt(suggestion);
  };

  return (
    <div className="min-h-screen py-12">
      <ProcessingOverlay isVisible={isProcessing} step="Processing with AI..." />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 border border-accent-500/30 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-accent-400" />
            <span className="text-accent-400 text-sm font-medium">AI-Powered</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            AI Image Editor
          </h1>
          <p className="text-dark-400 max-w-xl mx-auto">
            Transform your images using natural language. Just describe what you want, 
            and let AI do the magic.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ImageUploader
              onUpload={handleUpload}
              currentImage={currentImage}
              onRemove={handleRemoveImage}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          </motion.div>

          {/* Prompt Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <label className="block text-white font-medium mb-3">
              What would you like to do?
            </label>
            
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how you want to transform your image..."
                className="input-field min-h-[120px] pr-12 resize-none"
                rows={4}
              />
              <button
                onClick={handleGenerate}
                disabled={!file || !prompt.trim() || isProcessing}
                className="absolute bottom-3 right-3 p-2 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            {/* Suggestions */}
            <div className="mt-4">
              <div className="flex items-center gap-2 text-dark-400 text-sm mb-3">
                <Lightbulb className="w-4 h-4" />
                <span>Try these suggestions:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 hover:border-primary-500 rounded-lg text-sm text-dark-300 hover:text-white transition-all duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* AI Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary-400" />
              AI Options
            </h3>
            
            <div className="space-y-3">
              <ToggleSwitch
                checked={aiOptions.autoEnhance}
                onChange={(value) => setAiOption('autoEnhance', value)}
                label="Auto Enhance"
                description="Automatically improve brightness, contrast, and colors"
              />
              
              <ToggleSwitch
                checked={aiOptions.removeBackground}
                onChange={(value) => setAiOption('removeBackground', value)}
                label="Remove Background"
                description="Automatically detect and remove the background"
              />
              
              <ToggleSwitch
                checked={aiOptions.smartCrop}
                onChange={(value) => setAiOption('smartCrop', value)}
                label="Smart Crop"
                description="Intelligently crop to focus on the main subject"
              />
              
              <ToggleSwitch
                checked={aiOptions.upscale}
                onChange={(value) => setAiOption('upscale', value)}
                label="AI Upscale"
                description="Enhance resolution using AI upscaling"
              />
            </div>
          </motion.div>

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleGenerate}
              disabled={!file || !prompt.trim() || isProcessing}
              className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate Magic
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AIToolPage;
