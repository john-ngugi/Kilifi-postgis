var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var Jawg_Dark = L.tileLayer('https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
    attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 0,
    maxZoom: 19,
    subdomains: 'abcd',
    accessToken: 'pvACxnlBBAuY2BYUQgRkP3KWxkvbVBP2wMz0Fr5YHlW1HVaffc01lUdo8DPxgXGj'
});

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});


var map = L.map('map', {
    center: [-4.09, 39.505],
    zoom: 12,
    layers: [osm]
});


var baseMaps = {
    "OpenStreetMap": osm,
    // "esri_satellite_world": Esri_WorldImagery
};

var overlayMaps = {
    "dark": Jawg_Dark,
    "esri_satellite_world": Esri_WorldImagery
};

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);





const menuButton = document.getElementById("menu-button");
const popupWindow = document.getElementById('sidebar-popup');
const buttonSubmit = document.getElementById('button-submit');
const searchInputLocation = document.getElementById('search-location-input-top-map');
const paymentLink = document.getElementById('payment-link');
const moveLink = document.getElementById('move-link');
const payForm = document.getElementById('pay-form');
const cancelBtn = document.getElementById('cancle-pay-button');
const content = document.getElementById('content')
const loadingSpinner = document.getElementById('loading-spinner');
const button_geoJSON = document.getElementById('button-geojson-retriever');


menuButton.addEventListener('click', () => {

    if (popupWindow.style.display == 'flex') {
        popupWindow.style.display = 'none';
        menuButton.innerHTML = `<i class="fa-solid fa-bars fa-xl"></i>`;


    } else {
        popupWindow.style.display = 'flex';
        popupWindow.style.flexDirection = 'column';
        menuButton.innerHTML = `<i class="fa-solid fa-xmark fa-xl"></i>`;

    }

})

function getLocationData(location) {
    fetch(`http://api.weatherapi.com/v1/current.json?key=4f46346cace64259af5195730221407&q=${location}&aqi=yes`)
        .then(res => res.json()).then(
            data => {
                var lat = data.location.lat;
                var long = data.location.lon;
                console.log(lat, long)
                map.setView([lat, long], 15, { animate: true });
            }
        )
}


buttonSubmit.addEventListener('click', (e) => {
    console.log('searching')
    e.preventDefault();
    var location = searchInputLocation.value;
    getLocationData(location);
    e.preventDefault();
})

paymentLink.addEventListener('click', (e) => {
    console.log('clicked')
    e.preventDefault();
    if (payForm.style.display == 'flex') {
        // payForm.style.display == 'none';
        popupWindow.style.display = 'none';
    } else {
        payForm.style.display = 'flex';
    }
})


moveLink.addEventListener('click', (e) => {
    console.log('clicked move');
    content.innerHTML = `
  
    <div class=" mt-1 ps-2 pe-2 mb-3">
        <label for="parcel-no" class=" form-label">Enter Coordinates or location</label>
        <input type="text" class=" form-control" id="parcel-no" placeholder="enter parcel-no">
    </div>

`;
    e.preventDefault();
    if (payForm.style.display == 'flex') {
        // payForm.style.display == 'none';
        popupWindow.style.display = 'none';
    } else {
        payForm.style.display = 'flex';
    }
})


cancelBtn.addEventListener('click', () => {
    payForm.style.display = 'none';
})

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function colorChanger() {
    const red = getRandomInt(0, 255);
    const green = getRandomInt(0, 255);
    const blue = getRandomInt(0, 255);

    return `rgb(${red}, ${green}, ${blue})`;
}



button_geoJSON.addEventListener('click', () => {
    console.log('JSON button clicked ');
    loadingSpinner.style.display = 'flex';
    console.log(loadingSpinner)
    fetch('/get_polygons_geojson')
        .then(response => response.json())
        .then(data => {
            console.log('printing geojson');
            console.log(data);
            console.log(typeof(data));
            console.log(data.features);
            // Process the GeoJSON data and add it to the Leaflet map
            data.features.forEach((feature) => {
                const randomColor = colorChanger();

                L.geoJSON(feature, {
                    style: {
                        color: 'transparent', // Outline color
                        fillColor: randomColor, // Unique fill color for each feature
                        fillOpacity: 0.5 // Fill opacity (0 = transparent, 1 = opaque)
                    }
                }).addTo(map);
            });

            // map.setView([-4.194521375, 39.558787241], 12)
        })
        .catch(error => console.error('Error fetching GeoJSON:', error))
        .finally(() => {
            loadingSpinner.style.display = 'none';
        });

});


// Define the highlight style for the GeoJSON layer on hover
var highlightStyle = {
    fillColor: 'red',
    fillOpacity: 0.7
};

// Function to reset the style to the default style
function resetHighlight(e) {
    var layer = e.target;

    // Retrieve the original random color and apply it
    var originalColor = layer.feature.properties.originalColor;
    layer.setStyle({ fillColor: originalColor });

    // Remove the highlight style
    layer.setStyle(defaultStyle);
}

// Function to highlight the feature on hover
function highlightFeature(e) {
    var layer = e.target;

    // Store the original random color in the feature properties
    layer.feature.properties.originalColor = layer.options.style.fillColor;

    // Apply the highlight style
    layer.setStyle(highlightStyle);

    // Add event listener for mouseout event
    layer.on({
        mouseout: resetHighlight
    });
}

// Add event listeners to each feature for mouseover and mouseout events
geojsonLayer.eachLayer(function(layer) {
    layer.on({
        mouseover: highlightFeature
    });
});