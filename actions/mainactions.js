const OPENWEATHER_API_KEY = "a0140f98c00df8d5ca8c165d523a5806";
const SPOTIFY_CLIENT_ID = "c70162eaa3ea4f8986e41d1394c25d2a";
const SPOTIFY_CLIENT_SECRET = "5033c19b13b947a58087f70d22c52e81";
const TICKETMASTER_API_KEY = "EqCGMuljDooDkdNAyDuNPWlvoKsTt9NV";

// Map weather conditions to moods
const weatherToMood = {
  Clear: ["happy", "energetic", "adventurous", "motivated"],
  Rain: ["sad", "nostalgic", "romantic", "calm"],
  Clouds: ["chill", "thoughtful", "focused", "creative"],
  Snow: ["calm", "playful", "cozy", "reflective"],
  Thunderstorm: ["energetic", "empowered", "mysterious", "rebellious"],
  Drizzle: ["relaxing", "romantic", "nostalgic", "tranquil"],
  Fog: ["meditative", "mysterious", "creative", "focused"],
  Wind: ["restless", "energized", "thoughtful", "inspired"],
  Haze: ["dreamy", "subdued", "mellow", "mystical"],
  Hot: ["happy", "lazy", "cheerful", "adventurous"],
  Cold: ["cozy", "focused", "introspective", "peaceful"],
  Mist: ["mysterious", "calm", "thoughtful", "dreamy"],
  Overcast: ["low-energy", "chill", "focused", "creative"],
};

const weatherAliases = {
  Frosty: "Cold",
};

const weatherToEventType = {
  Clear: ["outdoor", "festival", "sports", "concert"],
  Rain: ["indoor", "theater", "museum"],
  Clouds: ["workshop", "networking", "live music"],
  Snow: ["holiday", "movie", "indoor"],
  Thunderstorm: ["party", "music", "live performance"],
  Drizzle: ["dinner", "gallery", "art"],
  Fog: ["yoga", "meditation", "seminar"],
  Wind: ["sports", "outdoor", "adventure"],
  Haze: ["photography", "exhibition", "art"],
  Hot: ["beach", "water", "festival"],
  Cold: ["book club", "indoor", "cozy"],
  Mist: ["mystery", "calm", "meditation"],
  Overcast: ["networking", "indoor sports", "workshop"],
};

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

    // Clear the events grid when using the sentiment section
    const eventsGrid = document.getElementById("events-grid");
    eventsGrid.innerHTML = ""; // Clear any events displayed

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

// Fetch Events
async function fetchEvents(lat, lon, weatherType) {
  const radius = 60; // Radius in miles
  const keywords = weatherToEventType[weatherType] || ["events"];

  const startDate = new Date().toISOString(); // Current date/time
  const endDate = new Date(
    Date.now() + 6 * 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const corsProxy = "https://cors-anywhere.herokuapp.com/";

  for (const keyword of keywords) {
    const url = `${corsProxy}https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&latlong=${lat},${lon}&radius=${radius}&keyword=${keyword}&startDateTime=${startDate}&endDateTime=${endDate}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`HTTP error for keyword ${keyword}: ${response.status}`);
        continue;
      }
      const data = await response.json();

      if (data._embedded && data._embedded.events) {
        console.log(`Events found for keyword: ${keyword}`);
        return data._embedded.events.filter((event) => {
          if (
            !event.dates ||
            !event.dates.start ||
            !event.dates.start.dateTime
          ) {
            return false;
          }
          const eventDate = new Date(event.dates.start.dateTime).getTime();
          const start = new Date(startDate).getTime();
          const end = new Date(endDate).getTime();
          return eventDate >= start && eventDate <= end;
        });
      }
    } catch (error) {
      console.error(
        `Error fetching events for keyword ${keyword}:`,
        error.message
      );
    }
  }

  console.warn("No specific events found. Falling back to 'events'.");
  const fallbackUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&latlong=${lat},${lon}&radius=${radius}&keyword=events`;
  const fallbackResponse = await fetch(fallbackUrl);
  const fallbackData = await fallbackResponse.json();

  return fallbackData._embedded?.events || [];
}

// Display Events
function displayEvents(events) {
  console.log("Events to display: ", events);
  const eventsGrid = document.getElementById("events-grid");
  eventsGrid.innerHTML = ""; // Clear previous content

  if (!events.length) {
    eventsGrid.innerHTML = "<p>No events found for this location.</p>";
    return;
  }

  // Create a scrollable container
  const scrollContainer = document.createElement("div");
  scrollContainer.className = "events-scroll-container";

  events.forEach((event) => {
    const eventCard = document.createElement("div");
    eventCard.className = "event-card";
    eventCard.innerHTML = `
      <img src="${
        event.images?.[0]?.url ||
        "https://via.placeholder.com/300x200?text=No+Image"
      }" alt="${event.name || "Event"}" class="event-image">
      <h3>${event.name || "Unknown Event"}</h3>
      <p>${
        event.dates?.start?.dateTime
          ? new Date(event.dates.start.dateTime).toLocaleString()
          : "Date not available"
      }</p>
      <p>Location: ${event._embedded?.venues?.[0]?.name || "Unknown Venue"}</p>
      <a href="${
        event.url || "#"
      }" target="_blank" class="btn_custom">More Info</a>
    `;
    eventsGrid.appendChild(eventCard);
  });

  eventsGrid.appendChild(scrollContainer);
}

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
    document.getElementById(
      "weather_info"
    ).innerHTML = `<h3>Your weather: <span>${weatherCondition}</span></h3>
    <p> Your mood: <span>${mood}</span></p>`;

    const playlistSection = document.getElementById("playlist_section");
    playlistSection.scrollIntoView({ behavior: "smooth", block: "start" }); // Scroll to the top of the playlist section

    // hide carousel
    const carousel = document.getElementById("carouselFade");
    carousel.style.display = "none";

    const playlists = await fetchPlaylists(mood);
    displayPlaylists(playlists);

    // Fetch and Display Events
    const lat = weatherData.coord.lat;
    const lon = weatherData.coord.lon;
    const events = await fetchEvents(lat, lon, weatherCondition);
    displayEvents(events);

    // Scroll to the Events Section
    // const eventsSection = document.getElementById("events_section");
    // eventsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

function getMoodForWeather(weatherCondition) {
  const condition = weatherAliases[weatherCondition] || weatherCondition;
  const moods = weatherToMood[condition] || ["neutral"];
  return moods[Math.floor(Math.random() * moods.length)];
}
