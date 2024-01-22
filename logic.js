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
            if (coord.LATITUDE !== undefined && coord.LONGITUD !== undefined) {
                var marker = L.marker([coord.LATITUDE, coord.LONGITUD]);
                markers.addLayer(marker);
            }
        });
        map.addLayer(markers);
    })

// Initial map update
updateMap();

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
                    var marker = L.marker([coord.LATITUDE, coord.LONGITUD]);
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

// Event listeners
document.getElementById('yearFilter').addEventListener('change', updateMap);
document.getElementById('regionFilter').addEventListener('change', updateMap);
document.getElementById('PopulationFilter').addEventListener('change', updateMap);
document.getElementById('LocationFilter').addEventListener('change', updateMap);

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
                if (condition === 'Night/Dark Conditions') {
                    return 'black'; // Nighttime color
                } else if (condition === 'Daylight/Lit Conditions') {
                    return 'blue'; // Daytime color
                }
            });

            var myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        data: dataValues,
                        backgroundColor: backgroundColors,
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
                            },
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                generateLabels: function (chart) {
                                    return [{
                                        text: 'Daylight/Lit Conditions',
                                        fillStyle: 'blue',
                                        hidden: false, 
                                    }, {
                                        text: 'Night/Dark Conditions',
                                        fillStyle: 'black',
                                        hidden: false, 
                                    }];
                                },
                            },
                        },
                    },
                }
            });
        })
.catch(error => console.error('Error loading JSON:', error));
}

// Call the function to initialize the chart
updateDayNightChart();

// Sample JSON data with only years
const jsonData = [
    { YEAR: 2019 },
    { YEAR: 2020 },
    { YEAR: 2019 },
    { YEAR: 2021 },
    { YEAR: 2020 },
];

// Count occurrences of each year (total accidents per year)
const yearCounts = jsonData.reduce((counts, entry) => {
    const year = entry.YEAR.toString(); // Convert to string
    counts[year] = (counts[year] || 0) + 1;
    return counts;
}, {});

console.log(yearCounts);

// Function to create or update the yearly accidents chart
function updateYearlyChart() {
    var yearlyCtx = document.getElementById('yearlyChart').getContext('2d');

    // Fetch and load the JSON data from yearlyaccidents.json file
    fetch('./data/yearlyaccidents.json')
        .then(response => response.json())
        .then(data => {
            // Count occurrences of each year (total accidents per year)
            const yearCounts = data.reduce((counts, entry) => {
                const year = entry.YEAR.toString(); // Convert to string
                counts[year] = (counts[year] || 0) + 1;
                return counts;
            }, {});

            // Prepare data for chart
            var labels = Object.keys(yearCounts);
            var accidentCounts = Object.values(yearCounts);

            // Define colors based on accident counts
            var backgroundColors = accidentCounts.map(count => {
                if (count === Math.max(...accidentCounts)) {
                    return 'red'; // Highest count in red
                } else if (count === Math.min(...accidentCounts)) {
                    return 'pink'; // Lowest count in pink
                } else {
                    return 'orange'; // Medium count in orange
                }
            });

            var yearlyChart = new Chart(yearlyCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Accidents',
                        data: accidentCounts,
                        backgroundColor: backgroundColors,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1000
                            }
                        }
                    },
                }
            });
        })
        .catch(error => console.error('Error loading JSON:', error));
}

// Call the function to initialize the chart
updateYearlyChart();