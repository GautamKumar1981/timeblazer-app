import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchBaziProfile, saveBaziProfile } from '../store/slices/baziSlice';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';

type CityInfo = { name: string; lat: number; lon: number; tz: number };

const WORLD: Record<string, CityInfo[]> = {
  'Nepal': [
    { name: 'Kathmandu',  lat: 27.7172, lon: 85.3240,  tz: 5.75 },
    { name: 'Pokhara',    lat: 28.2096, lon: 83.9856,  tz: 5.75 },
    { name: 'Lalitpur',   lat: 27.6588, lon: 85.3247,  tz: 5.75 },
    { name: 'Bhaktapur',  lat: 27.6710, lon: 85.4298,  tz: 5.75 },
    { name: 'Biratnagar', lat: 26.4525, lon: 87.2718,  tz: 5.75 },
    { name: 'Birgunj',    lat: 27.0104, lon: 84.8771,  tz: 5.75 },
    { name: 'Dharan',     lat: 26.8065, lon: 87.2845,  tz: 5.75 },
    { name: 'Butwal',     lat: 27.7006, lon: 83.4532,  tz: 5.75 },
  ],
  'India': [
    { name: 'Mumbai',     lat: 19.0760, lon: 72.8777,  tz: 5.5 },
    { name: 'Delhi',      lat: 28.6139, lon: 77.2090,  tz: 5.5 },
    { name: 'Bangalore',  lat: 12.9716, lon: 77.5946,  tz: 5.5 },
    { name: 'Chennai',    lat: 13.0827, lon: 80.2707,  tz: 5.5 },
    { name: 'Kolkata',    lat: 22.5726, lon: 88.3639,  tz: 5.5 },
    { name: 'Hyderabad',  lat: 17.3850, lon: 78.4867,  tz: 5.5 },
    { name: 'Pune',       lat: 18.5204, lon: 73.8567,  tz: 5.5 },
    { name: 'Ahmedabad',  lat: 23.0225, lon: 72.5714,  tz: 5.5 },
    { name: 'Jaipur',     lat: 26.9124, lon: 75.7873,  tz: 5.5 },
    { name: 'Surat',      lat: 21.1702, lon: 72.8311,  tz: 5.5 },
    { name: 'Lucknow',    lat: 26.8467, lon: 80.9462,  tz: 5.5 },
    { name: 'Chandigarh', lat: 30.7333, lon: 76.7794,  tz: 5.5 },
    { name: 'Patna',      lat: 25.5941, lon: 85.1376,  tz: 5.5 },
    { name: 'Bhopal',     lat: 23.2599, lon: 77.4126,  tz: 5.5 },
    { name: 'Varanasi',   lat: 25.3176, lon: 82.9739,  tz: 5.5 },
  ],
  'USA': [
    { name: 'New York',      lat: 40.7128, lon: -74.0060,  tz: -5 },
    { name: 'Los Angeles',   lat: 34.0522, lon: -118.2437, tz: -8 },
    { name: 'Chicago',       lat: 41.8781, lon: -87.6298,  tz: -6 },
    { name: 'Houston',       lat: 29.7604, lon: -95.3698,  tz: -6 },
    { name: 'Phoenix',       lat: 33.4484, lon: -112.0740, tz: -7 },
    { name: 'Philadelphia',  lat: 39.9526, lon: -75.1652,  tz: -5 },
    { name: 'San Francisco', lat: 37.7749, lon: -122.4194, tz: -8 },
    { name: 'Seattle',       lat: 47.6062, lon: -122.3321, tz: -8 },
    { name: 'Miami',         lat: 25.7617, lon: -80.1918,  tz: -5 },
    { name: 'Boston',        lat: 42.3601, lon: -71.0589,  tz: -5 },
    { name: 'Dallas',        lat: 32.7767, lon: -96.7970,  tz: -6 },
    { name: 'Atlanta',       lat: 33.7490, lon: -84.3880,  tz: -5 },
    { name: 'Denver',        lat: 39.7392, lon: -104.9903, tz: -7 },
    { name: 'Las Vegas',     lat: 36.1699, lon: -115.1398, tz: -8 },
    { name: 'Washington DC', lat: 38.9072, lon: -77.0369,  tz: -5 },
  ],
  'UK': [
    { name: 'London',     lat: 51.5074, lon: -0.1278, tz: 0 },
    { name: 'Birmingham', lat: 52.4862, lon: -1.8904, tz: 0 },
    { name: 'Manchester', lat: 53.4808, lon: -2.2426, tz: 0 },
    { name: 'Glasgow',    lat: 55.8642, lon: -4.2518, tz: 0 },
    { name: 'Leeds',      lat: 53.8008, lon: -1.5491, tz: 0 },
    { name: 'Edinburgh',  lat: 55.9533, lon: -3.1883, tz: 0 },
    { name: 'Bristol',    lat: 51.4545, lon: -2.5879, tz: 0 },
    { name: 'Liverpool',  lat: 53.4084, lon: -2.9916, tz: 0 },
  ],
  'Australia': [
    { name: 'Sydney',      lat: -33.8688, lon: 151.2093, tz: 10 },
    { name: 'Melbourne',   lat: -37.8136, lon: 144.9631, tz: 10 },
    { name: 'Brisbane',    lat: -27.4698, lon: 153.0251, tz: 10 },
    { name: 'Perth',       lat: -31.9505, lon: 115.8605, tz: 8 },
    { name: 'Adelaide',    lat: -34.9285, lon: 138.6007, tz: 9.5 },
    { name: 'Canberra',    lat: -35.2809, lon: 149.1300, tz: 10 },
    { name: 'Gold Coast',  lat: -28.0167, lon: 153.4000, tz: 10 },
  ],
  'Canada': [
    { name: 'Toronto',   lat: 43.6532, lon: -79.3832,  tz: -5 },
    { name: 'Vancouver', lat: 49.2827, lon: -123.1207, tz: -8 },
    { name: 'Montreal',  lat: 45.5017, lon: -73.5673,  tz: -5 },
    { name: 'Calgary',   lat: 51.0447, lon: -114.0719, tz: -7 },
    { name: 'Ottawa',    lat: 45.4215, lon: -75.6972,  tz: -5 },
    { name: 'Edmonton',  lat: 53.5461, lon: -113.4938, tz: -7 },
    { name: 'Winnipeg',  lat: 49.8951, lon: -97.1384,  tz: -6 },
  ],
  'China': [
    { name: 'Beijing',   lat: 39.9042, lon: 116.4074, tz: 8 },
    { name: 'Shanghai',  lat: 31.2304, lon: 121.4737, tz: 8 },
    { name: 'Guangzhou', lat: 23.1291, lon: 113.2644, tz: 8 },
    { name: 'Shenzhen',  lat: 22.5431, lon: 114.0579, tz: 8 },
    { name: 'Chengdu',   lat: 30.5728, lon: 104.0668, tz: 8 },
    { name: 'Hangzhou',  lat: 30.2741, lon: 120.1551, tz: 8 },
    { name: 'Wuhan',     lat: 30.5928, lon: 114.3055, tz: 8 },
    { name: "Xi'an",     lat: 34.3416, lon: 108.9398, tz: 8 },
    { name: 'Chongqing', lat: 29.5630, lon: 106.5516, tz: 8 },
    { name: 'Tianjin',   lat: 39.3434, lon: 117.3616, tz: 8 },
  ],
  'Japan': [
    { name: 'Tokyo',     lat: 35.6762, lon: 139.6503, tz: 9 },
    { name: 'Osaka',     lat: 34.6937, lon: 135.5023, tz: 9 },
    { name: 'Kyoto',     lat: 35.0116, lon: 135.7681, tz: 9 },
    { name: 'Hiroshima', lat: 34.3853, lon: 132.4553, tz: 9 },
    { name: 'Sapporo',   lat: 43.0621, lon: 141.3544, tz: 9 },
    { name: 'Fukuoka',   lat: 33.5904, lon: 130.4017, tz: 9 },
    { name: 'Nagoya',    lat: 35.1815, lon: 136.9066, tz: 9 },
  ],
  'South Korea': [
    { name: 'Seoul',   lat: 37.5665, lon: 126.9780, tz: 9 },
    { name: 'Busan',   lat: 35.1796, lon: 129.0756, tz: 9 },
    { name: 'Incheon', lat: 37.4563, lon: 126.7052, tz: 9 },
    { name: 'Daegu',   lat: 35.8714, lon: 128.6014, tz: 9 },
  ],
  'Singapore': [
    { name: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 8 },
  ],
  'Malaysia': [
    { name: 'Kuala Lumpur', lat: 3.1390,  lon: 101.6869, tz: 8 },
    { name: 'George Town',  lat: 5.4141,  lon: 100.3288, tz: 8 },
    { name: 'Johor Bahru',  lat: 1.4927,  lon: 103.7414, tz: 8 },
    { name: 'Kota Kinabalu',lat: 5.9804,  lon: 116.0735, tz: 8 },
  ],
  'Indonesia': [
    { name: 'Jakarta',          lat: -6.2088, lon: 106.8456, tz: 7 },
    { name: 'Surabaya',         lat: -7.2504, lon: 112.7688, tz: 7 },
    { name: 'Bandung',          lat: -6.9175, lon: 107.6191, tz: 7 },
    { name: 'Bali (Denpasar)', lat: -8.6705, lon: 115.2126, tz: 8 },
    { name: 'Medan',            lat: 3.5952,  lon: 98.6722,  tz: 7 },
  ],
  'Thailand': [
    { name: 'Bangkok',    lat: 13.7563, lon: 100.5018, tz: 7 },
    { name: 'Chiang Mai', lat: 18.7883, lon: 98.9853,  tz: 7 },
    { name: 'Pattaya',    lat: 12.9236, lon: 100.8825, tz: 7 },
    { name: 'Phuket',     lat: 7.8804,  lon: 98.3923,  tz: 7 },
  ],
  'Vietnam': [
    { name: 'Hanoi',            lat: 21.0285, lon: 105.8542, tz: 7 },
    { name: 'Ho Chi Minh City', lat: 10.8231, lon: 106.6297, tz: 7 },
    { name: 'Da Nang',          lat: 16.0544, lon: 108.2022, tz: 7 },
  ],
  'Philippines': [
    { name: 'Manila',    lat: 14.5995, lon: 120.9842, tz: 8 },
    { name: 'Cebu City', lat: 10.3157, lon: 123.8854, tz: 8 },
    { name: 'Davao',     lat: 7.1907,  lon: 125.4553, tz: 8 },
  ],
  'Germany': [
    { name: 'Berlin',    lat: 52.5200, lon: 13.4050, tz: 1 },
    { name: 'Munich',    lat: 48.1351, lon: 11.5820, tz: 1 },
    { name: 'Hamburg',   lat: 53.5753, lon: 10.0153, tz: 1 },
    { name: 'Frankfurt', lat: 50.1109, lon: 8.6821,  tz: 1 },
    { name: 'Cologne',   lat: 50.9333, lon: 6.9500,  tz: 1 },
    { name: 'Stuttgart', lat: 48.7758, lon: 9.1829,  tz: 1 },
  ],
  'France': [
    { name: 'Paris',      lat: 48.8566, lon: 2.3522, tz: 1 },
    { name: 'Lyon',       lat: 45.7640, lon: 4.8357, tz: 1 },
    { name: 'Marseille',  lat: 43.2965, lon: 5.3698, tz: 1 },
    { name: 'Nice',       lat: 43.7102, lon: 7.2620, tz: 1 },
    { name: 'Bordeaux',   lat: 44.8378, lon: -0.5792, tz: 1 },
  ],
  'Italy': [
    { name: 'Rome',     lat: 41.9028, lon: 12.4964, tz: 1 },
    { name: 'Milan',    lat: 45.4654, lon: 9.1859,  tz: 1 },
    { name: 'Venice',   lat: 45.4408, lon: 12.3155, tz: 1 },
    { name: 'Florence', lat: 43.7696, lon: 11.2558, tz: 1 },
    { name: 'Naples',   lat: 40.8518, lon: 14.2681, tz: 1 },
  ],
  'Spain': [
    { name: 'Madrid',    lat: 40.4168, lon: -3.7038, tz: 1 },
    { name: 'Barcelona', lat: 41.3851, lon: 2.1734,  tz: 1 },
    { name: 'Seville',   lat: 37.3891, lon: -5.9845, tz: 1 },
    { name: 'Valencia',  lat: 39.4699, lon: -0.3763, tz: 1 },
    { name: 'Bilbao',    lat: 43.2630, lon: -2.9350, tz: 1 },
  ],
  'Netherlands': [
    { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, tz: 1 },
    { name: 'Rotterdam', lat: 51.9225, lon: 4.4792, tz: 1 },
    { name: 'The Hague', lat: 52.0705, lon: 4.3007, tz: 1 },
  ],
  'Switzerland': [
    { name: 'Zurich',  lat: 47.3769, lon: 8.5417, tz: 1 },
    { name: 'Geneva',  lat: 46.2044, lon: 6.1432, tz: 1 },
    { name: 'Basel',   lat: 47.5596, lon: 7.5886, tz: 1 },
    { name: 'Bern',    lat: 46.9480, lon: 7.4474, tz: 1 },
  ],
  'UAE': [
    { name: 'Dubai',     lat: 25.2048, lon: 55.2708, tz: 4 },
    { name: 'Abu Dhabi', lat: 24.4539, lon: 54.3773, tz: 4 },
    { name: 'Sharjah',   lat: 25.3462, lon: 55.4211, tz: 4 },
  ],
  'Saudi Arabia': [
    { name: 'Riyadh', lat: 24.7136, lon: 46.6753, tz: 3 },
    { name: 'Jeddah', lat: 21.5433, lon: 39.1728, tz: 3 },
    { name: 'Mecca',  lat: 21.3891, lon: 39.8579, tz: 3 },
    { name: 'Medina', lat: 24.5247, lon: 39.5692, tz: 3 },
  ],
  'Russia': [
    { name: 'Moscow',          lat: 55.7558, lon: 37.6173, tz: 3 },
    { name: 'Saint Petersburg',lat: 59.9311, lon: 30.3609, tz: 3 },
    { name: 'Novosibirsk',     lat: 54.9885, lon: 82.9207, tz: 7 },
  ],
  'Brazil': [
    { name: 'Sao Paulo',       lat: -23.5505, lon: -46.6333, tz: -3 },
    { name: 'Rio de Janeiro',  lat: -22.9068, lon: -43.1729, tz: -3 },
    { name: 'Brasilia',        lat: -15.7942, lon: -47.8822, tz: -3 },
    { name: 'Salvador',        lat: -12.9714, lon: -38.5014, tz: -3 },
    { name: 'Fortaleza',       lat: -3.7172,  lon: -38.5433, tz: -3 },
  ],
  'Mexico': [
    { name: 'Mexico City',  lat: 19.4326, lon: -99.1332,  tz: -6 },
    { name: 'Guadalajara',  lat: 20.6597, lon: -103.3496, tz: -6 },
    { name: 'Monterrey',    lat: 25.6866, lon: -100.3161, tz: -6 },
    { name: 'Cancun',       lat: 21.1619, lon: -86.8515,  tz: -5 },
  ],
  'Argentina': [
    { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816, tz: -3 },
    { name: 'Cordoba',      lat: -31.4201, lon: -64.1888, tz: -3 },
    { name: 'Rosario',      lat: -32.9442, lon: -60.6505, tz: -3 },
  ],
  'South Africa': [
    { name: 'Johannesburg', lat: -26.2041, lon: 28.0473, tz: 2 },
    { name: 'Cape Town',    lat: -33.9249, lon: 18.4241, tz: 2 },
    { name: 'Durban',       lat: -29.8587, lon: 31.0218, tz: 2 },
    { name: 'Pretoria',     lat: -25.7461, lon: 28.1881, tz: 2 },
  ],
  'Nigeria': [
    { name: 'Lagos',  lat: 6.5244,  lon: 3.3792,  tz: 1 },
    { name: 'Abuja',  lat: 9.0579,  lon: 7.4951,  tz: 1 },
    { name: 'Kano',   lat: 12.0022, lon: 8.5920,  tz: 1 },
  ],
  'Kenya': [
    { name: 'Nairobi',  lat: -1.2921, lon: 36.8219, tz: 3 },
    { name: 'Mombasa',  lat: -4.0435, lon: 39.6682, tz: 3 },
  ],
  'Pakistan': [
    { name: 'Karachi',    lat: 24.8607, lon: 67.0011, tz: 5 },
    { name: 'Lahore',     lat: 31.5204, lon: 74.3587, tz: 5 },
    { name: 'Islamabad',  lat: 33.6844, lon: 73.0479, tz: 5 },
    { name: 'Rawalpindi', lat: 33.5651, lon: 73.0169, tz: 5 },
  ],
  'Bangladesh': [
    { name: 'Dhaka',      lat: 23.8103, lon: 90.4125, tz: 6 },
    { name: 'Chittagong', lat: 22.3569, lon: 91.7832, tz: 6 },
    { name: 'Sylhet',     lat: 24.8949, lon: 91.8687, tz: 6 },
  ],
  'Sri Lanka': [
    { name: 'Colombo', lat: 6.9271, lon: 79.8612, tz: 5.5 },
    { name: 'Kandy',   lat: 7.2906, lon: 80.6337, tz: 5.5 },
    { name: 'Jaffna',  lat: 9.6615, lon: 80.0255, tz: 5.5 },
  ],
  'New Zealand': [
    { name: 'Auckland',      lat: -36.8509, lon: 174.7645, tz: 12 },
    { name: 'Wellington',    lat: -41.2924, lon: 174.7787, tz: 12 },
    { name: 'Christchurch',  lat: -43.5321, lon: 172.6362, tz: 12 },
  ],
  'Portugal': [
    { name: 'Lisbon', lat: 38.7223, lon: -9.1393, tz: 0 },
    { name: 'Porto',  lat: 41.1579, lon: -8.6291, tz: 0 },
  ],
  'Sweden': [
    { name: 'Stockholm',  lat: 59.3293, lon: 18.0686, tz: 1 },
    { name: 'Gothenburg', lat: 57.7089, lon: 11.9746, tz: 1 },
  ],
  'Norway': [
    { name: 'Oslo',   lat: 59.9139, lon: 10.7522, tz: 1 },
    { name: 'Bergen', lat: 60.3913, lon: 5.3221,  tz: 1 },
  ],
  'Denmark': [
    { name: 'Copenhagen', lat: 55.6761, lon: 12.5683, tz: 1 },
  ],
  'Finland': [
    { name: 'Helsinki', lat: 60.1699, lon: 24.9384, tz: 2 },
    { name: 'Tampere',  lat: 61.4978, lon: 23.7610, tz: 2 },
  ],
  'Poland': [
    { name: 'Warsaw', lat: 52.2297, lon: 21.0122, tz: 1 },
    { name: 'Krakow', lat: 50.0647, lon: 19.9450, tz: 1 },
    { name: 'Gdansk', lat: 54.3520, lon: 18.6466, tz: 1 },
  ],
  'Turkey': [
    { name: 'Istanbul', lat: 41.0082, lon: 28.9784, tz: 3 },
    { name: 'Ankara',   lat: 39.9334, lon: 32.8597, tz: 3 },
    { name: 'Izmir',    lat: 38.4237, lon: 27.1428, tz: 3 },
  ],
  'Egypt': [
    { name: 'Cairo',      lat: 30.0444, lon: 31.2357, tz: 2 },
    { name: 'Alexandria', lat: 31.2001, lon: 29.9187, tz: 2 },
  ],
  'Israel': [
    { name: 'Tel Aviv',   lat: 32.0853, lon: 34.7818, tz: 2 },
    { name: 'Jerusalem',  lat: 31.7683, lon: 35.2137, tz: 2 },
  ],
  'Iran': [
    { name: 'Tehran',  lat: 35.6892, lon: 51.3890, tz: 3.5 },
    { name: 'Isfahan', lat: 32.6546, lon: 51.6680, tz: 3.5 },
    { name: 'Mashhad', lat: 36.2972, lon: 59.6067, tz: 3.5 },
  ],
  'Myanmar': [
    { name: 'Yangon',    lat: 16.8661, lon: 96.1951, tz: 6.5 },
    { name: 'Mandalay',  lat: 21.9588, lon: 96.0891, tz: 6.5 },
    { name: 'Naypyidaw', lat: 19.7633, lon: 96.0785, tz: 6.5 },
  ],
  'Other': [
    { name: 'Other', lat: 0, lon: 0, tz: 0 },
  ],
};

