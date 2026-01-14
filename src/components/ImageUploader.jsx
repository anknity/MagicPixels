import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, Image, X, Loader2 } from 'lucide-react';

function ImageUploader({ 
  onUpload, 
  currentImage, 
  onRemove, 
  isUploading,
  uploadProgress,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff'] },
  maxSize = 10 * 1024 * 1024,
  multiple = false,
}) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(multiple ? acceptedFiles : acceptedFiles[0]);
    }
  }, [onUpload, multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled: isUploading,
  });

  if (currentImage) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative card p-4"
      >
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 z-10 p-2 bg-dark-800/80 hover:bg-red-500 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-800">
          <img
            src={typeof currentImage === 'string' ? currentImage : URL.createObjectURL(currentImage)}
            alt="Uploaded"
            className="w-full h-full object-contain"
          />
        </div>
        
        {typeof currentImage !== 'string' && (
          <div className="mt-3 flex items-center justify-between text-sm text-dark-400">
            <span className="truncate">{currentImage.name}</span>
            <span>{(currentImage.size / 1024).toFixed(1)} KB</span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`upload-zone ${isDragActive ? 'upload-zone-active' : ''} ${
        isUploading ? 'pointer-events-none' : ''
      }`}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        {isUploading ? (
          <>
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            <div className="w-full max-w-xs">
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                />
              </div>
              <p className="text-sm text-dark-400 mt-2">Uploading... {uploadProgress}%</p>
            </div>
          </>
        ) : (
          <>
            <motion.div
              animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
              className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl flex items-center justify-center"
            >
              {isDragActive ? (
                <Image className="w-8 h-8 text-primary-400" />
              ) : (
                <Upload className="w-8 h-8 text-primary-400" />
              )}
            </motion.div>
            
            <div className="text-center">
              <p className="text-white font-medium">
                {isDragActive ? 'Drop your image here' : 'Drag & drop your image here'}
              </p>
              <p className="text-dark-400 text-sm mt-1">
                or <span className="text-primary-400 hover:underline cursor-pointer">browse files</span>
              </p>
            </div>
            
            <p className="text-dark-500 text-xs">
              Supports: PNG, JPG, GIF, WebP, BMP, TIFF (Max {maxSize / 1024 / 1024}MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ImageUploader;
