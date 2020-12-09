class googleDistanceAPIRepository {

    constructor(config) {
        this.config = config;
    }

    getGoogleDistanceByLatitudeAndLongitude(origin, destiny) {

        let directionsService = new google.maps.DirectionsService();
        const route = {
            origin: new google.maps.LatLng(origin.latitude, origin.longitude),
            destination: new google.maps.LatLng(destiny.latitude, destiny.longitude),
            travelMode: 'DRIVING' //Set as default
        };
        let promise = new Promise((resolve, reject) => {

            directionsService.route(route,
                (response, status) => {

                    if (status === "OK")
                        resolve(response);
                    else
                        reject(response);
                }, error => { reject(error); });

        });

        return promise;

    }
}

export default googleDistanceAPIRepository;