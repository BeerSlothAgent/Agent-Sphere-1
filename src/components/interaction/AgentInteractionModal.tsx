import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MessageCircle, 
  Mic, 
  Video, 
  MapPin,
  Send,
  User,
  Bot,
  DollarSign,
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  description: string;
  object_type: string;
  latitude: number;
  longitude: number;
  range_meters: number;
  interaction_fee: number;
  interaction_types: string[];
  agent_wallet_type: string;
  agent_wallet_address: string;
  mcp_integrations: string[];
  is_active: boolean;
}

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface AgentInteractionModalProps {
  agent: Agent | null;
  visible: boolean;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number };
}

const AgentInteractionModal: React.FC<AgentInteractionModalProps> = ({
  agent,
  visible,
  onClose,
  userLocation
}) => {
  // Calculate distance function - moved before first usage
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const [currentView, setCurrentView] = useState<'overview' | 'chat' | 'voice' | 'video'>('overview');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [selectedInteractionType, setSelectedInteractionType] = useState<'chat' | 'voice' | 'video'>('chat');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate distance
  const distance = userLocation && agent ? 
    Math.round(calculateDistance(
      userLocation.latitude, 
      userLocation.longitude, 
      agent.latitude, 
      agent.longitude
    )) : 25;

  // Agent personalities and smart responses
  const agentPersonalities = {
    'AI Agent': {
      greeting: "Hello! I'm an AI agent ready to assist you with any questions or tasks. How can I help you today?",
      color: '#4F46E5',
      responses: {
        hello: "Hi there! Great to meet you. I'm here to help with anything you need.",
        help: "I can assist with general questions, provide information, help with problem-solving, and much more. What would you like to explore?",
        capabilities: "I have access to various tools including web search, calculations, and general knowledge. I can also help with analysis and creative tasks.",
        default: "That's an interesting question! Let me think about that and provide you with a helpful response."
      }
    },
    'Study Buddy': {
      greeting: "Hey there! Ready to learn something new? I'm your study companion and I'm here to make learning fun and effective!",
      color: '#10B981',
      responses: {
        hello: "Hello, fellow learner! What subject are we tackling today?",
        help: "I can help you with homework, explain difficult concepts, create study plans, and provide practice questions. What do you need help with?",
        study: "Let's create a personalized study plan! What subject are you working on and what's your timeline?",
        homework: "I'd love to help with your homework! Share the problem or topic and I'll guide you through it step by step.",
        default: "Great question! Let me break this down in a way that's easy to understand and remember."
      }
    },
    'Local Services': {
      greeting: "Looking for something in the area? I know all the best local spots and can help you find exactly what you need!",
      color: '#F59E0B',
      responses: {
        hello: "Welcome to the neighborhood! I'm your local guide. What can I help you find?",
        help: "I can provide directions, recommend local businesses, share information about facilities, and help you navigate the area.",
        directions: "I'd be happy to give you directions! Where are you trying to go?",
        food: "There are some great dining options nearby! Are you looking for a specific type of cuisine or price range?",
        default: "I know this area well! Let me share some helpful local information about that."
      }
    },
    'Content Creator': {
      greeting: "Let's create something amazing together! I help with writing, brainstorming, and bringing creative ideas to life.",
      color: '#EC4899',
      responses: {
        hello: "Hello, creative soul! Ready to make something awesome?",
        help: "I can assist with writing, brainstorming, content planning, creative projects, and artistic inspiration. What's your vision?",
        write: "I love helping with writing! What type of content are you working on? Blog post, story, script, or something else?",
        ideas: "Brainstorming time! Tell me about your project and I'll help generate some creative ideas.",
        default: "That sparks my creativity! Let me help you explore that idea and develop it further."
      }
    },
    'Game Agent': {
      greeting: "Ready to play? I create fun games, puzzles, and interactive experiences for entertainment!",
      color: '#8B5CF6',
      responses: {
        hello: "Hey player! Ready for some fun? What kind of game are you in the mood for?",
        help: "I can create games, puzzles, trivia, word games, and interactive challenges. I can also help with game strategies!",
        game: "Let's play! I can create a quick game for us right now. Do you prefer puzzles, trivia, word games, or something else?",
        puzzle: "I love puzzles! Here's a quick one: I'm thinking of a number between 1 and 100. Can you guess it in 7 tries or less?",
        default: "That sounds like it could be turned into a fun game or challenge! Let me think of how we can make it interactive."
      }
    }
  };

  const getAgentPersonality = () => {
    return agentPersonalities[agent?.object_type as keyof typeof agentPersonalities] || agentPersonalities['AI Agent'];
  };

  const getInteractionFee = (type: string) => {
    switch (type) {
      case 'chat': return agent?.interaction_fee || 10;
      case 'voice': return (agent?.interaction_fee || 10) * 6;
      case 'video': return (agent?.interaction_fee || 10) * 11;
      default: return agent?.interaction_fee || 10;
    }
  };

  const generateAgentResponse = (userMessage: string): string => {
    const personality = getAgentPersonality();
    const message = userMessage.toLowerCase();
    
    // Check for specific keywords
    for (const [keyword, response] of Object.entries(personality.responses)) {
      if (message.includes(keyword)) {
        return response;
      }
    }
    
    // Default response
    return personality.responses.default;
  };

  const handleStartInteraction = (type: 'chat' | 'voice' | 'video') => {
    setSelectedInteractionType(type);
    setShowPaymentConfirm(true);
  };

  const handleConfirmPayment = async () => {
    setIsProcessingPayment(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessingPayment(false);
    setShowPaymentConfirm(false);
    setCurrentView(selectedInteractionType);
    
    // Initialize conversation with greeting
    const greeting = getAgentPersonality().greeting;
    setMessages([{
      id: Date.now().toString(),
      type: 'agent',
      content: greeting,
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate agent typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const agentResponse: Message = {
      id: (Date.now() + 1).toString(),
      type: 'agent',
      content: generateAgentResponse(userMessage.content),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, agentResponse]);
    setIsTyping(false);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (visible && agent) {
      setCurrentView('overview');
      setMessages([]);
      setInputMessage('');
      setIsTyping(false);
      setShowPaymentConfirm(false);
    }
  }, [visible, agent]);

  if (!visible || !agent) return null;

  const personality = getAgentPersonality();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div 
            className="p-6 text-white relative"
            style={{ backgroundColor: personality.color }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="pr-12">
              <h2 className="text-2xl font-bold mb-1">{agent.name}</h2>
              <p className="text-white text-opacity-90 mb-2">{agent.object_type}</p>
              <div className="flex items-center text-white text-opacity-80 text-sm">
                <MapPin size={14} className="mr-1" />
                <span>{distance}m away</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {currentView === 'overview' && (
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About this agent</h3>
                  <p className="text-gray-600 text-sm">{agent.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Interaction Options</h3>
                  <div className="space-y-3">
                    {/* Chat Option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStartInteraction('chat')}
                      className="w-full flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="p-3 bg-blue-100 rounded-full">
                        <MessageCircle size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1 ml-4 text-left">
                        <h4 className="font-semibold text-gray-900">Text Chat</h4>
                        <p className="text-sm text-gray-600">Start a conversation</p>
                      </div>
                      <div className="flex items-center text-green-600 font-semibold">
                        <DollarSign size={16} />
                        <span>{getInteractionFee('chat')} USDFC</span>
                      </div>
                    </motion.button>

                    {/* Voice Option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStartInteraction('voice')}
                      className="w-full flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="p-3 bg-green-100 rounded-full">
                        <Mic size={20} className="text-green-600" />
                      </div>
                      <div className="flex-1 ml-4 text-left">
                        <h4 className="font-semibold text-gray-900">Voice Chat</h4>
                        <p className="text-sm text-gray-600">Talk with the agent</p>
                      </div>
                      <div className="flex items-center text-green-600 font-semibold">
                        <DollarSign size={16} />
                        <span>{getInteractionFee('voice')} USDFC</span>
                      </div>
                    </motion.button>

                    {/* Video Option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStartInteraction('video')}
                      className="w-full flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Video size={20} className="text-purple-600" />
                      </div>
                      <div className="flex-1 ml-4 text-left">
                        <h4 className="font-semibold text-gray-900">Video Call</h4>
                        <p className="text-sm text-gray-600">Face-to-face interaction</p>
                      </div>
                      <div className="flex items-center text-green-600 font-semibold">
                        <DollarSign size={16} />
                        <span>{getInteractionFee('video')} USDFC</span>
                      </div>
                    </motion.button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Capabilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {agent.mcp_integrations.map((capability, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Agent Wallet:</span>
                    <span className="font-mono">{agent.agent_wallet_address}</span>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'chat' && (
              <div className="flex flex-col h-96">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={() => setCurrentView('overview')}
                        className="mr-3 p-1 hover:bg-gray-200 rounded"
                      >
                        <X size={16} />
                      </button>
                      <h3 className="font-semibold">Chat with {agent.name}</h3>
                    </div>
                    <div className="flex items-center text-green-600 text-sm font-semibold">
                      <DollarSign size={14} />
                      <span>{getInteractionFee('chat')} USDFC</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(currentView === 'voice' || currentView === 'video') && (
              <div className="p-6 text-center">
                <div className="mb-4">
                  {currentView === 'voice' ? (
                    <Mic size={48} className="mx-auto text-green-500" />
                  ) : (
                    <Video size={48} className="mx-auto text-purple-500" />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {currentView === 'voice' ? 'Voice Chat' : 'Video Call'} Coming Soon!
                </h3>
                <p className="text-gray-600 mb-4">
                  {currentView === 'voice' 
                    ? 'Voice interactions will be available in the next update.'
                    : 'Video calls will be available in the next update.'
                  }
                </p>
                <button
                  onClick={() => setCurrentView('overview')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Back to Options
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Payment Confirmation Modal */}
        <AnimatePresence>
          {showPaymentConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
              >
                <div className="text-center">
                  <div className="mb-4">
                    <Wallet size={48} className="mx-auto text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Confirm Interaction</h3>
                  <p className="text-gray-600 mb-4">
                    Start {selectedInteractionType} with {agent.name}?
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cost:</span>
                      <div className="flex items-center text-green-600 font-semibold">
                        <DollarSign size={16} />
                        <span>{getInteractionFee(selectedInteractionType)} USDFC</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowPaymentConfirm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={isProcessingPayment}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      disabled={isProcessingPayment}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
                    >
                      {isProcessingPayment ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        'Confirm'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default AgentInteractionModal;