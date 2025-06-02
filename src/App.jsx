/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Moon, Sun, RefreshCw, Search, Navigation, Loader2, MapPin, AlertCircle, Cloud, CloudRain, CloudSnow, Zap, Star, Plus, Droplets, Wind, Eye, Gauge, Sunrise, Sunset, Heart, BarChart3, Calendar, Clock, TrendingUp, Compass, Thermometer } from 'lucide-react';

// API constants
const API_KEY = "27c5e288bfb79247a8276b11fb4c12ac";
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const App = () => {
  // Core state
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Weather data
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [lastSearchedCity, setLastSearchedCity] = useState('');
  const [units, setUnits] = useState('metric'); // 'metric' or 'imperial'

  // Preferences (using in-memory storage)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // Enhanced city suggestions
  const Cities = useMemo(() => [
    // Major Metropolitan Cities
    'Mumbai, IN', 'Delhi, IN', 'Bangalore, IN', 'Chennai, IN', 
    'Kolkata, IN', 'Hyderabad, IN', 'Pune, IN', 'Ahmedabad, IN',
    
    // State Capitals
    'Lucknow, IN', 'Jaipur, IN', 'Bhopal, IN', 'Patna, IN',
    'Chandigarh, IN', 'Thiruvananthapuram, IN', 'Bhubaneswar, IN',
    'Raipur, IN', 'Gangtok, IN', 'Shimla, IN', 'Dehradun, IN',
    'Ranchi, IN', 'Agartala, IN', 'Kohima, IN', 'Imphal, IN',
    'Shillong, IN', 'Aizawl, IN', 'Panaji, IN', 'Itanagar, IN',
    
    // Other Major Cities
    'Surat, IN', 'Nagpur, IN', 'Kanpur, IN', 'Indore, IN',
    'Thane, IN', 'Visakhapatnam, IN', 'Pimpri-Chinchwad, IN',
    'Vadodara, IN', 'Ghaziabad, IN', 'Ludhiana, IN', 'Agra, IN',
    'Nashik, IN', 'Faridabad, IN', 'Meerut, IN', 'Rajkot, IN',
    'Varanasi, IN', 'Srinagar, IN', 'Aurangabad, IN', 'Dhanbad, IN',
    'Amritsar, IN', 'Allahabad, IN', 'Guwahati, IN', 'Coimbatore, IN',
    'Howrah, IN', 'Mysore, IN', 'Jodhpur, IN', 'Gwalior, IN',
    'Vijayawada, IN', 'Madurai, IN', 'Salem, IN', 'Hubli-Dharwad, IN',
    'Tiruppur, IN', 'Tiruchirappalli, IN', 'Bareilly, IN', 'Moradabad, IN',
    'Kota, IN', 'Bhilai, IN', 'Jamshedpur, IN', 'Mangalore, IN',
    'Cuttack, IN', 'Ajmer, IN', 'Gaya, IN', 'Warangal, IN',
    'Erode, IN', 'Ooty, IN', 'Dehradun, IN', 'Jammu, IN',
    'Puducherry, IN', 'Port Blair, IN', 'Silvassa, IN', 'Daman, IN',
    'Kavaratti, IN', 'Leh, IN',
    
    // Tourism/Religious Cities
    'Haridwar, IN', 'Rishikesh, IN', 'Varkala, IN', 'Pushkar, IN',
    'Tirupati, IN', 'Mathura, IN', 'Vrindavan, IN', 'Bodh Gaya, IN',
    'Shirdi, IN', 'Amarnath, IN', 'Dwarka, IN', 'Puri, IN',
    'Rameswaram, IN', 'Kedarnath, IN', 'Badrinath, IN', 'Gangotri, IN',
    
    // Industrial/Economic Cities
    'Noida, IN', 'Gurugram, IN', 'Bhiwadi, IN', 'Siliguri, IN',
    'Bhubaneswar, IN', 'Thiruvananthapuram, IN', 'Kochi, IN',
    'Visakhapatnam, IN', 'Guntur, IN', 'Bhilai, IN', 'Bokaro, IN',
    'Jamnagar, IN', 'Durgapur, IN', 'Asansol, IN', 'Rourkela, IN',
    'Navi Mumbai, IN'
  ], []);

  // Initialize app with default data
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      try {
        await fetchWeatherData('Chennai, IN');
      } catch (err) {
        setError('Failed to load initial weather data');
      }
      setLoading(false);
    };
    
    initializeApp();
  }, []);

  // Auto-refresh weather data
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (lastSearchedCity) {
        refreshWeather();
      }
    }, 600000); // Refresh every 10 minutes

    return () => clearInterval(refreshInterval);
  }, [lastSearchedCity]);

  // Enhanced weather condition mapping
  const getWeatherCondition = useCallback((weatherMain, weatherId) => {
    if (weatherId >= 200 && weatherId < 300) return 'stormy';
    if (weatherId >= 300 && weatherId < 400) return 'drizzle';
    if (weatherId >= 500 && weatherId < 600) return 'rainy';
    if (weatherId >= 600 && weatherId < 700) return 'snowy';
    if (weatherId >= 700 && weatherId < 800) return 'foggy';
    if (weatherId === 800) return 'sunny';
    if (weatherId > 800) return 'cloudy';
    return 'sunny';
  }, []);

  // Process and structure weather data
  const processWeatherData = (currentData, forecastData) => {
    const tempUnit = '°C';
    const speedUnit = 'km/h';
    const speedMultiplier = 3.6;
    
    // Process current weather
    const processedCurrent = {
      city: currentData.name,
      country: currentData.sys.country,
      temperature: Math.round(currentData.main.temp),
      condition: getWeatherCondition(currentData.weather[0].main, currentData.weather[0].id),
      description: currentData.weather[0].description,
      humidity: currentData.main.humidity,
      windSpeed: Math.round(currentData.wind.speed * speedMultiplier),
      windDirection: currentData.wind.deg,
      visibility: Math.round((currentData.visibility || 10000) / 1000),
      feelsLike: Math.round(currentData.main.feels_like),
      pressure: currentData.main.pressure,
      sunrise: new Date(currentData.sys.sunrise * 1000),
      sunset: new Date(currentData.sys.sunset * 1000),
      lastUpdated: new Date(currentData.dt * 1000).toLocaleTimeString(), // Use API timestamp
      dataAge: Math.round((Date.now() - currentData.dt * 1000) / 1000 / 60), // Age in minutes
      tempUnit,
      speedUnit,
      coord: currentData.coord
    };

    // Process daily forecast - Modified to show next 5 days
    const dailyForecast = [];
    const today = new Date();
    const seenDates = new Set();

    // Group forecast data by date and get one entry per day
    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toLocaleDateString();
      
      // Skip if it's today or if we already have this date
      if (date.getDate() === today.getDate() || seenDates.has(dateStr)) {
        return;
      }

      // Only take the next 5 days
      if (dailyForecast.length < 5) {
        seenDates.add(dateStr);
        dailyForecast.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: dateStr,
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          condition: getWeatherCondition(item.weather[0].main, item.weather[0].id),
          description: item.weather[0].description,
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed * speedMultiplier),
          pop: Math.round((item.pop || 0) * 100),
          tempUnit,
          speedUnit
        });
      }
    });

    // Process hourly forecast
    const hourlyForecast = forecastData.list.slice(0, 8).map((item, index) => {
      const date = new Date(Date.now() + (index * 3 * 60 * 60 * 1000));
      return {
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        temperature: Math.round(item.main.temp),
        condition: getWeatherCondition(item.weather[0].main, item.weather[0].id),
        pop: Math.round((item.pop || 0) * 100),
        tempUnit
      };
    });

    setCurrentWeather(processedCurrent);
    setForecast(dailyForecast);
    setHourlyForecast(hourlyForecast);
    setLastSearchedCity(`${currentData.name}, ${currentData.sys.country}`);
  };

  // Enhanced weather fetching
  const fetchWeatherData = async (city, showLoading = true) => {
    if (!city?.trim()) {
      setError('Please enter a city name');
      return;
    }

    if (showLoading) setLoading(true);
    setError('');

    try {
      // Extract city name without country code
      const cityName = city.split(',')[0].trim();
      
      // Modified geocoding URL with limit=5 to get more results
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=5&appid=${API_KEY}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (!geoData.length) {
        throw new Error('City not found');
      }

      // Find the major city by prioritizing state capitals and larger cities
      const majorCity = geoData.find(location => {
        // Check if the name exactly matches what we searched for
        const nameMatches = location.name.toLowerCase() === cityName.toLowerCase();
        // Check if it's a major city (state level)
        const isStateLevel = location.state && !location.local_names;
        // Check population if available
        const isLargeCity = location.population > 500000; // Increased population threshold

        return nameMatches && (isStateLevel || isLargeCity);
      }) || geoData[0]; // Fallback to first result if no major city found

      const { lat, lon } = majorCity;

      // Rest of your API calls remain the same
      const currentUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
      const currentResponse = await fetch(currentUrl);
      const currentData = await currentResponse.json();

      // Override the name if it's a locality
      if (currentData.name !== cityName) {
        currentData.name = cityName;
      }

      const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();

      processWeatherData(currentData, forecastData);
    } catch (err) {
      setError(err.message === 'City not found' ? 
        'City not found. Please try another location.' : 
        'Failed to fetch weather data. Please try again.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Refresh current weather
  const refreshWeather = async () => {
    if (!currentWeather || !lastSearchedCity) return;
    
    setRefreshing(true);
    try {
      await fetchWeatherData(lastSearchedCity, false);
    } catch (err) {
      setError('Failed to refresh weather data');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle search
  const handleSearch = useCallback(async (city) => {
    await fetchWeatherData(city);
    setSearchQuery('');
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = (city) => {
    setSearchQuery('');
    setShowSuggestions(false);
    fetchWeatherData(city);
  };

  // Favorites management
  const toggleFavorite = useCallback((city) => {
    setFavorites(prev => 
      prev.includes(city) 
        ? prev.filter(fav => fav !== city)
        : [...prev, city]
    );
  }, []);

  // Enhanced Weather Icon Component
  const WeatherIcon = ({ condition, size = 24, className = "" }) => {
    const iconProps = { size, className: `${className}` };
    
    switch (condition) {
      case 'sunny':
        return <Sun {...iconProps} className={`${className} text-yellow-400`} />;
      case 'cloudy':
        return <Cloud {...iconProps} className={`${className} text-gray-400`} />;
      case 'rainy':
        return <CloudRain {...iconProps} className={`${className} text-blue-400`} />;
      case 'drizzle':
        return <CloudRain {...iconProps} className={`${className} text-blue-300`} />;
      case 'snowy':
        return <CloudSnow {...iconProps} className={`${className} text-blue-200`} />;
      case 'stormy':
        return <Zap {...iconProps} className={`${className} text-purple-400`} />;
      case 'foggy':
        return <Cloud {...iconProps} className={`${className} text-gray-300`} />;
      default:
        return <Sun {...iconProps} className={`${className} text-yellow-400`} />;
    }
  };

  // Wind direction helper
  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  // Theme configuration
  const themeConfig = {
    isDark: isDarkMode,
    background: isDarkMode 
      ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
      : 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500',
    card: isDarkMode 
      ? 'bg-slate-800/40 backdrop-blur-xl border-slate-700/50' 
      : 'bg-white/15 backdrop-blur-xl border-white/25',
    text: isDarkMode ? 'text-slate-100' : 'text-white',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-white/90',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-white/70',
    input: isDarkMode 
      ? 'bg-slate-800/50 border-slate-600/50 text-slate-100 placeholder-slate-400' 
      : 'bg-white/20 border-white/30 text-white placeholder-white/70',
    button: isDarkMode 
      ? 'bg-slate-700/50 hover:bg-slate-600/60 border-slate-600/50' 
      : 'bg-white/20 hover:bg-white/30 border-white/30'
  };

  // Search Component
  const SearchComponent = () => (
    <div className="max-w-4xl mx-auto mb-8">
      <form onSubmit={(e) => { 
        e.preventDefault(); 
        handleSearch(searchQuery); 
      }} className="flex flex-col md:flex-row gap-4 items-center justify-center">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400/70" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Update suggestions based on new input
              if (e.target.value.length > 1) {
                const filtered = Cities.filter(city => 
                  city.toLowerCase().includes(e.target.value.toLowerCase())
                ).slice(0, 8);
                setSuggestions(filtered);
                setShowSuggestions(filtered.length > 0);
              } else {
                setSuggestions([]);
                setShowSuggestions(false);
              }
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow for clicks
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder="Search for any city worldwide..."
            className={`w-full pl-14 pr-6 py-5 rounded-2xl ${themeConfig.input} focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 text-lg backdrop-blur-lg shadow-lg`}
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute top-full left-0 right-0 ${themeConfig.card} rounded-2xl mt-3 shadow-2xl z-20 overflow-hidden border backdrop-blur-xl`}>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-5 py-4 hover:bg-white/20 transition-all duration-200 flex items-center ${themeConfig.text} group`}
                >
                  <MapPin size={16} className="mr-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <span className="font-medium">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-5 ${themeConfig.button} ${themeConfig.text} rounded-2xl transition-all duration-300 font-semibold border flex items-center gap-3 hover:scale-105 backdrop-blur-lg shadow-lg`}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Search size={18} />
              Search
            </>
          )}
        </button>
      </form>
    </div>
  );

  // Loading Component
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
      </div>
      <p className={`mt-6 text-lg ${themeConfig.textSecondary} animate-pulse`}>Fetching weather data...</p>
    </div>
  );

  // Error Component
  const ErrorState = ({ error, onDismiss }) => (
    <div className="max-w-2xl mx-auto mb-8">
      <div className={`${themeConfig.card} rounded-2xl p-6 border flex items-center gap-4 shadow-lg`}>
        <AlertCircle className="text-red-400 flex-shrink-0" size={24} />
        <div className="flex-1">
          <p className={`${themeConfig.text} font-medium`}>{error}</p>
        </div>
        <button
          onClick={onDismiss}
          className={`p-2 ${themeConfig.button} rounded-lg hover:scale-105 transition-all`}
        >
          ×
        </button>
      </div>
    </div>
  );

  // Main Weather Display
  const WeatherDisplay = () => (
    <div className="space-y-8">
      {/* Current Weather Card */}
      <div className={`${themeConfig.card} rounded-3xl p-8 border shadow-2xl`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-3xl font-bold ${themeConfig.text} mb-2`}>
              {currentWeather.city}, {currentWeather.country}
            </h2>
            <p className={`${themeConfig.textMuted} text-sm`}>
              Last updated: {currentWeather.lastUpdated} 
              ({currentWeather.dataAge} minutes ago)
            </p>
          </div>
          <button
            onClick={() => toggleFavorite(lastSearchedCity)}
            className={`p-3 rounded-full ${themeConfig.button} hover:scale-110 transition-all`}
          >
            <Heart 
              size={24} 
              className={favorites.includes(lastSearchedCity) ? 'text-red-400 fill-current' : themeConfig.text}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Weather Info */}
          <div className="flex items-center space-x-6">
            <WeatherIcon condition={currentWeather.condition} size={80} />
            <div>
              <div className={`text-6xl font-bold ${themeConfig.text} mb-2`}>
                {currentWeather.temperature}{currentWeather.tempUnit}
              </div>
              <p className={`text-xl ${themeConfig.textSecondary} capitalize mb-1`}>
                {currentWeather.description}
              </p>
              <p className={`${themeConfig.textMuted}`}>
                Feels like {currentWeather.feelsLike}{currentWeather.tempUnit}
              </p>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`${themeConfig.card} rounded-xl p-4 border`}>
              <div className="flex items-center mb-2">
                <Droplets size={20} className="text-blue-400 mr-2" />
                <span className={`${themeConfig.textMuted} text-sm`}>Humidity</span>
              </div>
              <p className={`text-2xl font-bold ${themeConfig.text}`}>{currentWeather.humidity}%</p>
            </div>

            <div className={`${themeConfig.card} rounded-xl p-4 border`}>
              <div className="flex items-center mb-2">
                <Wind size={20} className="text-green-400 mr-2" />
                <span className={`${themeConfig.textMuted} text-sm`}>Wind</span>
              </div>
              <p className={`text-2xl font-bold ${themeConfig.text}`}>
                {currentWeather.windSpeed} {currentWeather.speedUnit}
              </p>
              <p className={`${themeConfig.textMuted} text-xs`}>
                {getWindDirection(currentWeather.windDirection)}
              </p>
            </div>

            <div className={`${themeConfig.card} rounded-xl p-4 border`}>
              <div className="flex items-center mb-2">
                <Eye size={20} className="text-purple-400 mr-2" />
                <span className={`${themeConfig.textMuted} text-sm`}>Visibility</span>
              </div>
              <p className={`text-2xl font-bold ${themeConfig.text}`}>{currentWeather.visibility} km</p>
            </div>

            <div className={`${themeConfig.card} rounded-xl p-4 border`}>
              <div className="flex items-center mb-2">
                <Gauge size={20} className="text-orange-400 mr-2" />
                <span className={`${themeConfig.textMuted} text-sm`}>Pressure</span>
              </div>
              <p className={`text-2xl font-bold ${themeConfig.text}`}>{currentWeather.pressure} hPa</p>
            </div>
          </div>
        </div>

        {/* Sun Times */}
        <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <Sunrise size={24} className="text-orange-400" />
            <div>
              <p className={`${themeConfig.textMuted} text-sm`}>Sunrise</p>
              <p className={`${themeConfig.text} font-semibold`}>
                {currentWeather.sunrise.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Sunset size={24} className="text-red-400" />
            <div>
              <p className={`${themeConfig.textMuted} text-sm`}>Sunset</p>
              <p className={`${themeConfig.text} font-semibold`}>
                {currentWeather.sunset.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Forecast */}
      <div className={`${themeConfig.card} rounded-3xl p-6 border shadow-xl`}>
        <h3 className={`text-2xl font-bold ${themeConfig.text} mb-6 flex items-center`}>
          <Clock size={28} className="mr-3 text-blue-400" />
          Hourly Forecast
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 auto-rows-fr">
          {hourlyForecast.map((hour, index) => (
            <div 
              key={index} 
              className={`${themeConfig.card} rounded-xl p-4 border text-center`}
            >
              <p className={`${themeConfig.textMuted} text-sm mb-2`}>{hour.time}</p>
              <WeatherIcon condition={hour.condition} size={32} className="mx-auto mb-2" />
              <p className={`${themeConfig.text} font-bold text-lg mb-1`}>
                {hour.temperature}°C
              </p>
              <p className={`${themeConfig.textMuted} text-xs`}>{hour.pop}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className={`${themeConfig.card} rounded-3xl p-6 border shadow-xl`}>
        <h3 className={`text-2xl font-bold ${themeConfig.text} mb-6 flex items-center`}>
          <Calendar size={28} className="mr-3 text-green-400" />
          5-Day Forecast
        </h3>
        <div className="space-y-4">
          {forecast.map((day, index) => (
            <div key={index} className={`${themeConfig.card} rounded-xl p-4 border`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 text-center">
                    <p className={`${themeConfig.text} font-semibold`}>{day.day}</p>
                    <p className={`${themeConfig.textMuted} text-sm`}>{day.date}</p>
                  </div>
                  <WeatherIcon condition={day.condition} size={40} />
                  <div>
                    <p className={`${themeConfig.text} capitalize font-medium`}>{day.description}</p>
                    <p className={`${themeConfig.textMuted} text-sm`}>Rain: {day.pop}%</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`${themeConfig.text} text-xl font-bold`}>
                    {day.high}{day.tempUnit} / {day.low}{day.tempUnit}
                  </div>
                  <div className={`${themeConfig.textMuted} text-sm flex items-center justify-end mt-1`}>
                    <Wind size={14} className="mr-1" />
                    {day.windSpeed} {day.speedUnit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className={`${themeConfig.card} rounded-3xl p-6 border shadow-xl`}>
          <h3 className={`text-2xl font-bold ${themeConfig.text} mb-6 flex items-center`}>
            <Star size={28} className="mr-3 text-yellow-400" />
            Favorite Locations
          </h3>
          <div className="flex flex-wrap gap-3">
            {favorites.map((city, index) => (
              <button
                key={index}
                onClick={() => fetchWeatherData(city)}
                className={`px-4 py-2 ${themeConfig.button} rounded-full border hover:scale-105 transition-all duration-200 ${themeConfig.text}`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen ${themeConfig.background} relative overflow-hidden transition-all duration-700`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-r from-pink-400/10 to-red-400/10 rounded-full blur-xl animate-pulse delay-3000"></div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex justify-center items-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <div className="relative z-10 flex items-center">
                <Sun size={42} className={`${themeConfig.text} mr-3 drop-shadow-lg`} />
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce delay-500"></div>
              </div>
            </div>
          </div>
          <h1 className={`text-5xl md:text-7xl font-bold ${themeConfig.text} mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-lg`}>
            WeatherPro
          </h1>
          <p className={`text-lg md:text-xl ${themeConfig.textSecondary} max-w-3xl mx-auto leading-relaxed`}>
            Your intelligent weather companion with advanced forecasting and personalized insights
          </p>
        </header>

        {/* Controls */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-xl ${themeConfig.button} ${themeConfig.text} transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg backdrop-blur-lg`}
            title="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <SearchComponent />

        {/* Loading State */}
        {loading && <LoadingState />}

        {/* Error State */}
        {error && <ErrorState error={error} onDismiss={() => setError('')} />}

        {/* Weather Display */}
        {currentWeather && !loading && <WeatherDisplay />}
      </div>
    </div>
  );
};

export default App;