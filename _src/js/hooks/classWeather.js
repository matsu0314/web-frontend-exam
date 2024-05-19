/**
 * クラス GetWeather
 * 天気情報を取得して表示するクラス
 */
export class GetWeather {
  /**
   * コンストラクター
   * @param {Object} APIdata - 天気情報のAPIデータ
   * @param {HTMLElement} targetDOM - 天気情報を表示する対象のDOM要素
   */
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

  /**
   * 天気アイコンを生成してDOMに追加する
   * @param {HTMLElement} targetElm - アイコンを追加する対象のDOM要素
   * @param {string} path - アイコン画像のURL
   * @param {string} label - アイコンのラベル
   * @private
   */
  _createWeatherIconTag(targetElm, path, label) {
    const weatherIconImg = document.createElement("img");
    weatherIconImg.src = path;
    weatherIconImg.alt = label;

    targetElm.appendChild(weatherIconImg);
  }

  /**
   * 温度差を設定する
   * @param {Object} beforeDayTemp - 前日の温度データ
   */
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

  /**
   * 温度差を計算する
   * @param {number|string} todayTemp - 今日の温度
   * @param {number|string} yesterdayTemp - 昨日の温度
   * @returns {string} 温度差を示す文字列
   * @private
   */
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

/**
 * クラス GetTodayTomorrow
 * 今日と明日の天気情報を取得して表示するクラス
 * @extends GetWeather
 */
export class GetTodayTomorrow extends GetWeather {
  /**
   * コンストラクター
   * @param {Object} APIdata - 天気情報のAPIデータ
   * @param {HTMLElement} targetDOM - 天気情報を表示する対象のDOM要素
   */
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

  /**
   * 降水確率を生成してDOMに追加する
   * @param {HTMLElement} targetElm - 降水確率を追加する対象のDOM要素
   * @param {Object} rainObj - 降水確率のデータ
   * @private
   */
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
