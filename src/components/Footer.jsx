import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Heart } from 'lucide-react';

function Footer() {
  return (
    <footer className="border-t border-dark-800 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold gradient-text">
                MagicPixels
              </span>
            </Link>
            <p className="text-dark-400 text-sm max-w-md">
              AI-powered image control center. Transform, enhance, and perfect your images 
              with cutting-edge AI technology and professional-grade tools.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/ai-tool" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  AI Tools
                </Link>
              </li>
              <li>
                <Link to="/resize" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Resize Images
                </Link>
              </li>
              <li>
                <Link to="/compress" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Compress Images
                </Link>
              </li>
              <li>
                <Link to="/convert" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Convert Format
                </Link>
              </li>
            </ul>
          </div>

          {/* More Tools */}
          <div>
            <h3 className="text-white font-semibold mb-4">More Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/pdf-tools" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  PDF Tools
                </Link>
              </li>
              <li>
                <Link to="/background-remove" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                  Remove Background
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-dark-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500" /> by MagicPixels Team
          </p>
          
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="text-dark-500 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="text-dark-500 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
          
          <p className="text-dark-500 text-sm">
            © {new Date().getFullYear()} MagicPixels. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
