// Leaflet map
var map = L.map('map').setView([37.8, -96], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Loading and plotting coordinates
var markers = L.markerClusterGroup();
fetch('./data/mapdata.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(coord => {
            var marker = L.marker([coord.LATITUDE, coord.LONGITUDE]);
            markers.addLayer(marker);
        });
        map.addLayer(markers);
    })
    .catch(error => console.error('Error loading JSON:', error));

// Adding filters
function updateMap() {
    var selectedYear = document.getElementById('yearFilter').value;
    var selectedRegion = document.getElementById('regionFilter').value;
    var selectedRoadType = document.getElementById('RoadTypeFilter').value;
    var selectedPopulation = document.getElementById('PopulationFilter').value;
    var selectedAccidentType = document.getElementById('AccidentTypeFilter').value;
    var selectedIntersectionType = document.getElementById('IntersectionTypeFilter').value;
    var selectedLocation = document.getElementById('LocationFilter').value;
    var selectedLighting = document.getElementById('LightingFilter').value;
    var selectedWeatherType = document.getElementById('WeatherTypeFilter').value;
    var selectedTime = document.getElementById('TimeFilter').value;

    markers.clearLayers();
    fetch('./data/mapdata.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(coord => {
                if (checkFilters(coord, selectedYear, selectedRegion, selectedRoadType, selectedPopulation, selectedLocation)) {
                    var marker = L.marker([coord.LATITUDE, coord.LONGITUDE]);
                    markers.addLayer(marker);
                }
            });
            map.addLayer(markers);
        })
        .catch(error => console.error('Error loading JSON:', error));
}

function checkFilters(coord, selectedYear, selectedRegion, selectedRoadType, selectedPopulation, selectedLocation) {
    var filterCriteria = [];
    if (selectedYear !== 'all') {
        filterCriteria.push(parseInt(coord.YEAR) === parseInt(selectedYear));
    }
    if (selectedRoadType !== 'all') {
        filterCriteria.push(parseInt(coord.ROADTYPE) === parseInt(selectedRoadType));
    }
    if (selectedPopulation !== 'all') {
        filterCriteria.push(coord.POPULATION === selectedPopulation);
    }
    if (selectedAccidentType !== 'all') {
        filterCriteria.push(coord.ACCIDENTTYPE === selectedAccidentType);
    }
    if (selectedIntersectionType !== 'all') {
        filterCriteria.push(coord.INTERSECTIONTYPE === selectedIntersectionType);
    }
    if (selectedLocation !== 'all') {
        filterCriteria.push(coord.LOCATION === selectedLocation);
    }
    if (selectedLighting !== 'all') {
        filterCriteria.push(coord.LIGHTING === selectedLighting);
    }
    if (selectedRegion !== 'all') {
        filterCriteria.push(coord.REGION === selectedRegion);
    }
    if (selectedWeatherType !== 'all') {
        filterCriteria.push(coord.WEATHERTYPE === selectedWeatherType);
    }
    if (selectedTime !== 'all') {
        filterCriteria.push(coord.TIME === selectedTime);
    }
    if (filterCriteria.length > 0) {
        return filterCriteria.every(condition => condition);
    }
    return true;
}

// Initial map update
updateMap();

// Event listeners for filters
document.getElementById('yearFilter').addEventListener('change', updateMap);
document.getElementById('regionFilter').addEventListener('change', updateMap);
document.getElementById('RoadTypeFilter').addEventListener('change', updateMap);
document.getElementById('PopulationFilter').addEventListener('change', updateMap);
document.getElementById('AccidentTypeFilter').addEventListener('change', updateMap);
document.getElementById('IntersectionTypeFilter').addEventListener('change', updateMap);
document.getElementById('LocationFilter').addEventListener('change', updateMap);
document.getElementById('LightingFilter').addEventListener('change', updateMap);
document.getElementById('WeatherTypeFilter').addEventListener('change', updateMap);
document.getElementById('TimeFilter').addEventListener('change', updateMap);