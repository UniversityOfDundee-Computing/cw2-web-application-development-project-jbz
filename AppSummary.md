# Application Idea Summary

## Overview: 
 This app connects weather, user emotions, music, and local events for a personalised experience. By integrating the OpenWeather API, Spotify API, and Ticketmaster API, it curates playlists and suggests events based on real-time weather conditions and user mood. Users can explore activities within a specified radius for the next 1 month, tailored to their preferences and schedules. Additionally, the app uses Hugging Face’s GoEmotions model to analyse custom mood descriptions, providing even more tailored music recommendations.

## Key Features:
1.	**Weather-Based Playlists:** Fetch live weather data via OpenWeather API and map conditions (e.g., rain → nostalgic) to Spotify playlists.
2.	**Custom Mood Search:** Users can input mood descriptions, which the GoEmotions model processes to detect relevant emotions and generate playlists.
3.	**Event Suggestions:** Using the Ticketmaster API, the app fetches events within a chosen radius from the user’s location for the next three months. These events help users plan activities ahead, offering a balance between spontaneity and convenience.
4.	**Interactive UI:** Dynamic weather visuals, mood-specific playlists, and smooth navigation.
5.	**Responsiveness:** Fully responsive website.

## Development Process:
1.	**Design:** Wireframes for weather inputs, playlist display, and activity suggestions.
2.	**Implementation:**
    - Frontend: HTML, CSS (Bootstrap), JavaScript.
    - API Integrations: OpenWeather, Spotify, GoEmotion, TicketMaster.
    - Dynamic updates for playlists and weather details.
3.	**Testing:** Validating API integrations and ensuring a seamless user experience.
4.	**Deployment:** Hosting for real-world usage.

## Technology Stack:
- **APIs:**  OpenWeather, Spotify, Hugging Face GoEmotions.
- **Frontend:** HTML, CSS (Bootstrap), JavaScript.

## API Integration:
![API Work Flow](/assets/APIWorkflow.png)

## Wireframe:
![Initial Design](/assets/wireframe.png)