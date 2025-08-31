// lib/utils.js
import { trafficZones } from './constants';

// Calculate real distance using Haversine formula
export const calculateRealDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Analyze traffic zones
export const analyzeTrafficZones = (startLat, startLng, endLat, endLng) => {
  const affectedZones = [];
  const currentHour = new Date().getHours();
  
  trafficZones.forEach(zone => {
    const inZone = (
      (startLat >= zone.area.lat[0] && startLat <= zone.area.lat[1] &&
       startLng >= zone.area.lng[0] && startLng <= zone.area.lng[1]) ||
      (endLat >= zone.area.lat[0] && endLat <= zone.area.lat[1] &&
       endLng >= zone.area.lng[0] && endLng <= zone.area.lng[1])
    );
    
    if (inZone) {
      let multiplier = zone.multiplier;
      
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

// Get location icon based on type
export const getLocationIcon = (types) => {
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

// Enhanced risk assessment
export const assessEnhancedRisk = (weather, travelData, mode, arrivalTimeStr, isDarkMode) => {
  let riskScore = 0;
  const riskFactors = [];
  
  if (weather.isRaining) {
    const rainRisk = weather.rainLevel > 5 ? 3 : weather.rainLevel > 2 ? 2 : 1;
    riskScore += rainRisk;
    riskFactors.push(`🌧️ ฝน ${weather.rainLevel.toFixed(1)}mm/ชั่วโมง`);
    
    if (mode === 'motorcycle') {
      riskScore += 2;
      riskFactors.push('⚠️ มอเตอร์ไซค์ในสายฝน');
    }
  }
  
  if (travelData.trafficZones.length > 0) {
    const trafficRisk = travelData.trafficZones.reduce((max, zone) => {
      const zoneRisk = zone.severity === 'สูงมาก' ? 4 : zone.severity === 'สูง' ? 3 : zone.severity === 'ปานกลาง' ? 2 : 1;
      return Math.max(max, zoneRisk);
    }, 0);
    riskScore += trafficRisk;
    riskFactors.push(`🚦 ${travelData.trafficZones[0].name}`);
  }
  
  const now = new Date();
  if (arrivalTimeStr) {
    try {
      const [hours, minutes] = arrivalTimeStr.split(':').map(num => parseInt(num, 10));
      
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        const targetTime = new Date();
        targetTime.setHours(hours, minutes, 0, 0);
        
        if (targetTime.getTime() <= now.getTime()) {
          targetTime.setDate(targetTime.getDate() + 1);
        }
        
        const timeUntilTarget = (targetTime.getTime() - now.getTime()) / (1000 * 60);
        
        if (timeUntilTarget < travelData.time + 15) {
          riskScore += 3;
          riskFactors.push(`⏰ เวลาเหลือน้อย (${Math.round(timeUntilTarget)} นาที)`);
        } else if (timeUntilTarget < travelData.time + 30) {
          riskScore += 1;
          riskFactors.push('⏳ เวลาค่อนข้างเพียงพอ');
        }
      }
    } catch (error) {
      console.warn('Time parsing error:', error);
      riskFactors.push('⚠️ ไม่สามารถตรวจสอบเวลาได้');
    }
  }
  
  if (travelData.reliability < 0.8) {
    riskScore += 2;
    riskFactors.push('📊 ความน่าเชื่อถือต่ำ');
  }
  
  if (mode === 'motorcycle' && travelData.distance > 20) {
    riskScore += 1;
    riskFactors.push('🏍️ ระยะทางไกล');
  }
  
  const currentHour = now.getHours();
  const isRushHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19);
  if (isRushHour) {
    riskScore += 2;
    riskFactors.push('🕐 ชั่วโมงเร่งด่วน');
  }
  
  let level, color, advice = '';
  if (riskScore >= 8) {
    level = 'อันตรายสูง';
    color = isDarkMode ? 'text-red-400 bg-red-900/30 border-red-500/50' : 'text-red-800 bg-red-100 border-red-300';
    advice = 'ควรเลื่อนเวลาออกเดินทางให้เร็วขึ้น หรือเปลี่ยนเส้นทาง';
  } else if (riskScore >= 5) {
    level = 'ควรระวัง';
    color = isDarkMode ? 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50' : 'text-yellow-700 bg-yellow-50 border-yellow-200';
    advice = 'เตรียมตัวให้พร้อม และติดตามสถานการณ์';
  } else if (riskScore >= 3) {
    level = 'ปานกลาง';
    color = isDarkMode ? 'text-orange-400 bg-orange-900/30 border-orange-500/50' : 'text-orange-700 bg-orange-50 border-orange-200';
    advice = 'วางแผนการเดินทางตามปกติ';
  } else {
    level = 'ปลอดภัย';
    color = isDarkMode ? 'text-green-400 bg-green-900/30 border-green-500/50' : 'text-green-700 bg-green-50 border-green-200';
    advice = 'เงื่อนไขดีสำหรับการเดินทาง';
  }
  
  return { level, color, factors: riskFactors, score: riskScore, advice };
};