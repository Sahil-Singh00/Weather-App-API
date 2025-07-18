// API Configuration
const API_KEY = "ebf95f5979488ce0e143453a8b5fc27f"; // Replace with your actual API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_API_URL = 'http://api.openweathermap.org/geo/1.0/direct';
const AQI_API_URL = 'http://api.openweathermap.org/data/2.5/air_pollution';

// DOM Elements
const citySearchInput = document.getElementById('city-search');
const searchBtn = document.getElementById('search-btn');
const currentLocationBtn = document.getElementById('current-location-btn');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const authModal = document.getElementById('auth-modal');
const closeModalBtn = document.getElementById('close-modal');
const authForm = document.getElementById('auth-form');
const loginForm = document.getElementById('login-form');
const authTitle = document.getElementById('auth-title');
const authSwitch = document.getElementById('auth-switch');
const switchToSignup = document.getElementById('switch-to-signup');
const weatherCanvas = document.getElementById('weather-canvas');

// Weather Display Elements
const currentTemp = document.getElementById('current-temp');
const weatherDescription = document.getElementById('weather-description');
const currentDate = document.getElementById('current-date');
const currentLocation = document.getElementById('current-location');
const mainWeatherIcon = document.getElementById('main-weather-icon');
const forecastCards = document.getElementById('forecast-cards');

// Highlight Elements
const aqiValue = document.getElementById('aqi-value');
const aqiStatus = document.getElementById('aqi-status');
const aqiProgress = document.getElementById('aqi-progress');
const aqiDescription = document.getElementById('aqi-description');
const sunriseTime = document.getElementById('sunrise-time');
const sunsetTime = document.getElementById('sunset-time');
const sunProgressBar = document.getElementById('sun-progress-bar');
const daylightHours = document.getElementById('daylight-hours');
const humidityValue = document.getElementById('humidity-value');
const humidityGauge = document.getElementById('humidity-gauge');
const humidityStatus = document.getElementById('humidity-status');
const windValue = document.getElementById('wind-value');
const windArrow = document.getElementById('wind-arrow');
const windDirection = document.getElementById('wind-direction');
const windStatus = document.getElementById('wind-status');
const visibilityValue = document.getElementById('visibility-value');
const visibilityProgress = document.getElementById('visibility-progress');
const visibilityStatus = document.getElementById('visibility-status');
const pressureValue = document.getElementById('pressure-value');
const pressureGauge = document.getElementById('pressure-gauge');
const pressureStatus = document.getElementById('pressure-status');

// App State
let currentWeatherData = null;
let currentForecastData = null;
let currentAQIData = null;
let currentCity = {
    name: 'New York',
    lat: 40.7128,
    lon: -74.0060,
    country: 'US'
};
let isCelsius = true;
let user = null;

// Canvas Setup
const ctx = weatherCanvas.getContext('2d');
weatherCanvas.width = window.innerWidth;
weatherCanvas.height = window.innerHeight;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Set current date
    updateDate();
    
    // Load default city weather
    fetchWeatherData(currentCity.lat, currentCity.lon);
    
    // Set up event listeners
    setupEventListeners();
    
    // Check for saved user
    checkAuthState();
});

// Event Listeners
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    citySearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Current location
    currentLocationBtn.addEventListener('click', getCurrentLocation);
    
    // Auth modal
    loginBtn.addEventListener('click', () => showAuthModal('login'));
    signupBtn.addEventListener('click', () => showAuthModal('signup'));
    closeModalBtn.addEventListener('click', hideAuthModal);
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthModal('signup');
    });
    
    // Form submission
    loginForm.addEventListener('submit', handleAuthSubmit);
    
    // Window resize
    window.addEventListener('resize', () => {
        weatherCanvas.width = window.innerWidth;
        weatherCanvas.height = window.innerHeight;
        if (currentWeatherData) {
            drawWeatherEffect(currentWeatherData.weather[0].main);
        }
    });
}

// Date Display
function updateDate() {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const today = new Date();
    currentDate.textContent = today.toLocaleDateString('en-US', options);
}

