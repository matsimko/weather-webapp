import { getWeatherForCity, getWeatherForLatLng } from "./weather.js"
import * as map from "./map.js"
import * as weatherChart from "./weatherChart.js"

//document.querySelector('input[name="searchOption"]:checked').value; //this would work as well, just switch based on the value

function hideWeatherResult() {
  hide(document.querySelector("#weather-result"));
  show(document.querySelector("#no-weather-data"));
}

function showWeatherResult() {
  show(document.querySelector("#weather-result"));
  hide(document.querySelector("#no-weather-data"));
}

/*
 update current weather results and update the chart with a new weather value
 */
function updateWeatherElems(weather, tempUnit) {
  console.log(weather);
  const { lat, lon } = weather.coord;
  const city = weather.name;

  const locationDiv = document.querySelector("#location");
  if (city) {
    locationDiv.innerHTML = `Weather in ${city} <small>(${lat}/${lon})</small>`
  }
  else {
    locationDiv.innerHTML = `Weather at ${lat}/${lon}`;
  }

  //const humidity = weather.main.humidity;
  //const pressure = weather.main.pressure;
  //objects destructuring is more convenient:
  const { humidity, pressure, temp, feels_like } = weather.main;
  const { icon, description } = weather.weather[0];
  document.querySelector("#humidity").innerHTML = humidity + " %";
  document.querySelector("#pressure").innerHTML = pressure + " hPa";
  document.querySelector("#feels-like").innerHTML = `${feels_like} ${tempUnit}`;
  document.querySelector("#temp").innerHTML = `${temp} ${tempUnit}`;
  document.querySelector("#weather-icon").src = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
  document.querySelector("#weather-desc").innerHTML = description;

  showWeatherResult();

  updateWeatherChart(weather);
}

//doing this in a separate function to prevent the code from becoming absolute spaghetti
function updateWeatherChart(weather) {
  const city = weather.name;
  const { lat, lon } = weather.coord;
  const { temp } = weather.main;

  const label = city ? city : `${lat}/${lon}`;
  const value = temp;

  weatherChart.addRecord(label, value);
}

async function searchByCity() {
  const city = document.querySelector("#city-input").value;
  const tempUnit = unitsSelect[unitsSelect.selectedIndex].text; //retrieve the current unit before the user can change the select element
  try {
    const weather = await getWeatherForCity(city, unitsSelect.value);
    //I still get the coordinates so I will update the map 
    //(and pass the listener which shouldn't be notified, as I already have the weather data)
    const { lat, lon } = weather.coord;
    map.setCenter({ lat: lat, lng: lon }, searchByLatlng);

    updateWeatherElems(weather, tempUnit);
  }
  catch (e) {
    hideWeatherResult();
  }



}

async function searchByLatlng(latlng) {
  const tempUnit = unitsSelect[unitsSelect.selectedIndex].text;
  try {
    const weather = await getWeatherForLatLng(latlng, unitsSelect.value);
    updateWeatherElems(weather, tempUnit);
  }
  catch (e) {
    hideWeatherResult();
  }
}


async function setMapLatlng() {
  const latInput = document.querySelector("#lat-input");
  const lngInput = document.querySelector("#lng-input");
  const lat = parseFloat(latInput.value);
  const lng = parseFloat(lngInput.value);

  const latlng = { lat, lng }; //short for {lat: lat, lng: lng}
  //setting the map center will trigger searchByLatlng(latlng) function above, as I am listening for the position change.
  map.setCenter(latlng);
}

map.addPositionListener(function (latlng) {
  searchByLatlng(latlng);
})

const unitsSelect = document.querySelector("#units-select");

const citySearchForm = document.querySelector("#city-search-form");
const latlngSearchForm = document.querySelector("#latlng-search-form");

const radioCity = document.querySelector("#radio-city");
const radioLatlng = document.querySelector("#radio-latlng");

const cityDiv = document.querySelector("#city");
const latlngDiv = document.querySelector("#latlng");
const searchResultDivs = [cityDiv, latlngDiv];

//I could've made a custom searchform class, but these arrays are enough to prevent major code duplication
const searchForms = [citySearchForm, latlngSearchForm];
const searchFunctions = [searchByCity, setMapLatlng];

function hide(elem) {
  elem.classList.add("d-none");
}
function show(elem) {
  elem.classList.remove("d-none");
}

//hide elements in "all" and show "one" 
function showOneOf(all, one) {
  all.forEach(elem => hide(elem));
  show(one);
}

if (radioCity.checked) {
  showOneOf(searchForms, citySearchForm);
}
else {
  showOneOf(searchForms, latlngSearchForm);
}

radioCity.addEventListener('change', () => showOneOf(searchForms, citySearchForm));
radioLatlng.addEventListener('change', () => showOneOf(searchForms, latlngSearchForm));


//on submit of each form, validate it and if ok, then call the appropriate search function
for (let i = 0; i < searchForms.length; i++) {
  //because I am using ES6 "let", each iteration has its own "i" variable,
  //so I don't have to make a closure via extra function "function addSubmitListener(i)" where I would send "i"
  searchForms[i].addEventListener('submit', function (e) {
    console.log(searchForms[i]);
    e.preventDefault();
    if (!searchForms[i].checkValidity()) {
      e.stopPropagation();
      searchForms[i].classList.add("was-validated");
    }
    else {
      searchForms[i].classList.remove("was-validated");
      searchFunctions[i]();
    }
  });
}



