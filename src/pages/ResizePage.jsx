import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minimize2, Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader';
import ProcessingOverlay from '../components/ProcessingOverlay';
import { resizeApi } from '../services/api';

const presets = [
  { name: 'Instagram Square', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Post', width: 1200, height: 630 },
  { name: 'Twitter Post', width: 1200, height: 675 },
  { name: 'LinkedIn Post', width: 1200, height: 627 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'Full HD', width: 1920, height: 1080 },
  { name: '4K', width: 3840, height: 2160 },
];

function ResizePage() {
  const [file, setFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [fit, setFit] = useState('cover');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [originalAspect, setOriginalAspect] = useState(1);

  const handleUpload = (uploadedFile) => {
    setFile(uploadedFile);
    setCurrentImage(URL.createObjectURL(uploadedFile));
    setResult(null);
    
    // Get original dimensions
    const img = new Image();
    img.onload = () => {
      setOriginalAspect(img.width / img.height);
    };
    img.src = URL.createObjectURL(uploadedFile);
  };

  const handleRemoveImage = () => {
    setFile(null);
    setCurrentImage(null);
    setResult(null);
  };

  const handleWidthChange = (value) => {
    setWidth(value);
    if (maintainAspect && value) {
      setHeight(Math.round(parseInt(value) / originalAspect).toString());
    }
  };

  const handleHeightChange = (value) => {
    setHeight(value);
    if (maintainAspect && value) {
      setWidth(Math.round(parseInt(value) * originalAspect).toString());
    }
  };

  const handlePresetClick = (preset) => {
    setWidth(preset.width.toString());
    setHeight(preset.height.toString());
  };

  const handleResize = async () => {
    if (!file) {
      toast.error('Please upload an image first');
      return;
    }

    if (!width && !height) {
      toast.error('Please enter width or height');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await resizeApi.resize(file, {
        width: width || undefined,
        height: height || undefined,
        fit,
        quality: 90,
      });

      if (response.success) {
        setResult(response.data);
        toast.success('Image resized successfully!');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to resize image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    
    try {
      const response = await fetch(result.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resized-${width}x${height}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  return (
    <div className="min-h-screen py-12">
      <ProcessingOverlay isVisible={isProcessing} step="Resizing image..." />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Minimize2 className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Resize Images
          </h1>
          <p className="text-dark-400 max-w-xl mx-auto">
            Resize your images to any dimension. Use presets for social media or enter custom dimensions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <ImageUploader
              onUpload={handleUpload}
              currentImage={currentImage}
              onRemove={handleRemoveImage}
            />

            {result && (
              <div className="card p-4">
                <h3 className="text-white font-medium mb-3">Result</h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-dark-800 mb-4">
                  <img
                    src={result.url}
                    alt="Resized"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-dark-400 mb-4">
                  <span>{result.width} x {result.height}</span>
                  <span>{(result.size / 1024).toFixed(1)} KB</span>
                </div>
                <button onClick={handleDownload} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download
                </button>
              </div>
            )}
          </motion.div>

          {/* Right Column - Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Dimensions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Dimensions</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-dark-400 text-sm mb-2">Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    placeholder="1920"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-dark-400 text-sm mb-2">Height (px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    placeholder="1080"
                    className="input-field"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintainAspect}
                  onChange={(e) => setMaintainAspect(e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-dark-300">Maintain aspect ratio</span>
              </label>
            </div>

            {/* Fit Mode */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Fit Mode</h3>
              
              <div className="grid grid-cols-3 gap-2">
                {['cover', 'contain', 'fill'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFit(mode)}
                    className={`p-3 rounded-lg border text-sm font-medium capitalize transition-all ${
                      fit === mode
                        ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                        : 'bg-dark-800 border-dark-600 text-dark-300 hover:border-dark-500'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Presets</h3>
              
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetClick(preset)}
                    className="p-3 bg-dark-800 hover:bg-dark-700 border border-dark-600 hover:border-primary-500 rounded-lg text-left transition-all"
                  >
                    <p className="text-white text-sm font-medium">{preset.name}</p>
                    <p className="text-dark-500 text-xs">{preset.width} x {preset.height}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Resize Button */}
            <button
              onClick={handleResize}
              disabled={!file || (!width && !height) || isProcessing}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resizing...
                </>
              ) : (
                <>
                  <Minimize2 className="w-5 h-5" />
                  Resize Image
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ResizePage;
