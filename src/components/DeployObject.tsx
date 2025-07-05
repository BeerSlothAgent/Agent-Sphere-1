import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Cuboid as Cube, 
  Circle, 
  Triangle, 
  Check, 
  AlertCircle, 
  Loader2, 
  Database, 
  Crosshair, 
  Wallet, 
  ChevronDown, 
  Bot, 
  GraduationCap, 
  BookOpen, 
  MapPinIcon, 
  Building,
  Home,
  Users,
  Briefcase,
  Gamepad2,
  Palette,
  Settings,
  DollarSign,
  Mic,
  MessageCircle,
  Globe,
  Sliders
} from 'lucide-react';
import { useAddress, ConnectWallet } from '@thirdweb-dev/react';

interface DeployObjectProps {
  supabase: any;
}

interface AgentType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultCapabilities: {
    chat_enabled: boolean;
    voice_enabled: boolean;
    mcp_functions: string[];
  };
}

interface LocationType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface PreciseLocation {
  preciseLatitude: number;
  preciseLongitude: number;
  preciseAltitude?: number;
  accuracy: number;
  correctionApplied: boolean;
}

interface AgentCapabilities {
  chat_enabled: boolean;
  voice_enabled: boolean;
  mcp_functions: string[];
  wallet_address: string;
  wallet_type: 'ethereum' | 'solana' | 'polygon';
}

interface AgentAppearance {
  model_type: 'generated' | 'uploaded';
  model_url: string;
  animations: string[];
  scale: { x: number; y: number; z: number };
}

const DeployObject = ({ supabase }: DeployObjectProps) => {
  // Core Agent Configuration
  const [agentName, setAgentName] = useState<string>('');
  const [agentDescription, setAgentDescription] = useState<string>('');
  const [selectedAgentType, setSelectedAgentType] = useState<string>('ai_agent');
  const [selectedLocationType, setSelectedLocationType] = useState<string>('Street');
  
  // Visual Configuration
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [agentAppearance, setAgentAppearance] = useState<AgentAppearance>({
    model_type: 'generated',
    model_url: '',
    animations: ['rotation'],
    scale: { x: 1.0, y: 1.0, z: 1.0 }
  });
  
  // Capabilities Configuration
  const [agentCapabilities, setAgentCapabilities] = useState<AgentCapabilities>({
    chat_enabled: true,
    voice_enabled: true,
    mcp_functions: ['weather', 'location_info'],
    wallet_address: '',
    wallet_type: 'ethereum'
  });
  
  // Range and Visibility
  const [rangeMeters, setRangeMeters] = useState<number>(25.0);
  const [deploymentCost, setDeploymentCost] = useState<number>(100);
  
  // Location and Deployment
  const [location, setLocation] = useState<Location | null>(null);
  const [preciseLocation, setPreciseLocation] = useState<PreciseLocation | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [isGettingPreciseLocation, setIsGettingPreciseLocation] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  
  // UI State
  
  const address = useAddress();
  
  // Define deployment network
  const deploymentNetwork = 'Avalanche Fuji';

  const agentTypes: AgentType[] = [
    {
      id: 'ai_agent',
      name: 'Intelligent Assistant',
      description: 'General purpose AI assistant for various tasks and queries',
      icon: <Bot className="w-5 h-5" />,
      defaultCapabilities: {
        chat_enabled: true,
        voice_enabled: true,
        mcp_functions: ['weather', 'search', 'calculator']
      }
    },
    {
      id: 'tutor',
      name: 'Tutor/Teacher',
      description: 'Educational support agent for learning and tutoring',
      icon: <GraduationCap className="w-5 h-5" />,
      defaultCapabilities: {
        chat_enabled: true,
        voice_enabled: true,
        mcp_functions: ['educational_content', 'quiz_generator', 'study_planner']
      }
    },
    {
      id: 'landmark',
      name: 'Local Services',
      description: 'Provides location-based information and local services',
      icon: <MapPinIcon className="w-5 h-5" />,
      defaultCapabilities: {
        chat_enabled: true,
        voice_enabled: false,
        mcp_functions: ['location_info', 'directions', 'local_business']
      }
    },
    {
      id: 'building',
      name: '3D World Modelling',
      description: 'Spatial and architectural assistance agent',
      icon: <Building className="w-5 h-5" />,
      defaultCapabilities: {
        chat_enabled: true,
        voice_enabled: true,
        mcp_functions: ['3d_modeling', 'spatial_analysis', 'architecture']
      }
    },
    {
      id: 'study_buddy',
      name: 'Content Creator',
      description: 'Creates and shares educational and entertainment content',
      icon: <Palette className="w-5 h-5" />,
      defaultCapabilities: {
        chat_enabled: true,
        voice_enabled: true,
        mcp_functions: ['content_generation', 'media_creation', 'social_sharing']
      }
    },
    {
      id: 'game_agent',
      name: 'Game Agent',
      description: 'Interactive games and entertainment experiences',
      icon: <Gamepad2 className="w-5 h-5" />,
      defaultCapabilities: {
        chat_enabled: true,
        voice_enabled: true,
        mcp_functions: ['game_logic', 'score_tracking', 'multiplayer']
      }
    }
  ];

  const locationTypes: LocationType[] = [
    {
      id: 'Home',
      name: 'Home',
      description: 'Private residence - only visible to owner',
      icon: <Home className="w-5 h-5" />
    },
    {
      id: 'Street',
      name: 'Street',
      description: 'Public street locations - visible to all users',
      icon: <MapPin className="w-5 h-5" />
    },
    {
      id: 'Countryside',
      name: 'Countryside',
      description: 'Nature and outdoor locations',
      icon: <Globe className="w-5 h-5" />
    },
    {
      id: 'Classroom',
      name: 'Classroom',
      description: 'Educational environments and schools',
      icon: <GraduationCap className="w-5 h-5" />
    },
    {
      id: 'Office',
      name: 'Office',
      description: 'Business and work environments',
      icon: <Briefcase className="w-5 h-5" />
    }
  ];

  const objectTypes = [
    {
      id: 'ai_agent',
      name: 'Cube',
      icon: <Cube className="w-8 h-8" />,
      description: 'Geometric cube shape'
    },
    {
      id: 'tutor',
      name: 'Sphere',
      icon: <Circle className="w-8 h-8" />,
      description: 'Spherical shape'
    },
    {
      id: 'landmark',
      name: 'Pyramid',
      icon: <Triangle className="w-8 h-8" />,
      description: 'Pyramid shape'
    }
  ];

  const availableMCPFunctions = [
    'weather', 'location_info', 'directions', 'search', 'calculator',
    'educational_content', 'quiz_generator', 'study_planner',
    'local_business', '3d_modeling', 'spatial_analysis', 'architecture',
    'content_generation', 'media_creation', 'social_sharing',
    'game_logic', 'score_tracking', 'multiplayer'
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Set default values when agent type changes
  useEffect(() => {
    if (selectedAgentType && !agentName) {
      const agentType = agentTypes.find(type => type.id === selectedAgentType);
      if (agentType) {
        setAgentName(`${agentType.name} Alpha`);
        setAgentCapabilities(prev => ({
          ...prev,
          ...agentType.defaultCapabilities
        }));
      }
    }
  }, [selectedAgentType, agentName]);

  // Update deployment cost based on capabilities
  useEffect(() => {
    let cost = 100; // Base cost
    if (agentCapabilities.voice_enabled) cost += 50;
    if (agentCapabilities.mcp_functions.length > 3) cost += 25;
    if (rangeMeters > 30) cost += Math.floor((rangeMeters - 30) * 2);
    setDeploymentCost(cost);
  }, [agentCapabilities, rangeMeters]);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationError('');
    setPreciseLocation(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setIsLoadingLocation(false);
      setLocation({ latitude: 34.0522, longitude: -118.2437 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
        setLocation({ latitude: 34.0522, longitude: -118.2437 });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const getPreciseLocation = async () => {
    if (!location || !supabase) return;

    setIsGettingPreciseLocation(true);
    setLocationError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiUrl = `${supabaseUrl}/functions/v1/get-precise-location`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const preciseLocationData: PreciseLocation = await response.json();
      setPreciseLocation(preciseLocationData);
      
    } catch (error) {
      console.error('Error getting precise location:', error);
      setLocationError('Failed to get precise location. Using standard GPS.');
      setPreciseLocation({
        preciseLatitude: location.latitude,
        preciseLongitude: location.longitude,
        accuracy: location.accuracy || 10,
        correctionApplied: false
      });
    } finally {
      setIsGettingPreciseLocation(false);
    }
  };

  const handleDeployAgent = async () => {
    if (!selectedObject || !location || !agentName.trim()) {
      setStatusMessage('Please complete all required fields');
      setDeploymentStatus('error');
      return;
    }

    if (!address) {
      setStatusMessage('Please connect your wallet to deploy agents');
      setDeploymentStatus('error');
      return;
    }

    if (!supabase) {
      setStatusMessage('Database connection not available');
      setDeploymentStatus('error');
      return;
    }

    if (!preciseLocation) {
      await getPreciseLocation();
      if (!preciseLocation) {
        setStatusMessage('Unable to get precise location for deployment');
        setDeploymentStatus('error');
        return;
      }
    }

    setIsDeploying(true);
    setDeploymentStatus('idle');

    try {
      // Generate agent wallet address (mock for now)
      const agentWalletAddress = `0x${Math.random().toString(16).substr(2, 40)}`;

      // Prepare complete agent specification
      const agentData = {
        // Core Identity
        user_id: address,
        name: agentName.trim(),
        description: agentDescription.trim() || `A ${selectedAgentType.replace('_', ' ')} deployed in AR space`,
        object_type: selectedObject,
        
        // Location & Positioning (RTK Precision)
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: preciseLocation.preciseAltitude || null,
        preciselatitude: preciseLocation.preciseLatitude,
        preciselongitude: preciseLocation.preciseLongitude,
        precisealtitude: preciseLocation.preciseAltitude || null,
        accuracy: preciseLocation.accuracy,
        correctionapplied: preciseLocation.correctionApplied,
        location_type: selectedLocationType,
        
        // Visibility & Range System
        range_meters: rangeMeters,
        is_active: true,
        
        // Visual Representation
        model_type: agentAppearance.model_type,
        model_url: agentAppearance.model_url || null,
        animations: agentAppearance.animations,
        scale: agentAppearance.scale,
        
        // Agent Capabilities
        chat_enabled: agentCapabilities.chat_enabled,
        voice_enabled: agentCapabilities.voice_enabled,
        mcp_integrations: {
          enabled_functions: agentCapabilities.mcp_functions,
          configuration: {}
        },
        
        // Crypto Wallet Configuration
        crypto_wallet_config: {
          agent_wallet_address: agentWalletAddress,
          wallet_type: agentCapabilities.wallet_type,
          autonomous_transactions: false
        },
        
        // Ownership & Economics
        owner_wallet: address,
        deployment_cost: deploymentCost,
        interaction_fee: 1.0,
        
        is_active: true // Ensure GeoAgent is active for AR Viewer
      };
      console.log('🚀 Deploying Complete Agent Specification:', agentData);

      const { data, error } = await supabase
        .from('deployed_objects')
        .insert([agentData])
        .select();

      if (error) {
        console.error('❌ Deployment error:', error);
        throw error;
      }

      console.log('✅ Agent Successfully Deployed:', data[0]);

      setDeploymentStatus('success');
      const accuracyText = preciseLocation.correctionApplied 
        ? `with RTK precision (±${preciseLocation.accuracy}cm)`
        : `with GPS accuracy (±${preciseLocation.accuracy}m)`;
      
      setStatusMessage(`${agentName} deployed successfully ${accuracyText}! Cost: ${deploymentCost} Auras`);
      
      // Reset form after successful deployment
      setTimeout(() => {
        setAgentName('');
        setAgentDescription('');
        setSelectedObject(null);
        setDeploymentStatus('idle');
        setStatusMessage('');
        setPreciseLocation(null);
        setActiveTab('basic');
      }, 5000);

    } catch (error) {
      console.error('❌ Error deploying agent:', error);
      setDeploymentStatus('error');
      setStatusMessage('Failed to deploy agent. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  };

  const canDeploy = selectedObject && location && agentName.trim() && !isDeploying && supabase && address;
  const displayLocation = preciseLocation || location;
  const selectedAgent = agentTypes.find(type => type.id === selectedAgentType);
  const selectedLocationTypeData = locationTypes.find(type => type.id === selectedLocationType);

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: <Settings className="w-4 h-4" /> },
    { id: 'appearance', name: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'capabilities', name: 'Capabilities', icon: <Bot className="w-4 h-4" /> },
    { id: 'economics', name: 'Economics', icon: <DollarSign className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Deploy Complete AI Agent
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Create a fully-featured AI agent with RTK-precision positioning, custom capabilities, and autonomous wallet integration.
          </p>
        </motion.div>

        {/* Status Messages */}
        {!supabase && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center">
              <Database className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <span className="text-red-800 font-medium">Database connection required</span>
                <p className="text-red-700 text-sm mt-1">
                  Please click "Connect to Supabase" in the top right to set up your database connection.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!address && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wallet className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <span className="text-orange-800 font-medium">Wallet connection required</span>
                  <p className="text-orange-700 text-sm mt-1">
                    Connect your wallet to deploy and own AI agents.
                  </p>
                </div>
              </div>
              <div className="ml-4">
                <ConnectWallet 
                  theme="light"
                  btnTitle="Connect Wallet"
                  modalTitle="Connect Wallet to AgentSphere"
                  modalSize="compact"
                  welcomeScreen={{
                    title: "Connect to AgentSphere",
                    subtitle: "Connect your wallet to deploy and manage AI agents"
                  }}
                  detailsBtn={() => {
                    return (
                      <div style={{ display: 'none' }} aria-hidden="true">
                        Details
                      </div>
                    );
                  }}
                  className="!bg-orange-600 !text-white !rounded-lg !font-medium !px-4 !py-2 !text-sm"
                />
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Basic Agent Information</h2>
                  
                  {/* Agent Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agent Type
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setShowAgentDropdown(!showAgentDropdown)}
                        disabled={!supabase || !address}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between ${
                          !supabase || !address
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                            : 'border-indigo-200 bg-indigo-50 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            !supabase || !address
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-indigo-100 text-indigo-600'
                          }`}>
                            {selectedAgent?.icon}
                          </div>
                          <div>
                            <div className={`font-medium ${!supabase || !address ? 'text-gray-400' : 'text-gray-900'}`}>
                              {selectedAgent?.name}
                            </div>
                            <div className={`text-sm ${!supabase || !address ? 'text-gray-400' : 'text-gray-600'}`}>
                              {selectedAgent?.description}
                            </div>
                          </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 transition-transform ${showAgentDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showAgentDropdown && supabase && address && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                          {agentTypes.map((agentType) => (
                            <button
                              key={agentType.id}
                              onClick={() => {
                                setSelectedAgentType(agentType.id);
                                setShowAgentDropdown(false);
                              }}
                              className={`w-full p-3 text-left hover:bg-indigo-50 transition-colors flex items-center space-x-3 ${
                                selectedAgentType === agentType.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                              }`}
                            >
                              <div className={`p-2 rounded-lg ${
                                selectedAgentType === agentType.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {agentType.icon}
                              </div>
                              <div>
                                <div className="font-medium">{agentType.name}</div>
                                <div className="text-sm text-gray-600">{agentType.description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Agent Name */}
                  <div>
                    <label htmlFor="agent-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Agent Name *
                    </label>
                    <input
                      type="text"
                      id="agent-name"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="e.g., Study Helper Alpha"
                      disabled={!supabase || !address}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                        !supabase || !address
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                      }`}
                    />
                  </div>

                  {/* Agent Description */}
                  <div>
                    <label htmlFor="agent-description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="agent-description"
                      value={agentDescription}
                      onChange={(e) => setAgentDescription(e.target.value)}
                      placeholder="Describe your agent's purpose and capabilities..."
                      rows={4}
                      disabled={!supabase || !address}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 resize-none ${
                        !supabase || !address
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                      }`}
                    />
                  </div>

                  {/* Location Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location Type
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                        disabled={!supabase || !address}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between ${
                          !supabase || !address
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            !supabase || !address
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {selectedLocationTypeData?.icon}
                          </div>
                          <div>
                            <div className={`font-medium ${!supabase || !address ? 'text-gray-400' : 'text-gray-900'}`}>
                              {selectedLocationTypeData?.name}
                            </div>
                            <div className={`text-sm ${!supabase || !address ? 'text-gray-400' : 'text-gray-600'}`}>
                              {selectedLocationTypeData?.description}
                            </div>
                          </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showLocationDropdown && supabase && address && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                          {locationTypes.map((locationType) => (
                            <button
                              key={locationType.id}
                              onClick={() => {
                                setSelectedLocationType(locationType.id);
                                setShowLocationDropdown(false);
                              }}
                              className={`w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                                selectedLocationType === locationType.id ? 'bg-gray-50' : ''
                              }`}
                            >
                              <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                                {locationType.icon}
                              </div>
                              <div>
                                <div className="font-medium">{locationType.name}</div>
                                <div className="text-sm text-gray-600">{locationType.description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibility Range: {rangeMeters.toFixed(1)}m
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="0.1"
                        value={rangeMeters}
                        onChange={(e) => setRangeMeters(parseFloat(e.target.value))}
                        disabled={!supabase || !address}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0m (Private)</span>
                        <span>25m (Neighborhood)</span>
                        <span>50m (Wide Area)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Visual Appearance</h2>
                  
                  {/* 3D Object Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      3D Object Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {objectTypes.map((objectType) => (
                        <motion.button
                          key={objectType.id}
                          onClick={() => setSelectedObject(objectType.id)}
                          disabled={!supabase || !address}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                            !supabase || !address
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                              : selectedObject === objectType.id
                              ? 'border-indigo-500 bg-indigo-50 shadow-md'
                              : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                          whileHover={supabase && address ? { scale: 1.02 } : {}}
                          whileTap={supabase && address ? { scale: 0.98 } : {}}
                        >
                          <div className={`p-3 rounded-lg mx-auto mb-2 w-fit ${
                            !supabase || !address
                              ? 'bg-gray-100 text-gray-400'
                              : selectedObject === objectType.id
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {objectType.icon}
                          </div>
                          <h3 className={`font-semibold ${!supabase || !address ? 'text-gray-400' : 'text-gray-900'}`}>
                            {objectType.name}
                          </h3>
                          <p className={`text-sm ${!supabase || !address ? 'text-gray-400' : 'text-gray-600'}`}>
                            {objectType.description}
                          </p>
                          {selectedObject === objectType.id && supabase && address && (
                            <Check className="h-5 w-5 text-indigo-600 mx-auto mt-2" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Scale Controls */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Scale Adjustments
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {['x', 'y', 'z'].map((axis) => (
                        <div key={axis}>
                          <label className="block text-xs text-gray-600 mb-1">
                            {axis.toUpperCase()}: {agentAppearance.scale[axis as keyof typeof agentAppearance.scale].toFixed(1)}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="3.0"
                            step="0.1"
                            value={agentAppearance.scale[axis as keyof typeof agentAppearance.scale]}
                            onChange={(e) => setAgentAppearance(prev => ({
                              ...prev,
                              scale: {
                                ...prev.scale,
                                [axis]: parseFloat(e.target.value)
                              }
                            }))}
                            disabled={!supabase || !address}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Animation Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Animations
                    </label>
                    <div className="space-y-2">
                      {['rotation', 'scaling', 'floating'].map((animation) => (
                        <label key={animation} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={agentAppearance.animations.includes(animation)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAgentAppearance(prev => ({
                                  ...prev,
                                  animations: [...prev.animations, animation]
                                }));
                              } else {
                                setAgentAppearance(prev => ({
                                  ...prev,
                                  animations: prev.animations.filter(a => a !== animation)
                                }));
                              }
                            }}
                            disabled={!supabase || !address}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">{animation}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Capabilities Tab */}
              {activeTab === 'capabilities' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Agent Capabilities</h2>
                  
                  {/* Core Capabilities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Core Interaction Methods
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <MessageCircle className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <div className="font-medium">Text Chat</div>
                            <div className="text-sm text-gray-600">Enable text-based conversations</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={agentCapabilities.chat_enabled}
                          onChange={(e) => setAgentCapabilities(prev => ({
                            ...prev,
                            chat_enabled: e.target.checked
                          }))}
                          disabled={!supabase || !address}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <Mic className="h-5 w-5 text-green-600 mr-3" />
                          <div>
                            <div className="font-medium">Voice Interface</div>
                            <div className="text-sm text-gray-600">Enable voice interactions (+50 Auras)</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={agentCapabilities.voice_enabled}
                          onChange={(e) => setAgentCapabilities(prev => ({
                            ...prev,
                            voice_enabled: e.target.checked
                          }))}
                          disabled={!supabase || !address}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </label>
                    </div>
                  </div>

                  {/* MCP Functions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      MCP Server Integrations
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {availableMCPFunctions.map((func) => (
                        <label key={func} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={agentCapabilities.mcp_functions.includes(func)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAgentCapabilities(prev => ({
                                  ...prev,
                                  mcp_functions: [...prev.mcp_functions, func]
                                }));
                              } else {
                                setAgentCapabilities(prev => ({
                                  ...prev,
                                  mcp_functions: prev.mcp_functions.filter(f => f !== func)
                                }));
                              }
                            }}
                            disabled={!supabase || !address}
                            className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-xs text-gray-700">{func.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {agentCapabilities.mcp_functions.length > 3 && '+25 Auras for advanced functions'}
                    </p>
                  </div>

                  {/* Wallet Configuration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agent Wallet Type
                    </label>
                    <select
                      value={agentCapabilities.wallet_type}
                      onChange={(e) => setAgentCapabilities(prev => ({
                        ...prev,
                        wallet_type: e.target.value as 'ethereum' | 'solana' | 'polygon'
                      }))}
                      disabled={!supabase || !address}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="ethereum">Ethereum</option>
                      <option value="polygon">Polygon</option>
                      <option value="solana">Solana</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Economics Tab */}
              {activeTab === 'economics' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Economics & Ownership</h2>
                  
                  {/* Cost Breakdown */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Deployment Cost Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Agent Cost:</span>
                        <span>100 Auras</span>
                      </div>
                      {agentCapabilities.voice_enabled && (
                        <div className="flex justify-between">
                          <span>Voice Interface:</span>
                          <span>+50 Auras</span>
                        </div>
                      )}
                      {agentCapabilities.mcp_functions.length > 3 && (
                        <div className="flex justify-between">
                          <span>Advanced MCP Functions:</span>
                          <span>+25 Auras</span>
                        </div>
                      )}
                      {rangeMeters > 30 && (
                        <div className="flex justify-between">
                          <span>Extended Range ({rangeMeters.toFixed(1)}m):</span>
                          <span>+{Math.floor((rangeMeters - 30) * 2)} Auras</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Total Cost:</span>
                        <span>{deploymentCost} Auras</span>
                      </div>
                    </div>
                  </div>

                  {/* Ownership Info */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Ownership Details</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div>Owner Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</div>
                      <div>Agent will have autonomous wallet: {agentCapabilities.wallet_type}</div>
                      <div>Interaction fee: 1 Aura per interaction</div>
                    </div>
                  </div>

                  {/* Revenue Potential */}
                  <div className="bg-green-50 rounded-xl p-4">
                    <h3 className="font-medium text-green-900 mb-2">Revenue Potential</h3>
                    <div className="space-y-2 text-sm text-green-800">
                      <div>• Earn 1 Aura per user interaction</div>
                      <div>• Higher range = more potential users</div>
                      <div>• Voice agents typically earn 2x more</div>
                      <div>• Educational agents have high engagement</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Location & Deployment Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Location & Deployment</h2>
            
            {/* Location Display */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center mb-3">
                <MapPin className="h-5 w-5 text-indigo-600 mr-2" />
                <span className="font-medium text-gray-900">GPS Coordinates</span>
                {isLoadingLocation && (
                  <Loader2 className="h-4 w-4 text-indigo-600 ml-2 animate-spin" />
                )}
              </div>
              
              {displayLocation ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Latitude:</span>
                    <span className="text-sm font-mono text-gray-900">
                      {displayLocation.latitude?.toFixed(8) || displayLocation.preciseLatitude?.toFixed(8)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Longitude:</span>
                    <span className="text-sm font-mono text-gray-900">
                      {displayLocation.longitude?.toFixed(8) || displayLocation.preciseLongitude?.toFixed(8)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Accuracy:</span>
                    <span className="text-sm text-gray-900">
                      ±{displayLocation.accuracy?.toFixed(2) || '10.00'}m
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  {isLoadingLocation ? 'Getting your location...' : 'Location unavailable'}
                </div>
              )}
              
              {locationError && (
                <div className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {locationError}
                </div>
              )}
            </div>

            {/* RTK Enhancement */}
            {preciseLocation && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center mb-3">
                  <Crosshair className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">RTK Enhanced</span>
                </div>
                <div className="text-sm text-green-700">
                  Precision: ±{preciseLocation.accuracy.toFixed(2)}{preciseLocation.correctionApplied ? 'cm' : 'm'}
                </div>
              </div>
            )}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="font-medium text-purple-800">Economic Model</span>
              </div>
              <div className="space-y-2 text-sm text-purple-700">
                <div className="flex justify-between">
                  <span>Deployment Cost:</span>
                  <span className="font-bold">100 Auras</span>
                </div>
                <div className="flex justify-between">
                  <span>Interaction Fee:</span>
                  <span className="font-bold">1 Aura per message</span>
                </div>
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span className="font-bold">{deploymentNetwork}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="font-medium text-blue-800">Status</span>
              </div>
              <div className="text-sm text-blue-700">
                {!address ? 'Connect wallet to deploy' :
                 !supabase ? 'Database connection required' :
                 !location ? 'Getting location...' :
                 !agentName.trim() ? 'Enter agent name' :
                 !selectedObject ? 'Select 3D object type' :
                 'Ready to deploy with RTK enhancement'}
              </div>
            </div>

            {/* Get Precise Location Button */}
            {location && !preciseLocation && supabase && address && (
              <button
                onClick={getPreciseLocation}
                disabled={isGettingPreciseLocation}
                className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isGettingPreciseLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting RTK Precision...
                  </>
                ) : (
                  <>
                    <Crosshair className="h-4 w-4 mr-2" />
                    Get RTK-Enhanced Location
                  </>
                )}
              </button>
            )}

            {/* Refresh Location Button */}
            <button
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {isLoadingLocation ? 'Getting Location...' : 'Refresh Location'}
            </button>

            {/* Deploy Button */}
            <motion.button
              onClick={handleDeployAgent}
              disabled={!canDeploy}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center ${
                canDeploy
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
              whileHover={canDeploy ? { scale: 1.02 } : {}}
              whileTap={canDeploy ? { scale: 0.98 } : {}}
            >
              {isDeploying ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Deploying Agent...
                </>
              ) : !address ? (
                'Connect Wallet to Deploy'
              ) : !supabase ? (
                'Connect Database to Deploy'
              ) : (
                <>
                  <Bot className="h-5 w-5 mr-2" />
                  Deploy Agent ({deploymentCost} Auras)
                </>
              )}
            </motion.button>

            {/* Cost Summary */}
            <div className="mt-4 text-center text-sm text-gray-600">
              <div>Deployment Cost: {deploymentCost} Auras</div>
              <div>Interaction Fee: 1 Aura per use</div>
            </div>

            {/* Status Message */}
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-lg flex items-center ${
                  deploymentStatus === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {deploymentStatus === 'success' ? (
                  <Check className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                {statusMessage}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Feature Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 bg-white rounded-2xl shadow-xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Agent Deployment System</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Settings className="h-6 w-6 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Complete Configuration</h4>
              <p className="text-sm text-gray-600">Full agent specification with identity, capabilities, and economics</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crosshair className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">RTK Precision</h4>
              <p className="text-sm text-gray-600">Centimeter-level accuracy using GEODNET RTK network</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Multi-User Ecosystem</h4>
              <p className="text-sm text-gray-600">Agents visible to users within configured range</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet className="h-6 w-6 text-pink-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Autonomous Wallets</h4>
              <p className="text-sm text-gray-600">Each agent gets its own crypto wallet for transactions</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeployObject;