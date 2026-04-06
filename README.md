# Climate Weather

A beautiful, modern weather application built with React, Three.js, and real-time weather data.

![Climate Weather](https://via.placeholder.com/800x400/0a0a0f/6366f1?text=Climate+Weather)

## Features

- **Real-time Weather Data** - Get current weather information from OpenWeatherMap API
- **Location Search** - Search for any city worldwide
- **Geolocation Support** - Get weather for your current location with one click
- **3D Visual Effects** - Stunning animated background with dynamic weather colors
- **Responsive Design** - Works beautifully on desktop and mobile devices
- **Dark Mode Interface** - Easy on the eyes with a modern dark theme

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenWeatherMap API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd climate-weather
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Get your API key from [OpenWeatherMap](https://openweathermap.org/api)

4. Update the API key in `src/hooks/useClimateEngine.js`:
   ```javascript
   const API_KEY = 'YOUR_API_KEY';
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Three.js** - 3D graphics
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Tailwind CSS** - Utility-first CSS framework

## Project Structure

```
climate-weather/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── MetricCard.jsx      # Weather metric display card
│   │   ├── SearchIcon.jsx      # Animated search icon with morphing effect
│   │   └── Silk.jsx            # 3D animated background
│   ├── hooks/
│   │   └── useClimateEngine.js # Weather data management
│   ├── App.jsx
│   ├── App.css                 # App-specific styles
│   ├── index.css               # Global styles
│   └── main.jsx                # Entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Usage

1. **Search for a city** - Type in the search box to find cities worldwide
2. **Get current location** - Click the location button to get weather for your current position
3. **View weather details** - See temperature, humidity, wind speed, and feels-like temperature
4. **Enjoy the visuals** - Watch the 3D background adapt to current weather conditions

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Weather data by [OpenWeatherMap](https://openweathermap.org/)
- Icons by [Lucide](https://lucide.dev/)
- 3D effects powered by [Three.js](https://threejs.org/)
