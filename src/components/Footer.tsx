import { Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center text-white font-bold mr-2">
                A
              </div>
              <span className="text-xl font-bold text-white">
                AgentSphere
              </span>
            </div>
            <p className="mt-4 text-indigo-200">
              Transforming education and community with location-based AI agents and augmented reality.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-indigo-200 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-indigo-200 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-indigo-200 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white">Product</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Beta Program</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white">Resources</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-indigo-200 hover:text-white transition-colors">Privacy</a></li>
            <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center text-white font-bold mr-2">
              N
            </div>
          </div>
        </div>
        
            <span className="ml-2 text-sm text-indigo-200">
              powered by NEAR
            </span>
        <div className="mt-12 pt-8 border-t border-indigo-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-indigo-200 text-sm">
            &copy; {new Date().getFullYear()} NEAR AgentSphere. All rights reserved. Built for NEAR Protocol Hackathon 2025.
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-300 rounded-full mr-2"></span>
            NEAR Hackathon 2025
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-6">
              <a href="#" className="text-indigo-200 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-indigo-200 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-indigo-200 hover:text-white transition-colors text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
  )
}