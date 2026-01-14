import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function ProcessingOverlay({ isVisible, step, progress }) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-dark-950/90 backdrop-blur-sm flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card p-8 max-w-sm w-full mx-4 text-center"
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-4 border-primary-500/30 border-t-primary-500"
          />
          
          {/* Inner ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full border-4 border-accent-500/30 border-b-accent-500"
          />
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">
          Processing Your Image
        </h3>
        
        {step && (
          <p className="text-primary-400 text-sm mb-4">{step}</p>
        )}

        {progress !== undefined && (
          <div className="w-full">
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
              />
            </div>
            <p className="text-dark-400 text-sm mt-2">{progress}% complete</p>
          </div>
        )}

        <p className="text-dark-500 text-xs mt-4">
          This may take a few moments...
        </p>
      </motion.div>
    </motion.div>
  );
}

export default ProcessingOverlay;
