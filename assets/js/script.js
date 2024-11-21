const API_KEY = 'your_api_key_here';

class WeatherDashboard {
    constructor() {
        this.cityInput = document.getElementById('city-input');
        this.searchBtn = document.getElementById('search-btn');
        this.searchHistory = document.getElementById('search-history');
        this.currentWeather = document.getElementById('current-weather');
        this.forecastCards = document.getElementById('forecast-cards');
        
        this.searchHistory.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                this.getWeatherData(e.target.textContent);
            }
        });
        
        this.searchBtn.addEventListener('click', () => {
            const city = this.cityInput.value.trim();
            if (city) {
                this.getWeatherData(city);
            }
        });

        this.loadSearchHistory();
    }

    async getWeatherData(city) {
        try {
            // Get coordinates first
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
            const geoResponse = await fetch(geoUrl);
            const geoData = await geoResponse.json();

            if (geoData.length === 0) {
                alert('City not found!');
                return;
            }

            const { lat, lon } = geoData[0];
            
            // Get weather data
            const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
            const weatherResponse = await fetch(weatherUrl);
            const weatherData = await weatherResponse.json();

            this.displayCurrentWeather(weatherData, city);
            this.displayForecast(weatherData);
            this.addToSearchHistory(city);
        } catch (error) {
            console.error('Error:', error);
            alert('Error fetching weather data');
        }
    }

    displayCurrentWeather(data, city) {
        const current = data.list[0];
        this.currentWeather.innerHTML = `
            <h2>${city} (${new Date().toLocaleDateString()})</h2>
            <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}.png" alt="weather icon">
            <p>Temperature: ${current.main.temp}°F</p>
            <p>Humidity: ${current.main.humidity}%</p>
            <p>Wind Speed: ${current.wind.speed} MPH</p>
        `;
    }

    displayForecast(data) {
        this.forecastCards.innerHTML = '';
        
        // Get one forecast per day (every 8th item in the list)
        for (let i = 7; i < data.list.length; i += 8) {
            const forecast = data.list[i];
            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <h3>${new Date(forecast.dt * 1000).toLocaleDateString()}</h3>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="weather icon">
                <p>Temp: ${forecast.main.temp}°F</p>
                <p>Wind: ${forecast.wind.speed} MPH</p>
                <p>Humidity: ${forecast.main.humidity}%</p>
            `;
            this.forecastCards.appendChild(card);
        }
    }

    addToSearchHistory(city) {
        let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
        if (!history.includes(city)) {
            history.push(city);
            localStorage.setItem('weatherHistory', JSON.stringify(history));
            this.displaySearchHistory();
        }
    }
    loadSearchHistory() {
        const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
        this.displaySearchHistory(history);
    }

    displaySearchHistory() {
        const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
        this.searchHistory.innerHTML = '';
        history.forEach(city => {
            const btn = document.createElement('button');
            btn.textContent = city;
            this.searchHistory.appendChild(btn);
        });
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WeatherDashboard();
}); 