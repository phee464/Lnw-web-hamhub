
// lib/constants.js
export const popularDestinations = [
  { name: 'สยามพารากอน', category: 'ห้างสรรพสินค้า', icon: '🛍️', lat: 13.7463, lng: 100.5340 },
  { name: 'เซ็นทรัลเวิลด์', category: 'ห้างสรรพสินค้า', icon: '🛍️', lat: 13.7474, lng: 100.5398 },
  { name: 'ไอคอนสยาม', category: 'ห้างสรรพสินค้า', icon: '🛍️', lat: 13.7264, lng: 100.5104 },
  { name: 'สนามบินสุวรรณภูมิ', category: 'สนามบิน', icon: '✈️', lat: 13.6900, lng: 100.7501 },
  { name: 'สนามบินดอนเมือง', category: 'สนามบิน', icon: '✈️', lat: 14.1384, lng: 100.6169 },
  { name: 'สถานีกลางกรุงเทพอภิวัฒน์', category: 'สถานีรถไฟ', icon: '🚆', lat: 13.7367, lng: 100.5448 },
  { name: 'จตุจักร', category: 'ตลาด', icon: '🛒', lat: 13.7998, lng: 100.5506 },
  { name: 'ท่าอากาศยานสุวรรณภูมิ ARL', category: 'สถานีรถไฟฟ้า', icon: '🚅', lat: 13.6956, lng: 100.7516 },
];

export const transportData = {
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
    trafficFactor: 0.75,
    rainFactor: 0.5,
    cost: { base: 5, perKm: 1.5 },
    reliability: 0.75 
  },
  public: { 
    name: 'รถสาธารณะ', 
    icon: '🚌', 
    baseSpeed: 15,
    trafficFactor: 0.8,
    rainFactor: 0.9,
    cost: { base: 0, perKm: 1.2 },
    reliability: 0.9 
  },
  bts_mrt: { 
    name: 'BTS/MRT', 
    icon: '🚇', 
    baseSpeed: 35,
    trafficFactor: 1.0,
    rainFactor: 0.95,
    cost: { base: 0, perKm: 2.5 },
    reliability: 0.95 
  }
};

export const rideApps = {
  grab: { 
    name: 'Grab', 
    icon: '🟢',
    color: 'bg-green-600 hover:bg-green-700',
    brandColor: '#15A355',
    baseRate: { car: 1.2, motorcycle: 1.0 },
    surgeRate: 1.5,
    waitTime: { min: 3, max: 8 },
    url: 'https://grab.com/th/'
  },
  bolt: { 
    name: 'Bolt', 
    icon: '⚡',
    color: 'bg-green-400 hover:bg-green-500',
    brandColor: '#34D186',
    baseRate: { car: 1.0, motorcycle: 0.8 },
    surgeRate: 1.3,
    waitTime: { min: 2, max: 6 },
    url: 'https://bolt.eu/th/'
  },
  lineman: { 
    name: 'LINE MAN', 
    icon: '💚',
    color: 'bg-emerald-600 hover:bg-emerald-700',
    brandColor: '#06C355',
    baseRate: { car: 1.1, motorcycle: 0.9 },
    surgeRate: 1.4,
    waitTime: { min: 4, max: 10 },
    url: 'https://lineman.line.me/'
  },
};

export const trafficZones = [
  { name: 'ศูนย์กลางธุรกิจ (สีลม-สาทร)', multiplier: 2.0, area: { lat: [13.72, 13.73], lng: [100.52, 100.54] } },
  { name: 'ย่านช้อปปิ้ง (สยาม-ราชประสงค์)', multiplier: 1.8, area: { lat: [13.74, 13.75], lng: [100.53, 100.55] } },
  { name: 'ย่านการค้า (ประตูน้ำ-ราชเทวี)', multiplier: 1.6, area: { lat: [13.75, 13.76], lng: [100.53, 100.54] } },
  { name: 'ถนนสุขุมวิท', multiplier: 1.7, area: { lat: [13.72, 13.78], lng: [100.55, 100.65] } },
  { name: 'ถนนพหลโยธิน', multiplier: 1.5, area: { lat: [13.76, 13.85], lng: [100.52, 100.56] } },
];