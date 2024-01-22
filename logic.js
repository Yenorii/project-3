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
            if (coord.LATITUDE !== undefined && coord.LONGITUDE !== undefined) {
                var marker = L.marker([coord.LATITUDE, coord.LONGITUDE]);
                markers.addLayer(marker);
            }
        });
        map.addLayer(markers);
    })
    .catch(error => console.error('Error loading JSON:', error));

// Adding filters
function updateMap() {
    var selectedYear = document.getElementById('yearFilter').value;
    var selectedRegion = document.getElementById('regionFilter').value;
    var selectedPopulation = document.getElementById('PopulationFilter').value;
    var selectedLocation = document.getElementById('LocationFilter').value;
    markers.clearLayers();
    fetch('./data/mapdata.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(coord => {
                if (checkFilters(coord, selectedYear, selectedRegion, selectedPopulation, selectedLocation)) {
                    var marker = L.marker([coord.LATITUDE, coord.LONGITUDE]);
                    markers.addLayer(marker);
                }
            });
            map.addLayer(markers);
        })
        .catch(error => console.error('Error loading JSON:', error));
}

function checkFilters(coord, selectedYear, selectedRegion, selectedPopulation, selectedLocation) {
    var filterCriteria = [];
    if (selectedYear !== 'all') {
        filterCriteria.push(parseInt(coord.YEAR) === parseInt(selectedYear));
    }
    if (selectedPopulation !== 'all') {
        filterCriteria.push(coord.POPULATION === selectedPopulation);
    }
    if (selectedLocation !== 'all') {
        filterCriteria.push(coord.LOCATION === selectedLocation);
    }
    if (selectedRegion !== 'all') {
        filterCriteria.push(coord.REGION === selectedRegion);
    }
    if (filterCriteria.length > 0) {
        return filterCriteria.every(condition => condition);
    }
    return true;
}

// Initial map update
updateMap();

// Create a function to update the day/night chart
function updateDayNightChart() {
    var ctx = document.getElementById('myChart').getContext('2d');
    
    // Fetch and load the JSON data from daynight.json file
    fetch('./data/daynight.json')
        .then(response => response.json())
        .then(data => {
            // Initialize an object to store the totals for each lighting condition
            var lightingTotals = {};

            // Loop through the data and calculate totals
            data.forEach(entry => {
                var lightingCondition = entry.LGT_COND.toString(); // Convert to string
                if (!lightingTotals[lightingCondition]) {
                    lightingTotals[lightingCondition] = 1;
                } else {
                    lightingTotals[lightingCondition]++;
                }
            });

            // Prepare data for chart
            var labels = Object.keys(lightingTotals);
            var dataValues = Object.values(lightingTotals);

            // Define colors for the clusters
            var backgroundColors = labels.map(condition => {
                if (condition === 'Day') {
                    return 'lightblue'; // Daytime color
                } else if (condition === 'Night') {
                    return 'navy'; // Nighttime color
                }
            });

            var myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        data: dataValues,
                        backgroundColor: backgroundColors, // Set colors based on lighting condition
                        borderColor: backgroundColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error loading JSON:', error));
}

// Call the function to initialize the chart
updateDayNightChart();