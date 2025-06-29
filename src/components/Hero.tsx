import { motion } from 'framer-motion';
import { ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-20 md:pb-28">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 right-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
                <span className="block">Deploy AI Agents</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">in Your World</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl">
                Create, interact, and earn Auras with location-based AI agents through AR. Transform your school and community with personalized digital assistants.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <a 
                  href="#auth" 
                  className="glow-button bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                >
                  Join Waitlist
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <a 
                  href="#features" 
                  className="bg-white text-indigo-600 border border-indigo-200 px-8 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Learn More
                </a>
              </div>
              <div className="mt-6 text-sm text-gray-500">
                <span className="font-medium">Now testing at:</span> Lincoln High, Roosevelt Academy, Tech Prep
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-12 lg:mt-0 lg:col-span-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative mx-auto w-full max-w-md">
              {/* Phone mockup */}
              <div className="relative shadow-2xl rounded-[2.5rem] border-8 border-gray-800 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-6 bg-gray-800 z-10"></div>
                <div className="absolute bottom-0 inset-x-0 h-6 bg-gray-800 z-10"></div>
                <div className="h-[600px] bg-gradient-to-b from-indigo-900 to-purple-900 relative overflow-hidden">
                  {/* AR view with agent */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src="https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                      alt="School courtyard" 
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    
                    {/* AR overlay elements */}
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/50 to-transparent"></div>
                    
                    {/* Deploy Agent Button */}
                    <div className="relative z-10 flex flex-col items-center">
                      <Link 
                        to="/deploy"
                        className="group relative"
                      >
                        <motion.div 
                          className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg flex items-center justify-center relative cursor-pointer transition-all duration-300 group-hover:scale-110"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50 blur-md group-hover:opacity-70 transition-opacity"></div>
                          <Plus className="text-white text-4xl relative z-10" />
                        </motion.div>
                        <motion.div 
                          className="mt-4 bg-black/60 backdrop-blur-sm px-6 py-3 rounded-xl text-white text-center group-hover:bg-black/70 transition-colors"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="font-bold">Tap to Deploy Agent</div>
                          <div className="text-xs opacity-80">Start creating your AR world</div>
                        </motion.div>
                      </Link>
                    </div>
                    
                    {/* AR UI elements */}
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-xs flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                      AR Mode Active
                    </div>
                    
                    <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-xs">
                      <div className="flex items-center">
                        <div className="text-purple-400 mr-1">⦿</div>
                        <span>School Courtyard</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
              <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;