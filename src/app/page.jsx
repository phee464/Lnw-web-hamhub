'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/lib/DarkModeContext';

export default function Home() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [mapData, setMapData] = useState({
    activeRoutes: 89,
    totalDistance: 2847,
    avgSpeed: 47,
    efficiency: 94.3
  });
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    setIsLoaded(true);
    
    let timeInterval;
    let dataInterval;
    let mapInstance;
    let baseLayer;
    let satelliteLayer;
    
    // ตั้งเวลาเริ่มต้นและอัปเดตทุกวินาที
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('th-TH'));
    };
    
    updateTime();
    timeInterval = setInterval(updateTime, 1000);
    
    // Load Leaflet CSS and JS
    const loadLeaflet = () => {
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(cssLink);
      }
      
      // Load Leaflet JS
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        initMap();
      }
    };

    const initMap = () => {
      try {
        if (window.L && document.getElementById('qgis-map')) {
          // ลบ map instance เก่าถ้ามี
          if (mapInstance) {
            mapInstance.remove();
          }
          
          // Initialize Leaflet map
          mapInstance = window.L.map('qgis-map').setView([13.7563, 100.5018], 12);
          
          // สร้าง base layers
          baseLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          });
          
          satelliteLayer = window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri, Maxar, Earthstar Geographics'
          });
          
          // เพิ่ม layer เริ่มต้น
          if (isSatelliteView) {
            satelliteLayer.addTo(mapInstance);
          } else {
            baseLayer.addTo(mapInstance);
          }
          
          // Add QGIS WMS Layer function
          function addQGISWMSLayer() {
            try {
              const wmsLayer = window.L.tileLayer.wms('http://your-qgis-server-url/wms', {
                layers: 'your_layer_name',
                format: 'image/png',
                transparent: true,
                attribution: 'QGIS Server'
              }).addTo(mapInstance);
            } catch (error) {
              console.warn('QGIS WMS Layer failed to load:', error);
            }
          }
          
          // Call the QGIS WMS function
          addQGISWMSLayer();

          // Apply dark mode styling if needed
          if (isDarkMode && !isSatelliteView) {
            mapInstance.getContainer().style.filter = 'invert(1) hue-rotate(180deg)';
          } else {
            mapInstance.getContainer().style.filter = 'none';
          }
        }
      } catch (error) {
        console.error('Map initialization failed:', error);
      }
    };

    loadLeaflet();

    // Simulate real-time data updates
    dataInterval = setInterval(() => {
      setMapData(prev => ({
        activeRoutes: Math.max(50, prev.activeRoutes + Math.floor(Math.random() * 5) - 2),
        totalDistance: prev.totalDistance + Math.floor(Math.random() * 10) - 5,
        avgSpeed: Math.max(30, prev.avgSpeed + Math.floor(Math.random() * 6) - 3),
        efficiency: Math.min(100, Math.max(85, prev.efficiency + (Math.random() - 0.5) * 2))
      }));
    }, 2000);
    
    // Cleanup function
    return () => {
      if (timeInterval) {
        clearInterval(timeInterval);
      }
      if (dataInterval) {
        clearInterval(dataInterval);
      }
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [isDarkMode, isSatelliteView]);

  // ฟังก์ชันสลับระหว่างแผนที่ปกติและดาวเทียม
  const toggleSatelliteView = () => {
    setIsSatelliteView(!isSatelliteView);
  };

  // ฟังก์ชันสำหรับไปหน้า smart-depart
  const handleNavigateToSmartDepart = () => {
    router.push('/smart-depart');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Section with Enhanced Typography */}
      <div className="relative z-10 pt-8 pb-6">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className={`text-5xl md:text-6xl font-black mb-4 tracking-tight ${
              isDarkMode 
                ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent'
            }`}>
              SMART-DEPART
            </h1>
            <p className={`text-xl md:text-2xl font-light mb-6 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              ระบบการเดินทางอัฉริยะ - Intelligence Control Center
            </p>
            
            <div className={`inline-flex items-center px-6 py-3 rounded-full backdrop-blur-md border ${
              isDarkMode 
                ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700'
            }`}>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse mr-3"></div>
              <span className="font-medium">ระบบทำงานปกติ • อัปเดต {currentTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-8 relative z-10">
        {/* Top Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 - User Analytics */}
          <div className={`rounded-3xl p-6 border-2 transition-all duration-500 backdrop-blur-xl ${
            isDarkMode 
              ? 'bg-slate-800/40 border-purple-600/30 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20' 
              : 'bg-white/60 border-purple-300/40 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20'
          } hover:scale-[1.02] group`}>
            {/* Header */}
            <div className="flex items-center mb-6">
              <div className={`w-10 h-10 rounded-xl mr-3 flex items-center justify-center ${
                isDarkMode ? 'bg-gradient-to-br from-purple-400 to-pink-500' : 'bg-gradient-to-br from-purple-500 to-pink-600'
              } shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>User Analytics</h3>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>การวิเคราะห์ผู้ใช้</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-2xl font-black mb-1 ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>1,247</div>
                <div className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>ผู้ใช้งานออนไลน์</div>
                <div className="flex justify-center mt-2">
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isDarkMode 
                      ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                      : 'bg-green-500/20 text-green-700 border border-green-400/30'
                  }`}>
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse mr-1"></div>
                    เพิ่มขึ้น 12%
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-black mb-1 ${
                  isDarkMode ? 'text-rose-400' : 'text-rose-600'
                }`}>1.2s</div>
                <div className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>เวลาตอบสนองเฉลี่ย</div>
              </div>
            </div>
          </div>

          {/* Card 2 - เริ่มต้นการเดินทางอัฉริยะ (ตรงกลาง) */}
          <div className={`rounded-3xl p-6 border-2 transition-all duration-500 backdrop-blur-xl hover:scale-105 cursor-pointer ${
            isDarkMode 
              ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-400/40 hover:border-cyan-300/60 shadow-2xl shadow-cyan-500/25'
              : 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border-blue-400/40 hover:border-blue-500/60 shadow-2xl shadow-blue-500/25'
          }`}>
            <div className="text-center">
              <div className={`text-4xl mb-4 ${
                isDarkMode ? 'text-cyan-300' : 'text-blue-600'
              }`}>🚗 🗺️ 🧠</div>
              <h2 className={`text-xl md:text-2xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>เรารู้ว่าคุณ “คิดว่าไปทัน” สุดท้ายก็สาย</h2>
              <p className={`text-sm mb-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>คราวนี้ให้ SMART-DEPART ช่วยคิดแทน</p>
              <button 
                onClick={handleNavigateToSmartDepart}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/30'
              }`}>
                🚀 เข้าสู่ระบบการเดินทางอัฉริยะ
              </button>
            </div>
          </div>

          {/* Card 3 - AI Intelligence */}
          <div className={`rounded-3xl p-6 border-2 transition-all duration-500 backdrop-blur-xl ${
            isDarkMode 
              ? 'bg-slate-800/40 border-emerald-600/30 shadow-2xl shadow-emerald-500/10 hover:shadow-emerald-500/20' 
              : 'bg-white/60 border-emerald-300/40 shadow-2xl shadow-emerald-500/10 hover:shadow-emerald-500/20'
          } hover:scale-[1.02] group`}>
            {/* Header */}
            <div className="flex items-center mb-6">
              <div className={`w-10 h-10 rounded-xl mr-3 flex items-center justify-center ${
                isDarkMode ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
              } shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>AI Intelligence</h3>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>ปัญญาประดิษฐ์</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-2xl font-black mb-1 ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                }`}>AI</div>
                <div className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>สถานะระบบ</div>
                <div className="flex justify-center mt-2">
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isDarkMode 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-emerald-500/20 text-emerald-700 border border-emerald-400/30'
                  }`}>
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse mr-1"></div>
                    ทำงานปกติ
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-black mb-1 ${
                  isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
                }`}>24/7</div>
                <div className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>การตรวจสอบ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="w-full">
          <div className={`rounded-3xl p-8 border-2 transition-all duration-500 backdrop-blur-xl ${
            isDarkMode 
              ? 'bg-slate-800/40 border-cyan-500/20 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/30' 
              : 'bg-white/60 border-blue-300/30 shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/30'
          } hover:scale-[1.01] group`}>
            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-2xl mr-4 flex items-center justify-center ${
                  isDarkMode ? 'bg-gradient-to-br from-cyan-400 to-blue-500' : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                } shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>QGIS Intelligence</h2>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Real-Time Geospatial Analytics</p>
                </div>
                <div className={`ml-4 px-4 py-2 text-white text-xs rounded-full animate-pulse font-medium ${
                  isDarkMode ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gradient-to-r from-blue-500 to-cyan-600'
                }`}>LIVE</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>กำลังอัพเดท</span>
              </div>
            </div>
            
            {/* Enhanced Control Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/25'
              }`}>
                📍 เส้นทาง
              </button>
              <button className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25'
              }`}>
                🗂️ WMS Layer
              </button>
              <button className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25'
              }`}>
                🏪 ร้านค้า
              </button>
              <button 
                onClick={toggleSatelliteView}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  isSatelliteView
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25'
                    : isDarkMode 
                      ? 'bg-slate-700/60 text-gray-300 hover:bg-slate-600/60 border-2 border-slate-600/50 hover:border-slate-500/50' 
                      : 'bg-gray-200/60 text-gray-700 hover:bg-gray-300/60 border-2 border-gray-300/50 hover:border-gray-400/50'
                }`}
              >
                {isSatelliteView ? '🛰️ ดาวเทียม' : '🗺️ แผนที่'}
              </button>
              <button className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-lg shadow-orange-500/25'
              }`}>
                📊 QGIS Data
              </button>
            </div>
            
            {/* Enhanced QGIS Maps Container */}
            <div className={`rounded-2xl h-[500px] relative overflow-hidden border-2 transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-900/30 border-gray-600/30 shadow-inner shadow-gray-900/50' 
                : 'bg-gray-50/30 border-gray-300/30 shadow-inner shadow-gray-200/50'
            }`}>
              {/* QGIS Leaflet Map */}
              <div id="qgis-map" className="w-full h-full rounded-2xl"></div>
              
              {/* Enhanced Map Toggle Button */}
              <button 
                onClick={toggleSatelliteView}
                className={`absolute top-6 right-6 z-20 p-4 rounded-2xl backdrop-blur-md border-2 transition-all duration-300 hover:scale-110 ${
                  isSatelliteView
                    ? isDarkMode
                      ? 'bg-green-600/80 border-green-500/50 text-white shadow-xl shadow-green-500/25'
                      : 'bg-green-500/80 border-green-400/50 text-white shadow-xl shadow-green-500/25'
                    : isDarkMode 
                      ? 'bg-black/60 border-gray-700/50 text-white hover:bg-gray-800/60 shadow-xl' 
                      : 'bg-white/60 border-gray-300/50 text-gray-800 hover:bg-gray-100/60 shadow-xl'
                }`}
                title={isSatelliteView ? 'สลับเป็นแผนที่ปกติ' : 'สลับเป็นแผนที่ดาวเทียม'}
              >
                <span className="text-2xl">{isSatelliteView ? '🗺️' : '🛰️'}</span>
              </button>
              
              {/* Enhanced Legend Overlay */}
              <div className={`absolute top-6 left-6 backdrop-blur-md rounded-2xl p-4 text-sm z-10 border-2 ${
                isDarkMode 
                  ? 'bg-black/60 border-gray-700/50 text-white'
                  : 'bg-white/60 border-gray-300/50 text-gray-800'
              }`}>
                <div className="font-semibold mb-3 text-base">Legend</div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mr-3 shadow-sm"></div>
                    <span>RS-SHOP สาขา</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 shadow-sm"></div>
                    <span>QGIS Layer Data</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mr-3 shadow-sm"></div>
                    <span>WMS Services</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-3 shadow-sm"></div>
                    <span>Real-time Data</span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Info Box */}
              <div className={`absolute bottom-6 left-6 backdrop-blur-md rounded-2xl p-4 text-sm z-10 border-2 ${
                isDarkMode 
                  ? 'bg-black/60 border-gray-700/50 text-white'
                  : 'bg-white/60 border-gray-300/50 text-gray-800'
              }`}>
                <div className={`font-bold mb-2 text-base ${
                  isDarkMode ? 'text-cyan-400' : 'text-blue-600'
                }`}>QGIS Intelligence</div>
                <div className={`text-sm mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>🕒 อัปเดตล่าสุด: {currentTime}</div>
                <div className={`text-sm flex items-center ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <span className="mr-2">{isSatelliteView ? '🛰️' : '🗺️'}</span>
                  โหมด: {isSatelliteView ? 'ดาวเทียม' : 'แผนที่ปกติ'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Background with Animated Gradients */}
      <div className={`fixed inset-0 -z-10 transition-all duration-1000 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-black'
          : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-white'
      }`}>
        {/* Animated Background Elements */}
        <div className={`absolute inset-0 opacity-30 ${
          isDarkMode 
            ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]'
            : 'bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]'
        }`}></div>
        
        {/* Floating Orbs */}
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${
          isDarkMode 
            ? 'bg-gradient-to-r from-cyan-400 to-blue-600'
            : 'bg-gradient-to-r from-blue-400 to-cyan-500'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse delay-1000 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-400 to-pink-600'
            : 'bg-gradient-to-r from-purple-400 to-pink-500'
        }`}></div>
        <div className={`absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-3xl opacity-15 animate-pulse delay-2000 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-emerald-400 to-teal-600'
            : 'bg-gradient-to-r from-emerald-400 to-teal-500'
        }`}></div>
      </div>
    </div>
  );
}