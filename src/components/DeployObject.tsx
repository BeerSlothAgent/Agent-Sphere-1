import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Cuboid as Cube, Circle, Triangle, Check, AlertCircle, Loader2, Database, Crosshair, Wallet } from 'lucide-react';
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
      id: 'cube',
      name: 'Cube',
      icon: <Cube className="w-8 h-8" />,
      description: 'A simple 3D cube object'
    },
    {
      id: 'sphere',
      name: 'Sphere',
      icon: <Circle className="w-8 h-8" />,
      description: 'A smooth spherical object'
    },
    {
      id: 'pyramid',
      name: 'Pyramid',
      icon: <Triangle className="w-8 h-8" />,
      description: 'A triangular pyramid shape'
    }
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

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

  // Generate object name based on type and existing count
  const generateObjectName = async (objectType: string): Promise<string> => {
    if (!supabase) {
      // For demo mode, just use simple numbering
      return `${objectType.charAt(0).toUpperCase() + objectType.slice(1)} 1`;
    }

    try {
      // Get count of existing objects of this type
      const { data, error } = await supabase
        .from('deployed_objects')
        .select('id')
        .eq('object_type', objectType);

      if (error) throw error;

      const count = (data?.length || 0) + 1;
      return `${objectType.charAt(0).toUpperCase() + objectType.slice(1)} ${count}`;
    } catch (error) {
      console.error('Error generating object name:', error);
      // Fallback to simple naming
      return `${objectType.charAt(0).toUpperCase() + objectType.slice(1)} 1`;
    }
  };

  const handleDeployObject = async () => {
    if (!selectedObject || !location) {
      setStatusMessage('Please select an object and ensure location is available');
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
      // Generate object name
      const objectName = await generateObjectName(selectedObject);
      const objectDescription = `A 3D ${selectedObject} object deployed in AR space`;

      // Prepare the data to insert with precise coordinates
      const insertData = {
        user_id: address,
        object_type: selectedObject,
        name: objectName,
        description: objectDescription,
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
        name: objectName,
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
      
      setStatusMessage(`${objectName} deployed successfully ${accuracyText}! AR Viewer can now locate this GeoAgent with precise coordinates.`);
      
      // Reset selection after successful deployment
      setTimeout(() => {
        setSelectedObject(null);
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

  const canDeploy = selectedObject && location && !isDeploying && supabase && address;
  const displayLocation = preciseLocation || location;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Select a 3D object and deploy it at your precise location using RTK-corrected GPS. Other users will be able to see and interact with it through AR.
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
                  modalTitleIconUrl=""
                  welcomeScreen={{
                    title: "Connect to AgentSphere",
                    subtitle: "Connect your wallet to deploy and manage GeoAgents"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Object Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your GeoAgent</h2>
            
            <fieldset className="grid grid-cols-1 gap-4">
              <legend className="sr-only">Select a GeoAgent type to deploy</legend>
              {objectTypes.map((objectType) => (
                <motion.button
                  key={objectType.id}
                  onClick={() => setSelectedObject(objectType.id)}
                  disabled={!supabase || !address}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
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
                  aria-describedby={`${objectType.id}-description`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      !supabase || !address
                        ? 'bg-gray-100 text-gray-400'
                        : selectedObject === objectType.id
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-gray-100 text-gray-600'
                    }`} aria-hidden="true">
                      {objectType.icon}
                    </div>
                    <div className="text-left">
                      <h3 className={`font-semibold ${!supabase || !address ? 'text-gray-400' : 'text-gray-900'}`}>
                        {objectType.name}
                      </h3>
                      <p id={`${objectType.id}-description`} className={`text-sm ${!supabase || !address ? 'text-gray-400' : 'text-gray-600'}`}>
                        {objectType.description}
                      </p>
                    </div>
                    {selectedObject === objectType.id && supabase && address && (
                      <Check className="h-5 w-5 text-indigo-600 ml-auto" aria-hidden="true" />
                    )}
                  </div>
                </motion.button>
              ))}
            </fieldset>
          </motion.div>

          {/* Location & Deployment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Deployment Location</h2>
            
            {/* Location Display */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center mb-3">
                <MapPin className="h-5 w-5 text-indigo-600 mr-2" aria-hidden="true" />
                <span className="font-medium text-gray-900">
                  {preciseLocation?.correctionApplied ? 'RTK-Corrected Location' : 'GPS Location'}
                </span>
                {isLoadingLocation && (
                  <Loader2 className="h-4 w-4 text-indigo-600 ml-2 animate-spin" aria-hidden="true" />
                )}
                {preciseLocation?.correctionApplied && (
                  <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    RTK Enhanced
                  </div>
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
                  {preciseLocation?.preciseAltitude && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Altitude:</span>
                      <span className="text-sm text-gray-900">
                        {preciseLocation.preciseAltitude.toFixed(2)}m
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  {isLoadingLocation ? 'Getting your location...' : 'Location unavailable'}
                </div>
              )}
              
              {locationError && (
                <div className="mt-2 text-sm text-red-600 flex items-center" role="alert">
                  <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                  {locationError}
                </div>
              )}
            </div>

            {/* Get Precise Location Button */}
            {location && !preciseLocation && supabase && address && (
              <button
                onClick={getPreciseLocation}
                disabled={isGettingPreciseLocation}
                className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                aria-describedby="rtk-status"
              >
                {isGettingPreciseLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                    Getting RTK Precision...
                  </>
                ) : (
                  <>
                    <Crosshair className="h-4 w-4 mr-2" aria-hidden="true" />
                    Get RTK-Enhanced Location
                  </>
                )}
              </button>
            )}
            <span id="rtk-status" className="sr-only">
              {isGettingPreciseLocation ? "Getting precise location data" : "RTK enhancement available"}
            </span>

            {/* Refresh Location Button */}
            <button
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-describedby="location-status"
            >
              {isLoadingLocation ? 'Getting Location...' : 'Refresh Location'}
            </button>
            <span id="location-status" className="sr-only">
              {isLoadingLocation ? "Getting current location" : "Location ready"}
            </span>

            {/* Deploy Button */}
            <motion.button
              onClick={handleDeployObject}
              disabled={!canDeploy}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-200 ${
                canDeploy
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
              whileHover={canDeploy ? { scale: 1.02 } : {}}
              whileTap={canDeploy ? { scale: 0.98 } : {}}
              aria-describedby="deploy-status"
            >
              {isDeploying ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" aria-hidden="true" />
                  Deploying GeoAgent...
                </span>
              ) : !address ? (
                'Connect Wallet to Deploy'
              ) : !supabase ? (
                'Connect Database to Deploy'
              ) : (
                'Deploy GeoAgent Here'
              )}
            </motion.button>
            <span id="deploy-status" className="sr-only">
              {isDeploying ? "Deploying GeoAgent" : canDeploy ? "Ready to deploy" : "Cannot deploy - missing requirements"}
            </span>

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
                  <Check className="h-5 w-5 mr-2" aria-hidden="true" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" aria-hidden="true" />
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
                <span className="text-indigo-600 font-bold" aria-hidden="true">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Connect Wallet</h4>
              <p className="text-sm text-gray-600">Connect your wallet to prove ownership and prevent spam deployments</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold" aria-hidden="true">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Get GPS Location</h4>
              <p className="text-sm text-gray-600">Your device provides approximate GPS coordinates (±10m accuracy)</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold" aria-hidden="true">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">RTK Enhancement</h4>
              <p className="text-sm text-gray-600">GEODNET RTK corrects your location to centimeter precision (±1cm)</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-pink-600 font-bold" aria-hidden="true">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Deploy & Store</h4>
              <p className="text-sm text-gray-600">GeoAgent gets auto-named and stored with precise coordinates for AR viewing</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeployObject;