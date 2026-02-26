import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Crop, Loader2, Download, RotateCcw, Maximize2, Circle, Square, Monitor, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader';
import ProcessingOverlay from '../components/ProcessingOverlay';
import { cropApi } from '../services/api';

const aspectPresets = [
  { label: 'Free', value: null, icon: Maximize2 },
  { label: '1:1', value: '1:1', icon: Square },
  { label: '16:9', value: '16:9', icon: Monitor },
  { label: '9:16', value: '9:16', icon: Smartphone },
  { label: '4:3', value: '4:3', icon: Monitor },
  { label: '3:2', value: '3:2', icon: Monitor },
];

const socialPresets = [
  { label: 'Instagram Post', ratio: '1:1', desc: '1080×1080' },
  { label: 'Instagram Story', ratio: '9:16', desc: '1080×1920' },
  { label: 'Facebook Cover', ratio: '16:9', desc: '820×312' },
  { label: 'Twitter Header', ratio: '3:1', desc: '1500×500' },
  { label: 'YouTube Thumbnail', ratio: '16:9', desc: '1280×720' },
  { label: 'LinkedIn Banner', ratio: '4:1', desc: '1584×396' },
];

function CropPage() {
  const [file, setFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedRatio, setSelectedRatio] = useState(null);
  const [gravity, setGravity] = useState('center');
  const [cropMode, setCropMode] = useState('aspect'); // aspect, circle, coords
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  // Coordinate crop state
  const [cropCoords, setCropCoords] = useState({ left: 0, top: 0, width: 100, height: 100 });

  const handleUpload = (uploadedFile) => {
    setFile(uploadedFile);
    setCurrentImage(URL.createObjectURL(uploadedFile));
    setResult(null);

    const img = new Image();
    img.onload = () => {
      setImgDimensions({ width: img.width, height: img.height });
      setCropCoords({ left: 0, top: 0, width: img.width, height: img.height });
    };
    img.src = URL.createObjectURL(uploadedFile);
  };

  const handleRemoveImage = () => {
    setFile(null);
    setCurrentImage(null);
    setResult(null);
  };

  const handleCrop = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      let response;

      if (cropMode === 'circle') {
        response = await cropApi.circle(file);
        toast.success('Circle crop applied!');
      } else if (cropMode === 'coords') {
        response = await cropApi.crop(file, cropCoords);
        toast.success('Custom crop applied!');
      } else if (selectedRatio) {
        response = await cropApi.aspectRatio(file, selectedRatio, gravity);
        toast.success(`Cropped to ${selectedRatio}!`);
      } else {
        response = await cropApi.crop(file, cropCoords);
        toast.success('Crop applied!');
      }

      if (response?.data?.url) {
        setResult(response.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {isProcessing && <ProcessingOverlay message="Cropping your image..." />}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-4">
          <Crop className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 text-sm font-medium">Smart Crop Tool</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
          Crop <span className="gradient-text">Images</span>
        </h1>
        <p className="text-dark-300 max-w-xl mx-auto">
          Crop images with aspect ratio presets, circle crop, and custom coordinates
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Crop Mode */}
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-3">Crop Mode</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mode: 'aspect', label: 'Aspect', icon: Square },
                { mode: 'circle', label: 'Circle', icon: Circle },
                { mode: 'coords', label: 'Custom', icon: Crop },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setCropMode(mode)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                    cropMode === mode
                      ? 'bg-primary-500/20 border border-primary-500/50 text-primary-400'
                      : 'bg-dark-800 border border-dark-700 text-dark-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Presets */}
          {cropMode === 'aspect' && (
            <div className="card p-5">
              <h3 className="text-white font-semibold mb-3">Aspect Ratio</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {aspectPresets.map(({ label, value, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => setSelectedRatio(value)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs transition-all ${
                      selectedRatio === value
                        ? 'bg-primary-500/20 border border-primary-500/50 text-primary-400'
                        : 'bg-dark-800 border border-dark-700 text-dark-300 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Gravity */}
              {selectedRatio && (
                <div>
                  <label className="text-sm text-dark-300 mb-2 block">Position</label>
                  <select
                    value={gravity}
                    onChange={(e) => setGravity(e.target.value)}
                    className="input-field w-full"
                  >
                    {['center', 'north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'].map(g => (
                      <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Custom Coordinates */}
          {cropMode === 'coords' && (
            <div className="card p-5">
              <h3 className="text-white font-semibold mb-3">Coordinates</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'left', label: 'Left' },
                  { key: 'top', label: 'Top' },
                  { key: 'width', label: 'Width' },
                  { key: 'height', label: 'Height' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-xs text-dark-400 mb-1 block">{label}</label>
                    <input
                      type="number"
                      value={cropCoords[key]}
                      onChange={(e) => setCropCoords(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                      className="input-field w-full text-sm"
                      min={0}
                    />
                  </div>
                ))}
              </div>
              {imgDimensions.width > 0 && (
                <p className="text-xs text-dark-500 mt-2">
                  Image: {imgDimensions.width} × {imgDimensions.height}
                </p>
              )}
            </div>
          )}

          {/* Social Media Presets */}
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-3">Social Presets</h3>
            <div className="space-y-2">
              {socialPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setCropMode('aspect');
                    setSelectedRatio(preset.ratio);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/50 text-dark-300 hover:text-white transition-all text-sm"
                >
                  <span>{preset.label}</span>
                  <span className="text-xs text-dark-500">{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Crop Button */}
          <button
            onClick={handleCrop}
            disabled={!file || isProcessing}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Crop className="w-5 h-5" />
            )}
            {isProcessing ? 'Cropping...' : 'Crop Image'}
          </button>
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
              {/* Original Image */}
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
                <div className="relative bg-dark-800 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: '300px' }}>
                  <img
                    src={currentImage}
                    alt="Original"
                    className="max-w-full max-h-[400px] object-contain"
                  />
                  {cropMode === 'circle' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 rounded-full border-2 border-primary-400/50 border-dashed" />
                    </div>
                  )}
                </div>
                {imgDimensions.width > 0 && (
                  <p className="text-xs text-dark-500 mt-2 text-center">
                    {imgDimensions.width} × {imgDimensions.height}px
                  </p>
                )}
              </div>

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium">Cropped Result</h3>
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
                  <div className="bg-dark-800 rounded-lg overflow-hidden flex items-center justify-center p-4"
                    style={{ backgroundImage: 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%), linear-gradient(-45deg, #1a1a2e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a2e 75%), linear-gradient(-45deg, transparent 75%, #1a1a2e 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}
                  >
                    <img
                      src={result.url}
                      alt="Cropped"
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  </div>
                  {result.width && (
                    <p className="text-xs text-dark-500 mt-2 text-center">
                      {result.width} × {result.height}px • {(result.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default CropPage;
