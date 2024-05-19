import { fetchWeatherApi } from "openmeteo";

/**
 * 「天気予報 API（livedoor 天気互換）」で天気情報を取得する非同期関数
 * API-URL:https://weather.tsukumijima.net/
 * @param {string} cityCode - 都市コード
 * @returns {Promise<Object>} - 取得した天気情報のデータ
 * @throws {Error} - フェッチ操作に問題があった場合
 */
export async function fetchWeatherLive(cityCode) {
  const apiUrl = `https://weather.tsukumijima.net/api/forecast?city=${cityCode}`;
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

/**
 * 「Open-Meteo WeatherForecastAPI」で天気情報を取得する非同期関数
 * API-URL:https://open-meteo.com/en/docs/
 * @param {Object} params - APIへのリクエストパラメータ
 * @returns {Promise<Object>} - 取得したWMO形式の天気情報のデータ
 */
export async function fetchWeatherWMO(params) {
  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);

  // Helper function to form time ranges
  /**
   * 時間範囲を生成するヘルパー関数
   * @param {number} start - 開始時間
   * @param {number} stop - 終了時間
   * @param {number} step - ステップ幅
   * @returns {number[]} - 時間範囲の配列
   */
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

  // 取得したお天気情報を返却
  return weatherData;
}
