import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Loader2, Download, RotateCcw, Eye, Wand2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader';
import ProcessingOverlay from '../components/ProcessingOverlay';
import { watermarkApi } from '../services/api';

const methods = [
  { value: 'inpaint', label: 'AI Inpaint', desc: 'Best quality, slower', badge: 'Recommended' },
  { value: 'clone', label: 'Clone Stamp', desc: 'Good for textures' },
  { value: 'basic', label: 'Smart Filter', desc: 'Fast processing' },
];

const strengths = [
  { value: 'light', label: 'Light', desc: 'Subtle watermarks' },
  { value: 'medium', label: 'Medium', desc: 'Standard watermarks' },
  { value: 'heavy', label: 'Heavy', desc: 'Bold watermarks' },
];

function WatermarkRemovePage() {
  const [file, setFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState(null);
  const [detection, setDetection] = useState(null);
  const [method, setMethod] = useState('inpaint');
  const [strength, setStrength] = useState('medium');

  const handleUpload = (uploadedFile) => {
    setFile(uploadedFile);
    setCurrentImage(URL.createObjectURL(uploadedFile));
    setResult(null);
    setDetection(null);
  };

  const handleRemoveImage = () => {
    setFile(null);
    setCurrentImage(null);
    setResult(null);
    setDetection(null);
  };

  const handleDetect = async () => {
    if (!file) return;
    setIsDetecting(true);
    try {
      const response = await watermarkApi.detect(file);
      if (response?.data) {
        setDetection(response.data);
        if (response.data.watermarkDetected) {
          toast.success('Watermark detected! Adjust settings and remove.');
        } else {
          toast('No obvious watermark detected. You can still try removal.', { icon: '🔍' });
        }
      }
    } catch (error) {
      toast.error(error.message || 'Detection failed');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleRemove = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const response = await watermarkApi.remove(file, { method, strength });
      if (response?.data?.url) {
        setResult(response.data);
        toast.success('Watermark removal complete!');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to remove watermark');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {isProcessing && <ProcessingOverlay message="Removing watermark..." />}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-full mb-4">
          <Droplets className="w-4 h-4 text-violet-400" />
          <span className="text-violet-400 text-sm font-medium">AI Watermark Remover</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
          Remove <span className="gradient-text">Watermarks</span>
        </h1>
        <p className="text-dark-300 max-w-xl mx-auto">
          AI-powered watermark detection and removal with multiple algorithms
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Method Selection */}
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-3">Removal Method</h3>
            <div className="space-y-2">
              {methods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMethod(m.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    method === m.value
                      ? 'bg-primary-500/20 border border-primary-500/50'
                      : 'bg-dark-800 border border-dark-700 hover:border-dark-600'
                  }`}
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className={method === m.value ? 'text-primary-400' : 'text-white'}>
                        {m.label}
                      </span>
                      {m.badge && (
                        <span className="px-1.5 py-0.5 bg-accent-500/20 text-accent-400 text-[10px] rounded">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-dark-500">{m.desc}</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    method === m.value ? 'border-primary-400 bg-primary-400' : 'border-dark-600'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          {/* Strength */}
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-3">Removal Strength</h3>
            <div className="grid grid-cols-3 gap-2">
              {strengths.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStrength(s.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all text-center ${
                    strength === s.value
                      ? 'bg-primary-500/20 border border-primary-500/50 text-primary-400'
                      : 'bg-dark-800 border border-dark-700 text-dark-300 hover:text-white'
                  }`}
                >
                  <span className="text-sm font-medium">{s.label}</span>
                  <span className="text-[10px] text-dark-500">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detection Result */}
          {detection && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5"
            >
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary-400" />
                Detection Results
              </h3>
              {detection.watermarkDetected ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-dark-300">
                    <span>Type</span>
                    <span className="text-white">{detection.detection?.type || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between text-dark-300">
                    <span>Position</span>
                    <span className="text-white">{detection.detection?.position || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between text-dark-300">
                    <span>Opacity</span>
                    <span className="text-white">{detection.detection?.opacity || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-dark-300">
                    <span>Coverage</span>
                    <span className="text-white">{detection.detection?.coverage || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-dark-400 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  No clear watermark detected
                </div>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleDetect}
              disabled={!file || isDetecting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-dark-300 hover:text-white hover:border-primary-500/50 transition-all disabled:opacity-50"
            >
              {isDetecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {isDetecting ? 'Detecting...' : 'Detect Watermark'}
            </button>

            <button
              onClick={handleRemove}
              disabled={!file || isProcessing}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Wand2 className="w-5 h-5" />
              )}
              {isProcessing ? 'Processing...' : 'Remove Watermark'}
            </button>
          </div>
        </motion.div>

        {/* Preview Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          {!file ? (
            <ImageUploader onUpload={handleUpload} />
          ) : (
            <div className="space-y-6">
              {/* Original */}
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Original Image</h3>
                  <button
                    onClick={handleRemoveImage}
                    className="text-dark-400 hover:text-red-400 text-sm flex items-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>
                <div className="bg-dark-800 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: '300px' }}>
                  <img src={currentImage} alt="Original" className="max-w-full max-h-[400px] object-contain" />
                </div>
              </div>

              {/* Before/After comparison */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">Result</h3>
                      <a
                        href={result.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm flex items-center gap-1 px-3 py-1.5"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>

                    {/* Side by side comparison */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-dark-500 mb-2 text-center">Before</p>
                        <div className="bg-dark-800 rounded-lg overflow-hidden flex items-center justify-center p-2">
                          <img src={currentImage} alt="Before" className="max-w-full max-h-[300px] object-contain" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-dark-500 mb-2 text-center">After</p>
                        <div className="bg-dark-800 rounded-lg overflow-hidden flex items-center justify-center p-2">
                          <img src={result.url} alt="After" className="max-w-full max-h-[300px] object-contain" />
                        </div>
                      </div>
                    </div>

                    {result.processing && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-dark-800 rounded text-xs text-dark-400">
                          Method: {result.processing.method}
                        </span>
                        <span className="px-2 py-1 bg-dark-800 rounded text-xs text-dark-400">
                          Strength: {result.processing.strength}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default WatermarkRemovePage;
