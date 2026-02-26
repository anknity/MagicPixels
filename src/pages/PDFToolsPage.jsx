import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FileText, Loader2, Download, Upload, Merge, Split, Stamp, X, Image, Hash, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import ProcessingOverlay from '../components/ProcessingOverlay';
import { pdfApi, pdfExtendedApi } from '../services/api';

const tools = [
  { id: 'create', name: 'Images to PDF', icon: FileText, description: 'Create PDF from images' },
  { id: 'toImages', name: 'PDF to Images', icon: Image, description: 'Convert PDF pages to images' },
  { id: 'merge', name: 'Merge PDFs', icon: Merge, description: 'Combine multiple PDFs' },
  { id: 'split', name: 'Split PDF', icon: Split, description: 'Split PDF into pages' },
  { id: 'watermark', name: 'Add Watermark', icon: Stamp, description: 'Add text watermark' },
  { id: 'pageNumbers', name: 'Page Numbers', icon: Hash, description: 'Add page numbers' },
  { id: 'rotate', name: 'Rotate Pages', icon: RotateCcw, description: 'Rotate PDF pages' },
];

function PDFToolsPage() {
  const [selectedTool, setSelectedTool] = useState('create');
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [pageSize, setPageSize] = useState('A4');
  const [rotation, setRotation] = useState(90);
  const [pageNumberPosition, setPageNumberPosition] = useState('bottom-center');

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: selectedTool === 'create' 
      ? { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }
      : { 'application/pdf': ['.pdf'] },
    multiple: selectedTool === 'create' || selectedTool === 'merge',
  });

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
    setResult(null);
  };

  const handleProcess = async () => {
    // Strict validation based on tool type
    if (!files || files.length === 0) {
      toast.error(selectedTool === 'create' 
        ? 'Please add at least one image to create a PDF' 
        : 'Please add files first');
      return;
    }

    // Validate file types for image-to-PDF
    if (selectedTool === 'create') {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
      const invalidFiles = files.filter(file => !validImageTypes.includes(file.type));
      if (invalidFiles.length > 0) {
        toast.error(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}. Only images allowed.`);
        return;
      }
    }

    setIsProcessing(true);

    try {
      let response;

      switch (selectedTool) {
        case 'create':
          response = await pdfApi.fromImages(files, { pageSize });
          break;
        case 'merge':
          if (files.length < 2) {
            throw new Error('Please add at least 2 PDFs to merge');
          }
          response = await pdfApi.merge(files);
          break;
        case 'split':
          if (files.length !== 1) {
            throw new Error('Please add exactly 1 PDF to split');
          }
          response = await pdfApi.split(files[0]);
          break;
        case 'watermark':
          if (files.length !== 1) {
            throw new Error('Please add exactly 1 PDF');
          }
          if (!watermarkText.trim()) {
            throw new Error('Please enter watermark text');
          }
          response = await pdfApi.watermark(files[0], watermarkText);
          break;
        case 'toImages':
          if (files.length !== 1) {
            throw new Error('Please add exactly 1 PDF');
          }
          response = await pdfExtendedApi.toImages(files[0], { format: 'png', quality: 90 });
          break;
        case 'pageNumbers':
          if (files.length !== 1) {
            throw new Error('Please add exactly 1 PDF');
          }
          response = await pdfExtendedApi.addPageNumbers(files[0], { position: pageNumberPosition });
          break;
        case 'rotate':
          if (files.length !== 1) {
            throw new Error('Please add exactly 1 PDF');
          }
          response = await pdfExtendedApi.rotate(files[0], rotation);
          break;
        default:
          throw new Error('Invalid tool selected');
      }

      if (response.success) {
        setResult(response.data);
        toast.success('PDF processed successfully!');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to process PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async (url, filename = 'document.pdf') => {
    try {
      // Check if it's already a blob URL (from direct download)
      if (url.startsWith('blob:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Clean up blob URL after download
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success('Download started!');
        return;
      }
      
      // For remote URLs, fetch and download
      const response = await fetch(url);
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Download started!');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  return (
    <div className="min-h-screen py-12">
      <ProcessingOverlay isVisible={isProcessing} step="Processing PDF..." />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            PDF Tools
          </h1>
          <p className="text-dark-400 max-w-xl mx-auto">
            Create PDFs from images, convert to images, merge, split, watermark, add page numbers & rotate.
          </p>
        </motion.div>

        {/* Tool Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8"
        >
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setSelectedTool(tool.id);
                  clearFiles();
                }}
                className={`p-4 rounded-xl border text-center transition-all ${
                  selectedTool === tool.id
                    ? 'bg-primary-500/20 border-primary-500'
                    : 'bg-dark-800 border-dark-600 hover:border-dark-500'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${
                  selectedTool === tool.id ? 'text-primary-400' : 'text-dark-400'
                }`} />
                <p className={`text-sm font-medium ${
                  selectedTool === tool.id ? 'text-primary-400' : 'text-white'
                }`}>
                  {tool.name}
                </p>
              </button>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`upload-zone ${isDragActive ? 'upload-zone-active' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <p className="text-white font-medium">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-dark-400 text-sm mt-1">
                or click to browse
              </p>
              <p className="text-dark-500 text-xs mt-2">
                {selectedTool === 'create' ? 'PNG, JPG, GIF, WebP' : 'PDF files only'}
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Files ({files.length})</h3>
                  <button onClick={clearFiles} className="text-dark-400 hover:text-red-400 text-sm">
                    Clear all
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-dark-800 rounded-lg">
                      <span className="text-dark-300 text-sm truncate flex-1">{file.name}</span>
                      <button onClick={() => removeFile(index)} className="ml-2 text-dark-500 hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="card p-4">
                <h3 className="text-white font-medium mb-3">Result</h3>
                
                {Array.isArray(result) ? (
                  <div className="space-y-2">
                    {result.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-dark-800 rounded-lg">
                        <span className="text-dark-300 text-sm">Page {item.page || index + 1}</span>
                        <button
                          onClick={() => handleDownload(item.url, `page-${item.page || index + 1}.pdf`)}
                          className="text-primary-400 hover:text-primary-300"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : result.pages ? (
                  <div className="space-y-2">
                    <p className="text-sm text-dark-400 mb-2">{result.totalPages} pages converted</p>
                    {result.pages.map((page, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-dark-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <img src={page.url} alt={`Page ${page.page}`} className="w-10 h-14 object-cover rounded" />
                          <span className="text-dark-300 text-sm">Page {page.page}</span>
                        </div>
                        <button
                          onClick={() => handleDownload(page.url, `page-${page.page}.${page.format || 'png'}`)}
                          className="text-primary-400 hover:text-primary-300"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => handleDownload(result.url)}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Right Column - Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Tool-specific options */}
            {selectedTool === 'create' && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Page Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['A4', 'Letter', 'A3', 'A5', 'Legal'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setPageSize(size)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        pageSize === size
                          ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                          : 'bg-dark-800 border-dark-600 text-dark-300 hover:border-dark-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedTool === 'watermark' && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Watermark Text</h3>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Enter watermark text..."
                  className="input-field"
                />
              </div>
            )}

            {selectedTool === 'toImages' && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">PDF to Images</h3>
                <p className="text-dark-400 text-sm">
                  Upload a PDF and each page will be converted to a high-quality PNG image.
                  You can download each page individually.
                </p>
              </div>
            )}

            {selectedTool === 'pageNumbers' && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Page Number Position</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setPageNumberPosition(pos)}
                      className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        pageNumberPosition === pos
                          ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                          : 'bg-dark-800 border-dark-600 text-dark-300 hover:border-dark-500'
                      }`}
                    >
                      {pos.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedTool === 'rotate' && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Rotation Angle</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[90, 180, 270, -90].map((angle) => (
                    <button
                      key={angle}
                      onClick={() => setRotation(angle)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        rotation === angle
                          ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                          : 'bg-dark-800 border-dark-600 text-dark-300 hover:border-dark-500'
                      }`}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Instructions</h3>
              <div className="text-dark-400 text-sm space-y-2">
                {selectedTool === 'create' && (
                  <>
                    <p>• Upload images in the order you want them in the PDF</p>
                    <p>• Each image will be placed on a separate page</p>
                    <p>• Supported formats: PNG, JPG, GIF, WebP</p>
                  </>
                )}
                {selectedTool === 'merge' && (
                  <>
                    <p>• Upload at least 2 PDF files to merge</p>
                    <p>• PDFs will be merged in the order uploaded</p>
                    <p>• Drag and drop to reorder if needed</p>
                  </>
                )}
                {selectedTool === 'split' && (
                  <>
                    <p>• Upload a single PDF file</p>
                    <p>• Each page will be extracted as a separate PDF</p>
                    <p>• Download individual pages or all at once</p>
                  </>
                )}
                {selectedTool === 'watermark' && (
                  <>
                    <p>• Upload a single PDF file</p>
                    <p>• Enter the watermark text</p>
                    <p>• Watermark will be added to all pages</p>
                  </>
                )}
                {selectedTool === 'toImages' && (
                  <>
                    <p>• Upload a single PDF file</p>
                    <p>• Each page is converted to a PNG image</p>
                    <p>• Download individual page images</p>
                  </>
                )}
                {selectedTool === 'pageNumbers' && (
                  <>
                    <p>• Upload a single PDF file</p>
                    <p>• Choose where to place page numbers</p>
                    <p>• Numbers added in "Page X of Y" format</p>
                  </>
                )}
                {selectedTool === 'rotate' && (
                  <>
                    <p>• Upload a single PDF file</p>
                    <p>• Choose rotation angle</p>
                    <p>• All pages will be rotated</p>
                  </>
                )}
              </div>
            </div>

            {/* Process Button */}
            <button
              onClick={handleProcess}
              disabled={files.length === 0 || isProcessing}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Process PDF
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default PDFToolsPage;
