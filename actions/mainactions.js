const OPENWEATHER_API_KEY = "a0140f98c00df8d5ca8c165d523a5806";

// Fetch weather data
async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
  
    if (response.status !== 200) {
      throw new Error(data.message || "Failed to fetch weather data");
    }
  
    return data;
}

// Change background based on weather
function updateBackground(condition) {
    const body = document.body;
    const heroSection = document.getElementById("weather_section"); //hero_section
  
    // Clear existing classes
    body.className = "";
    heroSection.className = "";
  
    // Add weather-specific classes
    const weatherClass = `weather-${condition.toLowerCase()}`;
    body.classList.add(weatherClass);
    heroSection.classList.add(weatherClass);
}
