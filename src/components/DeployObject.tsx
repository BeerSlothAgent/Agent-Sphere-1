import { MapPin, Crosshair, Plus, AlertCircle, CheckCircle, Loader2, Eye, Mic, MessageSquare, Globe, Zap, DollarSign, User, Building, GraduationCap, Landmark, Gamepad2, Palette, Store, Cuboid as Cube, Brain, Box, Circle, Triangle, Cylinder, Octagon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
}

interface PreciseLocation {
  preciseLatitude: number;
  preciseLongitude: number;
  preciseAltitude?: number;
  accuracy: number;
  correctionApplied: boolean;
}

interface DeployObjectProps {
  supabase: any;
}

const DeployObject = ({ supabase }: DeployObjectProps) => {
  // Location state
  const [location, setLocation] = useState<Location | null>(null);
  const [preciseLocation, setPreciseLocation] = useState<PreciseLocation | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGettingPreciseLocation, setIsGettingPreciseLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  // Agent configuration state
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [selectedAgentType, setSelectedAgentType] = useState('ai_agent');
  const [selectedLocationType, setSelectedLocationType] = useState('Street');
  const [rangeMeters, setRangeMeters] = useState('25.0');
  const [chatEnabled, setChatEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [defiEnabled, setDefiEnabled] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState('mynearwallet');
  const [interactionFee, setInteractionFee] = useState('0.50');
  const [selectedMcpIntegrations, setSelectedMcpIntegrations] = useState<string[]>([]);
  const [interactionTypes, setInteractionTypes] = useState<string[]>(['text_chat']);
  
  // Notification system settings
  const [enableProximityNotifications, setEnableProximityNotifications] = useState(true);

  // Deployment state
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string>('');
  const [deployedAgent, setDeployedAgent] = useState<any>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<string>('');
  const [deploymentResults, setDeploymentResults] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);

  // Mock owner wallet (in real app, this would come from wallet connection)
  const ownerWallet = 'user123.testnet';

  const agentTypes = [
    { 
      value: 'ai_agent', 
      label: 'NEAR AI Agent',
      description: 'NEAR-powered AI assistant for various tasks and queries',
      icon: <Brain className="h-4 w-4" />,
      arObject: 'cube',
      arColor: '#3B82F6',
      arIcon: <Box className="h-6 w-6" />
    },
    { 
      value: 'study_buddy', 
      label: 'Study Buddy', 
      description: 'Educational companion (appears as green sphere in AR)',
      icon: <GraduationCap className="h-4 w-4" />,
      arObject: 'sphere',
      arColor: '#10B981',
      arIcon: <Circle className="h-6 w-6" />
    },
    { 
      value: 'tutor', 
      label: 'Tutor', 
      description: 'Specialized teaching agent (appears as purple pyramid in AR)',
      icon: <User className="h-4 w-4" />,
      arObject: 'pyramid',
      arColor: '#7C3AED',
      arIcon: <Triangle className="h-6 w-6" />
    },
    { 
      value: 'landmark', 
      label: 'Landmark', 
      description: 'Location-based information provider (appears as orange cylinder in AR)',
      icon: <Landmark className="h-4 w-4" />,
      arObject: 'cylinder',
      arColor: '#F97316',
      arIcon: <Cylinder className="h-6 w-6" />
    },
    { 
      value: 'building', 
      label: 'Building', 
      description: 'Architectural information agent (appears as gray cube in AR)',
      icon: <Building className="h-4 w-4" />,
      arObject: 'cube',
      arColor: '#6B7280',
      arIcon: <Box className="h-6 w-6" />
    },
    { 
      value: 'Intelligent Assistant', 
      label: 'Intelligent Assistant',
      description: 'Multi-faceted helper shown as an octahedron in AR',
      icon: <Brain className="h-4 w-4" />,
      arObject: 'octahedron',
      arColor: '#06B6D4',
      arIcon: <Octagon className="h-6 w-6" />
    },
    { 
      value: 'Content Creator',
      label: 'Content Creator', 
      description: 'Creative agent for content generation (appears as pink torus in AR)',
      icon: <Palette className="h-4 w-4" />,
      arObject: 'torus',
      arColor: '#EC4899',
      arIcon: <Circle className="h-6 w-6" />
    },
    { 
      value: 'Local Services', 
      label: 'Local Services',
      description: 'Community service pillar displayed as a cylinder in AR',
      icon: <Store className="h-4 w-4" />,
      arObject: 'cone',
      arColor: '#EAB308',
      arIcon: <Triangle className="h-6 w-6" />
    },
    { 
      value: 'Tutor/Teacher', 
      label: 'Tutor/Teacher', 
      description: 'Professional educational instructor (appears as indigo pyramid in AR)',
      icon: <GraduationCap className="h-4 w-4" />,
      arObject: 'pyramid',
      arColor: '#4F46E5',
      arIcon: <Triangle className="h-6 w-6" />
    },
    { 
      value: '3D World Modelling', 
      label: '3D World Modelling',
      description: 'Spatial modeling and 3D environment creation (appears as green dodecahedron in AR)',
      icon: <Cube className="h-4 w-4" />,
      arObject: 'dodecahedron',
      arColor: '#059669',
      arIcon: <Octagon className="h-6 w-6" />
    },
    { 
      value: 'Game Agent', 
      label: 'Game Agent', 
      description: 'Interactive gaming companion (appears as red icosahedron in AR)',
      icon: <Gamepad2 className="h-4 w-4" />,
      arObject: 'icosahedron',
      arColor: '#DC2626',
      arIcon: <Octagon className="h-6 w-6" />
    }
  ];

  const locationTypes = [
    { value: 'Home', label: 'Home', description: 'Residential area or home environment' },
    { value: 'Street', label: 'Street', description: 'Public street or sidewalk area' },
    { value: 'Countryside', label: 'Countryside', description: 'Rural or natural outdoor environment' },
    { value: 'Classroom', label: 'Classroom', description: 'Educational facility or classroom' },
    { value: 'Office', label: 'Office', description: 'Business or office environment' }
  ];

  const walletTypes = [
    { value: 'mynearwallet', label: 'MyNearWallet', description: 'NEAR Protocol wallet integration' },
    { value: 'evm_wallet', label: 'EVM Wallet', description: 'Ethereum Virtual Machine compatible wallet' },
    { value: 'solana', label: 'Solana', description: 'Solana blockchain wallet' },
    { value: 'flow_wallet', label: 'Flow Wallet', description: 'Flow blockchain wallet integration' }
  ];

  // MCP Server Integrations - Complete List
  const mcpIntegrations = [
    // Left Column
    { id: 'weather', label: 'weather', description: 'Weather information and forecasts' },
    { id: 'directions', label: 'directions', description: 'Navigation and route planning' },
    { id: 'calculator', label: 'calculator', description: 'Mathematical calculations' },
    { id: 'qr_generator', label: 'qr generator', description: 'QR code generation' },
    { id: 'local_business', label: 'local business', description: 'Local business information' },
    { id: 'spatial_analysis', label: 'spatial analysis', description: 'Geographic and spatial data analysis' },
    { id: 'content_generation', label: 'content generation', description: 'AI-powered content creation' },
    { id: 'social_sharing', label: 'social sharing', description: 'Social media integration' },

    // Right Column  
    { id: 'location_info', label: 'location info', description: 'Detailed location information' },
    { id: 'search', label: 'search', description: 'Web search capabilities' },
    { id: 'educational_content', label: 'educational content', description: 'Learning materials and resources' },
    { id: 'study_planner', label: 'study planner', description: 'Study schedule and planning tools' },
    { id: '3d_modeling', label: '3d modeling', description: '3D model creation and manipulation' },
    { id: 'architecture', label: 'architecture', description: 'Architectural design and analysis' },
    { id: 'media_creation', label: 'media creation', description: 'Multimedia content creation' },
    { id: 'game_tools', label: 'game tools', description: 'Gaming utilities and tools' }
  ];

  const generateFakeAgentWallet = (walletType: string): string => {
    const walletFormats = {
      mynearwallet: () => `agent_${Math.random().toString(36).substr(2, 8)}.testnet`,
      evm_wallet: () => `0x${Math.random().toString(16).substr(2, 40)}`,
      solana: () => `${Math.random().toString(36).substr(2, 32)}${Math.random().toString(36).substr(2, 12)}`,
      flow_wallet: () => `0x${Math.random().toString(16).substr(2, 16)}`
    };
    
    return walletFormats[walletType as keyof typeof walletFormats]?.() || 'Not Generated';
  };

  const get3DObjectName = (agentType: string): string => {
    const agentTypeData = agentTypes.find(type => type.value === agentType);
    return agentTypeData?.arObject || 'cube';
  };

  const get3DObjectIcon = (agentType: string) => {
    const agentTypeData = agentTypes.find(type => type.value === agentType);
    return agentTypeData?.arIcon || <Box className="h-6 w-6" />;
  };

  const get3DObjectColor = (agentType: string): string => {
    const agentTypeData = agentTypes.find(type => type.value === agentType);
    return agentTypeData?.arColor || '#3B82F6';
  };

  const validateARCompatibility = (agentData: any): boolean => {
    const required = [
      'object_type',
      'name',
      'interaction_fee_usdfc',
      'agent_wallet_type',
      'latitude',
      'longitude'
    ];
    
    const missing = required.filter(field => !agentData[field]);
    
    if (missing.length > 0) {
      console.warn('Missing AR fields:', missing);
    }
    
    return missing.length === 0;
  };

  const handleMcpToggle = (integrationId: string, checked: boolean) => {
    if (checked) {
      setSelectedMcpIntegrations(prev => [...prev, integrationId]);
    } else {
      setSelectedMcpIntegrations(prev => prev.filter(id => id !== integrationId));
    }
  };

  const handleInteractionTypeToggle = (type: string, checked: boolean) => {
    if (checked) {
      setInteractionTypes(prev => [...prev, type]);
    } else {
      setInteractionTypes(prev => prev.filter(t => t !== type));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy
        };
        setLocation(newLocation);
        setIsGettingLocation(false);
        console.log('📍 Location obtained:', newLocation);
      },
      (error) => {
        console.error('❌ Location error:', error);
        setLocationError(`Location error: ${error.message}`);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const getPreciseLocation = async () => {
    if (!location) {
      setLocationError('Please get your basic location first');
      return;
    }

    setIsGettingPreciseLocation(true);
    setLocationError('');

    try {
      console.log('🛰️ Getting RTK-enhanced coordinates...');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-precise-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const preciseData = await response.json();
      console.log('✅ RTK correction applied:', preciseData);

      setPreciseLocation({
        preciseLatitude: preciseData.preciseLatitude,
        preciseLongitude: preciseData.preciseLongitude,
        preciseAltitude: preciseData.preciseAltitude,
        accuracy: preciseData.accuracy,
        correctionApplied: preciseData.correctionApplied
      });

      setIsGettingPreciseLocation(false);
    } catch (error) {
      console.error('❌ RTK correction failed:', error);
      setLocationError('Failed to get precise location. Using standard GPS.');
      setIsGettingPreciseLocation(false);
    }
  };

  const simulateNearDeployment = async (agentData: any) => {
    // Simulate blockchain transaction
    const mockTxHash = `near_tx_${Math.random().toString(36).substr(2, 20)}`;
    const mockBlockHeight = Math.floor(Math.random() * 1000000) + 50000000;
    
    // Simulate deployment delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      success: true,
      transactionHash: mockTxHash,
      blockHeight: mockBlockHeight,
      agentContractId: `${agentData.name.toLowerCase().replace(/\s+/g, '_')}.${ownerWallet}`,
      agentWalletAddress: generateFakeAgentWallet(agentData.walletType),
      deploymentCost: 0.1, // NEAR transaction fee
      timestamp: new Date().toISOString()
    };
  };

  // Generate realistic IPFS hash (QmHash format)
  const generateIPFSHash = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let hash = 'Qm';
    for (let i = 0; i < 44; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  // Generate realistic Filecoin CID (bafybeih format)
  const generateFilecoinCID = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz234567';
    let cid = 'bafybeih';
    for (let i = 0; i < 50; i++) {
      cid += chars[Math.floor(Math.random() * chars.length)];
    }
    return cid;
  };

  const handleDeployAgent = async () => {
    if (!supabase) {
      setDeploymentError('Database connection not available. Please connect to Supabase first.');
      return;
    }

    if (!location) {
      setDeploymentError('Please get your location first');
      return;
    }

    if (!agentName.trim()) {
      setDeploymentError('Please enter an agent name');
      return;
    }

    setIsDeploying(true);
    setDeploymentStatus('Preparing deployment...');
    setDeploymentProgress(0);

    try {
      // Step 1: Create agent card for IPFS storage
      setDeploymentStatus('ipfs-creating');
      setDeploymentProgress(20);
      const agentCard = {
        name: agentName,
        type: selectedAgentType,
        description: agentDescription,
        capabilities: selectedMcpIntegrations || [],
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          type: selectedLocationType
        },
        range: parseFloat(rangeMeters),
        pricing: {
          interactionFee: parseFloat(interactionFee),
          currency: 'USDFC'
        },
        owner: ownerWallet,
        deployedAt: new Date().toISOString(),
        version: "1.0.0",
        metadata: {
          platform: "AgentSphere",
          blockchain: "NEAR Protocol",
          storage: "Filecoin/IPFS",
          hackathon: "NEAR Protocol Hackathon 2025"
        }
      };
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Simulate IPFS storage
      setDeploymentStatus('ipfs-storing');
      setDeploymentProgress(40);
      const ipfsHash = generateIPFSHash();
      console.log('📁 Agent card stored on IPFS:', agentCard);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Simulate Filecoin storage
      setDeploymentStatus('filecoin-securing');
      setDeploymentProgress(60);
      const filecoinCID = generateFilecoinCID();
      console.log('💾 Agent card secured on Filecoin:', agentCard);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 4: Deploy to NEAR and database
      setDeploymentStatus('near-deploying');
      setDeploymentProgress(80);

      console.log('🚀 Starting agent deployment...');

      // Use precise location if available, otherwise fall back to standard location
      const deploymentLatitude = preciseLocation?.preciseLatitude || location.latitude;
      const deploymentLongitude = preciseLocation?.preciseLongitude || location.longitude;
      const deploymentAltitude = preciseLocation?.preciseAltitude || location.altitude;
      const deploymentAccuracy = preciseLocation?.accuracy || location.accuracy;
      const correctionApplied = preciseLocation?.correctionApplied || false;

      // Simulate NEAR blockchain deployment
      const blockchainResult = await simulateNearDeployment({
        name: agentName,
        walletType: selectedWalletType
      });

      const agentData = {
        user_id: ownerWallet,
        name: agentName,
        description: agentDescription,
        ipfs_hash: ipfsHash,
        filecoin_cid: filecoinCID,
        object_type: selectedAgentType,
        location_type: selectedLocationType,
        range_meters: parseFloat(rangeMeters),
        chat_enabled: chatEnabled,
        voice_enabled: voiceEnabled,
        defi_enabled: defiEnabled,
        mcp_integrations: selectedMcpIntegrations.length > 0 ? selectedMcpIntegrations : null,
        interaction_types: interactionTypes,
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: location.altitude,
        preciselatitude: deploymentLatitude,
        preciselongitude: deploymentLongitude,
        precisealtitude: deploymentAltitude,
        accuracy: deploymentAccuracy,
        correctionapplied: correctionApplied,
        is_active: true,
        owner_wallet: ownerWallet,
        agent_wallet_address: blockchainResult.agentWalletAddress,
        agent_wallet_type: selectedWalletType,
        interaction_fee_usdfc: parseFloat(interactionFee),
        network: 'near-testnet',
        contract_address: blockchainResult.agentContractId,
        deployment_tx: blockchainResult.transactionHash,
        deployment_block: blockchainResult.blockHeight,
        currency_type: 'USDFC'
      };

      // Validate AR compatibility
      if (!validateARCompatibility(agentData)) {
        console.warn('Agent may not display properly in AR due to missing fields');
      }

      console.log('💾 Saving agent to database:', agentData);

      const { data, error } = await supabase
        .from('deployed_objects')
        .insert([agentData])
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Agent deployed successfully:', data);
      
      setDeploymentProgress(100);
      setDeploymentStatus('success');
      setDeploymentResults({
        nearDeployment: true,
        ipfsStorage: true,
        filecoinStorage: true,
        agentId: data.id,
        ipfsHash: ipfsHash,
        filecoinCID: filecoinCID,
        agent: data,
        preciseLocation: preciseLocation
      });
      setShowSuccessModal(true);
      setIsDeploying(false);

    } catch (error) {
      console.error('❌ Deployment failed:', error);
      setDeploymentError(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsDeploying(false);
    }
  };

  const resetForm = () => {
    setAgentName('');
    setAgentDescription('');
    setSelectedAgentType('ai_agent');
    setSelectedLocationType('Street');
    setRangeMeters('25.0');
    setChatEnabled(true);
    setVoiceEnabled(true);
    setDefiEnabled(false);
    setSelectedWalletType('mynearwallet');
    setInteractionFee('0.50');
    setSelectedMcpIntegrations([]);
    setInteractionTypes(['text_chat']);
    setLocation(null);
    setPreciseLocation(null);
    setDeploymentSuccess(false);
    setDeploymentError('');
    setDeployedAgent(null);
  };

  const selectedAgentTypeData = agentTypes.find(type => type.value === selectedAgentType);
  const selectedLocationTypeData = locationTypes.find(type => type.value === selectedLocationType);
  const selectedWalletTypeData = walletTypes.find(type => type.value === selectedWalletType);
  const displayLocation = preciseLocation || location;

  // Enhanced agent type descriptions with notification context
  const agentTypeDescriptionsWithNotifications = {
    'ai_agent': {
      description: 'Intelligent assistant appearing as a glowing cube in AR',
      notification: 'Users get notified when entering your AI agent\'s range and can interact via map or camera'
    },
    'study_buddy': {
      description: 'Learning companion displayed as a knowledge sphere in AR',
      notification: 'Students receive proximity alerts and can access study materials through map interface'
    },
    'tutor': {
      description: 'Educational guide shown as a pointing pyramid in AR',
      notification: 'Learners get notified when near tutoring sessions and can join via map or AR'
    },
    'landmark': {
      description: 'Location marker appearing as a tall cylinder in AR',
      notification: 'Visitors receive location-based notifications and can explore details on map'
    },
    'building': {
      description: 'Architectural agent displayed as a prominent cube in AR',
      notification: 'Users get building information alerts and can view details through map interface'
    },
    'Intelligent Assistant': {
      description: 'Multi-faceted helper shown as an octahedron in AR',
      notification: 'Users receive assistance notifications and can access help via map or camera'
    },
    'Content Creator': {
      description: 'Creative agent appearing as a spinning torus in AR',
      notification: 'Creators get notified about content opportunities and can engage through map'
    },
    'Local Services': {
      description: 'Community service pillar displayed as a cylinder in AR',
      notification: 'Locals receive service alerts and can access information via map interface'
    },
    'Tutor/Teacher': {
      description: 'Educational pointer shown as a guidance pyramid in AR',
      notification: 'Students get learning notifications and can join sessions through map or AR'
    },
    '3D World Modelling': {
      description: 'Complex structure displayed as a large cube in AR',
      notification: 'Users receive modeling alerts and can explore 3D content via map interface'
    },
    'Game Agent': {
      description: 'Playful companion appearing as a small spinning sphere in AR',
      notification: 'Players get game notifications and can join activities through map or camera'
    }
  };

  const isReadyToDeploy = location && agentName.trim() && !isDeploying;

  if (deploymentSuccess && deployedAgent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8"
        >
          {/* Enhanced Success Header */}
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Agent Deployed Successfully!</h2>
            <p className="text-gray-600">Your GeoAgent is now live and ready for AR discovery!</p>
          </div>

          {/* Notification System Success Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-100 p-3 rounded border border-green-300">
                <h4 className="font-medium text-green-800 mb-2 flex items-center">
                  🔔 Notification System
                </h4>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Users get notified when entering {deployedAgent.range_meters}m range</li>
                  <li>• Notification icon changes color and shows badge</li>
                  <li>• Tap notification to see map with your agent</li>
                  <li>• Priority: normal</li>
                </ul>
              </div>
              
              <div className="bg-green-100 p-3 rounded border border-green-300">
                <h4 className="font-medium text-green-800 mb-2 flex items-center">
                  🗺️ Map & AR Experience
                </h4>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Agent appears on nearby agents map</li>
                  <li>• Shows {deployedAgent.range_meters}m range circle</li>
                  <li>• Users can switch between map and AR camera</li>
                  <li>• Marker style: standard</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>📱 User Journey:</strong> Users will discover your agent through proximity 
                notifications, view it on the map with interaction details, and engage via AR camera. 
                Test the experience by opening the AR Viewer app near the deployment location!
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* AR Experience Summary */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                AR Experience Ready
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">3D Object:</span>
                  <div className="flex items-center mt-1">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center text-white mr-2"
                      style={{ backgroundColor: get3DObjectColor(deployedAgent.object_type) }}
                    >
                      {get3DObjectIcon(deployedAgent.object_type)}
                    </div>
                    <span className="font-medium capitalize">{get3DObjectName(deployedAgent.object_type)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">AR Positioning:</span>
                  <p className="font-medium">±{deployedAgent.accuracy?.toFixed(deployedAgent.correctionapplied ? 2 : 0)}m accuracy</p>
                </div>
                <div>
                  <span className="text-blue-700">Interaction Cost:</span>
                  <p className="font-medium">{deployedAgent.interaction_fee_usdfc} USDFC per tap</p>
                </div>
                <div>
                  <span className="text-blue-700">Visibility Range:</span>
                  <p className="font-medium">{deployedAgent.range_meters}m radius</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-blue-800 space-y-1">
                <p>• Agent appears as spinning 3D {get3DObjectName(deployedAgent.object_type)} in AR</p>
                <p>• Positioned with {deployedAgent.correctionapplied ? 'centimeter' : 'meter'} precision</p>
                <p>• Users can tap to interact and see agent details</p>
                <p>• Ready for immersive AR experiences</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Agent Name:</span>
                  <p className="font-medium">{deployedAgent.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Agent Type:</span>
                  <p className="font-medium">{deployedAgent.object_type}</p>
                </div>
                <div>
                  <span className="text-gray-600">Location Type:</span>
                  <p className="font-medium">{deployedAgent.location_type}</p>
                </div>
                <div>
                  <span className="text-gray-600">Interaction Fee:</span>
                  <p className="font-medium">{deployedAgent.interaction_fee_usdfc || deployedAgent.interaction_fee} USDFC</p>
                </div>
                <div>
                  <span className="text-gray-600">Notifications:</span>
                  <p className="font-medium">Enabled (UI only)</p>
                </div>
                <div>
                  <span className="text-gray-600">Map Visibility:</span>
                  <p className="font-medium">Visible</p>
                </div>
                <div>
                  <span className="text-gray-600">Network:</span>
                  <p className="font-medium">NEAR Testnet</p>
                </div>
                <div>
                  <span className="text-gray-600">Range:</span>
                  <p className="font-medium">{deployedAgent.range_meters}m</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Blockchain Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-blue-700">Contract ID:</span>
                  <p className="font-mono text-xs break-all">{deployedAgent.agentContractId}</p>
                </div>
                <div>
                  <span className="text-blue-700">Transaction Hash:</span>
                  <p className="font-mono text-xs break-all">{deployedAgent.transactionHash}</p>
                </div>
                <div>
                  <span className="text-blue-700">Agent Wallet ({deployedAgent.agent_wallet_type}):</span>
                  <p className="font-mono text-xs break-all">{deployedAgent.agentWalletAddress}</p>
                </div>
                <div>
                  <span className="text-blue-700">Block Height:</span>
                  <p className="font-mono text-xs">{deployedAgent.blockHeight}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Location Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-purple-700">Coordinates:</span>
                  <p className="font-mono text-xs">
                    {(displayLocation as any).latitude?.toFixed(8) || (displayLocation as any).preciseLatitude?.toFixed(8)}, {(displayLocation as any).longitude?.toFixed(8) || (displayLocation as any).preciseLongitude?.toFixed(8)}
                  </p>
                </div>
                <div>
                  <span className="text-purple-700">Accuracy:</span>
                  <p className="font-mono text-xs">±{deployedAgent.accuracy?.toFixed(2)}m</p>
                </div>
                <div>
                  <span className="text-purple-700">RTK Enhanced:</span>
                  <p className="font-medium">{deployedAgent.correctionapplied ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-purple-700">Altitude:</span>
                  <p className="font-mono text-xs">{deployedAgent.precisealtitude?.toFixed(2) || deployedAgent.altitude?.toFixed(2) || 'N/A'}m</p>
                </div>
                <div>
                  <span className="text-purple-700">Range:</span>
                  <p className="font-bold text-purple-400">{deployedAgent.range_meters?.toFixed(1) || '25.0'}m</p>
                </div>
                <div>
                  <span className="text-purple-700">Notification Range:</span>
                  <p className="font-medium">{deployedAgent.range_meters?.toFixed(1) || '25.0'}m detection radius</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={resetForm}
                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Deploy Another Agent
              </button>
              <button
                onClick={() => window.location.href = '/ar'}
                className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                View in AR
              </button>
              <button
                onClick={() => {
                  const shareText = `Check out my AI agent "${deployedAgent.name}" in AR! Located at ${deployedAgent.preciselatitude?.toFixed(6) || deployedAgent.latitude?.toFixed(6)}, ${deployedAgent.preciselongitude?.toFixed(6) || deployedAgent.longitude?.toFixed(6)}`;
                  navigator.share?.({ title: 'AgentSphere Agent', text: shareText }) || 
                  navigator.clipboard?.writeText(shareText);
                }}
                className="bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Share
              </button>
            </div>
            
            {/* AR Discovery Instructions */}
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <h4 className="font-medium text-indigo-800 mb-2">🎯 Test Your Agent Discovery:</h4>
              <ol className="text-sm text-indigo-700 space-y-1">
                <li>1. Open AR Viewer app on your mobile device</li>
                <li>2. Walk within {deployedAgent.range_meters || 25}m of deployment location</li>
                <li>3. Watch for notification icon to change color</li>
                <li>4. Tap notification to see map with your agent</li>
                <li>5. Switch to AR camera to interact with agent</li>
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Deploy NEAR Agent</h1>
            <p className="text-green-100 mt-2">Create and deploy your NEAR agent to the NEAR blockchain with NeAR QR Pay</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Location & Deployment Panel */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Location & Deployment
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Location Controls */}
                <div className="space-y-4">
                  <div>
                    <button
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      {isGettingLocation ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Getting Location...
                        </>
                      ) : (
                        <>
                          <Crosshair className="h-4 w-4 mr-2" />
                          Get Current Location
                        </>
                      )}
                    </button>
                  </div>

                  {location && (
                    <div>
                      <button
                        onClick={getPreciseLocation}
                        disabled={isGettingPreciseLocation}
                        className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
                      >
                        {isGettingPreciseLocation ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Applying RTK Correction...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Get RTK-Enhanced Location
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {locationError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                        <span className="text-red-800 text-sm">{locationError}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Display */}
                {displayLocation && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      {preciseLocation ? 'RTK-Enhanced Coordinates' : 'GPS Coordinates'}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Latitude:</span>
                        <span className="text-sm font-mono">{(displayLocation as any).latitude?.toFixed(8) || (displayLocation as any).preciseLatitude?.toFixed(8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Longitude:</span>
                        <span className="text-sm font-mono">{(displayLocation as any).longitude?.toFixed(8) || (displayLocation as any).preciseLongitude?.toFixed(8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Altitude:</span>
                        <span className="text-sm font-mono">{(displayLocation as any).altitude?.toFixed(2) || (displayLocation as any).preciseAltitude?.toFixed(2) || 'N/A'}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Accuracy:</span>
                        <span className="text-sm font-mono">±{(displayLocation as any).accuracy?.toFixed(preciseLocation ? 2 : 0)}m</span>
                      </div>
                      {preciseLocation && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">RTK Correction:</span>
                          <span className="text-sm font-medium text-green-600">Applied</span>
                        </div>
                      )}
                    </div>
                    
                    {/* AR Experience Info */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          AR Experience
                        </h4>
                        <div className="text-sm text-blue-800 space-y-1">
                          <p>• Agent will appear as 3D {get3DObjectName(selectedAgentType)} in AR</p>
                          <p>• Positioned with ±{preciseLocation ? '2cm' : '10m'} accuracy using {preciseLocation ? 'RTK' : 'GPS'}</p>
                          <p>• Visible from {rangeMeters}m distance</p>
                          <p>• Clickable for interactions in AR Viewer</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Agent Configuration */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Agent Configuration</h2>
              
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="My Study Buddy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Type
                  </label>
                  <select
                    value={selectedAgentType}
                    onChange={(e) => setSelectedAgentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {agentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {selectedAgentTypeData && (
                    <p className="text-xs text-gray-500 mt-1">{selectedAgentTypeData.description}</p>
                  )}
                  {agentTypeDescriptionsWithNotifications[selectedAgentType as keyof typeof agentTypeDescriptionsWithNotifications] && (
                    <p className="text-xs text-blue-600 mt-2 italic">
                      📱 {agentTypeDescriptionsWithNotifications[selectedAgentType as keyof typeof agentTypeDescriptionsWithNotifications].notification}
                    </p>
                  )}
                  
                  {/* 3D Object Preview */}
                  <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">AR Appearance Preview</h4>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: get3DObjectColor(selectedAgentType) }}
                      >
                        {get3DObjectIcon(selectedAgentType)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">3D Object: {get3DObjectName(selectedAgentType)}</p>
                        <p className="text-xs text-gray-500">This is how your agent will appear in AR</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NEAR Agent Description
                </label>
                <textarea
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  placeholder="Describe what your NEAR agent does and how it can help users with NEAR Protocol integration..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Location & Range */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Type
                  </label>
                  <select
                    value={selectedLocationType}
                    onChange={(e) => setSelectedLocationType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {locationTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {selectedLocationTypeData && (
                    <p className="text-xs text-gray-500 mt-1">{selectedLocationTypeData.description}</p>
                  )}
                </div>

                {/* Range Visualization Info */}
                {location && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                      📍 Interaction Range & AR Notifications
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-blue-700 mb-2">Range Settings:</h5>
                        <div className="text-sm text-blue-600 space-y-1">
                          <p><strong>Detection Range:</strong> {rangeMeters}m radius</p>
                          <p><strong>Notification Trigger:</strong> When users enter range</p>
                          <p><strong>Map Visibility:</strong> Shows range circle</p>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-blue-700 mb-2">AR Experience:</h5>
                        <div className="text-sm text-blue-600 space-y-1">
                          <p>🔔 <strong>Notification:</strong> Icon changes color</p>
                          <p>🗺️ <strong>Map View:</strong> Shows on nearby agents map</p>
                          <p>📱 <strong>Interaction:</strong> Tap marker for details</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-blue-100 rounded border border-blue-300">
                      <p className="text-sm text-blue-800">
                        <strong>💡 User Journey:</strong> When users approach your agent, they'll receive 
                        a notification and can view it on the map before switching to AR camera for interaction.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility Range (meters)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={rangeMeters}
                    onChange={(e) => setRangeMeters(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">How far users can be to see your agent (0-50m)</p>
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  NEAR Agent Interaction Methods
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="chat-enabled"
                      checked={chatEnabled}
                      onChange={(e) => setChatEnabled(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="chat-enabled" className="flex items-center text-sm font-medium text-gray-700">
                      <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                      NeAR Text Chat
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="voice-enabled"
                      checked={voiceEnabled}
                      onChange={(e) => setVoiceEnabled(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="voice-enabled" className="flex items-center text-sm font-medium text-gray-700">
                      <Mic className="h-4 w-4 mr-2 text-green-600" />
                      NeAR Voice Chat
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="defi-enabled"
                      checked={defiEnabled}
                      onChange={(e) => setDefiEnabled(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="defi-enabled" className="flex items-center text-sm font-medium text-gray-700">
                      <DollarSign className="h-4 w-4 mr-2 text-purple-600" />
                      NEAR DeFi Features
                    </label>
                  </div>
                </div>
              </div>

              {/* MCP Server Integrations */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">NEAR MCP Server Integrations</h4>
                <div className="grid grid-cols-2 gap-4 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {mcpIntegrations.map((integration) => (
                    <label key={integration.id} className="flex items-start space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedMcpIntegrations.includes(integration.id)}
                        onChange={(e) => handleMcpToggle(integration.id, e.target.checked)}
                        className="mt-0.5 rounded border-gray-300"
                      />
                      <div>
                        <span className="font-medium">{integration.label}</span>
                        <p className="text-xs text-gray-500">{integration.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Wallet Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NEAR Agent Wallet Type
                </label>
                <select
                  value={selectedWalletType}
                  onChange={(e) => setSelectedWalletType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {walletTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {selectedWalletTypeData && (
                  <p className="text-xs text-gray-500 mt-1">{selectedWalletTypeData.description}</p>
                )}
              </div>
            </div>

            {/* Notification & Discovery Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                🔔 Notification & Discovery Settings
              </h3>
              
              <div className="space-y-4">
                {/* Notification Preferences */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">User Notification Preferences:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={enableProximityNotifications}
                        onChange={(e) => setEnableProximityNotifications(e.target.checked)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        Enable proximity notifications (UI only - not stored)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Notification Preview */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h5 className="font-medium text-gray-700 mb-3">Notification Preview:</h5>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500">
                      <span className="text-white text-xs">🔔</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {agentName || 'Your Agent'} nearby
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedAgentType.replace('_', ' ')} • {rangeMeters}m range • {interactionFee} USDFC
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-white rounded border">
                    <p className="text-xs text-gray-600">
                      <strong>Map Display:</strong> Standard marker with {rangeMeters}m range circle
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interaction Types Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <span>💬</span>
                <span>NEAR Interaction Types</span>
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Text Chat */}
                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={interactionTypes.includes('text_chat')}
                    onChange={(e) => handleInteractionTypeToggle('text_chat', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">💬</span>
                    <div>
                      <span className="font-medium">NeAR Text Chat</span>
                      <p className="text-sm text-gray-500">Enable NEAR-powered text-based conversations</p>
                    </div>
                  </div>
                </label>

                {/* Voice Interface */}
                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={interactionTypes.includes('voice_interface')}
                    onChange={(e) => handleInteractionTypeToggle('voice_interface', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🎤</span>
                    <div>
                      <span className="font-medium">NeAR Voice Interface</span>
                      <p className="text-sm text-gray-500">Enable NEAR-powered voice interactions (+50 USDFC)</p>
                    </div>
                  </div>
                </label>

                {/* Video Interface */}
                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={interactionTypes.includes('video_interface')}
                    onChange={(e) => handleInteractionTypeToggle('video_interface', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">📹</span>
                    <div>
                      <span className="font-medium">NeAR Video Interface</span>
                      <p className="text-sm text-gray-500">Enable NEAR-powered video conversations (+100 USDFC)</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Economics & Ownership */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">NEAR Economics & Ownership</h3>
              
              {/* Agent Interaction Fee Setup */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-3">NEAR Agent Interaction Fee</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fee per Interaction (USDFC on NEAR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={interactionFee}
                      onChange={(e) => setInteractionFee(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Set the USDFC fee users pay to interact with your NEAR agent
                    </p>
                  </div>
                  
                  {/* AR Interaction Preview */}
                  <div className="mt-3 bg-white p-3 rounded-lg border">
                    <h5 className="font-medium text-purple-900 mb-2">AR Interaction Preview</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">AR Display:</span>
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {agentName || 'Agent Name'} - {interactionFee || '0.50'} USDFC
                        </span>
                      </div>
                      <p className="text-xs text-purple-700">
                        Users will see this when they tap your agent in AR
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ownership Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">NEAR Ownership Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">NEAR Owner Wallet:</span>
                    <span className="font-mono text-xs">{ownerWallet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">NEAR Agent Wallet ({selectedWalletType}):</span>
                    <span className="font-mono text-xs text-blue-600">{generateFakeAgentWallet(selectedWalletType)}</span>
                  </div>
                </div>
              </div>

              {/* Revenue Potential */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">NEAR Revenue Potential</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Earn {interactionFee || '0.50'} USDFC per user interaction</li>
                  <li>• Higher visibility = more potential NEAR users</li>
                  <li>• NeAR voice agents typically earn 2x more</li>
                  <li>• NEAR educational agents have high engagement</li>
                  <li>• NeAR QR Pay enables instant transactions</li>
                </ul>
              </div>
            </div>

            {/* Deploy Button */}
            {deploymentError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800">{deploymentError}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleDeployAgent}
              disabled={!isReadyToDeploy}
              className="deploy-button-enhanced w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white py-6 px-6 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center min-h-[80px]"
            >
              {isDeploying ? (
                <div className="button-content">
                  <div className="flex items-center main-action">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Deploying...
                  </div>
                </div>
              ) : (
                <div className="button-content">
                  <div className="main-action flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Deploy NEAR Agent
                  </div>
                  <div className="storage-action">
                    & Store Agent Card on Filecoin/IPFS
                  </div>
                  <div className="dual-logos">
                    <span className="near-logo">🔗 NEAR</span>
                    <span className="plus">+</span>
                    <span className="filecoin-logo">📁 Filecoin</span>
                  </div>
                </div>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Deployment Status Modal */}
      {isDeploying && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full mx-4 text-white border border-green-500">
            <div className="deployment-status text-center">
              <div className="status-header mb-6">
                <h3 className="text-2xl font-bold text-green-400 mb-2">Deploying Your NEAR Agent</h3>
                <p className="text-gray-300">Storing on Filecoin/IPFS + Deploying on NEAR</p>
              </div>
              
              <div className="progress-bar mb-6">
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${deploymentProgress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-400 mt-2">{deploymentProgress}% Complete</div>
              </div>
              
              <div className="status-message mb-6">
                <DeploymentStatusMessage status={deploymentStatus} />
              </div>

              <div className="deployment-steps">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={`step ${deploymentProgress >= 20 ? 'completed' : 'pending'}`}>
                    <div className="step-icon">📁</div>
                    <div className="step-text">Create Card</div>
                  </div>
                  <div className={`step ${deploymentProgress >= 40 ? 'completed' : 'pending'}`}>
                    <div className="step-icon">🌐</div>
                    <div className="step-text">Store IPFS</div>
                  </div>
                  <div className={`step ${deploymentProgress >= 60 ? 'completed' : 'pending'}`}>
                    <div className="step-icon">💾</div>
                    <div className="step-text">Secure Filecoin</div>
                  </div>
                  <div className={`step ${deploymentProgress >= 80 ? 'completed' : 'pending'}`}>
                    <div className="step-icon">🔗</div>
                    <div className="step-text">Deploy NEAR</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && deploymentResults && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-white border-2 border-green-500">
            <div className="success-content p-8">
              <div className="success-header text-center mb-8">
                <div className="success-icon text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-green-400 mb-2">Deployment Successful!</h2>
                <p className="text-gray-300">Your NEAR agent is live and agent card is stored!</p>
              </div>

              <div className="deployment-results space-y-6">
                <div className="result-section">
                  <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
                    🔗 NEAR Protocol Deployment
                  </h3>
                  <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                    <div className="result-item">
                      <span className="label text-gray-400">Status:</span>
                      <span className="value success text-green-400 font-bold">✅ NEAR Agent Deployed</span>
                    </div>
                    <div className="result-item">
                      <span className="label text-gray-400">Agent ID:</span>
                      <span className="value font-mono text-blue-400">{deploymentResults.agentId}</span>
                    </div>
                    <div className="result-item">
                      <span className="label text-gray-400">Network:</span>
                      <span className="value text-white">NEAR Protocol Testnet</span>
                    </div>
                    <div className="result-item">
                      <span className="label text-gray-400">Agent Name:</span>
                      <span className="value text-white">{deploymentResults.agent?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="result-section">
                  <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
                    📁 Filecoin/IPFS Storage
                  </h3>
                  <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                    <div className="result-item">
                      <span className="label text-gray-400">IPFS Status:</span>
                      <span className="value success text-green-400 font-bold">✅ Agent Card Stored on IPFS</span>
                    </div>
                    <div className="result-item">
                      <span className="label text-gray-400">IPFS Hash:</span>
                      <span className="value hash font-mono text-blue-400 text-sm break-all">{deploymentResults.ipfsHash}</span>
                    </div>
                    <div className="result-item">
                      <span className="label text-gray-400">Filecoin Status:</span>
                      <span className="value success text-green-400 font-bold">✅ Agent Card Secured on Filecoin</span>
                    </div>
                    <div className="result-item">
                      <span className="label text-gray-400">Filecoin CID:</span>
                      <span className="value hash font-mono text-purple-400 text-sm break-all">{deploymentResults.filecoinCID}</span>
                    </div>
                  </div>
                </div>

                {deploymentResults.preciseLocation && (
                  <div className="result-section">
                    <h3 className="text-xl font-bold text-yellow-400 mb-4">🎯 RTK-Enhanced Positioning</h3>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-green-400 font-medium">
                        ✅ RTK-Enhanced GPS: ±{deploymentResults.preciseLocation.accuracy}m accuracy
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="next-steps mt-8">
                <h3 className="text-xl font-bold text-green-400 mb-4">🎯 What's Next?</h3>
                <div className="space-y-3">
                  <div className="next-step-item">
                    <span className="text-2xl">📱</span>
                    <span className="text-gray-300">Open NeAR Viewer to see your agent in AR</span>
                  </div>
                  <div className="next-step-item">
                    <span className="text-2xl">🌐</span>
                    <span className="text-gray-300">Your agent data is permanently stored on IPFS</span>
                  </div>
                  <div className="next-step-item">
                    <span className="text-2xl">🔒</span>
                    <span className="text-gray-300">Filecoin ensures long-term data preservation</span>
                  </div>
                  <div className="next-step-item">
                    <span className="text-2xl">💰</span>
                    <span className="text-gray-300">Start earning USDFC from agent interactions</span>
                  </div>
                </div>
              </div>
              
              <div className="action-buttons mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/ar"
                  className="btn-view-ar flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg hover:shadow-lg transition-all text-center font-bold flex items-center justify-center"
                >
                  👁️ View in NeAR
                </Link>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    resetForm();
                  }}
                  className="btn-deploy-another flex-1 bg-gray-700 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-bold"
                >
                  Deploy Another
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="btn-close bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors font-bold"
                >
                  Close
                </button>
              </div>

              <div className="powered-by mt-8 text-center">
                <small className="text-green-400 font-medium">
                  Powered by NEAR Protocol + Filecoin/IPFS
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Deployment Status Message Component
const DeploymentStatusMessage = ({ status }: { status: string }) => {
  const statusMessages = {
    'preparing': '🔄 Preparing deployment...',
    'ipfs-creating': '📁 Creating agent card for Filecoin/IPFS...',
    'ipfs-storing': '🌐 Storing agent card on IPFS...',
    'filecoin-securing': '💾 Securing on Filecoin network...',
    'near-deploying': '🔗 Deploying NEAR agent...',
    'success': '🎉 Deployment completed successfully!',
    'error': '❌ Deployment failed. Please try again.'
  };

  return (
    <div className="text-lg text-green-400 font-medium">
      {statusMessages[status as keyof typeof statusMessages] || statusMessages.preparing}
    </div>
  );
};

export default DeployObject;