var google;

function initMap() {

    // 🚫 Disable map completely on mobile
    if (window.innerWidth < 768) return;

    var mapElement = document.getElementById('map');

    // ❗ VERY IMPORTANT SAFETY CHECK
    if (!mapElement) return;

    var myLatlng = { lat: 40.69847032728747, lng: -73.9514422416687 };

    var mapOptions = {
        zoom: 7,
        center: myLatlng,
        scrollwheel: false,
        styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
        ]
    };

    var map = new google.maps.Map(mapElement, mapOptions);

    // Marker (NO geocode API – clean & fast)
    new google.maps.Marker({
        position: myLatlng,
        map: map,
        icon: 'images/loc.png'
    });
}

google.maps.event.addDomListener(window, 'load');