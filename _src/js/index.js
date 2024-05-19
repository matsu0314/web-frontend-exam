import {
  displayWeekWeather,
  displayTodayTomorrow,
} from "./hooks/displayWeather";
import { fetchWeatherLive, fetchWeatherWMO } from "./hooks/fetchWeatherDate";

(async () => {
  let isLoading = true;

  // 週間データ取得
  const params = {
    latitude: 35.6785,
    longitude: 139.6823,
    daily: ["weather_code", "temperature_2m_max", "temperature_2m_min"],
    timezone: "Asia/Tokyo",
  };
  const weatherData = await fetchWeatherWMO(params);

  await displayWeekWeather(weatherData);

  //　今日と明日の天気
  const cityCode = "130010"; // 東京
  
  try {
    const API_Data = await fetchWeatherLive(cityCode);
    await displayTodayTomorrow(API_Data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
  isLoading = false;

  if(!isLoading) {
    const htmlElement = document.querySelector('html');
    htmlElement.classList.add("fadeIn");
    htmlElement.classList.remove("loading");

  }
})();
