const OPENWEATHER_API_KEY = "a0140f98c00df8d5ca8c165d523a5806";
const SPOTIFY_CLIENT_ID = "c70162eaa3ea4f8986e41d1394c25d2a";
const SPOTIFY_CLIENT_SECRET = "5033c19b13b947a58087f70d22c52e81";

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

// Get Spotify access token
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

// Fetch random playlists from Spotify
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
