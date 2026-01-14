import { useState } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Loader2, Download, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader';
import ProcessingOverlay from '../components/ProcessingOverlay';
import { backgroundApi } from '../services/api';

const backgroundColors = [
  { name: 'Transparent', value: 'transparent', preview: 'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ccc%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23ccc%22%2F%3E%3C%2Fsvg%3E")]' },
  { name: 'White', value: '#ffffff', preview: 'bg-white' },
  { name: 'Black', value: '#000000', preview: 'bg-black' },
  { name: 'Red', value: '#ef4444', preview: 'bg-red-500' },
  { name: 'Blue', value: '#3b82f6', preview: 'bg-blue-500' },
  { name: 'Green', value: '#22c55e', preview: 'bg-green-500' },
  { name: 'Purple', value: '#a855f7', preview: 'bg-purple-500' },
  { name: 'Gray', value: '#6b7280', preview: 'bg-gray-500' },
];

function BackgroundRemovePage() {
  const [file, setFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [selectedBg, setSelectedBg] = useState('transparent');
  const [customColor, setCustomColor] = useState('#ffffff');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = (uploadedFile) => {
    setFile(uploadedFile);
    setCurrentImage(URL.createObjectURL(uploadedFile));
    setResult(null);
  };

  const handleRemoveImage = () => {
    setFile(null);
    setCurrentImage(null);
    setResult(null);
  };

  const handleRemoveBackground = async () => {
    if (!file) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);

    try {
      let response;

      if (selectedBg === 'transparent') {
        response = await backgroundApi.remove(file);
      } else {
        const bgColor = selectedBg === 'custom' ? customColor : selectedBg;
        response = await backgroundApi.replace(file, bgColor);
      }

      if (response.success) {
        setResult(response.data);
        toast.success('Background processed successfully!');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to process image');
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
      a.download = `no-background.png`;
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
      <ProcessingOverlay isVisible={isProcessing} step="Removing background..." />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Remove Background
          </h1>
          <p className="text-dark-400 max-w-xl mx-auto">
            Remove or replace image backgrounds automatically.
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
                <div 
                  className={`aspect-video rounded-lg overflow-hidden mb-4 ${
                    selectedBg === 'transparent' 
                      ? 'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23444%22%2F%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23444%22%2F%3E%3Crect%20x%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23333%22%2F%3E%3Crect%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23333%22%2F%3E%3C%2Fsvg%3E")]' 
                      : 'bg-dark-800'
                  }`}
                >
                  <img
                    src={result.url}
                    alt="Result"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm text-dark-400 mb-4">
                  <span>{result.width} x {result.height}</span>
                  <span>{(result.size / 1024).toFixed(1)} KB</span>
                </div>
                
                <button onClick={handleDownload} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download PNG
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
            {/* Background Selection */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary-400" />
                Background Color
              </h3>
              
              <div className="grid grid-cols-4 gap-3 mb-4">
                {backgroundColors.map((bg) => (
                  <button
                    key={bg.value}
                    onClick={() => setSelectedBg(bg.value)}
                    className={`relative p-1 rounded-lg border-2 transition-all ${
                      selectedBg === bg.value
                        ? 'border-primary-500'
                        : 'border-transparent hover:border-dark-500'
                    }`}
                  >
                    <div className={`w-full aspect-square rounded-md ${bg.preview}`} />
                    <span className="block text-xs text-dark-400 mt-1 text-center">{bg.name}</span>
                  </button>
                ))}
              </div>

              {/* Custom Color */}
              <div className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg">
                <button
                  onClick={() => setSelectedBg('custom')}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    selectedBg === 'custom' ? 'border-primary-500' : 'border-dark-600'
                  }`}
                  style={{ backgroundColor: customColor }}
                />
                <div className="flex-1">
                  <label className="block text-dark-400 text-xs mb-1">Custom Color</label>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setSelectedBg('custom');
                    }}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setSelectedBg('custom');
                  }}
                  className="w-24 px-2 py-1 bg-dark-700 border border-dark-600 rounded text-white text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">How it works</h3>
              <div className="text-dark-400 text-sm space-y-2">
                <p>• Upload an image with a clear subject</p>
                <p>• Choose a background color or keep it transparent</p>
                <p>• Click "Remove Background" to process</p>
                <p>• Download your result as PNG</p>
              </div>
            </div>

            {/* Process Button */}
            <button
              onClick={handleRemoveBackground}
              disabled={!file || isProcessing}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Scissors className="w-5 h-5" />
                  Remove Background
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default BackgroundRemovePage;
