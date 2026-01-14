import { motion } from 'framer-motion';

function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
      <div className="flex-1 mr-4">
        <p className="text-white font-medium">{label}</p>
        {description && (
          <p className="text-dark-400 text-sm mt-0.5">{description}</p>
        )}
      </div>
      
      <button
        onClick={() => onChange(!checked)}
        className={`toggle-switch ${checked ? 'active' : ''}`}
        role="switch"
        aria-checked={checked}
      >
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
}

export default ToggleSwitch;
