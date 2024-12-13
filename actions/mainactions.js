const OPENWEATHER_API_KEY = "a0140f98c00df8d5ca8c165d523a5806";
const SPOTIFY_CLIENT_ID = "c70162eaa3ea4f8986e41d1394c25d2a";
const SPOTIFY_CLIENT_SECRET = "5033c19b13b947a58087f70d22c52e81";

// Map weather conditions to moods
const weatherToMood = {
  //Clear Weather
  Clear: ["happy", "energetic", "adventurous", "motivated"],
  //Rainy Weather
  Rain: ["sad", "nostalgic", "romantic", "calm"],
  //Cloudy
  Clouds: ["chill", "thoughtful", "focused", "creative"],
  //Snowy weather
  Snow: ["calm", "playful", "cozy", "reflective"],
  //thunderstorms
  Thunderstorm: ["energetic", "empowered", "mysterious", "rebellious"],
  //drizzle
  Drizzle: ["relaxing", "romantic", "nostalgic", "tranquil"],
  //Foggy
  Fog: ["meditative", "mysterious", "creative", "focused"],
  //Windy
  Wind: ["restless", "energized", "thoughtful", "inspired"],
  //hazy
  Haze: ["dreamy", "subdued", "mellow", "mystical"],
  //Hot
  Hot: ["happy", "lazy", "cheerful", "adventurous"],
  //Cold
  Cold: ["cozy", "focused", "introspective", "peaceful"],
  //Misty
  Mist: ["mysterious", "calm", "thoughtful", "dreamy"],
  //Overcast
  Overcast: ["low-energy", "chill", "focused", "creative"],
};

const weatherAliases = {
  Frosty: "Cold",
};

// ------------------------------------------ API CALLS and HTML AUGMENTATONS --------------------------------------------//
// Fetch weather data
async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  if (response.status !== 200) {
    throw new Error(data.message || "Failed to fetch weather data");
  }

  console.log("Data >>> ", data)

  return data;
}

// Change background based on weather (HTML CHANGES)
function updateBackground(condition) {
  const body = document.body;
  const weatherSection = document.getElementById("weather_section");

  // Clear existing classes
  body.className = "";
  weatherSection.className = "";

  // Add weather-specific classes
  const weatherClass = `weather-${condition.toLowerCase()}`;
  body.classList.add(weatherClass);
  weatherSection.classList.add(weatherClass);

  // remove predefined backgrounds in section
  const playListSection = document.getElementById("playlist_section");
  playListSection.style.backgroundImage = "none";
  playListSection.style.backgroundColor = "transparent";
}

// Get Spotify access token for every call (API CALL)
async function getSpotifyToken() {
  const credentials = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  console.log("Spotify Token Response:", data);

  if (!data.access_token) {
    throw new Error("Failed to obtain Spotify API token");
  }

  return data.access_token;
}

