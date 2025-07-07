import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Crosshair, AlertCircle, Loader2, Eye, RotateCcw, Info } from 'lucide-react';
import 'aframe';
import AgentInteractionModal from './interaction/AgentInteractionModal';
import './interaction/ARPaymentStyles.css';

interface DeployedObject {
  id: string;
  name: string;
  description: string;
  object_type: string;
  user_id: string;
  location_type: string;
  range_meters: number;
  chat_enabled: boolean;
  voice_enabled: boolean;
  mcp_integrations: any;
  crypto_wallet_config: any;
  deployment_cost: number;
  interaction_fee: number;
  owner_wallet: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  preciselatitude?: number;
  preciselongitude?: number;
  precisealtitude?: number;
  accuracy?: number;
  correctionapplied?: boolean;
  is_active: boolean;
  created_at: string;
  interaction_types?: string[];
  agent_wallet_type?: string;
  agent_wallet_address?: string;
}

interface ARViewerProps {
  supabase: any;
}

const ARViewer = ({ supabase }: ARViewerProps) => {
  const [objects, setObjects] = useState<DeployedObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedObject, setSelectedObject] = useState<DeployedObject | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [showInteractionModal, setShowInteractionModal] = useState<boolean>(false);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    loadObjects();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using demo location');
      setUserLocation({ lat: 34.0522, lon: -118.2437 }); // LA coordinates for demo
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        console.log('Location error, using demo location:', error);
        setUserLocation({ lat: 34.0522, lon: -118.2437 }); // Fallback to demo location
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const loadObjects = async () => {
    if (!supabase) {
      setError('Database connection not available. Please connect to Supabase first.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 Loading GeoAgents from database...');
      
      const { data, error: fetchError } = await supabase
        .from('deployed_objects')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Error fetching objects:', fetchError);
        throw fetchError;
      }

      console.log('✅ Loaded GeoAgents:', data);
      setObjects(data || []);
      
      if (data && data.length > 0) {
        console.log('🎯 AR Viewer ready with', data.length, 'active GeoAgents');
        data.forEach((obj: DeployedObject) => {
          const coords = obj.preciselatitude && obj.preciselongitude 
            ? { lat: obj.preciselatitude, lon: obj.preciselongitude }
            : { lat: obj.latitude, lon: obj.longitude };
          
          console.log(`📍 ${obj.name}: ${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)} ${obj.correctionapplied ? '(RTK)' : '(GPS)'}`);
        });
      }
    } catch (err) {
      console.error('❌ Error loading objects:', err);
      setError('Failed to load objects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getObjectColor = (objectType: string) => {
    switch (objectType) {
      case 'ai_agent': return '#4f46e5'; // Indigo
      case 'tutor': return '#7c3aed'; // Purple  
      case 'landmark': return '#ec4899'; // Pink
      case 'building': return '#10b981'; // Green
      default: return '#6b7280'; // Gray
    }
  };

  const getObjectEmoji = (objectType: string) => {
    switch (objectType) {
      case 'ai_agent': return '🟦';
      case 'tutor': return '🔵';
      case 'landmark': return '🔺';
      case 'building': return '🏢';
      default: return '📦';
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Distance in meters
  };

  const handleAgentInteraction = (agent: DeployedObject) => {
    // Convert DeployedObject to Agent format for the modal
    const enhancedAgent = {
      id: parseInt(agent.id) || Math.random(),
      name: agent.name,
      description: agent.description || `I'm a ${agent.object_type} agent ready to help!`,
      object_type: agent.object_type,
      latitude: agent.preciselatitude || agent.latitude,
      longitude: agent.preciselongitude || agent.longitude,
      range_meters: agent.range_meters || 25,
      interaction_fee: agent.interaction_fee || 10,
      interaction_types: agent.interaction_types || ["chat", "voice", "video"],
      agent_wallet_type: agent.agent_wallet_type || "NEAR",
      agent_wallet_address: agent.agent_wallet_address || `${agent.name.toLowerCase().replace(/\s+/g, '')}.near`,
      mcp_integrations: agent.mcp_integrations || ["Chat", "Voice"],
      is_active: agent.is_active
    };

    setSelectedObject(enhancedAgent);
    setShowInteractionModal(true);
  };

  const getAgentGreeting = (agentType: string) => {
    switch (agentType) {
      case 'ai_agent':
        return "Hello! I'm your AI assistant. How can I help you today?";
      case 'tutor':
        return "Welcome! I'm here to help you learn. What subject would you like to explore?";
      case 'landmark':
        return "Hi there! I can provide information about this location and nearby services.";
      case 'building':
        return "Greetings! I specialize in spatial analysis and 3D modeling. What can I help you visualize?";
      default:
        return "Hello! I'm an AI agent ready to assist you.";
    }
  };

  const sendChatMessage = () => {
    if (!currentMessage.trim() || !selectedObject) return;

    // Add user message
    const userMessage = { role: 'user' as const, message: currentMessage };
    setChatMessages(prev => [...prev, userMessage]);

    // Generate mock agent response based on agent type and message
    const agentResponse = generateAgentResponse(selectedObject.object_type, currentMessage);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'agent', message: agentResponse }]);
    }, 1000);

    setCurrentMessage('');
  };

  const generateAgentResponse = (agentType: string, userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('weather')) {
      return "Based on current data, it's partly cloudy with a temperature of 72°F. Perfect weather for outdoor activities!";
    }
    
    if (message.includes('location') || message.includes('where')) {
      return "You're currently at the coordinates where I was deployed. This area is great for exploring!";
    }
    
    switch (agentType) {
      case 'tutor':
        if (message.includes('math') || message.includes('calculate')) {
          return "I'd be happy to help with math! What specific problem are you working on?";
        }
        return "I can help you with various subjects including math, science, and literature. What would you like to learn about?";
      
      case 'landmark':
        return "This location has interesting features nearby. I can provide directions, local business information, or historical facts about the area.";
      
      case 'building':
        return "I can help analyze spatial relationships and create 3D models. Are you working on any architectural or design projects?";
      
      default:
        return "That's an interesting question! I'm here to help with various tasks. Could you tell me more about what you need?";
    }
  };

  const getRelativePosition = (objLat: number, objLon: number, index: number) => {
    if (!userLocation) {
      // Demo mode: arrange objects in a circle around the viewer
      const angle = (index * 60) * Math.PI / 180; // 60 degrees apart
      const radius = 3 + (index * 0.5); // Varying distances
      return {
        x: Math.sin(angle) * radius,
        y: 1.6 + (index * 0.3), // Varying heights
        z: -Math.cos(angle) * radius
      };
    }

    // Real mode: calculate actual relative position
    const distance = calculateDistance(userLocation.lat, userLocation.lon, objLat, objLon);
    const bearing = Math.atan2(
      Math.sin((objLon - userLocation.lon) * Math.PI / 180),
      Math.cos(userLocation.lat * Math.PI / 180) * Math.tan(objLat * Math.PI / 180) -
      Math.sin(userLocation.lat * Math.PI / 180) * Math.cos((objLon - userLocation.lon) * Math.PI / 180)
    );

    // Scale down distance for AR view (1 meter = 1 unit, but cap at reasonable distance)
    const scaledDistance = Math.min(distance / 10, 20); // Max 20 units away
    
    return {
      x: Math.sin(bearing) * scaledDistance,
      y: 1.6, // Eye level
      z: -Math.cos(bearing) * scaledDistance
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loading AR Viewer</h2>
          <p className="text-indigo-200">Fetching GeoAgents from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AR Viewer Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadObjects}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* AR Scene */}
      <div className="absolute inset-0">
        <a-scene
          ref={sceneRef}
          embedded
          style={{ height: '100vh', width: '100vw' }}
          background="color: #000"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
        >
          {/* Assets */}
          <a-assets>
            <a-mixin
              id="cube-mixin"
              geometry="primitive: box; width: 0.5; height: 0.5; depth: 0.5"
              animation="property: rotation; to: 360 360 360; loop: true; dur: 8000; easing: linear"
            />
            <a-mixin
              id="sphere-mixin"
              geometry="primitive: sphere; radius: 0.3"
              animation="property: rotation; to: 0 360 0; loop: true; dur: 6000; easing: linear"
            />
            <a-mixin
              id="pyramid-mixin"
              geometry="primitive: cone; radiusBottom: 0.3; radiusTop: 0; height: 0.6"
              animation="property: rotation; to: 0 360 0; loop: true; dur: 7000; easing: linear"
            />
          </a-assets>

          {/* Camera */}
          <a-camera
            position="0 1.6 0"
            look-controls="enabled: true"
            wasd-controls="enabled: true"
            cursor="rayOrigin: mouse"
          />

          {/* Lighting */}
          <a-light type="ambient" color="#404040" intensity="0.4" />
          <a-light type="directional" position="1 4 1" color="#ffffff" intensity="0.8" />

          {/* Objects */}
          {objects.map((obj, index) => {
            const position = getRelativePosition(
              obj.preciselatitude || obj.latitude,
              obj.preciselongitude || obj.longitude,
              index
            );
            const color = getObjectColor(obj.object_type);

            return (
              <a-entity key={obj.id} position={`${position.x} ${position.y} ${position.z}`}>
                {/* 3D Object */}
                <a-entity
                  mixin={`${obj.object_type === 'ai_agent' ? 'cube' : obj.object_type === 'tutor' ? 'sphere' : 'pyramid'}-mixin`}
                  material={`color: ${color}; metalness: 0.2; roughness: 0.8`}
                  class="clickable-object"
                  data-object-id={obj.id}
                  onClick={() => handleAgentInteraction(obj)}
                />
                
                {/* Object Name Label */}
                <a-text
                  value={obj.name}
                  position="0 0.8 0"
                  align="center"
                  color="#ffffff"
                  font="kelsonsans"
                  width="8"
                  material="color: rgba(0,0,0,0.7); transparent: true"
                />
                
                {/* Distance/Accuracy Info */}
                <a-text
                  value={obj.correctionapplied ? `RTK ±${obj.accuracy?.toFixed(2)}m` : `GPS ±${obj.accuracy?.toFixed(0) || '10'}m`}
                  position="0 -0.8 0"
                  align="center"
                  color={obj.correctionapplied ? "#10b981" : "#f59e0b"}
                  font="kelsonsans"
                  width="6"
                />
                
                {/* Interaction Indicators */}
                {obj.chat_enabled && (
                  <a-text
                    value="💬"
                    position="-0.5 0.5 0"
                    align="center"
                    width="4"
                  />
                )}
                {obj.voice_enabled && (
                  <a-text
                    value="🎤"
                    position="0.5 0.5 0"
                    align="center"
                    width="4"
                  />
                )}
              </a-entity>
            );
          })}

          {/* Ground Grid */}
          <a-plane
            position="0 0 0"
            rotation="-90 0 0"
            width="50"
            height="50"
            color="#1a1a1a"
            material="transparent: true; opacity: 0.3"
          />
        </a-scene>
      </div>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-4 text-white max-w-sm">
        <div className="flex items-center mb-3">
          <Eye className="h-5 w-5 mr-2 text-green-400" />
          <h2 className="text-lg font-bold">NeAR Viewer</h2>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Active NEAR Agents:</span>
            <span className="font-bold text-green-400">{objects.length}</span>
          </div>
          
          {userLocation && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Your Location:</span>
              <span className="font-mono text-xs text-green-400">
                {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Range:</span>
            <span className="font-bold text-green-400">{objects[0]?.range_meters?.toFixed(1) || '25.0'}m</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Capabilities:</span>
            <div className="flex space-x-1">
              {objects.some(obj => obj.chat_enabled) && <span className="text-blue-400">💬</span>}
              {objects.some(obj => obj.voice_enabled) && <span className="text-green-400">🎤</span>}
              {objects.some(obj => obj.mcp_integrations) && <span className="text-green-400">🔗</span>}
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-600">
            <p className="text-xs text-gray-400">
              Use mouse to look around, WASD keys to move. NEAR agents are spinning and labeled with their names.
            </p>
          </div>
        </div>
      </div>

      {/* Object List */}
      <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-4 text-white max-w-xs max-h-96 overflow-y-auto">
        <h3 className="text-lg font-bold mb-3 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-green-400" />
          Nearby NEAR Agents
        </h3>
        
        {objects.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">No active NEAR Agents found</p>
            <p className="text-gray-500 text-xs mt-1">Deploy some NEAR agents first!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {objects.map((obj) => {
              const distance = userLocation 
                ? calculateDistance(
                    userLocation.lat, 
                    userLocation.lon,
                    obj.preciselatitude || obj.latitude,
                    obj.preciselongitude || obj.longitude
                  )
                : null;

              return (
                <div
                  key={obj.id}
                  className="bg-white bg-opacity-10 rounded-lg p-3 hover:bg-opacity-20 transition-colors cursor-pointer"
                  onClick={() => setSelectedObject(obj)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getObjectEmoji(obj.object_type)}</span>
                      <span className="font-medium">{obj.name}</span>
                    </div>
                    {obj.correctionapplied && (
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        RTK
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-300 space-y-1">
                    <div>Type: {obj.object_type}</div>
                    {distance && (
                      <div>Distance: {distance < 1000 ? `${distance.toFixed(0)}m` : `${(distance/1000).toFixed(1)}km`}</div>
                    )}
                    <div>Accuracy: ±{obj.accuracy?.toFixed(obj.correctionapplied ? 2 : 0) || '10'}m</div>
                    <div className="flex items-center space-x-2">
                      <span>Capabilities:</span>
                      {obj.chat_enabled && <span className="text-blue-400">💬</span>}
                      {obj.voice_enabled && <span className="text-green-400">🎤</span>}
                      {obj.mcp_integrations && <span className="text-green-400">🔗</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 z-10 flex space-x-2">
        <button
          onClick={loadObjects}
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors"
          title="Refresh Objects"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        
        <button
          onClick={getCurrentLocation}
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-colors"
          title="Update Location"
        >
          <Crosshair className="h-5 w-5" />
        </button>
      </div>

      {/* Object Details Modal */}
      {selectedObject && !showInteractionModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getObjectEmoji(selectedObject.object_type)}</span>
                <h3 className="text-xl font-bold text-gray-900">{selectedObject.name}</h3>
              </div>
              <button
                onClick={() => setSelectedObject(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Description:</span>
                <p className="text-gray-600 mt-1">{selectedObject.description}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <span className="ml-2 text-gray-600">{selectedObject.object_type}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Location Type:</span>
                <span className="ml-2 text-gray-600">{selectedObject.location_type}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Range:</span>
                <span className="ml-2 text-gray-600">{selectedObject.range_meters?.toFixed(1)}m</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Coordinates:</span>
                <div className="mt-1 font-mono text-xs text-gray-600">
                  <div>Lat: {(selectedObject.preciselatitude || selectedObject.latitude).toFixed(8)}</div>
                  <div>Lon: {(selectedObject.preciselongitude || selectedObject.longitude).toFixed(8)}</div>
                  {selectedObject.precisealtitude && (
                    <div>Alt: {selectedObject.precisealtitude.toFixed(2)}m</div>
                  )}
                </div>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Accuracy:</span>
                <span className="ml-2 text-gray-600">
                  ±{selectedObject.accuracy?.toFixed(selectedObject.correctionapplied ? 2 : 0) || '10'}m
                  {selectedObject.correctionapplied && (
                    <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      RTK Enhanced
                    </span>
                  )}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Deployed:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(selectedObject.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Owner:</span>
                <span className="ml-2 text-gray-600 font-mono text-xs">
                  {selectedObject.owner_wallet ? 
                    `${selectedObject.owner_wallet.slice(0, 6)}...${selectedObject.owner_wallet.slice(-4)}` : 
                    'Unknown'}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Capabilities:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedObject.chat_enabled && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      💬 Chat
                    </span>
                  )}
                  {selectedObject.voice_enabled && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      🎤 Voice
                    </span>
                  )}
                  {selectedObject.mcp_integrations && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                      🔗 MCP
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              {selectedObject.chat_enabled && (
                <button
                  onClick={() => {
                    setShowInteractionPanel(true);
                    const greeting = getAgentGreeting(selectedObject.object_type);
                    setChatMessages([{ role: 'agent', message: greeting }]);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  💬 Start Chat
                </button>
              )}
              
              {selectedObject.voice_enabled && (
                <button
                  onClick={() => alert('Voice interaction coming soon!')}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  🎤 Voice Chat
                </button>
              )}
              
              <button
                onClick={() => setSelectedObject(null)}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Enhanced Interaction Modal */}
      <AgentInteractionModal
        agent={selectedObject}
        visible={showInteractionModal}
        onClose={() => {
          setShowInteractionModal(false);
          setSelectedObject(null);
        }}
        userLocation={userLocation}
      />

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-4 text-white max-w-xs">
        <div className="flex items-center mb-2">
          <Info className="h-4 w-4 mr-2 text-green-400" />
          <span className="font-medium text-sm">Controls</span>
        </div>
        <div className="text-xs text-gray-300 space-y-1">
          <div>• Mouse: Look around</div>
          <div>• WASD: Move around</div>
          <div>• Click NEAR agents: View details</div>
          <div>• NEAR agents spin automatically</div>
          <div>• NeAR QR Pay: Instant payments</div>
        </div>
      </div>
    </div>
  );
};

export default ARViewer;