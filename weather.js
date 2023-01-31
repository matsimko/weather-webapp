const apiKey = "9e699e4117c7dad2ab170008ba62db7d";

async function getWeather(params, tempUnits) {
    tempUnits = (tempUnits == "default") ? "" : "&units=" + tempUnits;
    const response = await fetch("https://api.openweathermap.org/data/2.5/weather?" +
        params + tempUnits + "&appid=" + apiKey);
    const json = await response.json(); //already parsed to obj
    return json;
}

async function getWeatherForCity(city, tempUnits) {
    const params = "q=" + city;
    const weather = await getWeather(params, tempUnits);
    return weather;   
}

async function getWeatherForLatLng(latlng, tempUnits) {
    const params = "lat=" + latlng.lat + "&lon=" + latlng.lng;
    const weather = await getWeather(params, tempUnits);
    return weather;
}

export { getWeatherForCity, getWeatherForLatLng }