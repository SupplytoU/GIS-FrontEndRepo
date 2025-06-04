import { useState, useEffect, useCallback } from 'react';
import './FarmerDashboard.css';
import useLocalStorage from 'use-local-storage';
import Example from './CropChart';
import { useNavigate } from 'react-router-dom';

const cropIcons = {
    Maize: '🌽',
    Beans: '🫘',
    Coffee: '☕',
    Tea: '🍵',
    Wheat: '🌾',
};

const MainContent = () => {
    const [isDark] = useLocalStorage("isDark", false);
    const [weatherData, setWeatherData] = useState(null);
    const [activeTab, setActiveTab] = useState('temperature');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState("Nairobi");
    const navigate = useNavigate();

    const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

    const fetchWeatherData = useCallback(async (type = 'temperature') => {
        if (!apiKey) {
            setError("Weather API key is not configured. Please contact support.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=1&aqi=no&alerts=no`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            setWeatherData(data);
            setActiveTab(type);
        } catch (err) {
            console.error("Error fetching weather data:", err);
            setError(err.message || "Failed to fetch weather data");
        } finally {
            setLoading(false);
        }
    }, [apiKey, location]);

    useEffect(() => {
        fetchWeatherData('temperature');
    }, [fetchWeatherData]);

    const formatTime = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className='DashboardContent' data-theme={isDark ? "dark" : "light"}>
            <div className='FarmerHeader'>
                <div className='WelcomeTag'>Welcome Back, Neema!</div>
            </div>
            <div className='FarmerContent'>
                <div className='LeftColumn'>
                    <div className='WeatherSection'>
                        <div className='WeatherTitle'>Weather Conditions</div>
                        <div className='LocationSelector'>
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                disabled={loading}
                            >
                                <option value="Nairobi">Nairobi</option>
                                <option value="Mombasa">Mombasa</option>
                                <option value="Kiambu">Kiambu</option>
                                <option value="Nakuru">Nakuru</option>
                            </select>
                        </div>
                        <div className='WeatherButtons'>
                            <button
                                className={`WeatherButton ${activeTab === 'temperature' ? 'active' : ''}`}
                                onClick={() => fetchWeatherData('temperature')}
                                disabled={loading}
                            >
                                {loading && activeTab === 'temperature' ? 'Loading...' : 'Temperature'}
                            </button>
                            <button
                                className={`WeatherButton ${activeTab === 'precipitation' ? 'active' : ''}`}
                                onClick={() => fetchWeatherData('precipitation')}
                                disabled={loading}
                            >
                                {loading && activeTab === 'precipitation' ? 'Loading...' : 'Precipitation'}
                            </button>
                        </div>
                        <div className='WeatherContent'>
                            {loading && <div className='WeatherLoading'>Loading weather data...</div>}
                            {error && (
                                <div className='WeatherError'>
                                    Error: {error}
                                    <button onClick={() => fetchWeatherData(activeTab)}>Retry</button>
                                </div>
                            )}
                            {weatherData && !loading && !error && (
                                <>
                                    {activeTab === 'temperature' && (
                                        <div className='TemperatureDisplay'>
                                            <h3>Current Weather in {weatherData.location?.name}</h3>
                                            <div className='WeatherMain'>
                                                <span className='TempValue'>{Math.round(weatherData.current?.temp_c)}°C</span>
                                                <span className='WeatherDesc'>
                                                    {weatherData.current?.condition?.text}
                                                </span>
                                            </div>
                                            <div className='WeatherDetails'>
                                                <p>Feels like: {Math.round(weatherData.current?.feelslike_c)}°C</p>
                                                <p>Humidity: {weatherData.current?.humidity}%</p>
                                                <p>Wind: {weatherData.current?.wind_kph} km/h</p>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'precipitation' && (
                                        <div className='PrecipitationDisplay'>
                                            <h3>Precipitation Forecast for {weatherData.location?.name}</h3>
                                            <div className='ForecastContainer'>
                                                {weatherData.forecast?.forecastday[0]?.hour.slice(0, 8).map((forecast, index) => (
                                                    <div key={index} className='ForecastItem'>
                                                        <p className='ForecastTime'>{formatTime(forecast.time)}</p>
                                                        <p className='ForecastPrecip'>
                                                            {forecast.precip_mm}mm
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className='MyCropsSection'>
                        <div className='WeatherTitle'>My Crops</div>
                        <div className='CropsList'>
                            {['Maize', 'Beans', 'Coffee', 'Tea', 'Wheat', 'Potatoes'].map((crop, index) => (
                                <div key={index} className='CropItem'>
                                    <span className='CropIcon'>{cropIcons[crop] || '🌱'}</span>
                                    <span className='CropName'>{crop}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='RightColumn'>
                    <div
                        className='MapSnippet'
                        onClick={() => navigate('/View Locations')}
                        style={{
                            cursor: 'pointer',
                            backgroundColor: '#eef',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            textAlign: 'center'
                        }}
                    >
                        <p><strong>🗺️ View Your Farmland</strong></p>
                        <p>Click to open the full map</p>
                    </div>
                    <div className='CropChart'>
                        <Example />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainContent;
