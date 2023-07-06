// const campground = require("../../models/campground");

mapboxgl.accessToken = 'pk.eyJ1IjoiY2FuZHJhZGhwIiwiYSI6ImNsamloNjNxOTAwNnkzanQ4NTM3YWkxN3QifQ.nq_aA1IGe24-r1TOOfQNoQ';
    const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
    });

    map.addControl(new mapboxgl.NavigationControl());

    new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup( {offset: 25 })
        .setHTML(
            `<h5>${campground.title}</h5><p>${campground.location}</p>`
        )
    )
    .addTo(map);