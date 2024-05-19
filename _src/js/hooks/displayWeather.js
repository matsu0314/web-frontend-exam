import { getWeatherInfo } from "./getWeatherInfo";
import { GetWeather, GetTodayTomorrow } from "./classWeather";

import dayjs from "dayjs";
import "dayjs/locale/ja";

// 日本語ローカルに設定
dayjs.locale("ja");

/**
 * 週間天気を表示する関数
 * @param {Object} weatherData - 週間天気のAPIデータ
 * @param {Object} weatherData.daily - 日ごとの天気データ
 * @param {Date[]} weatherData.daily.time - 各日の日時の配列
 * @param {number[]} weatherData.daily.weatherCode - 各日の天気コードの配列
 * @param {number[]} weatherData.daily.temperature2mMax - 各日の最高気温の配列
 * @param {number[]} weatherData.daily.temperature2mMin - 各日の最低気温の配列
 */
export function displayWeekWeather(weatherData) {
  // 週間天気を表示する要素を取得
  const weekWeather = document.querySelector("#week-weather");
  const weekWeatherTemplate = document.querySelector("#weekWeather-template");

  // 火曜日からデータ取得
  for (let i = 2; i < weatherData.daily.time.length; i++) {
    const weatherCode = weatherData.daily.weatherCode[i];
    const weatherInfo = getWeatherInfo(weatherCode);
    const weatherDay = dayjs(weatherData.daily.time[i].toISOString()).format(
      "M月D日 (ddd)"
    );

    const temperature2mMaxAry = weatherData.daily.temperature2mMax;
    const temperature2mMinAry = weatherData.daily.temperature2mMin;

    // 前日の最高・最低気温を取得
    const beforeMaxTemp = Math.floor(temperature2mMaxAry[i - 1]) || null;
    const beforeMinTemp = Math.floor(temperature2mMinAry[i - 1]) || null;

    const WeatherDataWMO = {
      date: weatherDay,
      weatherLabel: weatherInfo.label,
      iconLabel: weatherInfo.label,
      iconURL: weatherInfo.icon,
      maxTemp: Math.floor(temperature2mMaxAry[i]),
      minTemp: Math.floor(temperature2mMinAry[i]),
      chanceOfRain: "-", //　今週の天気は降水確率なし
    };

    // 天気カードのテンプレートをコピー
    let weather_element = weekWeatherTemplate.content.cloneNode(true);
    // 天気の日付を取得して表示
    const getWeatherDay = weather_element.querySelector(".js-weather-date");
    getWeatherDay.textContent = WeatherDataWMO.date;
    // 週間（日付別）の天気インスタンス化
    const getWeather = new GetWeather(WeatherDataWMO, weather_element);
    // 週間（日付別）、前日の気温差を取得
    getWeather.tempDiffSet = {
      maxTemp: beforeMaxTemp,
      minTemp: beforeMinTemp,
    };

    weekWeather.appendChild(weather_element);
  }
}

/**
 * 今日と明日の天気を表示する関数
 * @param {Object} API_Data - 天気のAPIデータ
 * @param {Object[]} API_Data.forecasts - 各日の天気予報の配列
 * @param {string} API_Data.forecasts[].date - 日付
 * @param {string} API_Data.forecasts[].telop - 天気
 * @param {Object} API_Data.forecasts[].image - 天気画像の情報
 * @param {string} API_Data.forecasts[].image.title - 天気画像のタイトル
 * @param {string} API_Data.forecasts[].image.url - 天気画像のURL
 * @param {Object} API_Data.forecasts[].temperature - 気温情報
 * @param {Object} API_Data.forecasts[].temperature.max - 最高気温
 * @param {string} API_Data.forecasts[].temperature.max.celsius - 最高気温（摂氏）
 * @param {Object} API_Data.forecasts[].temperature.min - 最低気温
 * @param {string} API_Data.forecasts[].temperature.min.celsius - 最低気温（摂氏）
 * @param {Object} API_Data.forecasts[].chanceOfRain - 降水確率
 */
export function displayTodayTomorrow(API_Data) {
  const todayWeather = document.getElementById("today-weather");
  const tomorrowWeather = document.getElementById("tomorrow-weather");

  // TODO: 天気予報 APIでは昨日のデータが取得できない様です。
  // 必要でしたらAPIの元になっている気象庁のJSONから取得します。
  const yesterdayData = {
    date: "-",
    weatherLabel: "-",
    iconLabel: "-",
    iconURL: "-",
    maxTemp: "-",
    minTemp: "-",
    chanceOfRain: "-",
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
}