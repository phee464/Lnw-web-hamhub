'use client';

import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { useDarkMode } from '@/lib/DarkModeContext';


const popularDestinations = [
  { name: 'สยามพารากอน', category: 'ห้างสรรพสินค้า', icon: '🛍️', lat: 13.7463, lng: 100.5340 },
  { name: 'เซ็นทรัลเวิลด์', category: 'ห้างสรรพสินค้า', icon: '🛍️', lat: 13.7474, lng: 100.5398 },
  { name: 'ไอคอนสยาม', category: 'ห้างสรรพสินค้า', icon: '🛍️', lat: 13.7264, lng: 100.5104 },
  { name: 'สนามบินสุวรรณภูมิ', category: 'สนามบิน', icon: '✈️', lat: 13.6900, lng: 100.7501 },
  { name: 'สนามบินดอนเมือง', category: 'สนามบิน', icon: '✈️', lat: 14.1384, lng: 100.6169 },
  { name: 'สถานีกลางกรุงเทพอภิวัฒน์', category: 'สถานีรถไฟ', icon: '🚆', lat: 13.7367, lng: 100.5448 },
  { name: 'จตุจักร', category: 'ตลาด', icon: '🛒', lat: 13.7998, lng: 100.5506 },
  { name: 'ท่าอากาศยานสุวรรณภูมิ ARL', category: 'สถานีรถไฟฟ้า', icon: '🚅', lat: 13.6956, lng: 100.7516 },
];


// --- Brand SVGs (inline, no dependency) ---
const GrabSVG = ({ size = 36, className = "", ...props }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    className={className}
    role="img"
    aria-label="Grab"
    {...props}
  >
    <rect width="256" height="256" rx="56" fill="#00B14F" />
    {/* รูปตัว G แบบมินิมอล */}
    <circle cx="128" cy="128" r="64" fill="none" stroke="#fff" strokeWidth="24" strokeLinecap="round" />
    <line x1="128" y1="128" x2="176" y2="128" stroke="#fff" strokeWidth="24" strokeLinecap="round" />
  </svg>
);

const BoltSVG = ({ size = 36, className = "", ...props }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    className={className}
    role="img"
    aria-label="Bolt"
    {...props}
  >
    <rect width="256" height="256" rx="56" fill="#00D775" />
    {/* สายฟ้า */}
    <path
      d="M140 56 L116 120 H156 L116 200 L128 140 H92 Z"
      fill="#fff"
    />
  </svg>
);

const LinemanSVG = ({ size = 36, className = "", ...props }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    className={className}
    role="img"
    aria-label="LINE MAN"
    {...props}
  >
    <rect width="256" height="256" rx="56" fill="#d4ddd8" />
    {/* ตัว M แบบซ้อน */}
    <path
      fill="#fff"
      d="M72 192V64h32l24 40 24-40h32v128h-24V104l-32 48-32-48v88z"
    />
  </svg>
);


const transportData = {
  car: { 
    name: 'รถยนต์ส่วนตัว', 
    icon: '🚗', 
    baseSpeed: 20, 
    trafficFactor: 0.5,
    rainFactor: 0.7, 
    cost: { base: 8, perKm: 3.5 }, 
    reliability: 0.85 
  },
  motorcycle: { 
    name: 'มอเตอร์ไซค์', 
    icon: '🏍️', 
    baseSpeed: 25,
    trafficFactor: 0.75, // รถมอไซค์หลบรถติดได้ดีกว่า
    rainFactor: 0.5, // อันตรายมากเวลาฝนตก
    cost: { base: 5, perKm: 1.5 },
    reliability: 0.75 
  },
  public: { 
    name: 'รถสาธารณะ', 
    icon: '🚌', 
    baseSpeed: 15, // รวมเวลารอ + เดิน
    trafficFactor: 0.8, // มีเลนเฉพาะบางส่วน
    rainFactor: 0.9, // ไม่กระทบมาก
    cost: { base: 0, perKm: 1.2 },
    reliability: 0.9 
  },
  bts_mrt: { 
    name: 'BTS/MRT', 
    icon: '🚇', 
    baseSpeed: 35, // รวมเวลาเดิน + รอ
    trafficFactor: 1.0, // ไม่กระทบจราจร
    rainFactor: 0.95, // กระทบเล็กน้อยจากฝน
    cost: { base: 0, perKm: 2.5 },
    reliability: 0.95 
  }
};

const rideApps = {
  grab: { 
    name: '',
    logoUrl: 'https://cdn.worldvectorlogo.com/logos/grab-2.svg',
    color: 'bg-green-600 hover:bg-green-700',
    baseRate: { car: 1.2, motorcycle: 1.0 },
    surgeRate: 1.5,
    url: 'https://grab.com/th/transport/'
  },
  bolt: { 
    name: '',
    logoUrl: 'https://cdn.worldvectorlogo.com/logos/bolt-1.svg',
    color: 'bg-orange-500 hover:bg-orange-600',
    baseRate: { car: 1.0, motorcycle: 0.8 },
    surgeRate: 1.3,
    url: 'https://bolt.eu/th/'
  },
  line: { 
    name: '',
    logoUrl: 'https://images.seeklogo.com/logo-png/41/2/line-man-icon-logo-png_seeklogo-412076.png',
    color: 'bg-teal-500 hover:bg-teal-600',
    baseRate: { car: 1.1, motorcycle: 0.9 },
    surgeRate: 1.4,
    url: 'https://lineman.line.me/'
  },
};

// เพิ่มข้อมูล Traffic zones ของกรุงเทพฯ
const trafficZones = [
  { name: 'ศูนย์กลางธุรกิจ (สีลม-สาทร)', multiplier: 2.0, area: { lat: [13.72, 13.73], lng: [100.52, 100.54] } },
  { name: 'ย่านช้อปปิ้ง (สยาม-ราชประสงค์)', multiplier: 1.8, area: { lat: [13.74, 13.75], lng: [100.53, 100.55] } },
  { name: 'ย่านการค้า (ประตูน้ำ-ราชเทวี)', multiplier: 1.6, area: { lat: [13.75, 13.76], lng: [100.53, 100.54] } },
  { name: 'ถนนสุขุมวิท', multiplier: 1.7, area: { lat: [13.72, 13.78], lng: [100.55, 100.65] } },
  { name: 'ถนนพหลโยธิน', multiplier: 1.5, area: { lat: [13.76, 13.85], lng: [100.52, 100.56] } },
];

