import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { origin, destination, mode } = await request.json();
    
    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    const serpApiKey = process.env.NEXT_PUBLIC_SERP_API_KEY;
    
    if (!serpApiKey) {
      console.warn('SERP API key not found');
      return NextResponse.json({
        route: null,
        fallback: true
      });
    }

    // SERP API Google Maps search for route information
    const routeQuery = `directions from ${origin} to ${destination} ${mode || 'driving'}`;
    const serpParams = new URLSearchParams({
      engine: 'google',
      q: routeQuery,
      hl: 'th',
      gl: 'th',
      api_key: serpApiKey
    });

    const serpResponse = await fetch(
      `https://serpapi.com/search.json?${serpParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!serpResponse.ok) {
      throw new Error(`SERP API error: ${serpResponse.status}`);
    }

    const serpData = await serpResponse.json();
    
    // Extract route information from search results
    let routeInfo = null;
    
    // Look for Google Maps directions in organic results
    const organicResults = serpData.organic_results || [];
    const mapsResults = organicResults.filter(result => 
      result.link && (
        result.link.includes('google.com/maps') ||
        result.title.toLowerCase().includes('direction') ||
        result.title.toLowerCase().includes('route')
      )
    );

    if (mapsResults.length > 0) {
      const mapsResult = mapsResults[0];
      
      // Extract duration and distance from snippet
      const snippet = mapsResult.snippet || '';
      const durationMatch = snippet.match(/(\d+)\s*(hour|hr|min|minute)/i);
      const distanceMatch = snippet.match(/(\d+\.?\d*)\s*(km|mile|mi)/i);
      
      let duration = 1800; // Default 30 minutes in seconds
      let distance = 15000; // Default 15km in meters
      
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        if (unit.includes('hour') || unit.includes('hr')) {
          duration = value * 3600;
        } else {
          duration = value * 60;
        }
      }
      
      if (distanceMatch) {
        const value = parseFloat(distanceMatch[1]);
        const unit = distanceMatch[2].toLowerCase();
        if (unit.includes('km')) {
          distance = value * 1000;
        } else if (unit.includes('mile') || unit.includes('mi')) {
          distance = value * 1609.34;
        }
      }

      routeInfo = {
        distance: distance,
        duration: duration,
        steps: extractStepsFromSnippet(snippet),
        source: 'SERP Google Maps'
      };
    }

    // Look for directions in answer box or featured snippet
    if (!routeInfo && serpData.answer_box) {
      const answerBox = serpData.answer_box;
      if (answerBox.type === 'directions' || answerBox.title?.toLowerCase().includes('direction')) {
        // Extract route info from answer box
        const snippet = answerBox.snippet || answerBox.answer || '';
        routeInfo = parseRouteFromText(snippet);
      }
    }

    // Alternative: Use Google Local results to get approximate distances
    if (!routeInfo && serpData.local_results && serpData.local_results.length > 0) {
      // Estimate based on typical Bangkok traffic
      const estimatedDistance = 15000; // 15km default
      const modeMultipliers = {
        car: 1.5, // Factor for traffic
        motorcycle: 1.2,
        public: 2.0,
        driving: 1.5
      };
      
      const multiplier = modeMultipliers[mode] || 1.5;
      routeInfo = {
        distance: estimatedDistance,
        duration: (estimatedDistance / 1000) * 60 * multiplier, // Rough calculation
        steps: [
          { instruction: `เดินทางจาก ${origin}`, distance: 0 },
          { instruction: `ไปยัง ${destination}`, distance: estimatedDistance },
          { instruction: `ถึงจุดหมาย ${destination}`, distance: 0 }
        ],
        source: 'Estimated'
      };
    }

    return NextResponse.json({
      route: routeInfo,
      origin,
      destination,
      mode: mode || 'driving',
      searchQuery: routeQuery
    });

  } catch (error) {
    console.error('Route search error:', error);
    
    // Return fallback route data
    return NextResponse.json({
      route: {
        distance: 15000, // 15km
        duration: 1800,  // 30 minutes
        steps: [
          { instruction: 'เริ่มต้นการเดินทาง', distance: 0 },
          { instruction: 'เดินทางไปยังจุดหมาย', distance: 15000 },
          { instruction: 'ถึงจุดหมายแล้ว', distance: 0 }
        ],
        source: 'Fallback'
      },
      fallback: true
    });
  }
}

// Helper function to extract route steps from text
function extractStepsFromSnippet(text) {
  const steps = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  lines.forEach((line, index) => {
    if (line.includes('→') || line.includes('turn') || line.includes('head') || 
        line.includes('continue') || line.includes('exit')) {
      steps.push({
        instruction: line.trim(),
        distance: 1000 * (index + 1) // Rough estimate
      });
    }
  });
  
  if (steps.length === 0) {
    steps.push({ instruction: 'เดินทางตามเส้นทางที่แนะนำ', distance: 15000 });
  }
  
  return steps;
}

// Helper function to parse route information from text
function parseRouteFromText(text) {
  const durationMatch = text.match(/(\d+)\s*(hour|hr|min|minute)/i);
  const distanceMatch = text.match(/(\d+\.?\d*)\s*(km|mile|mi)/i);
  
  let duration = 1800; // 30 minutes default
  let distance = 15000; // 15km default
  
  if (durationMatch) {
    const value = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    duration = unit.includes('hour') ? value * 3600 : value * 60;
  }
  
  if (distanceMatch) {
    const value = parseFloat(distanceMatch[1]);
    const unit = distanceMatch[2].toLowerCase();
    distance = unit.includes('km') ? value * 1000 : value * 1609.34; // Convert miles to meters
  }
  
  return {
    distance,
    duration,
    steps: extractStepsFromSnippet(text),
    source: 'Parsed from text'
  };
}