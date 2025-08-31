// hooks/useTravelCalculation.js
import { useState } from 'react';
import { calculateRealDistance, analyzeTrafficZones, assessEnhancedRisk } from '@/lib/utils';
import { fetchWeatherData, geocodeDestination } from '@/lib/services';
import { transportData } from '@/lib/constants';

export const useTravelCalculation = (isDarkMode) => {
  const [loading, setLoading] = useState(false);

  const calculateEnhancedTravelTime = async (startCoords, endCoords, mode, weather) => {
    const distance = calculateRealDistance(startCoords.lat, startCoords.lng, endCoords.lat, endCoords.lng);
    const transport = transportData[mode];
    const trafficZones = analyzeTrafficZones(startCoords.lat, startCoords.lng, endCoords.lat, endCoords.lng);
    
    let baseTime = (distance / transport.baseSpeed) * 60;
    
    const avgTrafficMultiplier = trafficZones.length > 0 
      ? trafficZones.reduce((sum, zone) => sum + zone.multiplier, 0) / trafficZones.length
      : 1;
    
    baseTime = baseTime / (transport.trafficFactor * (2 - avgTrafficMultiplier));
    
    if (weather?.isRaining) {
      baseTime = baseTime / transport.rainFactor;
    }
    
    if (mode === 'public' || mode === 'bts_mrt') {
      baseTime += 15;
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

  const calculateEnhancedRoute = async ({
    destination,
    destinationCoords,
    setDestinationCoords,
    arrivalTime,
    currentLocation,
    transportMode
  }) => {
    if (!destination.trim() || !arrivalTime || !currentLocation) {
      throw new Error('กรุณากรอกจุดหมาย เวลา และอนุญาตการเข้าถึงตำแหน่ง');
    }
    
    setLoading(true);
    try {
      let endCoords = destinationCoords;
      if (!endCoords) {
        const geocodeResult = await geocodeDestination(destination);
        if (geocodeResult) {
          endCoords = geocodeResult;
          setDestinationCoords(geocodeResult);
        } else {
          throw new Error('ไม่สามารถหาตำแหน่งจุดหมายได้');
        }
      }
      
      const [weather, travelData] = await Promise.all([
        fetchWeatherData(currentLocation.lat, currentLocation.lng),
        calculateEnhancedTravelTime(currentLocation, endCoords, transportMode, null)
      ]);
      
      const updatedTravelData = await calculateEnhancedTravelTime(currentLocation, endCoords, transportMode, weather);
      
      // Enhanced time validation
      const [hours, minutes] = arrivalTime.split(':').map(num => parseInt(num, 10));
      
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error('รูปแบบเวลาไม่ถูกต้อง กรุณากรอกเวลาให้ถูกต้อง');
      }
      
      const now = new Date();
      const arrivalDateTime = new Date();
      arrivalDateTime.setHours(hours, minutes, 0, 0);
      
      if (arrivalDateTime.getTime() <= now.getTime()) {
        arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
      }
      
      const maxHoursInFuture = 24;
      const maxFutureTime = new Date(now.getTime() + (maxHoursInFuture * 60 * 60 * 1000));
      if (arrivalDateTime.getTime() > maxFutureTime.getTime()) {
        throw new Error(`เวลาที่เลือกไกลเกินไป กรุณาเลือกเวลาภายใน ${maxHoursInFuture} ชั่วโมง`);
      }
      
      let bufferTime = Math.round(updatedTravelData.time * (1 - updatedTravelData.reliability) * 0.5);
      
      if (weather.isRaining) {
        bufferTime += Math.round(weather.rainLevel * 2);
      }
      
      if (updatedTravelData.trafficZones.length > 0) {
        const avgSeverity = updatedTravelData.trafficZones.reduce((sum, zone) => 
          sum + (zone.severity === 'สูงมาก' ? 4 : zone.severity === 'สูง' ? 3 : zone.severity === 'ปานกลาง' ? 2 : 1), 0
        ) / updatedTravelData.trafficZones.length;
        bufferTime += Math.round(avgSeverity * 3);
      }
      
      bufferTime = Math.max(bufferTime, 5);
      bufferTime = Math.min(bufferTime, 30);
      
      const totalTime = updatedTravelData.time + bufferTime;
      const departureDateTime = new Date(arrivalDateTime.getTime() - (totalTime * 60 * 1000));
      
      const risk = assessEnhancedRisk(weather, updatedTravelData, transportMode, arrivalTime, isDarkMode);
      
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

      return { result, weather };
      
    } catch (error) {
      console.error("Enhanced route calculation error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    calculateEnhancedRoute,
    loading
  };
};