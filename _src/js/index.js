import { fetchWeatherApi } from "openmeteo";
import { getWeatherInfo } from "./hooks/getWeatherInfo";
// import { GetWeather, GetTodayTomorrow } from "./hooks/classWeather";
import dayjs from "dayjs";
import "dayjs/locale/ja";

// 日本語ローカルに設定
dayjs.locale("ja");



class GetWeather {
  constructor(APIdata, targetDOM) {
    // DOM要素
    this.DOM = {};

    this.DOM.weatherLabel = targetDOM.querySelector(".js-weather-label");
    this.DOM.weatherIcon = targetDOM.querySelector(".js-weather-icon");
    this.DOM.tempHighest = targetDOM.querySelector(".js-temp-highest");
    this.DOM.tempLowest = targetDOM.querySelector(".js-temp-lowest");
    this.DOM.tempDiffHighest = targetDOM.querySelector(".js-temp-diff-highest");
    this.DOM.todayDiffLowest = targetDOM.querySelector(".js-temp-diff-lowest");

    // APIデータ
    this.APIdata = APIdata;

    this.DOM.weatherLabel.textContent = this.APIdata.weatherLabel;
    this.DOM.tempHighest.textContent = this.APIdata.maxTemp;
    this.DOM.tempLowest.textContent = this.APIdata.minTemp;

    this._createWeatherIconTag(
      this.DOM.weatherIcon,
      this.APIdata.iconURL,
      this.APIdata.iconLabel
    );
  }

  _createWeatherIconTag(targetElm, path, label) {
    const weatherIconImg = document.createElement("img");
    weatherIconImg.src = path;
    weatherIconImg.alt = label;

    targetElm.appendChild(weatherIconImg);
  }

  set tempDiffSet(beforeDayTemp) {
    this.DOM.tempDiffHighest.textContent = this._temperatureDiff(
      this.APIdata.maxTemp,
      beforeDayTemp.maxTemp
    );
    this.DOM.todayDiffLowest.textContent = this._temperatureDiff(
      this.APIdata.minTemp,
      beforeDayTemp.minTemp
    );
  }

  _temperatureDiff(todayTemp, yesterdayTemp) {
    if (todayTemp === null || yesterdayTemp === null) {
      return "[-]";
    }

    const temperatureDifference = Number(todayTemp) - Number(yesterdayTemp);

    if (temperatureDifference === 0) {
      return `[0]`;
    }

    const sign = temperatureDifference > 0 ? "+" : "";
    return `[${sign}${temperatureDifference}]`;
  }
}

class GetTodayTomorrow extends GetWeather {
  constructor(APIdata, targetDOM) {
    super(APIdata, targetDOM);
    this.DOM.todayChanceOfRain = targetDOM.querySelector(".js-chanceOfRain");

    if (this.DOM.todayChanceOfRain) {
      this._createChanceOfRainTag(
        this.DOM.todayChanceOfRain,
        this.APIdata.chanceOfRain
      );
    }
  }

  _createChanceOfRainTag(targetElm, rainObj) {
    const thElm = document.createElement("th");
    thElm.textContent = "降水";
    targetElm.appendChild(thElm);

    for (const [time, percent] of Object.entries(rainObj)) {
      const tdElm = document.createElement("td");
      tdElm.textContent = percent;
      targetElm.appendChild(tdElm);
    }
  }
}

