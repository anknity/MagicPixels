import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wand2, 
  Sparkles, 
  Eraser, 
  Palette, 
  ZoomIn, 
  Expand, 
  Scissors, 
  UserX, 
  Square,
  SlidersHorizontal,
  Image,
  Loader2,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader';
import ProcessingOverlay from '../components/ProcessingOverlay';
import useStore from '../store/useStore';
import { cloudinaryApi } from '../services/api';

const tools = [
  {
    id: 'bg-remove',
    name: 'Remove Background',
    description: 'AI-powered background removal',
    icon: Eraser,
    gradient: 'from-purple-500 to-pink-500',
    category: 'Background',
  },
  {
    id: 'bg-replace',
    name: 'Replace Background',
    description: 'Replace with solid color',
    icon: Palette,
    gradient: 'from-blue-500 to-cyan-500',
    category: 'Background',
  },
  {
    id: 'enhance',
    name: 'AI Enhance',
    description: 'Enhance image quality',
    icon: Sparkles,
    gradient: 'from-yellow-500 to-orange-500',
    category: 'Enhancement',
  },
  {
    id: 'upscale',
    name: 'AI Upscale',
    description: 'Increase resolution with AI',
    icon: ZoomIn,
    gradient: 'from-green-500 to-emerald-500',
    category: 'Enhancement',
  },
  {
    id: 'auto-improve',
    name: 'Auto Improve',
    description: 'Auto color & brightness fix',
    icon: Wand2,
    gradient: 'from-indigo-500 to-violet-500',
    category: 'Enhancement',
  },
  {
    id: 'gen-fill',
    name: 'Generative Fill',
    description: 'Extend image with AI',
    icon: Expand,
    gradient: 'from-rose-500 to-pink-500',
    category: 'Generative',
  },
  {
    id: 'gen-remove',
    name: 'Remove Object',
    description: 'Remove objects by describing',
    icon: Scissors,
    gradient: 'from-red-500 to-orange-500',
    category: 'Generative',
  },
  {
    id: 'gen-recolor',
    name: 'Recolor Object',
    description: 'Change color of objects',
    icon: Palette,
    gradient: 'from-teal-500 to-cyan-500',
    category: 'Generative',
  },
  {
    id: 'smart-crop',
    name: 'Smart Crop',
    description: 'AI-powered smart cropping',
    icon: Square,
    gradient: 'from-amber-500 to-yellow-500',
    category: 'Crop & Resize',
  },
  {
    id: 'blur-faces',
    name: 'Blur Faces',
    description: 'Blur detected faces',
    icon: UserX,
    gradient: 'from-slate-500 to-gray-500',
    category: 'Privacy',
  },
  {
    id: 'pixelate-faces',
    name: 'Pixelate Faces',
    description: 'Pixelate detected faces',
    icon: UserX,
    gradient: 'from-zinc-500 to-neutral-500',
    category: 'Privacy',
  },
  {
    id: 'artistic-filter',
    name: 'Artistic Filters',
    description: 'Apply artistic effects',
    icon: Image,
    gradient: 'from-fuchsia-500 to-purple-500',
    category: 'Filters',
  },
  {
    id: 'adjust-colors',
    name: 'Color Adjust',
    description: 'Fine-tune colors',
    icon: SlidersHorizontal,
    gradient: 'from-sky-500 to-blue-500',
    category: 'Adjustments',
  },
];

const artisticFilters = [
  { id: 'al_dente', name: 'Al Dente' },
  { id: 'athena', name: 'Athena' },
  { id: 'audrey', name: 'Audrey' },
  { id: 'aurora', name: 'Aurora' },
  { id: 'daguerre', name: 'Daguerre' },
  { id: 'eucalyptus', name: 'Eucalyptus' },
  { id: 'fes', name: 'Fes' },
  { id: 'frost', name: 'Frost' },
  { id: 'hairspray', name: 'Hairspray' },
  { id: 'hokusai', name: 'Hokusai' },
  { id: 'incognito', name: 'Incognito' },
  { id: 'peacock', name: 'Peacock' },
  { id: 'primavera', name: 'Primavera' },
  { id: 'quartz', name: 'Quartz' },
  { id: 'red_rock', name: 'Red Rock' },
  { id: 'sizzle', name: 'Sizzle' },
  { id: 'sonnet', name: 'Sonnet' },
  { id: 'ukulele', name: 'Ukulele' },
  { id: 'zorro', name: 'Zorro' },
];

const bgColors = [
  { id: 'white', name: 'White', color: '#ffffff' },
  { id: 'black', name: 'Black', color: '#000000' },
  { id: 'transparent', name: 'Transparent', color: 'transparent' },
  { id: 'red', name: 'Red', color: '#ef4444' },
  { id: 'blue', name: 'Blue', color: '#3b82f6' },
  { id: 'green', name: 'Green', color: '#22c55e' },
  { id: 'yellow', name: 'Yellow', color: '#eab308' },
  { id: 'purple', name: 'Purple', color: '#a855f7' },
  { id: 'pink', name: 'Pink', color: '#ec4899' },
  { id: 'gray', name: 'Gray', color: '#6b7280' },
];

