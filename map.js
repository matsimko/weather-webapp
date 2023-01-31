const defaultLatLong = {lat: 51.505, lng: -0.09}; //new L.LatLong(defaultLat, defaultLon)


//leaflet map
const map = L.map('map').setView(defaultLatLong, 4);

//using openstreetmap tiles
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"; //(style, zoom, x, y)
const tileLayer = L.tileLayer(tileUrl, {attribution, noWrap: true}); //when attribute name is not specified in an object, it will be name of the variable, so {attribution: attribution}
tileLayer.addTo(map);

//marker for current position
const markerIcon = L.icon({
    iconUrl: 'imgs/marker.png',
    iconSize:     [20, 40],
    iconAnchor:   [10, 40],
});
const marker = L.marker(defaultLatLong, {icon: markerIcon}).addTo(map);

function setCenter(latLng, ignoredCallback = null) {
    map.panTo(latLng);
    marker.setLatLng(latLng);
    //notify all listeners that position changed (except the ignoredCallback)
    positionListeners.forEach(listener => {
        if(listener !== ignoredCallback) {
            listener(latLng);
        }
    });
}

const positionListeners = [];

//I want to keep the map private to this module
function addPositionListener(callback) {
    positionListeners.push(callback);
}

if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
        const coords = position.coords;
        const latLng = {lat: coords.latitude, lng: coords.longitude};
        map.setZoom(12);
        setCenter(latLng);
    });
}

function onMapClick(e) {
    setCenter(e.latlng);
}
map.on('click', onMapClick);

export {setCenter, addPositionListener}





