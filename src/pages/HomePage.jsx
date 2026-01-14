import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Wand2, 
  Minimize2, 
  FileDown, 
  FileType, 
  Scissors, 
  Image, 
  Zap, 
  Shield, 
  Clock,
  ArrowRight,
  Eraser,
  ZoomIn,
  Expand,
  Palette,
} from 'lucide-react';

const tools = [
  {
    path: '/cloudinary-tools',
    icon: Sparkles,
    title: 'AI Image Tools',
    description: 'Powerful AI tools: Background removal, enhance, upscale, generative fill & more',
    gradient: 'from-purple-500 to-pink-500',
    badge: 'Cloudinary AI',
    featured: true,
  },
  {
    path: '/resize',
    icon: Minimize2,
    title: 'Resize Images',
    description: 'Resize to any dimension with smart presets for social media and web',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    path: '/compress',
    icon: FileDown,
    title: 'Compress Images',
    description: 'Reduce file size while maintaining quality with smart compression',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    path: '/convert',
    icon: FileType,
    title: 'Convert Format',
    description: 'Convert between PNG, JPG, WebP, AVIF and more formats',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    path: '/pdf-tools',
    icon: Image,
    title: 'PDF Tools',
    description: 'Create PDFs from images, merge, split, and add watermarks',
    gradient: 'from-red-500 to-rose-500',
  },
];

const aiFeatures = [
  { icon: Eraser, name: 'BG Remove', desc: 'AI background removal' },
  { icon: ZoomIn, name: 'Upscale', desc: 'AI image upscaling' },
  { icon: Expand, name: 'Gen Fill', desc: 'Extend with AI' },
  { icon: Palette, name: 'Recolor', desc: 'AI object recoloring' },
];

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process images in seconds with our optimized backend',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your images are processed securely and never stored permanently',
  },
  {
    icon: Clock,
    title: 'No Sign-up Required',
    description: 'Start using our tools instantly without creating an account',
  },
];

function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-primary-400 text-sm font-medium">
                AI-Powered Image Processing
              </span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6">
              Your Ultimate{' '}
              <span className="gradient-text">Image Control</span>{' '}
              Center
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-10">
              Transform, enhance, and perfect your images with cutting-edge AI technology. 
              Professional-grade tools, zero complexity.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/ai-tool" className="btn-primary flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Try AI Editor
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/resize" className="btn-secondary">
                Explore All Tools
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title mb-4">Powerful Image Tools</h2>
            <p className="text-dark-400 max-w-xl mx-auto">
              Everything you need to process, edit, and optimize your images in one place
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              
              return (
                <motion.div
                  key={tool.path}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={tool.path}>
                    <div className="card-hover p-6 h-full relative overflow-hidden group">
                      {/* Badge */}
                      {tool.badge && (
                        <span className="absolute top-4 right-4 px-2 py-1 bg-accent-500/20 text-accent-400 text-xs font-medium rounded-full">
                          {tool.badge}
                        </span>
                      )}
                      
                      {/* Icon */}
                      <div className={`w-14 h-14 bg-gradient-to-br ${tool.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      
                      {/* Content */}
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-dark-400 text-sm">
                        {tool.description}
                      </p>
                      
                      {/* Arrow */}
                      <div className="mt-4 flex items-center text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-medium">Get Started</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-dark-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-8 md:p-12 text-center relative overflow-hidden"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10" />
            
            <div className="relative">
              <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                Ready to Transform Your Images?
              </h2>
              <p className="text-dark-300 mb-8 max-w-xl mx-auto">
                Start using MagicPixels now and experience the future of image processing. 
                No sign-up required.
              </p>
              <Link to="/ai-tool" className="btn-primary inline-flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Get Started Free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