// Weather Data Fetching
async function fetchWeatherData(lat, lon) {
    try {
        // Fetch current weather
        const currentWeatherUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const currentResponse = await fetch(currentWeatherUrl);
        currentWeatherData = await currentResponse.json();
        
        // Fetch 5-day forecast
        const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);
        currentForecastData = await forecastResponse.json();
        
        // Fetch air quality data
        const aqiUrl = `${AQI_API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        const aqiResponse = await fetch(aqiUrl);
        currentAQIData = await aqiResponse.json();
        
        // Update UI with new data
        updateWeatherDisplay();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Failed to fetch weather data. Please try again.');
    }
}

// Update Weather Display
function updateWeatherDisplay() {
    if (!currentWeatherData || !currentForecastData || !currentAQIData) return;
    
    // Update current weather
    currentTemp.textContent = Math.round(currentWeatherData.main.temp);
    weatherDescription.textContent = currentWeatherData.weather[0].description;
    currentLocation.textContent = `${currentWeatherData.name}, ${currentWeatherData.sys.country}`;
    
    // Update weather icon
    updateWeatherIcon(mainWeatherIcon, currentWeatherData.weather[0]);
    
    // Update highlights
    updateHighlights();
    
    // Update forecast
    updateForecast();
    
    // Draw weather effect
    drawWeatherEffect(currentWeatherData.weather[0].main);
}

// Update Weather Icon
function updateWeatherIcon(element, weather) {
    const iconClass = getWeatherIconClass(weather);
    element.innerHTML = `<i class="fas ${iconClass}"></i>`;
    element.firstChild.classList.add('weather-icon', weather.main.toLowerCase());
}

function getWeatherIconClass(weather) {
    const main = weather.main.toLowerCase();
    const id = weather.id;
    
    // Clear
    if (main === 'clear') return 'fa-sun';
    
    // Clouds
    if (main === 'clouds') {
        if (id === 801 || id === 802) return 'fa-cloud-sun';
        return 'fa-cloud';
    }
    
    // Rain
    if (main === 'rain') {
        if (id >= 500 && id <= 504) return 'fa-cloud-rain';
        return 'fa-cloud-showers-heavy';
    }
    
    // Drizzle
    if (main === 'drizzle') return 'fa-cloud-rain';
    
    // Thunderstorm
    if (main === 'thunderstorm') return 'fa-bolt';
    
    // Snow
    if (main === 'snow') return 'fa-snowflake';
    
    // Atmosphere (mist, smoke, haze, fog, etc.)
    if (main === 'mist' || main === 'smoke' || main === 'haze' || main === 'fog') {
        return 'fa-smog';
    }
    
    // Default
    return 'fa-cloud';
}

// Update Highlights
function updateHighlights() {
    // Air Quality
    const aqi = currentAQIData.list[0].main.aqi;
    aqiValue.textContent = aqi;
    
    let aqiText, aqiColor;
    switch(aqi) {
        case 1:
            aqiText = 'Excellent';
            aqiColor = '#4CAF50'; // Green
            break;
        case 2:
            aqiText = 'Good';
            aqiColor = '#8BC34A'; // Light green
            break;
        case 3:
            aqiText = 'Moderate';
            aqiColor = '#FFC107'; // Yellow
            break;
        case 4:
            aqiText = 'Poor';
            aqiColor = '#FF9800'; // Orange
            break;
        case 5:
            aqiText = 'Very Poor';
            aqiColor = '#F44336'; // Red
            break;
        default:
            aqiText = 'N/A';
            aqiColor = '#9E9E9E'; // Grey
    }
    
    aqiStatus.textContent = aqiText;
    aqiProgress.style.width = `${aqi * 20}%`;
    aqiProgress.style.backgroundColor = aqiColor;
    aqiDescription.textContent = getAQIDescription(aqi);
    
    // Sunrise & Sunset
    const sunrise = new Date(currentWeatherData.sys.sunrise * 1000);
    const sunset = new Date(currentWeatherData.sys.sunset * 1000);
    
    sunriseTime.textContent = sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    sunsetTime.textContent = sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Calculate daylight progress
    const now = new Date();
    const totalDaylight = sunset - sunrise;
    const daylightPassed = now - sunrise;
    const daylightPercentage = (daylightPassed / totalDaylight) * 100;
    
    sunProgressBar.style.width = `${Math.min(100, Math.max(0, daylightPercentage))}%`;
    
    // Calculate daylight hours
    const daylightHoursValue = (sunset - sunrise) / (1000 * 60 * 60);
    const hours = Math.floor(daylightHoursValue);
    const minutes = Math.floor((daylightHoursValue - hours) * 60);
    daylightHours.textContent = `${hours}h ${minutes}m`;
    
    // Humidity
    const humidity = currentWeatherData.main.humidity;
    humidityValue.textContent = `${humidity}%`;
    humidityGauge.style.width = `${humidity}%`;
    humidityStatus.textContent = getHumidityStatus(humidity);
    
    // Wind
    const windSpeed = currentWeatherData.wind.speed;
    const windDeg = currentWeatherData.wind.deg;
    
    windValue.textContent = Math.round(windSpeed * 3.6); // Convert m/s to km/h
    windArrow.style.transform = `rotate(${windDeg}deg)`;
    windDirection.textContent = getWindDirection(windDeg);
    windStatus.textContent = getWindStatus(windSpeed);
    
    // Visibility
    const visibility = currentWeatherData.visibility / 1000; // Convert to km
    visibilityValue.textContent = visibility.toFixed(1);
    visibilityProgress.style.width = `${Math.min(100, (visibility / 10) * 100)}%`;
    visibilityStatus.textContent = getVisibilityStatus(visibility);
    
    // Pressure
    const pressure = currentWeatherData.main.pressure;
    pressureValue.textContent = pressure;
    
    // Normalize pressure to percentage (950-1050 hPa range)
    const pressurePercentage = ((pressure - 950) / 100) * 100;
    pressureGauge.style.width = `${pressurePercentage}%`;
    pressureStatus.textContent = getPressureStatus(pressure);
}

function getAQIDescription(aqi) {
    switch(aqi) {
        case 1: return 'Air quality is excellent, perfect for outdoor activities.';
        case 2: return 'Air quality is good, suitable for most outdoor activities.';
        case 3: return 'Air quality is acceptable, but sensitive individuals may be affected.';
        case 4: return 'Air quality is poor, consider reducing outdoor activities.';
        case 5: return 'Air quality is very poor, avoid outdoor activities if possible.';
        default: return 'Air quality data not available.';
    }
}

function getHumidityStatus(humidity) {
    if (humidity < 30) return 'Low humidity, may feel dry.';
    if (humidity < 60) return 'Comfortable humidity level.';
    if (humidity < 80) return 'High humidity, may feel muggy.';
    return 'Very high humidity, uncomfortable conditions.';
}

function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round((degrees % 360) / 45) % 8;
    return directions[index];
}

function getWindStatus(speed) {
    const kmh = speed * 3.6; // Convert m/s to km/h
    
    if (kmh < 1) return 'Calm';
    if (kmh < 5) return 'Light air';
    if (kmh < 11) return 'Light breeze';
    if (kmh < 19) return 'Gentle breeze';
    if (kmh < 28) return 'Moderate breeze';
    if (kmh < 38) return 'Fresh breeze';
    if (kmh < 49) return 'Strong breeze';
    if (kmh < 61) return 'Near gale';
    if (kmh < 74) return 'Gale';
    if (kmh < 88) return 'Strong gale';
    if (kmh < 102) return 'Storm';
    return 'Hurricane';
}

function getVisibilityStatus(visibility) {
    if (visibility >= 10) return 'Perfect visibility';
    if (visibility >= 5) return 'Good visibility';
    if (visibility >= 2) return 'Moderate visibility';
    if (visibility >= 1) return 'Poor visibility';
    return 'Very poor visibility';
}

function getPressureStatus(pressure) {
    if (pressure < 970) return 'Very low pressure';
    if (pressure < 990) return 'Low pressure';
    if (pressure < 1030) return 'Normal pressure';
    if (pressure < 1050) return 'High pressure';
    return 'Very high pressure';
}

// Update Forecast
function updateForecast() {
    forecastCards.innerHTML = '';
    
    // Group forecast by day
    const dailyForecast = {};
    currentForecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!dailyForecast[day]) {
            dailyForecast[day] = {
                temps: [],
                weather: [],
                date: date
            };
        }
        
        dailyForecast[day].temps.push(item.main.temp);
        dailyForecast[day].weather.push(item.weather[0]);
    });
    
    // Create forecast cards for next 5 days
    const days = Object.keys(dailyForecast).slice(0, 5);
    days.forEach(day => {
        const dayData = dailyForecast[day];
        const maxTemp = Math.round(Math.max(...dayData.temps));
        const minTemp = Math.round(Math.min(...dayData.temps));
        
        // Get most common weather condition for the day
        const weatherCounts = {};
        dayData.weather.forEach(w => {
            const main = w.main;
            weatherCounts[main] = (weatherCounts[main] || 0) + 1;
        });
        
        const mostCommonWeather = Object.keys(weatherCounts).reduce((a, b) => 
            weatherCounts[a] > weatherCounts[b] ? a : b
        );
        const weatherObj = dayData.weather.find(w => w.main === mostCommonWeather);
        
        // Create forecast card
        const card = document.createElement('div');
        card.className = 'forecast-card fade-in';
        card.innerHTML = `
            <div class="forecast-day">${day}</div>
            <div class="forecast-icon">
                <i class="fas ${getWeatherIconClass(weatherObj)}"></i>
            </div>
            <div class="forecast-temp">
                <span class="temp-max">${maxTemp}°</span>
                <span class="temp-min">${minTemp}°</span>
            </div>
        `;
        
        forecastCards.appendChild(card);
    });
}

// Weather Effects
function drawWeatherEffect(weatherCondition) {
    ctx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    
    switch(weatherCondition.toLowerCase()) {
        case 'rain':
            drawRain();
            break;
        case 'drizzle':
            drawDrizzle();
            break;
        case 'thunderstorm':
            drawThunderstorm();
            break;
        case 'snow':
            drawSnow();
            break;
        case 'clear':
            drawClearSky();
            break;
        case 'clouds':
            drawClouds();
            break;
        case 'mist':
        case 'smoke':
        case 'haze':
        case 'fog':
            drawFog();
            break;
        default:
            drawDefault();
    }
}

// Rain Effect
let rainDrops = [];
function drawRain() {
    // Initialize rain drops
    if (rainDrops.length === 0) {
        for (let i = 0; i < 200; i++) {
            rainDrops.push({
                x: Math.random() * weatherCanvas.width,
                y: Math.random() * weatherCanvas.height,
                length: 10 + Math.random() * 10,
                speed: 5 + Math.random() * 5
            });
        }
    }
    
    ctx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    ctx.strokeStyle = 'rgba(174, 194, 224, 0.7)';
    ctx.lineWidth = 1;
    
    rainDrops.forEach(drop => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();
        
        drop.y += drop.speed;
        if (drop.y > weatherCanvas.height) {
            drop.y = -drop.length;
            drop.x = Math.random() * weatherCanvas.width;
        }
    });
    
    requestAnimationFrame(drawRain);
}

// Drizzle Effect (lighter rain)
function drawDrizzle() {
    // Similar to rain but with shorter, slower drops
    if (rainDrops.length === 0) {
        for (let i = 0; i < 150; i++) {
            rainDrops.push({
                x: Math.random() * weatherCanvas.width,
                y: Math.random() * weatherCanvas.height,
                length: 5 + Math.random() * 5,
                speed: 2 + Math.random() * 3
            });
        }
    }
    
    ctx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
    ctx.lineWidth = 1;
    
    rainDrops.forEach(drop => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();
        
        drop.y += drop.speed;
        if (drop.y > weatherCanvas.height) {
            drop.y = -drop.length;
            drop.x = Math.random() * weatherCanvas.width;
        }
    });
    
    requestAnimationFrame(drawDrizzle);
}

// Thunderstorm Effect
let lightningActive = false;
let lightningTimer = null;
function drawThunderstorm() {
    drawRain();
    
    if (!lightningActive && Math.random() > 0.99) {
        lightningActive = true;
        drawLightning();
        
        if (lightningTimer) clearTimeout(lightningTimer);
        lightningTimer = setTimeout(() => {
            lightningActive = false;
        }, 100);
    }
    
    if (!lightningActive) {
        requestAnimationFrame(drawThunderstorm);
    }
}

function drawLightning() {
    const x = Math.random() * weatherCanvas.width;
    const segments = 5 + Math.floor(Math.random() * 5);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    
    for (let i = 1; i < segments; i++) {
        const newX = x + (Math.random() * 100 - 50);
        const newY = (weatherCanvas.height / segments) * i;
        ctx.lineTo(newX, newY);
    }
    
    ctx.stroke();
    
    // Flash effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    
    setTimeout(() => {
        ctx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    }, 50);
}

// Snow Effect
let snowflakes = [];
function drawSnow() {
    // Initialize snowflakes
    if (snowflakes.length === 0) {
        for (let i = 0; i < 100; i++) {
            snowflakes.push({
                x: Math.random() * weatherCanvas.width,
                y: Math.random() * weatherCanvas.height,
                radius: 1 + Math.random() * 3,
                speed: 1 + Math.random() * 2,
                sway: Math.random() * 0.5,
                swayX: 0
            });
        }
    }
    
    ctx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    snowflakes.forEach(flake => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
        
        flake.y += flake.speed;
        flake.swayX += flake.sway;
        flake.x += Math.sin(flake.swayX) * 0.5;
        
        if (flake.y > weatherCanvas.height) {
            flake.y = -flake.radius;
            flake.x = Math.random() * weatherCanvas.width;
        }
    });
    
    requestAnimationFrame(drawSnow);
}

// Clear Sky Effect
function drawClearSky() {
    // Gradient background for clear sky
    const gradient = ctx.createLinearGradient(0, 0, 0, weatherCanvas.height);
    gradient.addColorStop(0, 'rgba(108, 99, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(108, 99, 255, 0.05)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    
    // Draw sun
    const sunX = weatherCanvas.width * 0.8;
    const sunY = weatherCanvas.height * 0.2;
    const sunRadius = 50;
    
    // Sun glow
    const radgrad = ctx.createRadialGradient(
        sunX, sunY, sunRadius * 0.2,
        sunX, sunY, sunRadius * 2
    );
    radgrad.addColorStop(0, 'rgba(255, 228, 100, 0.8)');
    radgrad.addColorStop(0.9, 'rgba(255, 228, 100, 0.1)');
    radgrad.addColorStop(1, 'rgba(255, 228, 100, 0)');
    
    ctx.fillStyle = radgrad;
    ctx.fillRect(
        sunX - sunRadius * 2, 
        sunY - sunRadius * 2, 
        sunRadius * 4, 
        sunRadius * 4
    );
    
    // Sun core
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 228, 100, 1)';
    ctx.fill();
}

// Clouds Effect
let clouds = [];
function drawClouds() {
    // Initialize clouds
    if (clouds.length === 0) {
        for (let i = 0; i < 5; i++) {
            clouds.push({
                x: Math.random() * weatherCanvas.width,
                y: Math.random() * weatherCanvas.height * 0.5,
                width: 100 + Math.random() * 150,
                height: 40 + Math.random() * 40,
                speed: 0.2 + Math.random() * 0.3
            });
        }
    }
    
    ctx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    
    clouds.forEach(cloud => {
        // Draw cloud
        ctx.beginPath();
        ctx.ellipse(
            cloud.x, cloud.y, 
            cloud.width * 0.5, cloud.height * 0.5, 
            0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Additional cloud puffs
        ctx.beginPath();
        ctx.arc(
            cloud.x - cloud.width * 0.3, 
            cloud.y - cloud.height * 0.2, 
            cloud.height * 0.6, 
            0, Math.PI * 2
        );
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(
            cloud.x + cloud.width * 0.3, 
            cloud.y - cloud.height * 0.1, 
            cloud.height * 0.5, 
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Move cloud
        cloud.x += cloud.speed;
        if (cloud.x > weatherCanvas.width + cloud.width) {
            cloud.x = -cloud.width;
            cloud.y = Math.random() * weatherCanvas.height * 0.5;
        }
    });
    
    requestAnimationFrame(drawClouds);
}

// Fog Effect
function drawFog() {
    // Create fog gradient
    const fogGradient = ctx.createLinearGradient(0, 0, 0, weatherCanvas.height);
    fogGradient.addColorStop(0, 'rgba(200, 200, 200, 0.05)');
    fogGradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.1)');
    fogGradient.addColorStop(1, 'rgba(200, 200, 200, 0.05)');
    
    ctx.fillStyle = fogGradient;
    ctx.fillRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    
    // Add some moving fog patches
    ctx.fillStyle = 'rgba(200, 200, 200, 0.1)';
    for (let i = 0; i < 5; i++) {
        const x = (Date.now() * 0.01 + i * 100) % (weatherCanvas.width + 200) - 100;
        const y = weatherCanvas.height * 0.2 + Math.sin(Date.now() * 0.001 + i) * 50;
        const width = 200 + Math.sin(Date.now() * 0.0005 + i) * 50;
        const height = 100;
        
        ctx.beginPath();
        ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    requestAnimationFrame(drawFog);
}

// Default Effect (when weather condition isn't recognized)
function drawDefault() {
    // Simple gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, weatherCanvas.height);
    gradient.addColorStop(0, 'rgba(30, 30, 46, 0.8)');
    gradient.addColorStop(1, 'rgba(30, 30, 46, 0.9)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, weatherCanvas.width, weatherCanvas.height);
}

// Search Functionality
async function handleSearch() {
    const cityName = citySearchInput.value.trim();
    if (!cityName) return;
    
    try {
        // Fetch city coordinates
        const response = await fetch(`${GEO_API_URL}?q=${cityName}&limit=1&appid=${API_KEY}`);
        const data = await response.json();
        
        if (data.length === 0) {
            alert('City not found. Please try another location.');
            return;
        }
        
        const city = data[0];
        currentCity = {
            name: city.name,
            lat: city.lat,
            lon: city.lon,
            country: city.country
        };
        
        // Fetch weather for new location
        fetchWeatherData(city.lat, city.lon);
        
        // Clear search input
        citySearchInput.value = '';
    } catch (error) {
        console.error('Error searching for city:', error);
        alert('Failed to search for city. Please try again.');
    }
}

// Current Location
function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }
    
    currentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                // Reverse geocode to get city name
                const response = await fetch(`${GEO_API_URL}?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`);
                const data = await response.json();
                
                if (data.length > 0) {
                    const city = data[0];
                    currentCity = {
                        name: city.name,
                        lat: city.lat,
                        lon: city.lon,
                        country: city.country
                    };
                } else {
                    currentCity = {
                        name: 'Current Location',
                        lat: latitude,
                        lon: longitude,
                        country: ''
                    };
                }
                
                // Fetch weather for current location
                fetchWeatherData(latitude, longitude);
            } catch (error) {
                console.error('Error getting location:', error);
                alert('Failed to get your location. Please try again.');
            } finally {
                currentLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Current Location';
            }
        },
        (error) => {
            console.error('Geolocation error:', error);
            alert('Unable to retrieve your location. Please ensure location services are enabled.');
            currentLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Current Location';
        }
    );
}

// Authentication
function showAuthModal(mode) {
    authModal.style.display = 'flex';
    
    if (mode === 'login') {
        authTitle.textContent = 'Log In';
        loginForm.style.display = 'block';
        authSwitch.innerHTML = 'Don\'t have an account? <a href="#" id="switch-to-signup">Sign Up</a>';
    } else {
        authTitle.textContent = 'Sign Up';
        loginForm.style.display = 'block'; // In a real app, you'd have a separate signup form
        authSwitch.innerHTML = 'Already have an account? <a href="#" id="switch-to-login">Log In</a>';
    }
}

function hideAuthModal() {
    authModal.style.display = 'none';
}

function handleAuthSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simple validation
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }
    
    // In a real app, you would use Firebase or another auth service
    // This is a simplified version using localStorage
    if (authTitle.textContent === 'Sign Up') {
        // Sign up
        localStorage.setItem('weatherAppUser', JSON.stringify({ email }));
        user = { email };
        alert('Account created successfully!');
    } else {
        // Log in
        const storedUser = localStorage.getItem('weatherAppUser');
        if (storedUser && JSON.parse(storedUser).email === email) {
            user = { email };
            alert('Logged in successfully!');
        } else {
            alert('Invalid credentials. Please try again.');
            return;
        }
    }
    
    // Update UI
    updateAuthUI();
    hideAuthModal();
    
    // Clear form
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}

function checkAuthState() {
    const storedUser = localStorage.getItem('weatherAppUser');
    if (storedUser) {
        user = JSON.parse(storedUser);
        updateAuthUI();
    }
}

function updateAuthUI() {
    if (user) {
        document.querySelector('.auth-buttons').innerHTML = `
            <button id="logout-btn" class="btn auth-btn">Log Out</button>
        `;
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
    } else {
        document.querySelector('.auth-buttons').innerHTML = `
            <button id="login-btn" class="btn auth-btn">Log In</button>
            <button id="signup-btn" class="btn auth-btn">Sign Up</button>
        `;
        // Reattach event listeners
        document.getElementById('login-btn').addEventListener('click', () => showAuthModal('login'));
        document.getElementById('signup-btn').addEventListener('click', () => showAuthModal('signup'));
    }
}

function handleLogout() {
    user = null;
    localStorage.removeItem('weatherAppUser');
    updateAuthUI();
}