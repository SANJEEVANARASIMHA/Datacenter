import React, { useEffect } from "react";
import "./racktempanimate.css";
import $ from 'jquery'

export default function RackTempAnimation({ animateData }) {
    useEffect(() => {
        main();
        console.log("-------->", animateData);
        $("#mintemp").text(animateData[2].toFixed(2) + "°C");
        $("#maxtemp").text(animateData[1].toFixed(2) + "°C");
        $("#avgtemp").text(animateData[0].toFixed(2) + "°C");
        $("#tempavg").text(animateData[0].toFixed(2) + "°C ");
    }, []);

    // adds the correct css classes required to expand the pill and reveal the forecast
    const handlePillExpand = () => {
        const pill = document.querySelector(".pill-container");
        const currentWeather = document.querySelector(".current-weather");
        const weatherForecast = document.querySelector(
            ".weather-forecast-container"
        );

        pill.classList.add("pill-container--expanded");
        currentWeather.classList.add("current-weather--hidden");
        weatherForecast.classList.add("weather-forecast--show");
    };

    // adds the correct css classes required to contract the pill and reveal the current weather
    const handlePillContract = () => {
        const pill = document.querySelector(".pill-container");
        const currentWeather = document.querySelector(".current-weather");
        const weatherForecast = document.querySelector(
            ".weather-forecast-container"
        );

        pill.classList.remove("pill-container--expanded");
        currentWeather.classList.remove("current-weather--hidden");
        weatherForecast.classList.remove("weather-forecast--show");
    };

    // main function that runs on window load and calls everything necessary
    const main = () => {
        const pillContainer = document.querySelector(".pill-container");
        pillContainer.addEventListener("mouseenter", handlePillExpand);
        pillContainer.addEventListener("mouseleave", handlePillContract);
    };

    return (
        <div className="main-container">
            <div className="header-container">
                <div className="pill-container">
                    <div className="current-weather">
                        <img id='tempimg'
                            style={{ width: '50px', marginLeft: '23px' }}
                            alt=""
                            className="current-weather__icon"
                            src="https://www.amcharts.com/wp-content/themes/amcharts4/css/img/icons/weather/animated/day.svg"
                        />
                        <p className="current-weather__temp" id='tempavg'>
                            <span style={{ fontSize: "15px", color: '#00629B' }}>
                            </span>
                        </p>
                    </div>
                    <div className="weather-forecast-container">
                        <div className="weather-forecast">
                            <div className="weather-forecast__column">
                                <p className="weather-forecast__date"
                                    style={{ color: '#00629B' }}>Min
                                </p>
                                <img
                                    alt=""
                                    className="weather-forecast__icon"
                                    src="https://www.amcharts.com/wp-content/themes/amcharts4/css/img/icons/weather/animated/rainy-2.svg"
                                />
                                <p className="weather-forecast__temp" id='mintemp'
                                    style={{ color: '#00629B' }}>
                                </p>
                            </div>

                            <div className="weather-forecast__column">
                                <p className="weather-forecast__date"
                                    style={{ color: '#00629B' }}>Max</p>
                                <img
                                    alt=""
                                    className="weather-forecast__icon"
                                    src="https://www.amcharts.com/wp-content/themes/amcharts4/css/img/icons/weather/animated/thunder.svg"
                                />
                                <p className="weather-forecast__temp" id='maxtemp'
                                    style={{ color: '#00629B' }}>
                                </p>
                            </div>

                            <div className="weather-forecast__column">
                                <p className="weather-forecast__date"
                                    style={{ color: '#00629B' }}>Avg
                                </p>
                                <img
                                    alt=""
                                    className="weather-forecast__icon"
                                    src="https://www.amcharts.com/wp-content/themes/amcharts4/css/img/icons/weather/animated/day.svg"
                                />
                                <p className="weather-forecast__temp" id='avgtemp'
                                    style={{ color: '#00629B' }}>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
