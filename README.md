# Web development Assignment # 3

## Group Members

[1] Jerin C Joseph - 2616436
[2] Bhagirathsinh Dipsinh Parmar - 2615473
[3] Zaryab Hassan Farooqui - 2621083

# Weather-Based Music Application

This project is a weather-based music and events application developed by our team of three members. The application dynamically fetches weather data, curates music playlists tailored to weather conditions and user moods, and suggests local events happening within a user-defined radius. It integrates the **OpenWeather API**, **Spotify API**, **Ticketmaster API**, and **Hugging Face GoEmotions** to deliver a highly personalised and engaging experience.

## Features

### 1. **Weather-Driven Playlists**

- Users input their city name to fetch the current weather.
- The application maps the weather condition (e.g., Rain, Clear, Snow) to a mood (e.g., "Calm," "Happy," "Romantic").
- Based on the mood, it generates Spotify playlists that match the weather and vibe.

### 2. **Mood-Based Search**

- The mood-based search implementation uses the Hugging Face GoEmotions model to detect moods from user input and fetch Spotify playlists based on the detected mood.
- Users can explicitly search playlists by telling how they feel (e.g., I feel low today) in the provided search bar.
- The application analyses the mood and fetches playlists aligned with the user's input.

### 3. **Event Suggestions**

- The application integrates the Ticketmaster API to fetch events happening within a specified radius of the user's location.
- Events are tailored to the user's current weather condition using weather-based keywords and location-based queries.
- It displays events happening nearby, helping users plan ahead while staying relevant to seasonal activities.

### 4. **Dynamic Backgrounds**

- The background of the application dynamically changes based on the weather condition, providing a visually engaging experience.

## Technologies Used

### **Frontend**

- **HTML5**: For structuring the web interface.
- **CSS3** (with **Bootstrap**): For responsive and visually appealing styling.
- **JavaScript**: For dynamic content rendering and API integration.

### **APIs**

- **OpenWeather API**:
  - Provides weather information such as temperature, conditions (Rain, Clear, etc.), and location-specific data.
- **Spotify API**:
  - Retrieves playlists based on the mood derived from the weather conditions or user input.
- **Ticketmaster API**:
  - Fetches location-based events using latitude, longitude, radius, and weather-based keywords.
- **Hugging Face GoEmotions API**:
  - Detects emotions from user-submitted text and maps them to relevant moods for playlist generation.  

## How It Works

### **1. Weather-Based Mood Detection**

- The application uses predefined mappings between weather conditions and moods.
- A random mood is selected from the list for each weather condition.

### **2. Fetching Weather Data**

- Users input their city name.
- The application calls the **OpenWeather API** to fetch current weather data.

### **3. Generating Playlists**

- The application maps the detected mood to a Spotify playlist query.
- It uses the **Spotify API** to fetch playlists related to the mood.

### **4. Mood-Based Search**

- Uses the Hugging Face GoEmotions model to detect emotions from user-submitted text.
- Fetches Spotify playlists aligned with the identified mood.

### **5. Event Recommendations**

- Uses the user's latitude and longitude to query the Ticketmaster API.
- Tailors event suggestions based on location.

### **6. Displaying Results**

- Weather details, playlists, and event suggestions are displayed dynamically in a visually engaging, responsive layout.

## References

[1] [GradientBackground](https://cssgradient.io/gradient-backgrounds/)
[2] [Glass-Glassmorphism](https://css.glass/)
[3] [AnimateCSS](https://animate.style/)
[4] [Bootstrap](https://getbootstrap.com/)
