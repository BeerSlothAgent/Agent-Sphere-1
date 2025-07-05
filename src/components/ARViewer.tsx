import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Crosshair, AlertCircle, Loader2, Eye, RotateCcw, Info } from 'lucide-react';
import 'aframe';

interface DeployedObject {
  id: string;
  name: string;
  description: string;
  object_type: string;
  user_id: string;
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
  const [arMode, setArMode] = useState<'demo' | 'camera'>('demo');
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
      case 'video-assistant': return '#4f46e5'; // Indigo
      case 'video-tutor': return '#7c3aed'; // Purple  
      case 'video-guide': return '#ec4899'; // Pink
      default: return '#6b7280'; // Gray
    }
  };

  const getObjectEmoji = (objectType: string) => {
    switch (objectType) {
      case 'video-assistant': return '🟦';
      case 'video-tutor': return '🔵';
      case 'video-guide': return '🔺';
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
                  mixin={`${obj.object_type === 'video-assistant' ? 'cube' : obj.object_type === 'video-tutor' ? 'sphere' : 'pyramid'}-mixin`}
                  material={`color: ${color}; metalness: 0.2; roughness: 0.8`}
                  class="clickable-object"
                  data-object-id={obj.id}
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
          <Eye className="h-5 w-5 mr-2 text-indigo-400" />
          <h2 className="text-lg font-bold">AR Viewer</h2>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Active GeoAgents:</span>
            <span className="font-bold text-indigo-400">{objects.length}</span>
          </div>
          
          {userLocation && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Your Location:</span>
              <span className="font-mono text-xs text-green-400">
                {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
              </span>
            </div>
          )}
          
          <div className="pt-2 border-t border-gray-600">
            <p className="text-xs text-gray-400">
              Use mouse to look around, WASD keys to move. Objects are spinning and labeled with their names.
            </p>
          </div>
        </div>
      </div>

      {/* Object List */}
      <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-4 text-white max-w-xs max-h-96 overflow-y-auto">
        <h3 className="text-lg font-bold mb-3 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-purple-400" />
          Nearby GeoAgents
        </h3>
        
        {objects.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">No active GeoAgents found</p>
            <p className="text-gray-500 text-xs mt-1">Deploy some objects first!</p>
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full transition-colors"
          title="Refresh Objects"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        
        <button
          onClick={getCurrentLocation}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition-colors"
          title="Update Location"
        >
          <Crosshair className="h-5 w-5" />
        </button>
      </div>

      {/* Object Details Modal */}
      {selectedObject && (
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
            </div>
            
            <button
              onClick={() => setSelectedObject(null)}
              className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-4 text-white max-w-xs">
        <div className="flex items-center mb-2">
          <Info className="h-4 w-4 mr-2 text-blue-400" />
          <span className="font-medium text-sm">Controls</span>
        </div>
        <div className="text-xs text-gray-300 space-y-1">
          <div>• Mouse: Look around</div>
          <div>• WASD: Move around</div>
          <div>• Click objects: View details</div>
          <div>• Objects spin automatically</div>
        </div>
      </div>
    </div>
  );
};

export default ARViewer;