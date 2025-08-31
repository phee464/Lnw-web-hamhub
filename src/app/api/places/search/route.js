// src/app/api/places/search/route.js
import { NextResponse } from 'next/server';

/**
 * POST body example:
 * {
 *   "origin": "13.7563,100.5018"  // หรือ "Bangkok Thailand"
 *   "destination": "Suvarnabhumi Airport",
 *   "mode": "car" // car | motorcycle | public | walking | bicycling
 *   "language": "th" // optional
 * }
 */

export async function POST(request) {
  try {
    const { origin, destination, mode = 'car', language = 'th' } = await request.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    // ---- API Key (อ่านจากตัวแปร server-side ก่อน)
    const serpApiKey =
      process.env.SERP_API_KEY ||
      process.env.NEXT_PUBLIC_SERP_API_KEY;

    if (!serpApiKey) {
      console.warn('SERP API key not found');
      return NextResponse.json({
        route: fallbackRoute(),
        fallback: true,
        message: 'Missing SERP API key',
      });
    }

    // ---- Map transport mode -> google_maps_directions.travel_mode
    const travelMode = mapTravelMode(mode);

    // ---- Normalize origin/destination หากส่งมาเป็น object {lat, lng}
    const originStr = normalizeLocation(origin);
    const destinationStr = normalizeLocation(destination);

    // ---- เรียก SerpAPI: Google Maps Directions
    // Docs: https://serpapi.com/google-maps-directions
    const params = new URLSearchParams({
      engine: 'google_maps_directions',
      origin: originStr,
      destination: destinationStr,
      travel_mode: travelMode, // driving | walking | bicycling | transit | two_wheeler
      hl: language || 'th',
      api_key: serpApiKey,
      // ปล. บาง region จะรองรับ departure_time, บางที่อาจไม่
      departure_time: 'now',
    });

    const url = `https://serpapi.com/search.json?${params}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // คุณสามารถเพิ่ม cache: 'no-store' หากต้องการไม่ cache
    });

    if (!res.ok) {
      throw new Error(`SerpAPI HTTP ${res.status}`);
    }

    const data = await res.json();

    // โครงสร้างปกติที่คาดหวัง: routes[0].legs[0]...
    const parsed = parseSerpDirections(data);
    if (!parsed) {
      // ไม่มี routes ใน response → ตอบ fallback
      return NextResponse.json({
        route: fallbackRoute(),
        fallback: true,
        message: 'No route found from SerpAPI',
      });
    }

    // ตอบข้อมูลแบบละเอียด
    return NextResponse.json({
      route: parsed.route,
      origin: parsed.origin,
      destination: parsed.destination,
      mode: travelMode,
      source: 'SerpAPI google_maps_directions',
      search_metadata: data.search_metadata || null,
    });
  } catch (err) {
    console.error('Route API error:', err);
    return NextResponse.json({
      route: fallbackRoute(),
      fallback: true,
      error: String(err?.message || err),
    });
  }
}

/* -------------------------- Helpers -------------------------- */

// แปลง mode ของแอป → travel_mode ของ directions
function mapTravelMode(appMode) {
  switch ((appMode || '').toLowerCase()) {
    case 'car':
    case 'driving':
      return 'driving';
    case 'motorcycle':
    case 'bike':
    case 'two_wheeler':
      return 'two_wheeler'; // รองรับใน SerpAPI
    case 'public':
    case 'transit':
      return 'transit';
    case 'walking':
      return 'walking';
    case 'bicycling':
    case 'bicycle':
      return 'bicycling';
    default:
      return 'driving';
  }
}

// รองรับ input เป็น "lat,lng" หรือ object {lat,lng} หรือ string ทั่วไป
function normalizeLocation(loc) {
  if (!loc) return '';
  if (typeof loc === 'string') return loc.trim();
  if (typeof loc === 'object') {
    if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
      return `${loc.lat},${loc.lng}`;
    }
    if (Array.isArray(loc) && loc.length >= 2) {
      return `${loc[0]},${loc[1]}`;
    }
  }
  return String(loc);
}

// ลบ HTML tags จากคำแนะนำ step
function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// แปลง response จาก SerpAPI → โครงสร้าง route ของเรา
function parseSerpDirections(serpJson) {
  // ตัวอย่างโครงสร้าง: serpJson.routes[0].legs[0]
  const routes = Array.isArray(serpJson?.routes) ? serpJson.routes : null;
  if (!routes || routes.length === 0) return null;

  const route0 = routes[0];
  const leg0 = Array.isArray(route0?.legs) && route0.legs.length > 0 ? route0.legs[0] : null;
  if (!leg0) return null;

  // distance/duration (หน่วยจาก Google: meters/seconds)
  const distance = safeNumber(leg0?.distance?.value, 0);
  const duration = safeNumber(leg0?.duration?.value, 0);
  const durationInTraffic = safeNumber(leg0?.duration_in_traffic?.value, 0); // อาจไม่มี

  // steps
  const steps = Array.isArray(leg0.steps)
    ? leg0.steps.map((s, i) => ({
        index: i,
        instruction: stripHtml(s?.html_instructions || ''),
        distance: safeNumber(s?.distance?.value, 0),
        duration: safeNumber(s?.duration?.value, 0),
        maneuver: s?.maneuver || null,
        start_location: s?.start_location || null,
        end_location: s?.end_location || null,
        polyline: s?.polyline?.points || null,
      }))
    : [];

  // polyline รวมเส้นทาง
  const polyline =
    route0?.overview_polyline?.points ||
    leg0?.steps?.map((s) => s?.polyline?.points).filter(Boolean) ||
    null;

  // ที่อยู่/พิกัดต้นทาง–ปลายทาง (ถ้ามี)
  const startAddress = leg0?.start_address || null;
  const endAddress = leg0?.end_address || null;
  const startLocation = leg0?.start_location || null;
  const endLocation = leg0?.end_location || null;

  return {
    origin: startAddress || serpJson?.origin || null,
    destination: endAddress || serpJson?.destination || null,
    route: {
      distance,                  // meters
      duration,                  // seconds
      duration_in_traffic: durationInTraffic || null, // seconds (อาจว่าง)
      steps,                     // array
      polyline,                  // encoded polyline
      start_address: startAddress,
      end_address: endAddress,
      start_location: startLocation,
      end_location: endLocation,
      summary: route0?.summary || null,
      warnings: route0?.warnings || [],
      waypoint_order: route0?.waypoint_order || [],
    },
  };
}

function safeNumber(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

// route fallback เผื่อ API ล้มเหลว
function fallbackRoute() {
  return {
    distance: 15000, // 15 กม.
    duration: 1800,  // 30 นาที
    duration_in_traffic: null,
    steps: [
      { index: 0, instruction: 'เริ่มต้นการเดินทาง', distance: 0, duration: 0 },
      { index: 1, instruction: 'มุ่งหน้าไปยังจุดหมาย', distance: 15000, duration: 1800 },
      { index: 2, instruction: 'ถึงจุดหมายแล้ว', distance: 0, duration: 0 },
    ],
    polyline: null,
    start_address: null,
    end_address: null,
    start_location: null,
    end_location: null,
    summary: null,
    warnings: [],
    waypoint_order: [],
    source: 'Fallback',
  };
}
