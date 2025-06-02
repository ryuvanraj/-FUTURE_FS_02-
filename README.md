# WeatherPRO - Real-Time Weather Application

A modern, responsive weather application built with React that provides real-time weather information and forecasts using the OpenWeatherMap API.

![Screenshot 2025-06-02 200111](https://github.com/user-attachments/assets/7f2b412f-0eb3-4ac0-b7b2-7290e70ac401)
![Screenshot 2025-06-02 200213](https://github.com/user-attachments/assets/ba29dd22-7096-4792-b194-40b1ed393b83)
![Screenshot 2025-06-02 200349](https://github.com/user-attachments/assets/959fa103-4440-434f-a712-6e6d581075e0)
![Screenshot 2025-06-02 200434](https://github.com/user-attachments/assets/b79a5005-33e1-44a1-88e0-7d905cb771cc)

## Features

- Real-time weather data for any city worldwide
- Current weather conditions including:
  - Temperature
  - Humidity
  - Wind speed and direction
  - Visibility
  - Atmospheric pressure
- 5-day weather forecast
- Hourly forecast for the next 24 hours
- Sunrise and sunset times
- Light/Dark theme support
- Responsive design for all devices
- Search suggestions for cities
- Auto-refresh weather data

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- OpenWeatherMap API
- Lucide Icons
- JavaScript ES6+

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- OpenWeatherMap API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/ryuvanraj/-FUTURE_FS_02-.git
cd Weather
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenWeatherMap API key
```env
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

4. Start the development server
```bash
npm run dev
```

The application will be available at `https://weatherpro5.netlify.app/`

## Usage

- Enter a city name in the search bar
- Select a city from the suggestions or press enter
- View current weather conditions and forecast
- Toggle between light and dark themes
- Click the refresh button to update weather data
- View hourly forecast by scrolling horizontally

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

- OpenWeatherMap for providing the weather data API
- Lucide Icons for the beautiful icons
- Tailwind CSS for the styling framework