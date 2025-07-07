import { motion } from 'framer-motion';
import { Scan, Glasses, Coins } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Scan className="w-10 h-10 text-green-600" />,
      title: "Scan & Deploy NEAR Agents",
      description: "Use your phone to scan real locations and deploy personalized NEAR agents",
      image: "https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      delay: 0.1
    },
    {
      icon: <Glasses className="w-10 h-10 text-green-600" />,
      title: "NeAR Interaction",
      description: "See and talk to NEAR agents through augmented reality on your mobile device",
      image: "https://images.pexels.com/photos/3761348/pexels-photo-3761348.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      delay: 0.2
    },
    {
      icon: <Coins className="w-10 h-10 text-green-600" />,
      title: "NeAR QR Pay",
      description: "Revolutionary AR QR payment system powered by NEAR Protocol for instant transactions",
      image: "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      delay: 0.3
    }
  ];

  const agentTypes = [
    { name: "NEAR Study Buddy", emoji: "📚" },
    { name: "NEAR Campus Guide", emoji: "🧭" },
    { name: "NEAR Event Announcer", emoji: "📢" }
  ];

  return (
    <section id="features" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How AgentSphere Works
          </motion.h2>
          <motion.p 
            className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Create and interact with AI agents in your real-world environment
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: feature.delay }}
            >
              <div className="mb-4 inline-block p-3 bg-green-100 rounded-2xl">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <div className="relative h-48 rounded-lg overflow-hidden">
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent"></div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-center mb-6">Three-Repository Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🏠</span>
              </div>
              <h4 className="font-bold text-lg mb-2">Main Repository</h4>
              <p className="text-gray-600 text-sm mb-4">AgentSphere landing page and core UI components</p>
              <a 
                href="https://github.com/BeerSlothAgent/Agent-Sphere-1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm"
              >
                View Repository →
              </a>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🔗</span>
              </div>
              <h4 className="font-bold text-lg mb-2">NEAR + Filecoin + USDC</h4>
              <p className="text-gray-600 text-sm mb-4">Blockchain integrations and smart contracts</p>
              <a 
                href="https://github.com/BeerSlothAgent/geospatila-agent-near-shade-integrations" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View Repository →
              </a>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">👁️</span>
              </div>
              <h4 className="font-bold text-lg mb-2">AR Viewer</h4>
              <p className="text-gray-600 text-sm mb-4">Augmented reality viewer and camera integration</p>
              <a 
                href="https://github.com/BeerSlothAgent/geospatial-agent-ar-viewer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                View Repository →
              </a>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-center mb-6">Popular NEAR Agent Types</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {agentTypes.map((agent, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-md px-6 py-4 flex items-center space-x-3"
              >
                <span className="text-2xl">{agent.emoji}</span>
                <span className="font-medium text-gray-800">{agent.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-300 rounded-full mr-2"></span>
              Powered by NEAR Protocol
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;