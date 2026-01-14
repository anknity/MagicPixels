import { motion } from 'framer-motion';
import { Download, RefreshCw, Share2, Check, Copy } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

function ResultPreview({ 
  imageUrl, 
  originalUrl,
  metadata,
  onEditAgain,
  downloadFormats = ['png', 'jpg', 'webp'],
}) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('png');

  const handleDownload = async (format) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `magicpixels-image.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopiedUrl(true);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="aspect-video rounded-xl overflow-hidden bg-dark-800 relative">
          <img
            src={imageUrl}
            alt="Processed result"
            className="w-full h-full object-contain"
          />
        </div>
        
        {metadata && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {metadata.width && (
              <div className="text-center p-3 bg-dark-800/50 rounded-lg">
                <p className="text-dark-400 text-xs">Width</p>
                <p className="text-white font-semibold">{metadata.width}px</p>
              </div>
            )}
            {metadata.height && (
              <div className="text-center p-3 bg-dark-800/50 rounded-lg">
                <p className="text-dark-400 text-xs">Height</p>
                <p className="text-white font-semibold">{metadata.height}px</p>
              </div>
            )}
            {metadata.size && (
              <div className="text-center p-3 bg-dark-800/50 rounded-lg">
                <p className="text-dark-400 text-xs">Size</p>
                <p className="text-white font-semibold">
                  {(metadata.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}
            {metadata.format && (
              <div className="text-center p-3 bg-dark-800/50 rounded-lg">
                <p className="text-dark-400 text-xs">Format</p>
                <p className="text-white font-semibold uppercase">{metadata.format}</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Download Options</h3>
        
        <div className="flex flex-wrap gap-3 mb-6">
          {downloadFormats.map((format) => (
            <button
              key={format}
              onClick={() => handleDownload(format)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                selectedFormat === format
                  ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                  : 'bg-dark-800 border-dark-600 text-dark-300 hover:border-primary-500 hover:text-white'
              }`}
            >
              <Download className="w-4 h-4" />
              <span className="uppercase font-medium text-sm">{format}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCopyUrl}
            className="btn-secondary flex items-center gap-2"
          >
            {copiedUrl ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copiedUrl ? 'Copied!' : 'Copy URL'}
          </button>
          
          <button
            onClick={onEditAgain}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Edit Again
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default ResultPreview;
