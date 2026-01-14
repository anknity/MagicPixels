import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ImageOff, 
  Download, 
  RefreshCw, 
  Sparkles,
  AlertTriangle,
  Check,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { cloudinaryApi } from '../services/api';

function ResultPage() {
  const navigate = useNavigate();
  const { processedImage, currentImage, clearImages } = useStore();
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('png');

  useEffect(() => {
    if (processedImage?.publicId) {
      loadDownloadStatus();
    }
  }, [processedImage]);

  const loadDownloadStatus = async () => {
    if (!processedImage?.publicId) return;
    
    try {
      const result = await cloudinaryApi.getStatus(processedImage.publicId);
      if (result.success) {
        setDownloadStatus(result.data);
      }
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const handleDownload = async () => {
    if (!processedImage?.publicId) {
      // Fallback to direct download for non-cloudinary images
      const link = document.createElement('a');
      link.href = processedImage.url;
      link.download = `magicpixels-${Date.now()}.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    setIsDownloading(true);

    try {
      const result = await cloudinaryApi.download(processedImage.publicId, selectedFormat);
      
      if (result.success) {
        // Update local status
        setDownloadStatus(prev => ({
          ...prev,
          downloads: result.data.downloads,
          remaining: result.data.remaining,
        }));

        // Trigger download
        const link = document.createElement('a');
        link.href = result.data.downloadUrl;
        link.download = `magicpixels-${Date.now()}.${selectedFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (result.data.remaining === 0) {
          toast.success('File downloaded! This was your last download - file will be deleted.', {
            duration: 5000,
            icon: '⚠️',
          });
        } else {
          toast.success(`Downloaded! ${result.data.remaining} downloads remaining.`);
        }
      } else {
        toast.error(result.error || 'Download failed');
      }
    } catch (error) {
      toast.error(error.message || 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEditAgain = () => {
    navigate('/cloudinary-tools');
  };

  const handleNewImage = () => {
    clearImages();
    navigate('/cloudinary-tools');
  };

  if (!processedImage) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-12 text-center"
          >
            <ImageOff className="w-16 h-16 text-dark-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">No Result Found</h2>
            <p className="text-dark-400 mb-6">
              Please process an image first to see results.
            </p>
            <button onClick={() => navigate('/cloudinary-tools')} className="btn-primary">
              Go to AI Tools
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const remaining = downloadStatus?.remaining ?? processedImage?.downloads?.remaining ?? 3;
  const downloads = downloadStatus?.downloads ?? processedImage?.downloads?.downloads ?? 0;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <button onClick={handleNewImage} className="btn-secondary">
            Process New Image
          </button>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full mb-4">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Processing Complete</span>
          </div>
          
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Your Result is Ready! ✨
          </h1>
          <p className="text-dark-400">
            {processedImage.tool && `Processed with ${processedImage.tool}`}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Image Preview - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="card overflow-hidden">
              {/* Image */}
              <div className="relative aspect-video bg-dark-800 flex items-center justify-center">
                <img
                  src={processedImage.url}
                  alt="Processed result"
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Quality badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-dark-900/80 backdrop-blur-sm rounded-full flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  <span className="text-sm text-white">Enhanced Quality</span>
                </div>
              </div>

              {/* Metadata */}
              {processedImage.metadata && (
                <div className="p-4 border-t border-dark-700 flex items-center justify-between text-sm">
                  <div className="flex gap-6">
                    <span className="text-dark-400">
                      {processedImage.metadata.width} × {processedImage.metadata.height}
                    </span>
                    <span className="text-dark-400 uppercase">
                      {processedImage.metadata.format}
                    </span>
                    {processedImage.metadata.size && (
                      <span className="text-dark-400">
                        {(processedImage.metadata.size / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Download Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Download Status */}
            <div className={`card p-4 ${
              remaining === 0 
                ? 'bg-red-500/10 border-red-500/30' 
                : remaining === 1 
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-primary-500/10 border-primary-500/30'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {remaining === 0 ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : remaining === 1 ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Info className="w-5 h-5 text-primary-400" />
                )}
                <span className={`font-medium ${
                  remaining === 0 
                    ? 'text-red-400' 
                    : remaining === 1 
                      ? 'text-yellow-400'
                      : 'text-primary-400'
                }`}>
                  {remaining === 0 
                    ? 'No Downloads Left' 
                    : `${remaining} Download${remaining > 1 ? 's' : ''} Remaining`}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    remaining === 0 
                      ? 'bg-red-500' 
                      : remaining === 1 
                        ? 'bg-yellow-500'
                        : 'bg-gradient-to-r from-primary-500 to-accent-500'
                  }`}
                  style={{ width: `${(remaining / 3) * 100}%` }}
                />
              </div>
              
              <p className="text-dark-400 text-xs mt-2">
                {remaining === 0 
                  ? 'File will be deleted for privacy.' 
                  : 'File auto-deletes after 3 downloads for privacy.'}
              </p>
            </div>

            {/* Format Selection */}
            {remaining > 0 && (
              <div className="card p-4">
                <label className="block text-white font-medium mb-3">Download Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {['png', 'jpg', 'webp'].map((format) => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedFormat === format
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                      }`}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading || remaining === 0}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                remaining === 0
                  ? 'bg-dark-700 text-dark-500 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Preparing Download...
                </>
              ) : remaining === 0 ? (
                <>
                  <Download className="w-5 h-5" />
                  No Downloads Available
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download {selectedFormat.toUpperCase()}
                </>
              )}
            </button>

            {/* Edit Again */}
            <button
              onClick={handleEditAgain}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Edit Again
            </button>

            {/* Actions Applied */}
            {processedImage.actionsApplied && processedImage.actionsApplied.length > 0 && (
              <div className="card p-4">
                <h4 className="text-sm font-medium text-white mb-3">Applied Effects</h4>
                <ul className="space-y-2">
                  {processedImage.actionsApplied.map((action, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-dark-300">
                      <Check className="w-4 h-4 text-green-400" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>

        {/* Original vs Result Comparison */}
        {currentImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Before & After</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card overflow-hidden">
                <div className="p-3 bg-dark-800 border-b border-dark-700">
                  <span className="text-sm font-medium text-dark-400">Original</span>
                </div>
                <div className="aspect-video bg-dark-900 flex items-center justify-center">
                  <img
                    src={currentImage}
                    alt="Original"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
              <div className="card overflow-hidden">
                <div className="p-3 bg-dark-800 border-b border-dark-700">
                  <span className="text-sm font-medium text-primary-400">Processed</span>
                </div>
                <div className="aspect-video bg-dark-900 flex items-center justify-center">
                  <img
                    src={processedImage.url}
                    alt="Processed"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ResultPage;