const COUNTRIES = ['Nepal', ...Object.keys(WORLD).filter(c => c !== 'Nepal' && c !== 'Other').sort(), 'Other'];

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', backgroundColor: '#fff',
  border: '1px solid #e2d9f3', borderRadius: 8,
  color: '#1f2937', fontSize: 14, boxSizing: 'border-box', outline: 'none',
};

const BaziProfile: React.FC = () => {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { profile, loading, error } = useAppSelector((s) => s.bazi);
  const { user } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({
    birth_date: '', birth_hour: '8', birth_minute: '0',
    gender: 'M', timezone_offset: '8',
    birth_country: 'Nepal', birth_city: 'Kathmandu',
    birth_lat: '27.7172', birth_lon: '85.3240',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => { dispatch(fetchBaziProfile()); }, [dispatch]);

  useEffect(() => {
    if (profile) setForm({
      birth_date:       profile.birth_date,
      birth_hour:       String(profile.birth_hour),
      birth_minute:     String(profile.birth_minute),
      gender:           profile.gender,
      timezone_offset:  String(profile.timezone_offset),
      birth_country:    profile.birth_country || 'Nepal',
      birth_city:       profile.birth_city || 'Kathmandu',
      birth_lat:        profile.birth_lat != null ? String(profile.birth_lat) : '27.7172',
      birth_lon:        profile.birth_lon != null ? String(profile.birth_lon) : '85.3240',
    });
  }, [profile]);

  const handleCountryChange = (country: string) => {
    const cities = WORLD[country] || [];
    const first = cities[0];
    setForm(f => ({
      ...f,
      birth_country: country,
      birth_city: first ? first.name : '',
      birth_lat: first ? String(first.lat) : '',
      birth_lon: first ? String(first.lon) : '',
      timezone_offset: first ? String(first.tz) : f.timezone_offset,
    }));
  };

  const handleCityChange = (city: string) => {
    const cities = WORLD[form.birth_country] || [];
    const found = cities.find(c => c.name === city);
    if (found) {
      setForm(f => ({
        ...f, birth_city: city,
        birth_lat: String(found.lat),
        birth_lon: String(found.lon),
        timezone_offset: String(found.tz),
      }));
    } else {
      setForm(f => ({ ...f, birth_city: city }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(saveBaziProfile({
      birth_date:      form.birth_date,
      birth_hour:      parseInt(form.birth_hour),
      birth_minute:    parseInt(form.birth_minute),
      gender:          form.gender,
      timezone_offset: parseFloat(form.timezone_offset),
      birth_country:   form.birth_country,
      birth_city:      form.birth_city,
      birth_lat:       form.birth_lat !== '' ? parseFloat(form.birth_lat) : null,
      birth_lon:       form.birth_lon !== '' ? parseFloat(form.birth_lon) : null,
    }));
    if (saveBaziProfile.fulfilled.match(result)) {
      setSaved(true);
      setTimeout(() => { setSaved(false); navigate('/chart'); }, 1500);
    }
  };

  const label = (text: string) => (
    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6, fontWeight: 600 }}>
      {text}
    </label>
  );

  const cities = WORLD[form.birth_country] || [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>

          {user?.name && (
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>
                {user.name[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#2e1065' }}>Hello, {user.name}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Your birth profile powers Four Pillars + Vedic astrology</div>
              </div>
            </div>
          )}

          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#2e1065' }}>
            👤 Birth Profile Setup
          </h2>
          <p style={{ color: '#9ca3af', fontSize: 13, margin: '0 0 28px' }}>
            Your birth details are used for Four Pillars (四柱八字) and Vedic Jyotish charts.
          </p>

          {profile?.moon_rashi && (
            <div style={{ backgroundColor: '#ede9fe', borderRadius: 10, padding: '10px 16px', marginBottom: 20, border: '1px solid #c4b5fd', fontSize: 13, color: '#4c1d95' }}>
              Moon Rashi: <strong>{profile.moon_rashi}</strong> · Nakshatra: <strong>{profile.moon_nakshatra}</strong>
            </div>
          )}

          <div style={{ maxWidth: 540 }}>
            <form onSubmit={handleSubmit}>

              {/* Birth date & time */}
              <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e3f8', marginBottom: 20, boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 15, color: '#4c1d95', fontWeight: 700 }}>
                  Birth Date & Time
                </h3>

                <div style={{ marginBottom: 18 }}>
                  {label('Date of Birth')}
                  <input type="date" style={inp} value={form.birth_date} required
                    onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                  <div>
                    {label('Birth Hour (0–23)')}
                    <input type="number" style={inp} min={0} max={23} value={form.birth_hour} required
                      onChange={(e) => setForm({ ...form, birth_hour: e.target.value })} />
                  </div>
                  <div>
                    {label('Birth Minute')}
                    <input type="number" style={inp} min={0} max={59} value={form.birth_minute}
                      onChange={(e) => setForm({ ...form, birth_minute: e.target.value })} />
                  </div>
                </div>

                <div>
                  {label('Gender')}
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[{ v: 'M', l: '♂ Male' }, { v: 'F', l: '♀ Female' }].map(({ v, l }) => (
                      <button key={v} type="button"
                        onClick={() => setForm({ ...form, gender: v })}
                        style={{
                          flex: 1, padding: '10px 0', borderRadius: 9, fontWeight: 700, fontSize: 14,
                          border: `2px solid ${form.gender === v ? '#7c3aed' : '#e2d9f3'}`,
                          backgroundColor: form.gender === v ? '#ede9fe' : '#fff',
                          color: form.gender === v ? '#6d28d9' : '#9ca3af', cursor: 'pointer',
                        }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Birth location */}
              <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e3f8', marginBottom: 20, boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 15, color: '#4c1d95', fontWeight: 700 }}>
                  Birth Location
                </h3>

                <div style={{ marginBottom: 14 }}>
                  {label('Country')}
                  <select style={{ ...inp, appearance: 'none' as any }}
                    value={form.birth_country}
                    onChange={(e) => handleCountryChange(e.target.value)}>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  {label('City')}
                  <select style={{ ...inp, appearance: 'none' as any }}
                    value={form.birth_city}
                    onChange={(e) => handleCityChange(e.target.value)}>
                    {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    {label('Latitude')}
                    <input type="number" step="0.0001" style={inp} value={form.birth_lat}
                      onChange={(e) => setForm(f => ({ ...f, birth_lat: e.target.value }))} />
                  </div>
                  <div>
                    {label('Longitude')}
                    <input type="number" step="0.0001" style={inp} value={form.birth_lon}
                      onChange={(e) => setForm(f => ({ ...f, birth_lon: e.target.value }))} />
                  </div>
                </div>

                <div>
                  {label('Timezone (UTC offset)')}
                  <input type="number" step="0.25" style={inp} value={form.timezone_offset}
                    onChange={(e) => setForm(f => ({ ...f, timezone_offset: e.target.value }))} />
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                    Auto-filled from city. e.g. 5.5 for IST, 5.75 for NPT, -5 for EST
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#f5f3ff', borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: '1px solid #e8e3f8', fontSize: 13, color: '#6b7280' }}>
                Exact birth time improves Lagna and Nakshatra accuracy. If unknown, 6:00 AM is a safe default — Moon Rashi will still be calculated.
              </div>

              {error && (
                <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 14, border: '1px solid #fecaca' }}>
                  {error}
                </div>
              )}

              {saved && (
                <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 14, border: '1px solid #6ee7b7' }}>
                  Profile saved — redirecting to your chart...
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px 0', backgroundColor: '#7c3aed',
                color: '#fff', border: 'none', borderRadius: 9, fontSize: 15,
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Saving...' : profile ? 'Update My Chart →' : 'Calculate My Four Pillars Chart →'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BaziProfile;