async function getWeatherData(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

(async () => {
  // 週間データ取得
  const params = {
    latitude: 35.6785,
    longitude: 139.6823,
    daily: ["weather_code", "temperature_2m_max", "temperature_2m_min"],
    timezone: "Asia/Tokyo",
  };
  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);

  // Helper function to form time ranges
  const range = (start, stop, step) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];

  // Attributes for timezone and location
  const utcOffsetSeconds = response.utcOffsetSeconds();

  const daily = response.daily();

  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {
    daily: {
      time: range(
        Number(daily.time()),
        Number(daily.timeEnd()),
        daily.interval()
      ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
      weatherCode: daily.variables(0).valuesArray(),
      temperature2mMax: daily.variables(1).valuesArray(),
      temperature2mMin: daily.variables(2).valuesArray(),
    },
  };

  // `weatherData` now contains a simple structure with arrays for datetime and weather data

  const weekWeather = document.querySelector("#week-weather");
  const weekWeatherTemplate = document.querySelector("#weekWeather-template");

  for (let i = 2; i < weatherData.daily.time.length; i++) {
    const weatherCode = weatherData.daily.weatherCode[i];
    const weatherInfo = getWeatherInfo(weatherCode);
    const weatherDay = dayjs(weatherData.daily.time[i].toISOString()).format(
      "M月D日 (ddd)"
    );

    const temperature2mMaxAry = weatherData.daily.temperature2mMax;
    const temperature2mMinAry = weatherData.daily.temperature2mMin;

    const beforeMaxTemp = Math.floor(temperature2mMaxAry[i - 1]) || null;
    const beforeMinTemp = Math.floor(temperature2mMinAry[i - 1]) || null;

    const WMOWeatherData = {
      date: weatherDay,
      weatherLabel: weatherInfo.label,
      iconLabel: weatherInfo.label,
      iconURL: weatherInfo.icon,
      maxTemp: Math.floor(temperature2mMaxAry[i]),
      minTemp: Math.floor(temperature2mMinAry[i]),
      chanceOfRain: "-", //　今週の天気は降水確率なし
    };

    let weather_element = weekWeatherTemplate.content.cloneNode(true);
    const getWeatherDay = weather_element.querySelector(".js-weather-date");
    getWeatherDay.textContent = WMOWeatherData.date;
    const getWeather = new GetWeather(WMOWeatherData, weather_element);
    getWeather.tempDiffSet = {
      maxTemp: beforeMaxTemp,
      minTemp: beforeMinTemp,
    };

    weekWeather.appendChild(weather_element);
  }

  //　今日と明日の天気
  const cityCode = "130010"; // 東京
  const apiUrl = `https://weather.tsukumijima.net/api/forecast?city=${cityCode}`;
  try {
    const API_Data = await getWeatherData(apiUrl);
    const todayWeather = document.getElementById("today-weather");
    const tomorrowWeather = document.getElementById("tomorrow-weather");

    const yesterdayData = {
      date: API_Data["forecasts"][0]["date"],
      weatherLabel: API_Data["forecasts"][0]["telop"],
      iconLabel: API_Data["forecasts"][0]["image"]["title"],
      iconURL: API_Data["forecasts"][0]["image"]["url"],
      maxTemp: API_Data["forecasts"][0]["temperature"]["max"]["celsius"],
      minTemp: API_Data["forecasts"][0]["temperature"]["min"]["celsius"],
      chanceOfRain: API_Data["forecasts"][0]["chanceOfRain"],
    };

    const todayData = {
      date: API_Data["forecasts"][0]["date"],
      weatherLabel: API_Data["forecasts"][0]["telop"],
      iconLabel: API_Data["forecasts"][0]["image"]["title"],
      iconURL: API_Data["forecasts"][0]["image"]["url"],
      maxTemp: API_Data["forecasts"][0]["temperature"]["max"]["celsius"],
      minTemp: API_Data["forecasts"][0]["temperature"]["min"]["celsius"],
      chanceOfRain: API_Data["forecasts"][0]["chanceOfRain"],
    };

    const tomorrowData = {
      date: API_Data["forecasts"][1]["date"],
      weatherLabel: API_Data["forecasts"][1]["telop"],
      iconLabel: API_Data["forecasts"][1]["image"]["title"],
      iconURL: API_Data["forecasts"][1]["image"]["url"],
      maxTemp: API_Data["forecasts"][1]["temperature"]["max"]["celsius"],
      minTemp: API_Data["forecasts"][1]["temperature"]["min"]["celsius"],
      chanceOfRain: API_Data["forecasts"][1]["chanceOfRain"],
    };

    // インスタンス化
    const getTodayWeather = new GetTodayTomorrow(todayData, todayWeather);
    getTodayWeather.tempDiffSet = {
      maxTemp: yesterdayData.maxTemp,
      minTemp: yesterdayData.minTemp,
    };
    const getTomorrowWeather = new GetTodayTomorrow(
      tomorrowData,
      tomorrowWeather
    );
    getTomorrowWeather.tempDiffSet = {
      maxTemp: todayData.maxTemp,
      minTemp: todayData.minTemp,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
})();
