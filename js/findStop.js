// TODO Add loaders
// TODO Dynamic stop info
// TODO Map styling - remove locations only core roads
// TODO Auto draw bus routes on map, instead of buttons? Or make button handler for any button?

//Users most up to date location and their destination location
var locations = {
    userLat:"", 
    userLng:"", 
    destLat:"", 
    destLng:""
}; 

var watcher;
var busPath;

$(document).ready(function() {
    // Helper function to deal with button events.
    $("button").click(function(event) {
        switch(event.target.id){
            case "search":
                search();
                break;
            case "useFromLocation":
                break;
            case "b11":
                drawPath(11);
                break;
            case "b17":
                drawPath(17);
                break;
            case "b42":
                drawPath(42);
                break;
            case "b52":
                drawPath(52);
                break;
            case "b57":
                drawPath(57);                            
                break;
            default:
                alert("No button ID found for: "+event.target.id);
        }
    });

    /**
     * Searches for the suitable bus stop to get on and off at
     */
    function search(){
        // TODO Make search work basic brute force version using both input and auto
        // TODO Checks to make sure input is valid
        // TODO Move map so that everything is in the view
        // TODO remove previous markers
                                
        var address = document.getElementById("destination").value;

        codeAddress(address, function(result) {
            // TODO Check that result is valid
            locations.destLat = result.A;
            locations.destLng = result.F;
            
            var url = "https://ready-set-go.herokuapp.com/search/";
            $.get(url, locations, function(rawPath) {   
                
            }, 'json');
        });
    };
    
    /** 
     * Watches the users location
     */
    function updateLocation(){
        if(navigator.geolocation){                            
            watcher = navigator.geolocation.watchPosition(
                usePosition,
                noGeolocation,
                { maximumAge: 500000, enableHighAccuracy:true, timeout: 6000 }
            );
        } else {
            noGeolocation(false);
        }
    };
    
    /**
     * Centres map on users location once the map is created
     */
    function usePosition(pos){
        // TODO add a marker for user
        // TODO keep moving map to keep user centred ensuring everything stays in view
        locations.userLat = pos.coords.latitude;
        locations.userLng = pos.coords.longitude;
        
        map.setCenter(new google.maps.LatLng(locations.userLat, locations.userLng));
        
        console.log(locations);
    };

    /**
     * What to do if geolocation isn't available
     */
    function noGeolocation(geoError){        
        var errors = { 
            1: 'Permission denied',
            2: 'Position unavailable',
            3: 'Request timeout'
        };
        
        if(geoError){
            alert("Geolocation service failed: "+errors[geoError.code]);
        } else {
            alert("Browser/device doesn't support geolocation");
        }
        addInputLocation();
    };

    /**
     * Adds the dialogue box for a user to enter their position when geolocation isn't available
     */
    function addInputLocation(){
        if(document.getElementById("from-input") == null){
            var fromInput = document.createElement("div");
            fromInput.setAttribute("id", "from-input");
            fromInput.setAttribute("class", "input-group");
            fromInput.innerHTML = '<input type="text" class="form-control" placeholder="Where are you?"><span class="input-group-btn"><button class="btn btn-default" id="useFromLocation" type="button">Use this location</button></span>';
            $("#location-input").prepend(fromInput);
        } 
    }

    /**
     * Draws the given route number's path onto the map
     */
    function drawPath(routeNumber){
        var url = "https://ready-set-go.herokuapp.com/path/"+routeNumber;
        $.get(url, function(rawPath) {
            var pathData = [];
            removePath();
            // Get route information & iterate over into array
            for (var i = 0; i < rawPath.length; i++){
                pathData[i] = new google.maps.LatLng(rawPath[i].shape_pt_lat, rawPath[i].shape_pt_lon);
                busPath = new google.maps.Polyline({
                    path: pathData 
                });
            }
            busPath.setMap(map);
        }, 'json');
    };
    
    /**
     * Removes the currently drawn path from map
     */
    function removePath(){
        if(typeof busPath !== 'undefined'){
            busPath.setMap(null);
        };
    }
    
    /**
     * draws a marker at the given point and adds 
     */
    function drawMarker(lat, lng){
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            map: map
//            title: 'Hello World!'
        });
    }

    /** 
     * Turns the inputAddress into a geolocation
     * inputid is the users entered string
     */
    function codeAddress(inputAddress, callback) {
        // TODO Create a preference/focus for Wellington area
        // TODO Create a better dialogue box for failure
        // TODO Fail if location is too far away, try another result?
        geocoder.geocode( { 'address': inputAddress}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                callback( results[0].geometry.location);
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    }

    // ******* Map initialisation ******
    var map;
    var geocoder;
    var markers = [];
    function initialise() {
        var mapOptions = {
            zoom: 14,
//            scrollwheel: false,
//            navigationControl: false,
//            mapTypeControl: false,
//            scaleControl: false,
            draggable: false,
            disableDefaultUI: true,
            center: new google.maps.LatLng(-41.3, 174.783),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        geocoder = new google.maps.Geocoder();
    }

    google.maps.event.addDomListener(window, 'load', initialise);
    updateLocation();
});