const SmartDepartApp = () => {
  const { isDarkMode } = useDarkMode();
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [arrivalTime, setArrivalTime] = useState('09:00');
  const [transportMode, setTransportMode] = useState('car');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [routeResult, setRouteResult] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [realTimeWeather, setRealTimeWeather] = useState(null);
  const [realTimeTraffic, setRealTimeTraffic] = useState(null);

  const suggestionRef = useRef(null);
  const inputRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const routeControlRef = useRef(null);


  const fetchWeatherData = async (lat, lng) => {
    try {
      // ใช้ OpenWeatherMap API (ต้องสมัคร API key ฟรี)
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!API_KEY) {
        console.warn('OpenWeatherMap API key not found');
        return mockWeatherData();
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric&lang=th`
      );
      
      if (response.ok) {
        const data = await response.json();
        return {
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          condition: data.weather[0].main,
          description: data.weather[0].description,
          windSpeed: data.wind.speed,
          visibility: data.visibility / 1000, // convert to km
          isRaining: ['Rain', 'Drizzle', 'Thunderstorm'].includes(data.weather[0].main),
          rainLevel: data.rain?.['1h'] || 0, // mm in last hour
          icon: data.weather[0].icon
        };
      }
    } catch (error) {
      console.error('Weather API error:', error);
    }
    
    return mockWeatherData();
  };

  const mockWeatherData = () => {
    const conditions = ['Clear', 'Clouds', 'Rain', 'Haze'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    return {
      temperature: 28 + Math.random() * 10,
      humidity: 60 + Math.random() * 30,
      condition: condition,
      description: condition === 'Rain' ? 'ฝนปานกลาง' : 'อากาศปกติ',
      windSpeed: Math.random() * 5,
      visibility: 8 + Math.random() * 2,
      isRaining: condition === 'Rain',
      rainLevel: condition === 'Rain' ? Math.random() * 5 : 0
    };
  };

  // ========================
  // 2. Real Distance Calculation
  // ========================
  const calculateRealDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // ========================
  // 3. Traffic Analysis
  // ========================
  const analyzeTrafficZones = (startLat, startLng, endLat, endLng) => {
    const affectedZones = [];
    const currentHour = new Date().getHours();
    
    // Check if route passes through high traffic zones
    trafficZones.forEach(zone => {
      const inZone = (
        (startLat >= zone.area.lat[0] && startLat <= zone.area.lat[1] &&
         startLng >= zone.area.lng[0] && startLng <= zone.area.lng[1]) ||
        (endLat >= zone.area.lat[0] && endLat <= zone.area.lat[1] &&
         endLng >= zone.area.lng[0] && endLng <= zone.area.lng[1])
      );
      
      if (inZone) {
        let multiplier = zone.multiplier;
        
        // Increase multiplier during rush hours
        if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19)) {
          multiplier *= 1.5;
        }
        
        affectedZones.push({
          name: zone.name,
          multiplier: multiplier,
          severity: multiplier >= 2.5 ? 'สูงมาก' : multiplier >= 1.8 ? 'สูง' : multiplier >= 1.4 ? 'ปานกลาง' : 'ต่ำ'
        });
      }
    });
    
    return affectedZones;
  };

  // ========================
  // 4. Enhanced Travel Time Calculation
  // ========================
  const calculateEnhancedTravelTime = async (startCoords, endCoords, mode, weather) => {
    const distance = calculateRealDistance(startCoords.lat, startCoords.lng, endCoords.lat, endCoords.lng);
    const transport = transportData[mode];
    const trafficZones = analyzeTrafficZones(startCoords.lat, startCoords.lng, endCoords.lat, endCoords.lng);
    
    let baseTime = (distance / transport.baseSpeed) * 60; // minutes
    
    // Apply traffic factor
    const avgTrafficMultiplier = trafficZones.length > 0 
      ? trafficZones.reduce((sum, zone) => sum + zone.multiplier, 0) / trafficZones.length
      : 1;
    
    baseTime = baseTime / (transport.trafficFactor * (2 - avgTrafficMultiplier));
    
    // Apply weather factor
    if (weather?.isRaining) {
      baseTime = baseTime / transport.rainFactor;
    }
    
    // Add buffer for walking/waiting time for public transport
    if (mode === 'public' || mode === 'bts_mrt') {
      baseTime += 15; // 15 minutes buffer for waiting + walking
    }
    
    const costEstimate = transport.cost.base + (transport.cost.perKm * distance);
    
    return {
      time: Math.round(baseTime),
      distance: Math.round(distance * 100) / 100,
      cost: Math.round(costEstimate),
      trafficZones: trafficZones,
      reliability: transport.reliability
    };
  };

  // ========================
  // 5. Enhanced Location Search with Real APIs
  // ========================
  const searchPlacesEnhanced = async (query) => {
    if (!query) {
      setSuggestions(popularDestinations);
      return;
    }
    
    setSearchLoading(true);
    try {
      // Try Google Places API first (if available)
      const googleResponse = await fetch('/api/places/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, country: 'TH', language: 'th' }),
      });
      
      if (googleResponse.ok) {
        const data = await googleResponse.json();
        const formattedSuggestions = data.predictions.map(p => ({
          name: p.description,
          category: p.types?.[0]?.replace(/_/g, ' ') || 'สถานที่',
          icon: getLocationIcon(p.types),
          placeId: p.place_id
        }));
        setSuggestions(formattedSuggestions);
        return;
      }

      // Fallback to Nominatim
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=th&limit=10&addressdetails=1&accept-language=th`,
        {
          headers: {
            'User-Agent': 'SmartDepartApp/1.0'
          }
        }
      );
      
      if (nominatimResponse.ok) {
        const data = await nominatimResponse.json();
        const formattedSuggestions = data.map(item => ({
          name: item.display_name.split(',')[0],
          category: item.type || 'สถานที่',
          icon: getLocationIcon([item.type]),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          fullAddress: item.display_name
        }));
        setSuggestions(formattedSuggestions);
      }
      
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to popular destinations
      setSuggestions(popularDestinations.filter(dest => 
        dest.name.toLowerCase().includes(query.toLowerCase())
      ));
    } finally {
      setSearchLoading(false);
    }
  };

  const getLocationIcon = (types) => {
    if (!types || !Array.isArray(types)) return '📍';
    
    const iconMap = {
      'shopping_mall': '🛍️',
      'airport': '✈️',
      'train_station': '🚆',
      'subway_station': '🚇',
      'bus_station': '🚌',
      'hospital': '🏥',
      'school': '🏫',
      'university': '🎓',
      'bank': '🏦',
      'restaurant': '🍽️',
      'hotel': '🏨',
      'gas_station': '⛽',
      'park': '🌳',
      'tourist_attraction': '🗺️'
    };
    
    for (const type of types) {
      if (iconMap[type]) return iconMap[type];
    }
    return '📍';
  };

  // ========================
  // 6. Enhanced Route Calculation
  // ========================
  const calculateEnhancedRoute = async () => {
    if (!destination.trim() || !arrivalTime || !currentLocation) {
      showAlert('ข้อมูลไม่ครบ', 'กรุณากรอกจุดหมาย เวลา และอนุญาตการเข้าถึงตำแหน่ง', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      // Get destination coordinates
      let endCoords = destinationCoords;
      if (!endCoords) {
        // Try to geocode the destination
        const geocodeResult = await geocodeDestination(destination);
        if (geocodeResult) {
          endCoords = geocodeResult;
          setDestinationCoords(geocodeResult);
        } else {
          throw new Error('ไม่สามารถหาตำแหน่งจุดหมายได้');
        }
      }
      
      // Fetch real-time data
      const [weather, travelData] = await Promise.all([
        fetchWeatherData(currentLocation.lat, currentLocation.lng),
        calculateEnhancedTravelTime(currentLocation, endCoords, transportMode, null)
      ]);
      
      // Update weather after getting data
      const updatedTravelData = await calculateEnhancedTravelTime(currentLocation, endCoords, transportMode, weather);
      
      // Calculate departure time
      const [hours, minutes] = arrivalTime.split(':').map(Number);
      const arrivalDateTime = new Date();
      arrivalDateTime.setHours(hours, minutes, 0, 0);
      
      // Smart buffer calculation based on reliability and conditions
      let bufferTime = Math.round(updatedTravelData.time * (1 - updatedTravelData.reliability) * 0.5);
      
      // Add weather buffer
      if (weather.isRaining) {
        bufferTime += Math.round(weather.rainLevel * 2);
      }
      
      // Add traffic buffer
      if (updatedTravelData.trafficZones.length > 0) {
        const avgSeverity = updatedTravelData.trafficZones.reduce((sum, zone) => 
          sum + (zone.severity === 'สูงมาก' ? 4 : zone.severity === 'สูง' ? 3 : zone.severity === 'ปานกลาง' ? 2 : 1), 0
        ) / updatedTravelData.trafficZones.length;
        bufferTime += Math.round(avgSeverity * 3);
      }
      
      bufferTime = Math.max(bufferTime, 5); // Minimum 5 minutes buffer
      bufferTime = Math.min(bufferTime, 30); // Maximum 30 minutes buffer
      
      const totalTime = updatedTravelData.time + bufferTime;
      const departureDateTime = new Date(arrivalDateTime.getTime() - (totalTime * 60 * 1000));
      
      // Risk assessment
      const risk = assessEnhancedRisk(weather, updatedTravelData, transportMode);
      
      const result = {
        destination: destination.trim(),
        destinationCoords: endCoords,
        arrivalTime,
        departureTime: departureDateTime.toTimeString().slice(0, 5),
        travelTime: updatedTravelData.time,
        bufferTime,
        totalTime,
        distance: updatedTravelData.distance,
        cost: updatedTravelData.cost,
        weather,
        trafficZones: updatedTravelData.trafficZones,
        risk,
        transport: transportData[transportMode],
        reliability: updatedTravelData.reliability,
        calculatedAt: new Date().toLocaleString('th-TH')
      };

      setRouteResult(result);
      setRealTimeWeather(weather);
      
      // Update map with route
      updateMapWithRoute(currentLocation, endCoords, result);
      
      // Show success alert
      const urgency = totalTime <= 30 ? 'เร่งด่วน!' : totalTime <= 60 ? 'ควรเตรียมตัว' : 'พร้อมแล้ว';
      const icon = totalTime <= 30 ? 'warning' : 'success';
      
      Swal.fire({
        title: `${urgency} 🎯`,
        html: `<div style="text-align: left;">
          <strong>📍 จุดหมาย:</strong> ${result.destination}<br>
          <strong>📏 ระยะทาง:</strong> ${result.distance} กม.<br>
          <strong>⏰ ควรออกเดินทาง:</strong> ${result.departureTime}<br>
          <strong>🚗 ใช้เวลา:</strong> ${result.travelTime} นาที (+ ${result.bufferTime} นาทีสำรอง)<br>
          <strong>💰 ค่าใช้จ่าย:</strong> ~${result.cost} บาท<br>
          <strong>⚠️ ความเสี่ยง:</strong> ${result.risk.level}
        </div>`,
        icon: icon,
        background: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
      });
      
    } catch (error) {
      console.error("Enhanced route calculation error:", error);
      showAlert('เกิดข้อผิดพลาด', error.message || 'ไม่สามารถคำนวณได้ กรุณาลองใหม่', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // 7. Enhanced Risk Assessment
  // ========================
  const assessEnhancedRisk = (weather, travelData, mode) => {
    let riskScore = 0;
    const riskFactors = [];
    
    // Weather risk
    if (weather.isRaining) {
      const rainRisk = weather.rainLevel > 5 ? 3 : weather.rainLevel > 2 ? 2 : 1;
      riskScore += rainRisk;
      riskFactors.push(`🌧️ ฝน ${weather.rainLevel.toFixed(1)}mm/ชั่วโมง`);
      
      if (mode === 'motorcycle') {
        riskScore += 2; // Extra risk for motorcycles in rain
        riskFactors.push('⚠️ มอเตอร์ไซค์ในสายฝน');
      }
    }
    
    // Traffic risk
    if (travelData.trafficZones.length > 0) {
      const trafficRisk = travelData.trafficZones.reduce((max, zone) => {
        const zoneRisk = zone.severity === 'สูงมาก' ? 4 : zone.severity === 'สูง' ? 3 : zone.severity === 'ปานกลาง' ? 2 : 1;
        return Math.max(max, zoneRisk);
      }, 0);
      riskScore += trafficRisk;
      riskFactors.push(`🚦 ${travelData.trafficZones[0].name}`);
    }
    
    // Time pressure risk
    const currentTime = new Date();
    const arrivalParts = routeResult?.arrivalTime?.split(':') || ['09', '00'];
    const targetTime = new Date();
    targetTime.setHours(parseInt(arrivalParts[0]), parseInt(arrivalParts[1]), 0, 0);
    const timeUntilTarget = (targetTime.getTime() - currentTime.getTime()) / (1000 * 60); // minutes
    
    if (timeUntilTarget < travelData.time + 15) {
      riskScore += 3;
      riskFactors.push('⏰ เวลาเหลือน้อย');
    }
    
    // Reliability risk
    if (travelData.reliability < 0.8) {
      riskScore += 2;
      riskFactors.push('📊 ความน่าเชื่อถือต่ำ');
    }
    
    // Distance risk for certain modes
    if (mode === 'motorcycle' && travelData.distance > 20) {
      riskScore += 1;
      riskFactors.push('🏍️ ระยะทางไกล');
    }
    
    let level, color;
    if (riskScore >= 8) {
      level = 'อันตรายสูง';
      color = isDarkMode ? 'text-red-400 bg-red-900/30 border-red-500/50' : 'text-red-800 bg-red-100 border-red-300';
    } else if (riskScore >= 5) {
      level = 'ควรระวัง';
      color = isDarkMode ? 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50' : 'text-yellow-700 bg-yellow-50 border-yellow-200';
    } else if (riskScore >= 3) {
      level = 'ปานกลาง';
      color = isDarkMode ? 'text-orange-400 bg-orange-900/30 border-orange-500/50' : 'text-orange-700 bg-orange-50 border-orange-200';
    } else {
      level = 'ปลอดภัย';
      color = isDarkMode ? 'text-green-400 bg-green-900/30 border-green-500/50' : 'text-green-700 bg-green-50 border-green-200';
    }
    
    return { level, color, factors: riskFactors, score: riskScore };
  };

  // ========================
  // 8. Geocoding Function
  // ========================
  const geocodeDestination = async (address) => {
    try {
      // Try popular destinations first
      const popular = popularDestinations.find(dest => 
        dest.name.toLowerCase().includes(address.toLowerCase())
      );
      if (popular && popular.lat && popular.lng) {
        return { lat: popular.lat, lng: popular.lng, name: popular.name };
      }
      
      // Use Nominatim for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=th&limit=1&addressdetails=1`,
        {
          headers: { 'User-Agent': 'SmartDepartApp/1.0' }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            name: data[0].display_name
          };
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  };

  // ========================
  // 9. Enhanced Map Functions
  // ========================
  const updateMapWithRoute = async (start, end, routeData) => {
    if (!mapInstanceRef.current || !window.L) return;
    
    try {
      // Clear existing route
      if (routeControlRef.current) {
        mapInstanceRef.current.removeControl(routeControlRef.current);
      }
      
      // Create route using Leaflet Routing Machine (if available)
      if (window.L.Routing) {
        routeControlRef.current = window.L.Routing.control({
          waypoints: [
            window.L.latLng(start.lat, start.lng),
            window.L.latLng(end.lat, end.lng)
          ],
          routeWhileDragging: false,
          addWaypoints: false,
          createMarker: function(i, waypoint, n) {
            const icon = i === 0 ? '🚩' : '🎯';
            const title = i === 0 ? 'จุดเริ่มต้น' : 'จุดหมาย';
            return window.L.marker(waypoint.latLng, {
              title: title
            }).bindPopup(`${icon} ${title}`);
          }
        }).addTo(mapInstanceRef.current);
      } else {
        // Fallback: Simple markers and line
        const bounds = window.L.latLngBounds([start.lat, start.lng], [end.lat, end.lng]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
        
        // Add markers
        window.L.marker([start.lat, start.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup('🚩 จุดเริ่มต้น');
          
        window.L.marker([end.lat, end.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup('🎯 จุดหมาย');
          
        // Add simple line
        window.L.polyline([[start.lat, start.lng], [end.lat, end.lng]], {
          color: 'blue',
          weight: 4,
          opacity: 0.7
        }).addTo(mapInstanceRef.current);
      }
      
    } catch (error) {
      console.error('Map route update error:', error);
    }
  };

  // ========================
  // 10. Enhanced Current Location
  // ========================
  const getCurrentLocationEnhanced = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      showAlert('ไม่รองรับ', 'เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง', 'error');
      setLocationLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const locationData = { lat: latitude, lng: longitude, accuracy };

        // Get detailed address
        const details = await getEnhancedLocationDetails(locationData);
        
        const finalLocationData = {
          ...locationData,
          address: details?.address || 'ไม่ทราบชื่อสถานที่',
          district: details?.district || '',
          province: details?.province || 'กรุงเทพมหานคร',
          displayAddress: details?.displayAddress || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        };

        setCurrentLocation(finalLocationData);

        // Update map
        if (mapInstanceRef.current && window.L) {
          const latLng = [latitude, longitude];
          mapInstanceRef.current.setView(latLng, 16);
          
          // Clear existing markers
          if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current);
          }
          
          // Add accuracy circle
          const accuracyCircle = window.L.circle(latLng, {
            radius: accuracy,
            color: 'blue',
            fillColor: 'lightblue',
            fillOpacity: 0.2,
            weight: 2
          }).addTo(mapInstanceRef.current);
          
          markerRef.current = window.L.marker(latLng, {
            icon: window.L.divIcon({
              html: '📍',
              className: 'emoji-icon',
              iconSize: [20, 20]
            })
          })
            .addTo(mapInstanceRef.current)
            .bindPopup(`<b>คุณอยู่ที่:</b><br>${finalLocationData.displayAddress}<br><small>ความแม่นยำ: ±${Math.round(accuracy)} เมตร</small>`)
            .openPopup();
        }

        showAlert('อัปเดตตำแหน่งสำเร็จ! 📍', `${finalLocationData.district} ${finalLocationData.province}`, 'success');
        setLocationLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = 'ไม่ทราบสาเหตุ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'ผู้ใช้ปฏิเสธการเข้าถึงตำแหน่ง';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'ไม่สามารถระบุตำแหน่งได้';
            break;
          case error.TIMEOUT:
            errorMessage = 'หมดเวลาในการระบุตำแหน่ง';
            break;
        }
        
        showAlert('ระบุตำแหน่งไม่ได้', errorMessage, 'error');
        setLocationLoading(false);
      },
      options
    );
  };

  const getEnhancedLocationDetails = async (coordinates) => {
    try {
      const { lat, lng } = coordinates;
      
      // Use Nominatim for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=th`,
        {
          headers: {
            'User-Agent': 'SmartDepartApp/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data && data.address) {
          const addr = data.address;
          return {
            address: data.display_name || 'ไม่ทราบชื่อสถานที่',
            district: addr.suburb || addr.neighbourhood || addr.quarter || '',
            province: addr.state || addr.province || 'กรุงเทพมหานคร',
            displayAddress: `${addr.road || ''} ${addr.suburb || ''} ${addr.state || ''}`.trim() || data.display_name
          };
        }
      }
      
    } catch (error) {
      console.error('Enhanced location details error:', error);
    }
    
    return {
      address: `ละติจูด: ${coordinates.lat.toFixed(6)}, ลองจิจูด: ${coordinates.lng.toFixed(6)}`,
      district: '',
      province: 'ไม่สามารถระบุได้',
      displayAddress: `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`
    };
  };

  // ========================
  // 11. Enhanced Ride Price Calculation
  // ========================
  const calculateEnhancedRidePrice = (appKey, type = 'car', distance = 0) => {
    const app = rideApps[appKey];
    if (!app || !routeResult) return 'N/A';
    
    const actualDistance = routeResult.distance || distance;
    let basePrice = 40; // Base fare
    let perKmRate = type === 'car' ? 8 : 5; // Per km rate
    
    // Apply app multiplier
    const multiplier = app.baseRate[type] || 1;
    basePrice *= multiplier;
    perKmRate *= multiplier;
    
    let totalPrice = basePrice + (perKmRate * actualDistance);
    
    // Apply surge pricing during rush hours
    const hour = new Date().getHours();
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    const isWeekend = [0, 6].includes(new Date().getDay());
    
    if (isRushHour && !isWeekend) {
      totalPrice *= app.surgeRate;
    }
    
    // Weather surge
    if (realTimeWeather?.isRaining) {
      totalPrice *= 1.2;
    }
    
    // Traffic surge
    if (routeResult?.trafficZones?.length > 0) {
      const hasHighTraffic = routeResult.trafficZones.some(zone => 
        zone.severity === 'สูงมาก' || zone.severity === 'สูง'
      );
      if (hasHighTraffic) {
        totalPrice *= 1.15;
      }
    }
    
    const minPrice = Math.round(totalPrice * 0.8);
    const maxPrice = Math.round(totalPrice * 1.2);
    
    let priceText = `${minPrice}-${maxPrice} บาท`;
    if (isRushHour) priceText += ' (Surge)';
    if (realTimeWeather?.isRaining) priceText += ' ☔';
    
    return priceText;
  };

  // ========================
  // 12. Enhanced Suggestion Selection
  // ========================
  const selectSuggestionEnhanced = async (suggestion) => {
    setDestination(suggestion.name);
    setShowSuggestions(false);
    
    // Set coordinates if available
    if (suggestion.lat && suggestion.lng) {
      setDestinationCoords({ lat: suggestion.lat, lng: suggestion.lng });
      
      // Update map to show destination
      if (mapInstanceRef.current && window.L) {
        const latLng = [suggestion.lat, suggestion.lng];
        mapInstanceRef.current.setView(latLng, 14);
        
        // Add temporary marker
        const tempMarker = window.L.marker(latLng, {
          icon: window.L.divIcon({
            html: '🎯',
            className: 'emoji-icon',
            iconSize: [25, 25]
          })
        })
          .addTo(mapInstanceRef.current)
          .bindPopup(`🎯 ${suggestion.name}`)
          .openPopup();
          
        // Remove marker after 3 seconds
        setTimeout(() => {
          if (tempMarker) {
            mapInstanceRef.current.removeLayer(tempMarker);
          }
        }, 3000);
      }
    } else if (suggestion.placeId) {
      // Fetch detailed place information
      try {
        const response = await fetch('/api/places/details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ placeId: suggestion.placeId }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.result?.geometry?.location) {
            setDestinationCoords({
              lat: data.result.geometry.location.lat,
              lng: data.result.geometry.location.lng
            });
          }
        }
      } catch (error) {
        console.error('Place details error:', error);
      }
    }
  };

  // ========================
  // Initialize and Event Handlers
  // ========================
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .swal2-popup.swal2-toast {
        background: ${isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)'} !important;
        color: ${isDarkMode ? '#e2e8f0' : '#1e293b'} !important;
        backdrop-filter: blur(10px);
        border: 1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(226, 232, 240, 0.5)'};
      }
      .emoji-icon {
        text-align: center;
        font-size: 20px;
        background: none !important;
        border: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [isDarkMode]);

  useEffect(() => {
    const initializeEnhancedMap = () => {
      if (typeof window !== 'undefined' && window.L && mapContainerRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = window.L.map(mapContainerRef.current).setView([13.7563, 100.5018], 11);
        
        // Add multiple tile layer options
        const osmLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        });
        
        const cartoDarkLayer = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CARTO'
        });
        
        // Use appropriate layer based on dark mode
        const activeLayer = isDarkMode ? cartoDarkLayer : osmLayer;
        activeLayer.addTo(mapInstanceRef.current);
        
        // Add layer control
        const baseLayers = {
          'แผนที่มาตรฐาน': osmLayer,
          'แผนที่โหมดมืด': cartoDarkLayer
        };
        
        window.L.control.layers(baseLayers).addTo(mapInstanceRef.current);
        
        // Add scale control
        window.L.control.scale().addTo(mapInstanceRef.current);
      }
    };

    if (window.L) {
      initializeEnhancedMap();
    } else {
      const checkLeaflet = setInterval(() => {
        if (window.L) {
          clearInterval(checkLeaflet);
          initializeEnhancedMap();
        }
      }, 100);
    }

    getCurrentLocationEnhanced();
    
    // Set default arrival time to 1 hour from now
    const now = new Date();
    now.setHours(now.getHours() + 1);
    setArrivalTime(now.toTimeString().slice(0, 5));

    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isDarkMode]);

  const showAlert = (title, text, icon, toast = true) => {
    if (toast) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: icon,
        title: title,
        text: text,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } else {
      Swal.fire({
        title: title,
        html: text,
        icon: icon,
        confirmButtonText: 'ตกลง',
        background: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
      });
    }
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    setDestinationCoords(null); // Reset coordinates when typing
    setShowSuggestions(true);
    
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      searchPlacesEnhanced(value);
    }, 300);
  };

  const openEnhancedGoogleMaps = async () => {
    if (!currentLocation || !destination.trim()) {
      showAlert('ข้อมูลไม่ครบ', 'ต้องมีตำแหน่งปัจจุบันและจุดหมาย', 'warning');
      return;
    }
    
    const result = await Swal.fire({
      title: 'เปิด Google Maps 🗺️',
      html: `<div style="text-align: left;">
        <strong>🚩 จาก:</strong> ${currentLocation.displayAddress}<br>
        <strong>🎯 ไป:</strong> ${destination}<br>
        <strong>🚗 ระยะทาง:</strong> ${routeResult?.distance || 'N/A'} กม.<br>
        <strong>⏱️ เวลาประมาณ:</strong> ${routeResult?.travelTime || 'N/A'} นาที
      </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '🗺️ เปิด Google Maps',
      cancelButtonText: 'ยกเลิก',
      background: isDarkMode ? '#1e293b' : '#ffffff',
      color: isDarkMode ? '#f1f5f9' : '#0f172a',
    });
    
    if (result.isConfirmed) {
      const origin = `${currentLocation.lat},${currentLocation.lng}`;
      const dest = destinationCoords 
        ? `${destinationCoords.lat},${destinationCoords.lng}`
        : encodeURIComponent(destination);
      
      const transportMode = {
        car: 'driving',
        motorcycle: 'driving',
        public: 'transit',
        bts_mrt: 'transit'
      }[transportMode] || 'driving';
      
      const mapsUrl = `https://www.google.com/maps/dir/${origin}/${dest}?travelmode=${transportMode}`;
      window.open(mapsUrl, '_blank');
      
      showAlert('เปิด Google Maps แล้ว! 🗺️', 'ตรวจสอบเส้นทางล่าสุดได้', 'success');
    }
  };

  const openEnhancedRideApp = async (appKey) => {
    if (!destination.trim()) {
      showAlert('กรุณาระบุจุดหมาย', 'ต้องกรอกจุดหมายก่อนเรียกรถ', 'warning');
      return;
    }
    
    const app = rideApps[appKey];
const result = await Swal.fire({
  title: `เรียกรถผ่าน ${app.name}`,
  html: `<div style="text-align: left;">
      <strong>🚩 จาก:</strong> ${currentLocation?.displayAddress || 'ตำแหน่งปัจจุบัน'}<br>
      <strong>🎯 ไป:</strong> ${destination}<br>
      <strong>📏 ระยะทาง:</strong> ${routeResult?.distance || 'N/A'} กม.<br><br>
      <strong>💰 ราคาประมาณ:</strong><br>
      🚗 รถยนต์: ${calculateEnhancedRidePrice(appKey, 'car')}<br>
      🏍️ มอเตอร์ไซค์: ${calculateEnhancedRidePrice(appKey, 'motorcycle')}<br><br>
      <small>⚠️ ราคาอาจแตกต่างจากจริงขึ้นอยู่กับอุปสงค์-อุปทาน</small>
    </div>`,
  // ใช้รูปโลโก้จริงเป็นหัวโมดัล
  imageUrl: app.logoUrl,
  imageWidth: 56,
  imageHeight: 56,
  imageAlt: `${app.name} logo`,
  // ถ้าใช้ imageUrl แล้ว ไม่ต้องตั้ง icon
  // icon: 'question',
  showCancelButton: true,
  confirmButtonText: `🚗 เปิด ${app.name}`,
  cancelButtonText: 'ยกเลิก',
  background: isDarkMode ? '#1e293b' : '#ffffff',
  color: isDarkMode ? '#f1f5f9' : '#0f172a',
});

    
    if (result.isConfirmed) {
      window.open(app.url, '_blank');
      showAlert(`กำลังเปิด ${app.name} 📱`, 'เลือกประเภทรถและยืนยันการเดินทาง', 'info');
    }
  };

  const resetEnhancedForm = () => {
    setDestination('');
    setDestinationCoords(null);
    setRouteResult(null);
    setRealTimeWeather(null);
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Clear map route
    if (routeControlRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeControl(routeControlRef.current);
      routeControlRef.current = null;
    }
    
    showAlert('รีเซ็ตสำเร็จ! 🔄', 'พร้อมวางแผนการเดินทางใหม่', 'info');
  };

  // ========================
  // Render JSX
  // ========================
  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <div className={`
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`} />
      
      <div className="p-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <h1 className={`text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🧭 Smart Depart Pro
            </h1>
            <p className={`text-xl mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              ระบบวางแผนการเดินทางอัจฉริยะแบบเรียลไทม์
            </p>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ข้อมูลสภาพอากาศ • การจราจรแบบเรียลไทม์ • การคำนวณที่แม่นยำ • AI Risk Assessment
            </div>
          </div>

          {/* Enhanced Input Form */}
          <div className={`rounded-2xl shadow-2xl p-8 mb-8 transition-all duration-300 backdrop-blur-xl border ${isDarkMode 
            ? 'bg-slate-800/60 border-slate-700/50' 
            : 'bg-white/80 border-white/50'
          }`}>
            
            {/* Real-time Status Bar */}
            {(realTimeWeather || routeResult) && (
              <div className={`mb-6 p-4 rounded-xl border ${isDarkMode 
                ? 'bg-slate-900/50 border-slate-700' 
                : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex flex-wrap gap-4 text-sm">
                  {realTimeWeather && (
                    <div className="flex items-center space-x-2">
                      <span>🌤️</span>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {Math.round(realTimeWeather.temperature)}°C • {realTimeWeather.description}
                        {realTimeWeather.isRaining && ' • 🌧️ ฝนตก'}
                      </span>
                    </div>
                  )}
                  {routeResult?.trafficZones?.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span>🚦</span>
                      <span className={isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}>
                        จราจรหนัก: {routeResult.trafficZones[0].name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span>⏰</span>
                    <span className={isDarkMode ? 'text-green-400' : 'text-green-700'}>
                      อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Destination Input with Enhanced Search */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  🎯 จุดหมายปลายทาง
                </label>
                <div className="relative" ref={suggestionRef}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={destination}
                    onChange={handleDestinationChange}
                    onFocus={() => {
                      if (suggestions.length === 0) setSuggestions(popularDestinations);
                      setShowSuggestions(true);
                    }}
                    placeholder="ค้นหาสถานที่... (เช่น สยามพารากอน)"
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 pr-12 text-lg ${isDarkMode 
                      ? 'bg-slate-900/70 border-slate-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-300'
                    }`}
                  />
                  {searchLoading && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-xl hover:scale-110 transition-transform ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-600'}`}
                  >
                    🔍
                  </button>
                  
                  {/* Enhanced Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className={`absolute z-20 w-full mt-2 border rounded-xl shadow-2xl max-h-80 overflow-y-auto ${isDarkMode 
                      ? 'bg-slate-800 border-slate-700' 
                      : 'bg-white border-gray-200'
                    }`}>
                      <div className={`p-3 text-xs font-medium border-b ${isDarkMode 
                        ? 'text-gray-400 border-slate-700 bg-slate-900/50' 
                        : 'text-gray-500 border-gray-200 bg-gray-50'
                      }`}>
                        💡 เลือกจุดหมาย ({suggestions.length} ผลลัพธ์)
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => selectSuggestionEnhanced(suggestion)}
                          className={`w-full text-left px-4 py-4 border-b last:border-b-0 transition-colors ${isDarkMode 
                            ? 'hover:bg-slate-700 border-slate-700' 
                            : 'hover:bg-blue-50 border-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl flex-shrink-0">{suggestion.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className={`font-semibold truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {suggestion.name}
                              </div>
                              <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {suggestion.category}
                                {suggestion.fullAddress && (
                                  <div className="truncate">{suggestion.fullAddress}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Arrival Time */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  ⏰ เวลาที่ต้องถึง
                </label>
                <input
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 text-lg ${isDarkMode 
                    ? 'bg-slate-900/70 border-slate-600 text-white focus:ring-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                  }`}
                />
              </div>
              
              {/* Transport Mode */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  🚗 วิธีการเดินทาง
                </label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value)}
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 text-lg ${isDarkMode 
                    ? 'bg-slate-900/70 border-slate-600 text-white focus:ring-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                  }`}
                >
                  {Object.entries(transportData).map(([key, data]) => (
                    <option key={key} value={key}>{data.icon} {data.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="mb-8">
              <div className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                🚀 จุดหมายยอดนิยม
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {popularDestinations.slice(0, 8).map((dest, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDestination(dest.name);
                      setDestinationCoords(dest.lat && dest.lng ? { lat: dest.lat, lng: dest.lng } : null);
                      showAlert('เลือกแล้ว!', dest.name, 'success');
                    }}
                    className={`flex items-center space-x-2 p-3 border rounded-xl transition-all hover:scale-105 ${isDarkMode 
                      ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-gray-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    <span className="text-lg">{dest.icon}</span>
                    <span className="text-sm font-medium truncate">{dest.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={calculateEnhancedRoute}
                disabled={loading}
                className="col-span-1 md:col-span-1 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 disabled:opacity-50 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>กำลังคำนวณ...</span>
                  </div>
                ) : (
                  '🚀 คำนวณเส้นทาง Pro'
                )}
              </button>
              
              <button
                onClick={getCurrentLocationEnhanced}
                disabled={locationLoading}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 font-bold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {locationLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>กำลังหา...</span>
                  </div>
                ) : (
                  '📍 อัปเดตตำแหน่ง'
                )}
              </button>
              
              <button
                onClick={resetEnhancedForm}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🔄 เริ่มใหม่
              </button>
            </div>

            {/* Enhanced Current Location Display */}
            {currentLocation && (
              <div className={`mt-6 p-5 border rounded-xl ${isDarkMode 
                ? 'bg-purple-900/30 border-purple-700/50' 
                : 'bg-purple-50 border-purple-200'
              }`}>
                <div className="flex items-start space-x-4">
                  <span className="text-purple-500 text-2xl flex-shrink-0">📍</span>
                  <div className="flex-1">
                    <div className={`font-bold text-lg ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                      ตำแหน่งปัจจุบันของคุณ
                    </div>
                    <div className={`mt-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {currentLocation.displayAddress}
                    </div>
                    <div className={`text-sm mt-2 flex flex-wrap gap-4 ${isDarkMode ? 'text-purple-500' : 'text-purple-500'}`}>
                      <span>📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</span>
                      <span>🎯 ±{Math.round(currentLocation.accuracy)} เมตร</span>
                      <span>🏢 {currentLocation.district} {currentLocation.province}</span>
                    </div>
                  </div>
                  <button
                    onClick={getCurrentLocationEnhanced}
                    className={`text-sm px-3 py-1 rounded-lg transition-colors ${isDarkMode 
                      ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-800/30' 
                      : 'text-purple-600 hover:text-purple-800 hover:bg-purple-100'
                    }`}
                  >
                    🔄 อัปเดต
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Interactive Map */}
          <div className={`rounded-2xl shadow-2xl mb-8 h-96 md:h-[500px] overflow-hidden border ${isDarkMode 
            ? 'bg-slate-800/40 border-slate-700' 
            : 'bg-white/60 border-white/50'
          }`}>
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          {/* Enhanced Results Display */}
          {routeResult && (
            <div className="space-y-8">
              {/* Main Results Card */}
              <div className={`rounded-2xl shadow-2xl p-8 transition-all duration-300 backdrop-blur-xl border ${isDarkMode 
                ? 'bg-slate-800/60 border-slate-700/50' 
                : 'bg-white/80 border-white/50'
              }`}>
                <div className="flex justify-between items-center mb-8">
                  <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    📊 ผลการวิเคราะห์เส้นทาง
                  </h2>
                  <div className={`text-sm px-4 py-2 rounded-full ${isDarkMode 
                    ? 'bg-slate-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                    คำนวณเมื่อ: {routeResult.calculatedAt}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
                  <div className={`text-center p-6 rounded-2xl border shadow-lg ${isDarkMode 
                    ? 'bg-blue-900/30 border-blue-700' 
                    : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                  }`}>
                    <div className="text-4xl font-bold text-blue-500 mb-2">{routeResult.departureTime}</div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      เวลาออกเดินทาง
                    </div>
                  </div>
                  
                  <div className={`text-center p-6 rounded-2xl border shadow-lg ${isDarkMode 
                    ? 'bg-green-900/30 border-green-700' 
                    : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                  }`}>
                    <div className="text-4xl font-bold text-green-500 mb-2">{routeResult.travelTime}</div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      นาที (เดินทาง)
                    </div>
                  </div>
                  
                  <div className={`text-center p-6 rounded-2xl border shadow-lg ${isDarkMode 
                    ? 'bg-orange-900/30 border-orange-700' 
                    : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
                  }`}>
                    <div className="text-4xl font-bold text-orange-500 mb-2">{routeResult.distance}</div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      กิโลเมตร
                    </div>
                  </div>
                  
                  <div className={`text-center p-6 rounded-2xl border shadow-lg ${isDarkMode 
                    ? 'bg-purple-900/30 border-purple-700' 
                    : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
                  }`}>
                    <div className="text-3xl font-bold text-purple-500 mb-2">~฿{routeResult.cost}</div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      ค่าใช้จ่าย
                    </div>
                  </div>
                  
                  <div className="text-center p-6">
                    <button
                      onClick={openEnhancedGoogleMaps}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-2xl hover:from-green-600 hover:to-green-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      🗺️ Google Maps
                    </button>
                  </div>
                </div>

                {/* Enhanced Risk Assessment */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ⚠️ การประเมินความเสี่ยง AI
                    </h3>
                    <div className={`px-6 py-3 rounded-2xl border-2 ${routeResult.risk.color}`}>
                      <span className="font-bold text-lg">{routeResult.risk.level}</span>
                      <span className="text-sm ml-3">({routeResult.risk.score}/10)</span>
                    </div>
                  </div>
                  
                  {routeResult.risk.factors.length > 0 && (
                    <div className={`p-6 rounded-2xl border ${isDarkMode 
                      ? 'bg-slate-900/50 border-slate-700' 
                      : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        🔍 ปัจจัยเสี่ยงที่ตรวจพบ:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {routeResult.risk.factors.map((factor, index) => (
                          <div key={index} className={`flex items-center space-x-3 px-4 py-3 rounded-xl border ${isDarkMode 
                            ? 'bg-slate-700 border-slate-600 text-gray-200' 
                            : 'bg-white border-gray-300 text-gray-800'
                          }`}>
                            <span className="text-lg">{factor.split(' ')[0]}</span>
                            <span className="flex-1">{factor.split(' ').slice(1).join(' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Weather Information */}
                {realTimeWeather && (
                  <div className="mb-8">
                    <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      🌤️ สภาพอากาศปัจจุบัน
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-xl border text-center ${isDarkMode 
                        ? 'bg-slate-700/50 border-slate-600' 
                        : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="text-2xl font-bold text-blue-500">{Math.round(realTimeWeather.temperature)}°C</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>อุณหภูมิ</div>
                      </div>
                      
                      <div className={`p-4 rounded-xl border text-center ${isDarkMode 
                        ? 'bg-slate-700/50 border-slate-600' 
                        : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="text-2xl font-bold text-blue-500">{realTimeWeather.humidity}%</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>ความชื้น</div>
                      </div>
                      
                      <div className={`p-4 rounded-xl border text-center ${isDarkMode 
                        ? 'bg-slate-700/50 border-slate-600' 
                        : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="text-2xl font-bold text-blue-500">{realTimeWeather.visibility}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>ทัศนวิสัย (กม.)</div>
                      </div>
                      
                      <div className={`p-4 rounded-xl border text-center ${realTimeWeather.isRaining 
                        ? (isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200')
                        : (isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-blue-50 border-blue-200')
                      }`}>
                        <div className={`text-2xl font-bold ${realTimeWeather.isRaining ? 'text-yellow-500' : 'text-blue-500'}`}>
                          {realTimeWeather.isRaining ? `${realTimeWeather.rainLevel.toFixed(1)}mm` : '0mm'}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {realTimeWeather.isRaining ? 'ฝนตก' : 'ไม่มีฝน'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Traffic Zones */}
                {routeResult.trafficZones && routeResult.trafficZones.length > 0 && (
                  <div className="mb-8">
                    <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      🚦 พื้นที่จราจรที่ผ่าน
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {routeResult.trafficZones.map((zone, index) => (
                        <div key={index} className={`p-5 rounded-xl border ${
                          zone.severity === 'สูงมาก' ? (isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200') :
                          zone.severity === 'สูง' ? (isDarkMode ? 'bg-orange-900/30 border-orange-700' : 'bg-orange-50 border-orange-200') :
                          zone.severity === 'ปานกลาง' ? (isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200') :
                          (isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200')
                        }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {zone.name}
                              </div>
                              <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                ระดับการจราจร: {zone.severity}
                              </div>
                            </div>
                            <div className={`text-2xl font-bold ${
                              zone.severity === 'สูงมาก' ? 'text-red-500' :
                              zone.severity === 'สูง' ? 'text-orange-500' :
                              zone.severity === 'ปานกลาง' ? 'text-yellow-500' :
                              'text-green-500'
                            }`}>
                              ×{zone.multiplier.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Ride-hailing Options */}
                <div className="mb-8">
                  <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    🚖 แอปเรียกรถ (ราคาเรียลไทม์)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(rideApps).map(([key, app]) => (
                      <button
                        key={key}
                        onClick={() => openEnhancedRideApp(key)}
                        className={`${app.color} text-white p-6 rounded-2xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-105`}
                      >
                        <div className="text-center">
                          <img
  src={app.logoUrl}
  alt={`${app.name} logo`}
  className="mx-auto mb-4 h-10 w-10 object-contain rounded-md"
/>
                          <div className="font-bold text-xl mb-3">{app.name}</div>
                          <div className="space-y-2 text-sm opacity-90">
                            <div className="flex items-center justify-between">
                              <span>รถยนต์:</span>
                              <span className="font-semibold">{calculateEnhancedRidePrice(key, 'car')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span> มอเตอร์ไซค์:</span>
                              <span className="font-semibold">{calculateEnhancedRidePrice(key, 'motorcycle')}</span>
                            </div>
                          </div>
                          <div className="mt-3 text-xs opacity-75">
                            คลิกเพื่อเปิดแอป
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transport Comparison */}
                <div className="mb-8">
                  <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    📊 เปรียบเทียบวิธีการเดินทาง
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(transportData).map(([key, transport]) => {
                      const isSelected = key === transportMode;
                      return (
                        <div key={key} className={`p-5 rounded-2xl border-2 transition-all ${isSelected 
                          ? (isDarkMode ? 'bg-blue-900/50 border-blue-500' : 'bg-blue-50 border-blue-500') 
                          : (isDarkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200')
                        }`}>
                          <div className="text-center">
                            <div className="text-3xl mb-3">{transport.icon}</div>
                            <div className={`font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {transport.name}
                            </div>
                            <div className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <div>ความเร็ว: {transport.baseSpeed} กม./ชม.</div>
                              <div>ความน่าเชื่อถือ: {Math.round(transport.reliability * 100)}%</div>
                              <div>ค่าใช้จ่าย: ฿{transport.cost.base + transport.cost.perKm * (routeResult.distance || 0)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Footer */}
          <div className={`text-center mt-12 rounded-2xl p-6 shadow-xl transition-all duration-300 backdrop-blur-xl border ${isDarkMode 
            ? 'bg-slate-800/60 border-slate-700/50 text-gray-400' 
            : 'bg-white/80 border-white/50 text-gray-500'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="font-semibold mb-2">🔥 เทคโนโลยี</div>
                <p>OpenStreetMap • Nominatim • OpenWeatherMap • AI Risk Assessment</p>
              </div>
              <div>
                <div className="font-semibold mb-2">⚡ คุณสมบัติ</div>
                <p>คำนวณเรียลไทม์ • วิเคราะห์จราจร • ประเมินความเสี่ยง • เปรียบเทียบราคา</p>
              </div>
              <div>
                <div className="font-semibold mb-2">📱 การใช้งาน</div>
                <p>รองรับทุกอุปกรณ์ • อัปเดตแบบเรียลไทม์ • ใช้งานง่าย</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-current border-opacity-20">
              <p className="text-xs">
                💡 <strong>คำแนะนำ:</strong> ระบบใช้ข้อมูลจากหลายแหล่งเพื่อให้การคำนวณที่แม่นยำที่สุด 
                แต่สภาพการณ์จริงอาจแตกต่างได้ ควรตรวจสอบข้อมูลเพิ่มเติมก่อนเดินทาง
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDepartApp;