const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface LocationRequest {
  latitude: number;
  longitude: number;
}

interface PreciseLocationResponse {
  preciseLatitude: number;
  preciseLongitude: number;
  preciseAltitude?: number;
  accuracy: number;
  correctionApplied: boolean;
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Parse request body
    let requestData: LocationRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { latitude, longitude } = requestData;

    // Validate input
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return new Response(
        JSON.stringify({ error: "Invalid latitude or longitude" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return new Response(
        JSON.stringify({ error: "Latitude or longitude out of valid range" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Simulate RTK correction processing
    // In a real implementation, this would call GEODNET or another RTK service
    const simulateRTKCorrection = (lat: number, lon: number) => {
      // Add small random corrections to simulate RTK precision
      const latCorrection = (Math.random() - 0.5) * 0.00001; // ~1m correction
      const lonCorrection = (Math.random() - 0.5) * 0.00001; // ~1m correction
      
      return {
        preciseLatitude: lat + latCorrection,
        preciseLongitude: lon + lonCorrection,
        preciseAltitude: Math.random() * 100 + 50, // Random altitude between 50-150m
        accuracy: 0.01, // 1cm accuracy
        correctionApplied: true
      };
    };

    // Get precise location (simulated for demo)
    const preciseLocation: PreciseLocationResponse = simulateRTKCorrection(latitude, longitude);

    // Add a small delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return new Response(
      JSON.stringify(preciseLocation),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("Error in get-precise-location function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});