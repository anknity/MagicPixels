import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Loader2, Download, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader';
import ProcessingOverlay from '../components/ProcessingOverlay';
import { compressApi } from '../services/api';

function CompressPage() {
  const [file, setFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [quality, setQuality] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [targetSize, setTargetSize] = useState('');
  const [mode, setMode] = useState('quality'); // quality or target

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

  const handleCompress = async () => {
    if (!file) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);

    try {
      let response;
      
      if (mode === 'target' && targetSize) {
        response = await compressApi.auto(file, parseInt(targetSize) * 1024);
      } else {
        response = await compressApi.compress(file, { quality });
      }

      if (response.success) {
        setResult(response.data);
        toast.success('Image compressed successfully!');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to compress image');
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
      a.download = `compressed-image.${result.format || 'jpg'}`;
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
      <ProcessingOverlay isVisible={isProcessing} step="Compressing image..." />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileDown className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Compress Images
          </h1>
          <p className="text-dark-400 max-w-xl mx-auto">
            Reduce file size while maintaining quality. Perfect for web optimization.
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

            {file && (
              <div className="card p-4">
                <h3 className="text-white font-medium mb-3">Original</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-400">File Size</span>
                  <span className="text-white font-medium">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            )}

            {result && (
              <div className="card p-4">
                <h3 className="text-white font-medium mb-3">Compressed Result</h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-dark-800 mb-4">
                  <img
                    src={result.url}
                    alt="Compressed"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Original Size</span>
                    <span className="text-white">{(result.originalSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Compressed Size</span>
                    <span className="text-green-400 font-medium">
                      {(result.compressedSize / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Saved</span>
                    <span className="text-primary-400 font-medium flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      {result.compressionRatio}
                    </span>
                  </div>
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
            {/* Mode Selection */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Compression Mode</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('quality')}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    mode === 'quality'
                      ? 'bg-primary-500/20 border-primary-500'
                      : 'bg-dark-800 border-dark-600 hover:border-dark-500'
                  }`}
                >
                  <p className={`font-medium ${mode === 'quality' ? 'text-primary-400' : 'text-white'}`}>
                    By Quality
                  </p>
                  <p className="text-dark-400 text-sm">Set compression level</p>
                </button>
                <button
                  onClick={() => setMode('target')}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    mode === 'target'
                      ? 'bg-primary-500/20 border-primary-500'
                      : 'bg-dark-800 border-dark-600 hover:border-dark-500'
                  }`}
                >
                  <p className={`font-medium ${mode === 'target' ? 'text-primary-400' : 'text-white'}`}>
                    Target Size
                  </p>
                  <p className="text-dark-400 text-sm">Auto-adjust quality</p>
                </button>
              </div>
            </div>

            {/* Quality Slider */}
            {mode === 'quality' && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quality Level</h3>
                
                <div className="space-y-4">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Lower quality, smaller file</span>
                    <span className="text-white font-semibold text-lg">{quality}%</span>
                    <span className="text-dark-400">Higher quality, larger file</span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {[60, 70, 80, 90].map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`p-2 rounded-lg text-sm font-medium transition-all ${
                          quality === q
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                        }`}
                      >
                        {q}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Target Size */}
            {mode === 'target' && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Target File Size</h3>
                
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={targetSize}
                    onChange={(e) => setTargetSize(e.target.value)}
                    placeholder="500"
                    className="input-field flex-1"
                  />
                  <span className="text-dark-400 font-medium">KB</span>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[100, 250, 500, 1000].map((size) => (
                    <button
                      key={size}
                      onClick={() => setTargetSize(size.toString())}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        targetSize === size.toString()
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                      }`}
                    >
                      {size >= 1000 ? `${size / 1000}MB` : `${size}KB`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Compress Button */}
            <button
              onClick={handleCompress}
              disabled={!file || isProcessing || (mode === 'target' && !targetSize)}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Compressing...
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5" />
                  Compress Image
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default CompressPage;
