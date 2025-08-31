// lib/services.js
import { popularDestinations } from './constants';
import { getLocationIcon } from './utils';

// Weather API Service
export const fetchWeatherData = async (lat, lng) => {
  try {
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
        visibility: data.visibility / 1000,
        isRaining: ['Rain', 'Drizzle', 'Thunderstorm'].includes(data.weather[0].main),
        rainLevel: data.rain?.['1h'] || 0,
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

// Location Search Service
export const searchPlacesEnhanced = async (query) => {
  if (!query) {
    return popularDestinations;
  }
  
  try {
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
      return formattedSuggestions;
    } else {
      return popularDestinations.filter(dest => 
        dest.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
  } catch (error) {
    console.error('Search error:', error);
    return popularDestinations.filter(dest => 
      dest.name.toLowerCase().includes(query.toLowerCase())
    );
  }
};

// Geocoding Service
export const geocodeDestination = async (address) => {
  try {
    const popular = popularDestinations.find(dest => 
      dest.name.toLowerCase().includes(address.toLowerCase())
    );
    if (popular && popular.lat && popular.lng) {
      return { lat: popular.lat, lng: popular.lng, name: popular.name };
    }
    
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

// Reverse Geocoding Service
export const getEnhancedLocationDetails = async (coordinates) => {
  try {
    const { lat, lng } = coordinates;
    
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