function CloudinaryToolsPage() {
  const navigate = useNavigate();
  const { setProcessedImage, isProcessing, setProcessing } = useStore();
  
  const [file, setFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  
  // Tool-specific options
  const [bgColor, setBgColor] = useState('white');
  const [selectedFilter, setSelectedFilter] = useState('athena');
  const [removePrompt, setRemovePrompt] = useState('');
  const [recolorPrompt, setRecolorPrompt] = useState('');
  const [recolorColor, setRecolorColor] = useState('blue');
  const [cropWidth, setCropWidth] = useState(800);
  const [cropHeight, setCropHeight] = useState(600);
  const [fillWidth, setFillWidth] = useState(1200);
  const [fillHeight, setFillHeight] = useState(800);
  const [colorAdjust, setColorAdjust] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
  });

  const handleUpload = (uploadedFile) => {
    setFile(uploadedFile);
    setCurrentImage(URL.createObjectURL(uploadedFile));
  };

  const handleRemoveImage = () => {
    setFile(null);
    setCurrentImage(null);
    setSelectedTool(null);
  };

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    setShowOptions(true);
  };

  const handleProcess = async () => {
    if (!file || !selectedTool) {
      toast.error('Please select an image and tool');
      return;
    }

    setProcessing(true, `Applying ${selectedTool.name}...`);

    try {
      let result;

      switch (selectedTool.id) {
        case 'bg-remove':
          result = await cloudinaryApi.removeBackground(file);
          break;
        case 'bg-replace':
          result = await cloudinaryApi.replaceBackground(file, bgColor);
          break;
        case 'enhance':
          result = await cloudinaryApi.enhance(file);
          break;
        case 'upscale':
          result = await cloudinaryApi.upscale(file);
          break;
        case 'auto-improve':
          result = await cloudinaryApi.autoImprove(file);
          break;
        case 'gen-fill':
          result = await cloudinaryApi.generativeFill(file, fillWidth, fillHeight);
          break;
        case 'gen-remove':
          if (!removePrompt.trim()) {
            toast.error('Please describe what to remove');
            setProcessing(false);
            return;
          }
          result = await cloudinaryApi.generativeRemove(file, removePrompt);
          break;
        case 'gen-recolor':
          if (!recolorPrompt.trim()) {
            toast.error('Please describe what to recolor');
            setProcessing(false);
            return;
          }
          result = await cloudinaryApi.generativeRecolor(file, recolorPrompt, recolorColor);
          break;
        case 'smart-crop':
          result = await cloudinaryApi.smartCrop(file, cropWidth, cropHeight);
          break;
        case 'blur-faces':
          result = await cloudinaryApi.blurFaces(file);
          break;
        case 'pixelate-faces':
          result = await cloudinaryApi.pixelateFaces(file);
          break;
        case 'artistic-filter':
          result = await cloudinaryApi.applyFilter(file, selectedFilter);
          break;
        case 'adjust-colors':
          result = await cloudinaryApi.adjustColors(file, colorAdjust);
          break;
        default:
          throw new Error('Unknown tool');
      }

      if (result.success) {
        setProcessedImage({
          url: result.data.url,
          publicId: result.data.publicId,
          metadata: {
            width: result.data.width,
            height: result.data.height,
            size: result.data.size,
            format: result.data.format,
          },
          downloads: result.data.downloads,
          tool: selectedTool.name,
        });
        toast.success('Image processed successfully!');
        navigate('/result');
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast.error(error.message || 'Failed to process image');
    } finally {
      setProcessing(false);
    }
  };

  const renderToolOptions = () => {
    if (!selectedTool) return null;

    switch (selectedTool.id) {
      case 'bg-replace':
        return (
          <div className="space-y-4">
            <label className="block text-white font-medium mb-2">Background Color</label>
            <div className="grid grid-cols-5 gap-3">
              {bgColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setBgColor(color.id)}
                  className={`relative w-12 h-12 rounded-xl border-2 transition-all ${
                    bgColor === color.id
                      ? 'border-primary-500 scale-110'
                      : 'border-dark-600 hover:border-dark-400'
                  }`}
                  style={{ 
                    backgroundColor: color.color,
                    backgroundImage: color.id === 'transparent' 
                      ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                      : 'none',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        );

      case 'artistic-filter':
        return (
          <div className="space-y-4">
            <label className="block text-white font-medium mb-2">Select Filter</label>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2">
              {artisticFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedFilter === filter.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>
        );

      case 'gen-remove':
        return (
          <div className="space-y-4">
            <label className="block text-white font-medium mb-2">What to remove?</label>
            <input
              type="text"
              value={removePrompt}
              onChange={(e) => setRemovePrompt(e.target.value)}
              placeholder="e.g., person in background, watermark, text"
              className="input-field"
            />
          </div>
        );

      case 'gen-recolor':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">What to recolor?</label>
              <input
                type="text"
                value={recolorPrompt}
                onChange={(e) => setRecolorPrompt(e.target.value)}
                placeholder="e.g., car, shirt, hair"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">New Color</label>
              <div className="grid grid-cols-5 gap-3">
                {bgColors.filter(c => c.id !== 'transparent').map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setRecolorColor(color.id)}
                    className={`relative w-10 h-10 rounded-lg border-2 transition-all ${
                      recolorColor === color.id
                        ? 'border-primary-500 scale-110'
                        : 'border-dark-600 hover:border-dark-400'
                    }`}
                    style={{ backgroundColor: color.color }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'smart-crop':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Width</label>
                <input
                  type="number"
                  value={cropWidth}
                  onChange={(e) => setCropWidth(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Height</label>
                <input
                  type="number"
                  value={cropHeight}
                  onChange={(e) => setCropHeight(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { w: 1920, h: 1080, label: '1920×1080' },
                { w: 1280, h: 720, label: '1280×720' },
                { w: 1080, h: 1080, label: '1080×1080' },
                { w: 1200, h: 630, label: 'OG Image' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setCropWidth(preset.w);
                    setCropHeight(preset.h);
                  }}
                  className="px-3 py-1 bg-dark-700 text-dark-300 rounded-lg text-sm hover:bg-dark-600"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 'gen-fill':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">New Width</label>
                <input
                  type="number"
                  value={fillWidth}
                  onChange={(e) => setFillWidth(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">New Height</label>
                <input
                  type="number"
                  value={fillHeight}
                  onChange={(e) => setFillHeight(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            <p className="text-dark-400 text-sm">
              AI will generate content to fill the extended areas
            </p>
          </div>
        );

      case 'adjust-colors':
        return (
          <div className="space-y-4">
            {[
              { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
              { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
              { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
            ].map((slider) => (
              <div key={slider.key}>
                <div className="flex justify-between mb-2">
                  <label className="text-white font-medium">{slider.label}</label>
                  <span className="text-dark-400">{colorAdjust[slider.key]}</span>
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  value={colorAdjust[slider.key]}
                  onChange={(e) => setColorAdjust(prev => ({
                    ...prev,
                    [slider.key]: parseInt(e.target.value),
                  }))}
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>
            ))}
          </div>
        );

      default:
        return (
          <p className="text-dark-400">
            Click "Process" to apply {selectedTool.name}
          </p>
        );
    }
  };

  const categories = [...new Set(tools.map(t => t.category))];

  return (
    <div className="min-h-screen py-12">
      <ProcessingOverlay isVisible={isProcessing} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/30 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-primary-400 text-sm font-medium">Cloudinary AI Tools</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            AI-Powered Image Tools
          </h1>
          <p className="text-dark-400 max-w-xl mx-auto">
            Professional image editing powered by Cloudinary AI. Each processed image can be downloaded 3 times before auto-deletion.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Tools */}
          <div className="space-y-6">
            {/* Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ImageUploader
                onUpload={handleUpload}
                currentImage={currentImage}
                onRemove={handleRemoveImage}
              />
            </motion.div>

            {/* Tool Selection */}
            {currentImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Select a Tool</h3>
                
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-dark-400 mb-2">{category}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {tools.filter(t => t.category === category).map((tool) => {
                          const Icon = tool.icon;
                          const isSelected = selectedTool?.id === tool.id;
                          
                          return (
                            <button
                              key={tool.id}
                              onClick={() => handleToolSelect(tool)}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                isSelected
                                  ? 'bg-gradient-to-r ' + tool.gradient + ' text-white'
                                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                              }`}
                            >
                              <Icon className="w-5 h-5 flex-shrink-0" />
                              <div className="text-left">
                                <div className="text-sm font-medium">{tool.name}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Options & Process */}
          <div className="space-y-6">
            {/* Tool Options */}
            <AnimatePresence mode="wait">
              {selectedTool && (
                <motion.div
                  key={selectedTool.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="card p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${selectedTool.gradient} flex items-center justify-center`}>
                      <selectedTool.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedTool.name}</h3>
                      <p className="text-sm text-dark-400">{selectedTool.description}</p>
                    </div>
                  </div>

                  {renderToolOptions()}

                  <button
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="w-full btn-primary mt-6 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Process Image
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info Card */}
            {!selectedTool && currentImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 border-dashed border-dark-600"
              >
                <div className="text-center py-8">
                  <Wand2 className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Select a Tool</h3>
                  <p className="text-dark-400">
                    Choose an AI tool from the left to start editing your image
                  </p>
                </div>
              </motion.div>
            )}

            {/* Download Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-4 bg-gradient-to-r from-primary-500/5 to-accent-500/5 border-primary-500/20"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Enhanced Quality Output</h4>
                  <p className="text-dark-400 text-sm">
                    All processed images are automatically enhanced for best quality. 
                    Each file can be downloaded up to 3 times before auto-deletion for privacy.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CloudinaryToolsPage;