// Fetch random playlists from Spotify (API CALL)
async function fetchPlaylists(mood) {
  const token = await getSpotifyToken();
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${mood}+top&type=playlist&limit=50`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  console.log("Spotify API Response:", data);

  if (!data.playlists || !data.playlists.items) {
    console.warn("No playlists found for the mood:", mood);
    return [];
  }

  // Filter high-quality playlists
  const filtered = data.playlists.items.filter(
    (playlist) =>
      playlist &&
      playlist.images.length > 0 && // Has an image
      playlist.name.toLowerCase().includes(mood.toLowerCase()) // Name matches mood
  );

  // Randomize the filtered results and return the first 10
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10); // Return top 10 randomized playlists
}

// Fetching Sentiments from API folder
const sentimentForm = document.getElementById("search-mood");

async function query(data) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions",
    {
      headers: {
        Authorization: "Bearer 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",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  const result = await response.json();
  return result;
}

sentimentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Get the value of the query input field
  const queryInput = document.getElementById("moodQuery").value;
  if (!queryInput) {
    alert("Please enter a mood query.");
    return;
  }

  try {
    const sentimentResponse = await query({ inputs: queryInput });
    const results = sentimentResponse[0].filter((res) => res.score > 0.005);

    if (results.length === 0) {
      alert("No significant mood detected. Please try again.");
      return;
    }

    const mood = results[0]?.label; // The most significant mood label
    console.log(`Detected Mood: ${mood}`);

    // Fetch and display playlists for the mood
    const playlists = await fetchPlaylists(mood);
    displayPlaylists(playlists);

    // Scroll to the playlist section
    const playlistSection = document.getElementById("playlist_section");
    playlistSection.scrollIntoView({ behavior: "smooth", top: 0 });
  } catch (error) {
    console.error("Error processing mood query:", error.message);
    alert(
      "An error occurred while processing your mood query. Please try again."
    );
  }
});

// Display playlists in the UI
function displayPlaylists(playlists) {
  const playlistSection = document.getElementById("playlists-grid");
  playlistSection.innerHTML = "";

  if (!playlists || playlists.length === 0) {
    playlistSection.innerHTML = `<p>No playlists found for the selected mood.</p>`;
    return;
  }

  playlists.forEach((playlist) => {
    if (
      !playlist ||
      !playlist.images ||
      !playlist.name ||
      !playlist.external_urls
    ) {
      console.warn("Skipping invalid playlist:", playlist);
      return;
    }

    const card = document.createElement("div");
    card.className = "playlist-card";
    card.innerHTML = `
      <img src="${playlist.images[0]?.url || ""}" alt="${
      playlist.name || "Playlist"
    }">
      <h4>${playlist.name || "Unknown Playlist"}</h4>
      <a href="${
        playlist.external_urls?.spotify || "#"
      }" class='btn_custom' target="_blank">Listen on Spotify</a>
    `;
    playlistSection.appendChild(card);
  });
}

// Main Event Listener
const fetchWeatherButton = document.getElementById("fetch_weather");
fetchWeatherButton.addEventListener("click", async () => {
  const city = document.getElementById("city_input").value;
  if (!city) {
    alert("Please enter a city.");
    return;
  }
  try {
    const weatherData = await fetchWeather(city);
    const weatherCondition = weatherData.weather[0].main;

    const moods = weatherToMood[weatherCondition] || "happy"; //getting a random mood from the weather condition
    const mood = moods[Math.floor(Math.random() * moods.length)]; //picking only one mood now

    updateBackground(weatherCondition);
    displayWeatherDetails(weatherData);

    const playlistSection = document.getElementById("playlist_section");
    playlistSection.scrollIntoView({ behavior: "smooth", block: "start" }); // Scroll to the top of the playlist section

    // hide carousel
    const carousel = document.getElementById("carouselFade");
    carousel.style.display = "none";

    const playlists = await fetchPlaylists(mood);
    displayPlaylists(playlists);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

function getMoodForWeather(weatherCondition) {
  const condition = weatherAliases[weatherCondition] || weatherCondition;
  const moods = weatherToMood[condition] || ["neutral"];
  return moods[Math.floor(Math.random() * moods.length)];
}

//fetching weather details
function displayWeatherDetails(weatherData) {
  const weatherCondition = weatherData.weather[0].description;
  const temperature = (weatherData.main.temp - 273.15).toFixed(1); // Convert Kelvin to Celsius
  const feelsLike = (weatherData.main.feels_like - 273.15).toFixed(1); // Kelvin to Celsius
  const humidity = weatherData.main.humidity;
  const windSpeed = weatherData.wind.speed;

  //upate the weather_info section
  document.getElementById("weather_info").innerHTML = `
    <h3>Weather Details</h3>
    <ul>
      <li><strong>Condition:</strong> ${weatherCondition}</li>
      <li><strong>Temperature:</strong> ${temperature}°C</li>
      <li><strong>Feels Like:</strong> ${feelsLike}°C</li>
      <li><strong>Humidity:</strong> ${humidity}%</li>
      <li><strong>Wind Speed:</strong> ${windSpeed} m/s</li>
    </ul>
  `;
}
