import { motion } from 'framer-motion';
import { ArrowRight, Plus, Eye, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const phones = [
    {
      id: 'deploy',
      title: '🚀 Deploy Agent',
      subtitle: 'Create & Place',
      description: 'Design your AI agent and deploy it at precise locations',
      buttonText: 'Deploy GeoAgent',
      buttonIcon: <Plus className="h-4 w-4" />,
      link: '/deploy',
      bgImage: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
      overlayContent: (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="text-white text-2xl" />
            </div>
            <div className="font-bold text-sm">Agent Configuration</div>
            <div className="text-xs opacity-80">Choose type, name & location</div>
          </div>
        </div>
      )
    },
    {
      id: 'preview',
      title: '🔍 Preview Agents',
      subtitle: 'Test & Debug',
      description: 'Test your deployed agents in our AR preview environment',
      buttonText: 'AR Preview',
      buttonIcon: <Eye className="h-4 w-4" />,
      link: '/ar',
      bgImage: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
      overlayContent: (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Eye className="text-white text-2xl" />
            </div>
            <div className="font-bold text-sm">AR Testing Mode</div>
            <div className="text-xs opacity-80">View & interact with agents</div>
          </div>
          <div className="absolute top-4 right-4 bg-green-500/80 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-300 mr-1"></div>
            Testing Mode
          </div>
        </div>
      )
    },
    {
      id: 'experience',
      title: '🌍 Enter AR World',
      subtitle: 'Live Experience',
      description: 'Experience full AR with camera and real-world interaction',
      buttonText: 'Go Live',
      buttonIcon: <Camera className="h-4 w-4" />,
      link: '#',
      external: true,
      bgImage: 'https://images.pexels.com/photos/3761348/pexels-photo-3761348.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1',
      overlayContent: (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Camera className="text-white text-2xl" />
            </div>
            <div className="font-bold text-sm">Live AR Camera</div>
            <div className="text-xs opacity-80">Full production experience</div>
          </div>
          <div className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-300 mr-1 animate-pulse"></div>
            Live AR
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-20 md:pb-28">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 right-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
              <span className="block">Deploy AI Agents</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">in Your World</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-4xl mx-auto">
              Create, test, and experience location-based AI agents through AR. Transform your school and community with personalized digital assistants.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
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
        
        {/* Three Phone Layout */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {phones.map((phone, index) => (
            <motion.div
              key={phone.id}
              className="relative mx-auto w-full max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              {/* Phone mockup */}
              <div className="relative shadow-2xl rounded-[2.5rem] border-8 border-gray-800 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-6 bg-gray-800 z-20"></div>
                <div className="absolute bottom-0 inset-x-0 h-6 bg-gray-800 z-20"></div>
                <div className="h-[500px] bg-gradient-to-b from-indigo-900 to-purple-900 relative overflow-hidden">
                  {/* Background image */}
                  <img 
                    src={phone.bgImage}
                    alt={phone.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 to-transparent"></div>
                  
                  {/* Phone content */}
                  {phone.overlayContent}
                  
                  {/* Action button */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                    {phone.external ? (
                      <button
                        onClick={() => {
                          // Placeholder for external link - will be connected to Real AR Viewer
                          alert('Real AR Viewer coming soon! This will link to the production AR experience.');
                        }}
                        className="group relative"
                      >
                        <motion.div 
                          className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg flex items-center space-x-2 group-hover:shadow-xl transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {phone.buttonIcon}
                          <span>{phone.buttonText}</span>
                        </motion.div>
                      </button>
                    ) : (
                      <Link 
                        to={phone.link}
                        className="group relative"
                      >
                        <motion.div 
                          className={`${
                            phone.id === 'deploy' 
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                              : 'bg-gradient-to-r from-purple-500 to-pink-500'
                          } text-white px-6 py-3 rounded-xl font-medium shadow-lg flex items-center space-x-2 group-hover:shadow-xl transition-all duration-300`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {phone.buttonIcon}
                          <span>{phone.buttonText}</span>
                        </motion.div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Phone description */}
              <div className="mt-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{phone.title}</h3>
                <p className="text-sm font-medium text-indigo-600 mb-2">{phone.subtitle}</p>
                <p className="text-gray-600 text-sm">{phone.description}</p>
              </div>
              
              {/* Decorative elements */}
              <div className={`absolute -top-6 -right-6 w-24 h-24 ${
                phone.id === 'deploy' ? 'bg-indigo-400' : 
                phone.id === 'preview' ? 'bg-purple-400' : 'bg-pink-400'
              } rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-${index * 2000}`}></div>
            </motion.div>
          ))}
        </div>

        {/* Process flow indicators */}
        <motion.div 
          className="mt-12 flex justify-center items-center space-x-4 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-bold text-sm">1</span>
            </div>
            <span className="text-sm font-medium">Deploy</span>
          </div>
          <ArrowRight className="h-4 w-4" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold text-sm">2</span>
            </div>
            <span className="text-sm font-medium">Test</span>
          </div>
          <ArrowRight className="h-4 w-4" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-pink-600 font-bold text-sm">3</span>
            </div>
            <span className="text-sm font-medium">Experience</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;