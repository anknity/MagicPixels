import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileType, Loader2, Download, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader';
import ProcessingOverlay from '../components/ProcessingOverlay';
import { convertApi } from '../services/api';

const formats = [
  { id: 'png', name: 'PNG', description: 'Lossless, supports transparency' },
  { id: 'jpg', name: 'JPG', description: 'Best for photos, smaller size' },
  { id: 'webp', name: 'WebP', description: 'Modern format, great compression' },
  { id: 'avif', name: 'AVIF', description: 'Next-gen format, best quality' },
  { id: 'gif', name: 'GIF', description: 'Supports animation' },
  { id: 'tiff', name: 'TIFF', description: 'High quality for print' },
];

function ConvertPage() {
  const [file, setFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('webp');
  const [quality, setQuality] = useState(90);
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

  const handleConvert = async () => {
    if (!file) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await convertApi.convert(file, selectedFormat, quality);

      if (response.success) {
        setResult(response.data);
        toast.success(`Converted to ${selectedFormat.toUpperCase()} successfully!`);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to convert image');
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
      a.download = `converted-image.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const getOriginalFormat = () => {
    if (!file) return '';
    const ext = file.name.split('.').pop()?.toLowerCase();
    return ext || '';
  };

  return (
    <div className="min-h-screen py-12">
      <ProcessingOverlay isVisible={isProcessing} step="Converting format..." />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileType className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Convert Format
          </h1>
          <p className="text-dark-400 max-w-xl mx-auto">
            Convert your images between different formats with quality control.
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
                <div className="flex items-center justify-between">
                  <span className="text-dark-400">Current Format</span>
                  <span className="px-3 py-1 bg-dark-700 rounded-lg text-white font-medium uppercase">
                    {getOriginalFormat()}
                  </span>
                </div>
              </div>
            )}

            {result && (
              <div className="card p-4">
                <h3 className="text-white font-medium mb-3">Converted Result</h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-dark-800 mb-4">
                  <img
                    src={result.url}
                    alt="Converted"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">New Format</span>
                    <span className="text-primary-400 font-medium uppercase">{result.newFormat}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Dimensions</span>
                    <span className="text-white">{result.width} x {result.height}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">File Size</span>
                    <span className="text-white">{(result.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                
                <button onClick={handleDownload} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download {selectedFormat.toUpperCase()}
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
            {/* Format Selection */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Output Format</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {formats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`p-4 rounded-xl border text-left transition-all relative ${
                      selectedFormat === format.id
                        ? 'bg-primary-500/20 border-primary-500'
                        : 'bg-dark-800 border-dark-600 hover:border-dark-500'
                    }`}
                  >
                    {selectedFormat === format.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-primary-400" />
                      </div>
                    )}
                    <p className={`font-semibold ${
                      selectedFormat === format.id ? 'text-primary-400' : 'text-white'
                    }`}>
                      {format.name}
                    </p>
                    <p className="text-dark-400 text-xs mt-1">{format.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            {selectedFormat !== 'gif' && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quality</h3>
                
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
                    <span className="text-dark-400">10%</span>
                    <span className="text-white font-semibold text-lg">{quality}%</span>
                    <span className="text-dark-400">100%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Convert Button */}
            <button
              onClick={handleConvert}
              disabled={!file || isProcessing}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FileType className="w-5 h-5" />
                  Convert to {selectedFormat.toUpperCase()}
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ConvertPage;
