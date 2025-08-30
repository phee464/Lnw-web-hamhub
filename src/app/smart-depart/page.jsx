'use client';
import React, { useState, useEffect, useRef } from 'react';


const SmartDepartApp = () => {
  const [destination, setDestination] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [transportMode, setTransportMode] = useState('car');
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const suggestionRef = useRef(null);
  const inputRef = useRef(null);

  // SweetAlert2 integration
  const showAlert = (title, text, icon = 'info', showConfirmButton = true) => {
    if (typeof window !== 'undefined' && window.Swal) {
      return window.Swal.fire({
        title,
        html: text,
        icon,
        confirmButtonText: 'ตกลง',
        showConfirmButton,
        timer: showConfirmButton ? null : 3000,
        timerProgressBar: !showConfirmButton
      });
    } else {
      alert(`${title}\n\n${text.replace(/<[^>]*>/g, '')}`);
      return Promise.resolve();
    }
  };

  // Popular destinations
  const popularDestinations = [
    { name: 'สยามพารากอน', category: 'ห้างสรรพสินค้า', icon: '🛍️' },
    { name: 'MBK Center', category: 'ห้างสรรพสินค้า', icon: '🛍️' },
    { name: 'เซ็นทรัลเวิลด์', category: 'ห้างสรรพสินค้า', icon: '🛍️' },
    { name: 'สนามบินสุวรรณภูมิ', category: 'สนามบิน', icon: '✈️' },
    { name: 'สนามบินดอนเมือง', category: 'สนามบิน', icon: '✈️' },
    { name: 'สถานีรถไฟหัวลำโพง', category: 'ขนส่ง', icon: '🚂' },
    { name: 'จตุจักรสวนสยาม', category: 'ตลาด', icon: '🛒' },
    { name: 'วัดพระแก้ว', category: 'วัด', icon: '🏛️' }
  ];

  // Transport data
  const transportData = {
    car: {
      name: 'รถยนต์',
      baseTime: 30,
      cost: '80-150 บาท',
      trafficImpact: 2.2,
      rainImpact: 1.4,
      icon: '🚗',
      pros: ['สะดวกสบาย', 'ไม่เปียกฝน'],
      cons: ['ค่าใช้จ่ายสูง', 'หาที่จอดยาก']
    },
    motorcycle: {
      name: 'มอเตอร์ไซค์', 
      baseTime: 20,
      cost: '40-80 บาท',
      trafficImpact: 1.3,
      rainImpact: 2.5,
      icon: '🏍️',
      pros: ['เร็วที่สุด', 'ประหยัด'],
      cons: ['อันตรายเมื่อฝนตก', 'เปียกฝน']
    },
    public: {
      name: 'ขนส่งสาธารณะ',
      baseTime: 45,
      cost: '25-45 บาท',
      trafficImpact: 1.2,
      rainImpact: 1.1,
      icon: '🚌',
      pros: ['ประหยัดที่สุด', 'ปลอดภัย'],
      cons: ['ใช้เวลานาน', 'ต้องเดิน']
    }
  };

  // Ride apps
  const rideApps = {
    grab: {
      name: 'Grab',
      icon: '🚗',
      color: 'bg-green-500 hover:bg-green-600',
      estimatedPrice: { car: '80-150', motorcycle: '40-80' }
    },
    bolt: {
      name: 'Bolt',
      icon: '⚡',
      color: 'bg-orange-500 hover:bg-orange-600',
      estimatedPrice: { car: '70-130', motorcycle: '35-70' }
    },
    lineman: {
      name: 'LINE MAN',
      icon: '🛵',
      color: 'bg-green-600 hover:bg-green-700',
      estimatedPrice: { car: '75-140', motorcycle: '40-75' }
    }
  };

  useEffect(() => {
    // Load SweetAlert2
    if (typeof window !== 'undefined' && !window.Swal) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sweetalert2/11.10.1/sweetalert2.min.js';
      script.onload = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/sweetalert2/11.10.1/sweetalert2.min.css';
        document.head.appendChild(link);
      };
      document.head.appendChild(script);
    }

    // Auto-detect location
    getCurrentLocation();

    // Set default time
    const now = new Date();
    now.setHours(now.getHours() + 1);
    setArrivalTime(now.toTimeString().slice(0, 5));

    // Click outside handler
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      showAlert('ไม่รองรับ GPS', 'เบราว์เซอร์ไม่รองรับการหาตำแหน่ง', 'error');
      setLocationLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({
          lat: latitude,
          lng: longitude,
          address: 'บริเวณปัจจุบัน, กรุงเทพฯ',
          accuracy: position.coords.accuracy
        });
        setLocationLoading(false);
        showAlert('ได้ตำแหน่งแล้ว 📍', 'ระบบได้ตำแหน่งปัจจุบันแล้ว', 'success', false);
      },
      (error) => {
        showAlert('ไม่สามารถหาตำแหน่งได้', 'กรุณาอนุญาตการเข้าถึงตำแหน่ง', 'warning');
        setLocationLoading(false);
      },
      options
    );
  };

  // Search places
  const searchPlaces = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions(popularDestinations);
      return;
    }

    setSearchLoading(true);
    
    try {
      const response = await fetch('/api/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: `${query} bangkok thailand`,
          location: currentLocation ? `${currentLocation.lat},${currentLocation.lng}` : null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const apiSuggestions = data.results?.map(result => ({
          name: result.title || result.name,
          category: result.type || 'สถานที่',
          icon: '📍',
          address: result.address
        })) || [];

        const filteredPopular = popularDestinations.filter(place => 
          place.name.toLowerCase().includes(query.toLowerCase())
        );

        setSuggestions([...apiSuggestions, ...filteredPopular].slice(0, 8));
      } else {
        const filtered = popularDestinations.filter(place => 
          place.name.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filtered);
      }
    } catch (error) {
      const filtered = popularDestinations.filter(place => 
        place.name.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle destination change
  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      searchPlaces(value);
    }, 300);
    
    setShowSuggestions(true);
  };

  // Select suggestion
  const selectSuggestion = (suggestion) => {
    setDestination(suggestion.name);
    setShowSuggestions(false);
    showAlert('เลือกจุดหมายแล้ว ✅', suggestion.name, 'success', false);
  };

  // Get current weather
  const getCurrentWeather = () => {
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth();
    const isRainySeason = month >= 4 && month <= 9;
    
    let rainChance, condition;
    
    if (isRainySeason) {
      if (hour >= 13 && hour <= 18) {
        rainChance = Math.floor(Math.random() * 30) + 60;
        condition = 'เมฆมาก อาจมีฝนฟ้าร้อง';
      } else {
        rainChance = Math.floor(Math.random() * 30) + 20;
        condition = 'ฟ้าครึ้ม';
      }
    } else {
      rainChance = Math.floor(Math.random() * 20) + 10;
      condition = 'แจ่มใส';
    }

    return {
      condition,
      rainChance,
      temperature: Math.floor(Math.random() * 6) + 30,
      humidity: Math.floor(Math.random() * 25) + 60
    };
  };

  // Get traffic conditions
  const getTrafficConditions = () => {
    const hour = new Date().getHours();
    const conditions = [];
    
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      conditions.push(
        { location: 'ถ.สุขุมวิท', status: 'รถติดหนักมาก', severity: 'สูง', delay: 25 },
        { location: 'แยกอโศก', status: 'รถเคลื่อนช้า', severity: 'กลาง', delay: 15 }
      );
    } else {
      conditions.push(
        { location: 'ถนนหลัก', status: 'จราจรคล่องตัว', severity: 'ต่ำ', delay: 5 }
      );
    }

    return conditions;
  };

  // Calculate travel time
  const calculateTravelTime = (weather, traffic) => {
    const transport = transportData[transportMode];
    let travelTime = transport.baseTime;

    const trafficMultiplier = traffic.some(t => t.severity === 'สูง') ? transport.trafficImpact : 1;
    travelTime *= trafficMultiplier;

    if (weather.rainChance > 60) {
      travelTime *= transport.rainImpact;
    }

    return Math.round(travelTime);
  };

  // Assess risk
  const assessRisk = (weather, traffic, calculatedTime) => {
    let riskScore = 0;
    const riskFactors = [];

    if (weather.rainChance > 70) {
      riskScore += 4;
      riskFactors.push(`🌧️ ฝนตกหนัก ${weather.rainChance}%`);
    } else if (weather.rainChance > 40) {
      riskScore += 2;
      riskFactors.push(`☁️ อาจมีฝน ${weather.rainChance}%`);
    }

    const highTraffic = traffic.filter(t => t.severity === 'สูง');
    riskScore += highTraffic.length * 3;
    
    if (highTraffic.length > 0) {
      riskFactors.push('🚦 รถติดหนัก');
    }

    let riskLevel, riskColor;
    if (riskScore >= 6) {
      riskLevel = 'สูงมาก';
      riskColor = 'text-red-800 bg-red-100 border-red-300';
    } else if (riskScore >= 4) {
      riskLevel = 'ปานกลาง';
      riskColor = 'text-yellow-700 bg-yellow-50 border-yellow-200';
    } else {
      riskLevel = 'ปลอดภัย';
      riskColor = 'text-green-700 bg-green-50 border-green-200';
    }

    return { riskLevel, riskColor, riskFactors, riskScore };
  };

  // Calculate route with SERP API integration
  const calculateRoute = async () => {
    if (!destination.trim() || !arrivalTime) {
      showAlert('ข้อมูลไม่ครบ', 'กรุณากรอกจุดหมายและเวลา', 'warning');
      return;
    }

    setLoading(true);

    try {
      // Get detailed location information
      const originLocation = currentLocation ? 
        `${currentLocation.lat},${currentLocation.lng}` : 
        'Bangkok, Thailand';

      // Get route and location details from SERP API
      const [routeInfo, destinationDetails] = await Promise.all([
        getRouteInformation(originLocation, destination),
        getLocationDetails(destination)
      ]);

      const weather = getCurrentWeather();
      const traffic = getTrafficConditions();
      
      // Use SERP route data if available, otherwise use mock calculation
      let travelTime;
      let routeDetails = null;
      
      if (routeInfo && routeInfo.route) {
        travelTime = Math.round(routeInfo.route.duration / 60); // Convert seconds to minutes
        routeDetails = {
          distance: routeInfo.route.distance,
          duration: routeInfo.route.duration,
          polyline: routeInfo.route.polyline,
          steps: routeInfo.route.steps
        };
      } else {
        travelTime = calculateTravelTime(weather, traffic);
      }

      const risk = assessRisk(weather, traffic, travelTime);

      const [hours, minutes] = arrivalTime.split(':');
      const arrivalDateTime = new Date();
      arrivalDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const bufferTime = risk.riskScore >= 6 ? 20 : risk.riskScore >= 4 ? 15 : 10;
      const departureDateTime = new Date(arrivalDateTime.getTime() - ((travelTime + bufferTime) * 60 * 1000));
      
      const result = {
        destination: destination.trim(),
        destinationDetails: destinationDetails,
        arrivalTime,
        departureTime: departureDateTime.toTimeString().slice(0, 5),
        travelTime,
        bufferTime,
        weather,
        traffic,
        risk,
        transport: transportData[transportMode],
        routeDetails: routeDetails,
        calculatedAt: new Date().toLocaleString('th-TH')
      };

      setRouteResult(result);

      showAlert(
        'คำนวณสำเร็จ! 🎉',
        `<div style="text-align: left;">
          <strong>📍 จุดหมาย:</strong> ${result.destination}<br>
          ${destinationDetails ? `<strong>📍 รายละเอียด:</strong> ${destinationDetails.address}<br>` : ''}
          <strong>⏰ ต้องถึง:</strong> ${result.arrivalTime}<br>
          <strong>🚀 ควรออกเดินทาง:</strong> ${result.departureTime}<br>
          <strong>🚗 ใช้เวลา:</strong> ${result.travelTime} นาที<br>
          <strong>⚠️ ความเสี่ยง:</strong> ${result.risk.riskLevel}
        </div>`,
        'success'
      );

    } catch (error) {
      showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถคำนวณได้ กรุณาลองใหม่', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get location details from SERP API
  const getLocationDetails = async (locationName, coordinates = null) => {
    try {
      const response = await fetch('/api/places/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          location: locationName,
          coordinates: coordinates
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.details;
      }
    } catch (error) {
      console.error('Location details error:', error);
    }
    return null;
  };

  // Get route information using SERP API
  const getRouteInformation = async (origin, destination) => {
    try {
      const response = await fetch('/api/routes/serp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          origin: origin,
          destination: destination,
          mode: transportMode
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Route information error:', error);
    }
    return null;
  };
  const openGoogleMaps = async () => {
    if (!currentLocation || !destination) {
      showAlert('ข้อมูลไม่ครบ', 'ต้องมีตำแหน่งปัจจุบันและจุดหมาย', 'warning');
      return;
    }

    const result = await showAlert(
      'เปิด Google Maps 🗺️',
      `จะนำทางจาก ${currentLocation.address} ไปยัง ${destination}`,
      'question'
    );
    
    if (result.isConfirmed) {
      const origin = `${currentLocation.lat},${currentLocation.lng}`;
      const mapsUrl = `https://www.google.com/maps/dir/${origin}/${encodeURIComponent(destination)}`;
      window.open(mapsUrl, '_blank');
      showAlert('เปิดแล้ว! 🗺️', 'Google Maps เปิดในแท็บใหม่', 'success', false);
    }
  };

  // Calculate ride price
  const calculateRidePrice = (app, type = 'car') => {
    const basePrice = rideApps[app].estimatedPrice[type];
    const hour = new Date().getHours();
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    
    if (isRushHour) {
      const [min, max] = basePrice.split('-').map(p => parseInt(p));
      return `${Math.round(min * 1.3)}-${Math.round(max * 1.5)} บาท (Surge)`;
    }
    
    return `${basePrice} บาท`;
  };

  // Open ride app
  const openRideApp = async (appName) => {
    if (!destination.trim()) {
      showAlert('กรุณาระบุจุดหมาย', 'ต้องกรอกจุดหมายก่อนเรียกรถ', 'warning');
      return;
    }

    const app = rideApps[appName];
    const result = await showAlert(
      `เรียกรถผ่าน ${app.name} ${app.icon}`,
      `<div style="text-align: left;">
        <strong>จาก:</strong> ${currentLocation?.address || 'ตำแหน่งปัจจุบัน'}<br>
        <strong>ไป:</strong> ${destination}<br><br>
        <strong>ราคาประมาณ:</strong><br>
        🚗 รถยนต์: ${calculateRidePrice(appName, 'car')}<br>
        🏍️ มอเตอร์ไซค์: ${calculateRidePrice(appName, 'motorcycle')}
      </div>`,
      'question'
    );

    if (result.isConfirmed) {
      const deepLink = `https://www.${appName}.com`;
      window.open(deepLink, '_blank');
      showAlert(`กำลังเปิดแอพ ${app.name} 📱`, 'แอพจะเปิดในแท็บใหม่', 'info', false);
    }
  };

  // Reset form
  const resetForm = () => {
    setDestination('');
    setRouteResult(null);
    showAlert('รีเซ็ตแล้ว', 'ล้างข้อมูลเรียบร้อย', 'info', false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">🧭 Smart Depart</h1>
          <p className="text-lg text-gray-600">ระบบวางแผนการเดินทางอัจฉริยะ</p>
          <div className="text-sm text-gray-500 mt-2">
            คำนวณเวลา • ประเมินความเสี่ยง • แนะนำเส้นทาง
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📍 จุดหมาย</label>
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
                  placeholder="พิมพ์ชื่อสถานที่..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                />
                
                {searchLoading && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                >
                  🔥
                </button>

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    <div className="p-2 text-xs text-gray-500 border-b">💡 เลือกจุดหมาย</div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{suggestion.icon}</span>
                          <div>
                            <div className="font-medium">{suggestion.name}</div>
                            <div className="text-sm text-gray-500">{suggestion.category}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">⏰ เวลาที่ต้องถึง</label>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🚗 วิธีการเดินทาง</label>
              <select
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(transportData).map(([key, data]) => (
                  <option key={key} value={key}>{data.icon} {data.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <div className="text-sm font-medium text-gray-700 mb-3">🚀 เลือกด่วน</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => { setDestination('สยามพารากอน'); showAlert('เลือกแล้ว! 🛍️', 'สยามพารากอน', 'success', false); }}
                className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              >
                <span>🛍️</span><span className="text-sm">สยาม</span>
              </button>
              <button
                onClick={() => { setDestination('สนามบินสุวรรณภูมิ'); showAlert('เลือกแล้ว! ✈️', 'สนามบินสุวรรณภูมิ', 'success', false); }}
                className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
              >
                <span>✈️</span><span className="text-sm">สุวรรณภูมิ</span>
              </button>
              <button
                onClick={() => { setDestination('จตุจักรสวนสยาม'); showAlert('เลือกแล้ว! 🛒', 'จตุจักรสวนสยาม', 'success', false); }}
                className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100"
              >
                <span>🛒</span><span className="text-sm">จตุจักร</span>
              </button>
              <button
                onClick={() => { setDestination('สถานีรถไฟหัวลำโพง'); showAlert('เลือกแล้ว! 🚂', 'สถานีรถไฟหัวลำโพง', 'success', false); }}
                className="flex items-center space-x-2 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
              >
                <span>🚂</span><span className="text-sm">หัวลำโพง</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={calculateRoute}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold text-lg"
            >
              {loading ? '⏳ กำลังคำนวณ...' : '🚀 คำนวณเส้นทาง'}
            </button>
            
            <button
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 font-semibold disabled:opacity-50"
            >
              {locationLoading ? '📍 กำลังหา...' : '📍 ตำแหน่งปัจจุบัน'}
            </button>

            <button
              onClick={resetForm}
              className="bg-gray-500 text-white py-4 px-6 rounded-lg hover:bg-gray-600 font-semibold"
            >
              🔄 รีเซ็ต
            </button>
          </div>

          {/* Current Location Display */}
          {currentLocation && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-purple-600 text-xl">📍</span>
                <div className="flex-1">
                  <div className="font-medium text-purple-800">ตำแหน่งปัจจุบัน</div>
                  <div className="text-sm text-purple-600">{currentLocation.address}</div>
                  <div className="text-xs text-purple-500 mt-1">
                    พิกัด: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)} • 
                    ความแม่นยำ: {Math.round(currentLocation.accuracy)} เมตร
                  </div>
                </div>
                <button
                  onClick={getCurrentLocation}
                  className="text-purple-600 hover:text-purple-800 text-sm"
                >
                  🔄 อัปเดต
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {routeResult && (
          <div className="space-y-6">
            {/* Main Result */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📊 ผลการคำนวณเส้นทาง</h2>
                <div className="text-sm text-gray-500">คำนวณเมื่อ: {routeResult.calculatedAt}</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">{routeResult.departureTime}</div>
                  <div className="text-sm text-gray-600 mt-1">เวลาควรออกเดินทาง</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600">{routeResult.travelTime}</div>
                  <div className="text-sm text-gray-600 mt-1">นาที (เวลาเดินทาง)</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{routeResult.transport.cost}</div>
                  <div className="text-sm text-gray-600 mt-1">ค่าใช้จ่ายประมาณ</div>
                </div>
                <div className="text-center p-4">
                  <div className="space-y-2">
                    <button
                      onClick={openGoogleMaps}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 font-semibold text-sm"
                    >
                      🗺️ Google Maps
                    </button>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">⚠️ ประเมินความเสี่ยง</h3>
                  <div className={`px-4 py-2 rounded-full border-2 ${routeResult.risk.riskColor}`}>
                    <span className="font-bold">{routeResult.risk.riskLevel}</span>
                    <span className="text-sm ml-2">({routeResult.risk.riskScore}/10)</span>
                  </div>
                </div>
                
                {routeResult.risk.riskFactors.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="text-sm font-medium text-gray-700 mb-2">ปัจจัยเสี่ยงที่พบ:</div>
                    <div className="flex flex-wrap gap-2">
                      {routeResult.risk.riskFactors.map((factor, index) => (
                        <span key={index} className="bg-white px-3 py-1 rounded-full text-sm border">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ride-hailing Options */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🚖 ตัวเลือกเรียกรถ</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(rideApps).map(([key, app]) => (
                    <button
                      key={key}
                      onClick={() => openRideApp(key)}
                      className={`${app.color} text-white p-4 rounded-lg transition-all shadow-md hover:shadow-lg`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{app.icon}</div>
                        <div className="font-semibold">{app.name}</div>
                        <div className="text-xs mt-1 opacity-90">
                          🚗 {calculateRidePrice(key, 'car')}
                        </div>
                        <div className="text-xs opacity-90">
                          🏍️ {calculateRidePrice(key, 'motorcycle')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Weather & Traffic */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weather */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🌤️ สภาพอากาศปัจจุบัน</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">สภาพอากาศ:</span>
                    <span className="font-bold text-blue-700">{routeResult.weather.condition}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">โอกาสฝนตก:</span>
                    <span className={`font-bold ${
                      routeResult.weather.rainChance > 70 ? 'text-red-600' : 
                      routeResult.weather.rainChance > 40 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {routeResult.weather.rainChance}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">อุณหภูมิ:</span>
                    <span className="font-bold text-orange-600">{routeResult.weather.temperature}°C</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">ความชื้น:</span>
                    <span className="font-bold text-blue-600">{routeResult.weather.humidity}%</span>
                  </div>
                </div>
              </div>

              {/* Traffic */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🚦 สถานการณ์จราจร</h3>
                <div className="space-y-3">
                  {routeResult.traffic.map((condition, index) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      condition.severity === 'สูง' ? 'bg-red-50 border-red-400' :
                      condition.severity === 'กลาง' ? 'bg-yellow-50 border-yellow-400' : 
                      'bg-green-50 border-green-400'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-800">{condition.location}</div>
                          <div className={`text-sm ${
                            condition.severity === 'สูง' ? 'text-red-700' :
                            condition.severity === 'กลาง' ? 'text-yellow-700' : 'text-green-700'
                          }`}>
                            {condition.status}
                          </div>
                        </div>
                        {condition.delay && (
                          <div className="text-right">
                            <div className="text-xs text-gray-500">ความล่าช้า</div>
                            <div className="font-bold text-red-600">+{condition.delay} นาที</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SERP Location Details & Route Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🗺️ ข้อมูลสถานที่และเส้นทาง</h3>
              
              {/* Destination Details */}
              {routeResult.destinationDetails && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    📍 ข้อมูลจุดหมาย
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">ชื่อ:</span>
                      <div className="mt-1">{routeResult.destinationDetails.title}</div>
                    </div>
                    <div>
                      <span className="font-medium">ประเภท:</span>
                      <div className="mt-1">{routeResult.destinationDetails.type || 'สถานที่ทั่วไป'}</div>
                    </div>
                    <div>
                      <span className="font-medium">ที่อยู่:</span>
                      <div className="mt-1">{routeResult.destinationDetails.address}</div>
                    </div>
                    {routeResult.destinationDetails.phone && (
                      <div>
                        <span className="font-medium">โทรศัพท์:</span>
                        <div className="mt-1">{routeResult.destinationDetails.phone}</div>
                      </div>
                    )}
                    {routeResult.destinationDetails.rating && (
                      <div>
                        <span className="font-medium">คะแนนรีวิว:</span>
                        <div className="mt-1">⭐ {routeResult.destinationDetails.rating}</div>
                      </div>
                    )}
                    {routeResult.destinationDetails.hours && (
                      <div>
                        <span className="font-medium">เวลาเปิด-ปิด:</span>
                        <div className="mt-1">{routeResult.destinationDetails.hours}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Route Details */}
              {routeResult.routeDetails ? (
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    🛣️ ข้อมูลเส้นทาง (จาก SERP API)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {(routeResult.routeDetails.distance / 1000).toFixed(1)} กม.
                      </div>
                      <div className="text-gray-600">ระยะทาง</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(routeResult.routeDetails.duration / 60)} นาที
                      </div>
                      <div className="text-gray-600">เวลาเดินทาง</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {routeResult.routeDetails.steps?.length || 0}
                      </div>
                      <div className="text-gray-600">ขั้นตอนการเดินทาง</div>
                    </div>
                  </div>
                  
                  {/* Route Steps */}
                  {routeResult.routeDetails.steps && (
                    <div className="mt-4">
                      <h5 className="font-medium text-green-800 mb-2">🗺️ ขั้นตอนการเดินทาง:</h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {routeResult.routeDetails.steps.slice(0, 5).map((step, index) => (
                          <div key={index} className="bg-white p-2 rounded text-xs">
                            <span className="font-medium text-green-700">{index + 1}.</span> {step.instruction}
                          </div>
                        ))}
                        {routeResult.routeDetails.steps.length > 5 && (
                          <div className="text-xs text-gray-500 text-center">
                            ... และอีก {routeResult.routeDetails.steps.length - 5} ขั้นตอน
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">⚠️ ข้อมูลเส้นทาง</h4>
                  <p className="text-sm text-yellow-800">
                    ใช้ข้อมูลประมาณการ - สำหรับข้อมูลแม่นยำ กรุณาเปิด Google Maps
                  </p>
                </div>
              )}

              {/* Current Location */}
              {currentLocation && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-3">📍 ตำแหน่งปัจจุบัน</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">ที่อยู่:</span>
                      <div className="mt-1">{currentLocation.address}</div>
                    </div>
                    <div>
                      <span className="font-medium">พิกัด:</span>
                      <div className="mt-1">
                        {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">ความแม่นยำ:</span>
                      <div className="mt-1">{Math.round(currentLocation.accuracy)} เมตร</div>
                    </div>
                    <div>
                      <button
                        onClick={openGoogleMaps}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
                      >
                        🗺️ เปิด Google Maps
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 bg-white rounded-lg p-4 shadow">
          <p className="mb-2">
            <strong>🔥 Powered by SERP API:</strong> ข้อมูลสถานที่และเส้นทางแบบ Real-time จาก Google Search
          </p>
          <p className="mb-2">
            <strong>หมายเหตุ:</strong> ข้อมูลเป็นการประมาณการจากระบบ AI ควรติดตามสถานการณ์จริงเพิ่มเติม
          </p>
          <p>
            💡 <strong>เคล็ดลับ:</strong> ระบบจะคำนวณเวลา Buffer เพิ่มตามระดับความเสี่ยง เพื่อให้คุณถึงเป้าหมายตรงเวลา
          </p>
          <div className="mt-3 text-xs text-gray-400">
            🗺️ SERP API Location Data | 📍 GPS Tracking | 🚗 3 Apps เรียกรถ | 🧠 AI Route Planning
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDepartApp;