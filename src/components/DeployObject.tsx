import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Cuboid as Cube, Circle, Triangle, Check, AlertCircle, Loader2, Database, Crosshair, Wallet, ChevronDown, Bot, GraduationCap, BookOpen, MapPinIcon, Building } from 'lucide-react';
import { useAddress, ConnectWallet } from '@thirdweb-dev/react';

interface DeployObjectProps {
  supabase: any;
}

interface ObjectType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface AgentType {
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

const DeployObject = ({ supabase }: DeployObjectProps) => {
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [selectedAgentType, setSelectedAgentType] = useState<string>('ai_agent');
  const [agentName, setAgentName] = useState<string>('');
  const [agentDescription, setAgentDescription] = useState<string>('');
  const [showAgentDropdown, setShowAgentDropdown] = useState<boolean>(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [preciseLocation, setPreciseLocation] = useState<PreciseLocation | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [isGettingPreciseLocation, setIsGettingPreciseLocation] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  
  const address = useAddress();

  const objectTypes: ObjectType[] = [
    {
      id: 'ai_agent',
      name: 'Video Assistant',
      icon: <Cube className="w-8 h-8" />,
      description: 'An AI video assistant agent'
    },
    {
      id: 'tutor',
      name: 'Video Tutor',
      icon: <Circle className="w-8 h-8" />,
      description: 'An educational video tutor agent'
    },
    {
      id: 'landmark',
      name: 'Video Guide',
      icon: <Triangle className="w-8 h-8" />,
      description: 'A location guide video agent'
    }
  ];

  const agentTypes: AgentType[] = [
    {
      id: 'ai_agent',
      name: 'Video Assistant - Intelligent assistant agent',
      description: 'General purpose AI assistant for various tasks',
      icon: <Bot className="w-5 h-5" />
    },
    {
      id: 'tutor',
      name: 'Video Tutor - Educational support agent',
      description: 'Helps with studying and educational content',
      icon: <GraduationCap className="w-5 h-5" />
    },
    {
      id: 'landmark',
      name: 'Video Guide - Location guide agent',
      description: 'Provides location-based guidance and information',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      id: 'landmark',
      name: 'Landmark - Location marker',
      description: 'Marks important locations and provides information',
      icon: <MapPinIcon className="w-5 h-5" />
    },
    {
      id: 'building',
      name: 'Building - Structure or building',
      description: 'Represents buildings and architectural structures',
      icon: <Building className="w-5 h-5" />
    }
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Set default agent name when agent type changes
  useEffect(() => {
    if (selectedAgentType && !agentName) {
      const agentType = agentTypes.find(type => type.id === selectedAgentType);
      if (agentType) {
        const baseName = agentType.name.split(' - ')[0];
        setAgentName(`${baseName} Alpha`);
      }
    }
  }, [selectedAgentType, agentName]);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationError('');
    setPreciseLocation(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setIsLoadingLocation(false);
      // Use dummy coordinates for testing
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
        // Use dummy coordinates as fallback
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

      console.log('🎯 Requesting precise location for coordinates:', {
        latitude: location.latitude,
        longitude: location.longitude
      });

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
      
      console.log('✅ Precise location received from Geodnet service:', {
        original: { lat: location.latitude, lon: location.longitude },
        precise: {
          lat: preciseLocationData.preciseLatitude,
          lon: preciseLocationData.preciseLongitude,
          alt: preciseLocationData.preciseAltitude,
          accuracy: preciseLocationData.accuracy,
          correctionApplied: preciseLocationData.correctionApplied
        }
      });
      
    } catch (error) {
      console.error('❌ Error getting precise location:', error);
      setLocationError('Failed to get precise location. Using standard GPS.');
      // Fallback to standard GPS
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

  const handleDeployObject = async () => {
    if (!selectedObject || !location || !agentName.trim()) {
      setStatusMessage('Please select an object, enter an agent name, and ensure location is available');
      setDeploymentStatus('error');
      return;
    }

    if (!address) {
      setStatusMessage('Please connect your wallet to deploy objects');
      setDeploymentStatus('error');
      return;
    }

    if (!supabase) {
      setStatusMessage('Database connection not available. Please set up Supabase to deploy objects.');
      setDeploymentStatus('error');
      return;
    }

    // Get precise location first if we don't have it
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
      // Use the user-provided agent name and description
      const finalDescription = agentDescription.trim() || `A ${selectedAgentType.replace('-', ' ')} deployed in AR space`;

      // Prepare the data to insert with precise coordinates
      const insertData = {
        user_id: address,
        object_type: selectedObject,
        name: agentName.trim(),
        description: finalDescription,
        // Standard coordinates (for backward compatibility)
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: preciseLocation.preciseAltitude || null,
        // CRITICAL: Precise coordinates for AR positioning
        preciselatitude: preciseLocation.preciseLatitude,
        preciselongitude: preciseLocation.preciseLongitude,
        precisealtitude: preciseLocation.preciseAltitude || null,
        accuracy: preciseLocation.accuracy,
        correctionapplied: preciseLocation.correctionApplied,
        is_active: true // Ensure GeoAgent is active for AR Viewer
      };

      console.log('🚀 Deploying GeoAgent with precise coordinates:', insertData);

      const { data, error } = await supabase
        .from('deployed_objects')
        .insert([insertData])
        .select();

      if (error) {
        console.error('❌ Supabase insertion error:', error);
        throw error;
      }

      console.log('✅ Successfully deployed GeoAgent to database:', data);
      console.log('🎯 AR Viewer can now access this GeoAgent with precise coordinates:', {
        id: data[0]?.id,
        name: agentName,
        preciseCoords: {
          lat: preciseLocation.preciseLatitude,
          lon: preciseLocation.preciseLongitude,
          alt: preciseLocation.preciseAltitude
        },
        accuracy: preciseLocation.accuracy,
        rtkCorrected: preciseLocation.correctionApplied
      });

      setDeploymentStatus('success');
      const accuracyText = preciseLocation.correctionApplied 
        ? `with RTK precision (±${preciseLocation.accuracy}m)`
        : `with GPS accuracy (±${preciseLocation.accuracy}m)`;
      
      setStatusMessage(`${agentName} deployed successfully ${accuracyText}! AR Viewer can now locate this GeoAgent with precise coordinates.`);
      
      // Reset form after successful deployment
      setTimeout(() => {
        setSelectedObject(null);
        setAgentName('');
        setAgentDescription('');
        setDeploymentStatus('idle');
        setStatusMessage('');
        setPreciseLocation(null);
      }, 5000);

    } catch (error) {
      console.error('❌ Error deploying GeoAgent:', error);
      setDeploymentStatus('error');
      setStatusMessage('Failed to deploy GeoAgent. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  };

  const canDeploy = selectedObject && location && agentName.trim() && !isDeploying && supabase && address;
  const displayLocation = preciseLocation || location;
  const selectedAgent = agentTypes.find(type => type.id === selectedAgentType);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Deploy a GeoAgent
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Configure your AI agent and deploy it at your precise location using RTK-corrected GPS. Other users will be able to see and interact with it through AR.
          </p>
        </motion.div>

        {/* Database Connection Status */}
        {!supabase && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
            role="alert"
            aria-labelledby="database-error-title"
          >
            <div className="flex items-center">
              <Database className="h-5 w-5 text-red-600 mr-2" aria-hidden="true" />
              <div>
                <span id="database-error-title" className="text-red-800 font-medium">Database connection required</span>
                <p className="text-red-700 text-sm mt-1">
                  Please click "Connect to Supabase" in the top right to set up your database connection before deploying GeoAgents.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Wallet Connection Status */}
        {!address && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6"
            role="alert"
            aria-labelledby="wallet-error-title"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wallet className="h-5 w-5 text-orange-600 mr-2" aria-hidden="true" />
                <div>
                  <span id="wallet-error-title" className="text-orange-800 font-medium">Wallet connection required</span>
                  <p className="text-orange-700 text-sm mt-1">
                    You must connect your wallet to deploy GeoAgents. This ensures ownership and prevents spam.
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
                    subtitle: "Connect your wallet to deploy and manage GeoAgents"
                  }}
                  detailsBtn={() => {
                    return (
                      <div style={{ display: 'none' }} aria-hidden="true">
                        Details
                      </div>
                    );
                  }}
                  className="!bg-orange-600 !text-white !rounded-lg !font-medium !px-4 !py-2 !text-sm"
                  style={{
                    background: '#ea580c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    padding: '8px 16px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Configuration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">GeoAgent Configuration</h2>
            
            <div className="space-y-6">
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
                    <ChevronDown className={`h-5 w-5 transition-transform ${showAgentDropdown ? 'rotate-180' : ''} ${
                      !supabase || !address ? 'text-gray-400' : 'text-gray-600'
                    }`} />
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
                  Agent Name
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
                  Description (Optional)
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

              {/* Object Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3D Object Type
                </label>
                <fieldset className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <legend className="sr-only">Select a 3D object type for your agent</legend>
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
                      role="radio"
                      aria-checked={selectedObject === objectType.id}
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
                </fieldset>
              </div>
            </div>
          </motion.div>

          {/* Location & Deployment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Location Data</h2>
            
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
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Timestamp:</span>
                    <span className="text-sm text-gray-900">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  {isLoadingLocation ? 'Getting your location...' : 'Location unavailable'}
                </div>
              )}
              
              {locationError && (
                <div className="mt-2 text-sm text-red-600 flex items-center" role="alert">
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
                  <span className="font-medium text-green-800">RTK Enhanced (For AR Viewer)</span>
                </div>
                <div className="text-sm text-green-700">
                  RTK enhancement will be applied during deployment
                </div>
              </div>
            )}

            {/* Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="font-medium text-blue-800">Status</span>
              </div>
              <div className="text-sm text-blue-700">
                {!address ? 'Please connect your wallet to deploy GeoAgents' :
                 !supabase ? 'Database connection required' :
                 !location ? 'Getting location...' :
                 !agentName.trim() ? 'Enter agent name to continue' :
                 !selectedObject ? 'Select 3D object type' :
                 'Location acquired. Ready to deploy with RTK enhancement.'}
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
              {isLoadingLocation ? 'Getting Location...' : 'Refresh'}
            </button>

            {/* Deploy Button */}
            <motion.button
              onClick={handleDeployObject}
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
                  Deploying GeoAgent...
                </>
              ) : !address ? (
                'Connect Wallet to Deploy'
              ) : !supabase ? (
                'Connect Database to Deploy'
              ) : (
                <>
                  <MapPin className="h-5 w-5 mr-2" />
                  Deploy GeoAgent Here
                </>
              )}
            </motion.button>

            {/* Geodnet RTK Precision Info */}
            <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Crosshair className="h-4 w-4 text-indigo-600 mr-2" />
                <span className="font-medium text-indigo-800">Geodnet RTK Precision</span>
              </div>
              <p className="text-sm text-indigo-700">
                Your GeoAgent will be deployed with centimeter-level accuracy using Geodnet's RTK network. Precise coordinates will be stored in dedicated database columns for accurate AR placement.
              </p>
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
                role="alert"
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

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 bg-white rounded-2xl shadow-xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">How Precise GeoAgent Deployment Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Configure Agent</h4>
              <p className="text-sm text-gray-600">Choose agent type, name, and description for your AI assistant</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Get GPS Location</h4>
              <p className="text-sm text-gray-600">Your device provides approximate GPS coordinates (±10m accuracy)</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">RTK Enhancement</h4>
              <p className="text-sm text-gray-600">GEODNET RTK corrects your location to centimeter precision (±1cm)</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-pink-600 font-bold">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Deploy & Store</h4>
              <p className="text-sm text-gray-600">GeoAgent gets stored with precise coordinates for AR viewing</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeployObject;