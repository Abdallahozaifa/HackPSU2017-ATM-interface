/* global $, FB, View */
$(document).ready(function () {

    var fbBtn = $(".btn-facebook");

    /* Seting up ajax to cache asynchronous request for the facebook sdk to become available for all pages*/
    $.ajaxSetup({
        cache: true,
    });

    /* Obtains the facebook sdk */
    $.getScript('//connect.facebook.net/en_US/sdk.js').done(function () {

        /* Initializes the facebook sdk */
        FB.init({
            appId: '1150158898354169',
            version: 'v2.8' // or v2.0, v2.1, v2.2, v2.3
        });
    });

    /* Facebook login button handler*/
    fbBtn.click(function () {

        /* Checks if the user is currently logged in */
        FB.getLoginStatus(function (response) {

            /* The user is logged in and has authenticated */
            if (response.status === 'connected') {
                var uid = response.authResponse.userID;
                var accessToken = response.authResponse.accessToken;
                console.log("User ID is " + uid);
                console.log("Access token is " + accessToken);

                FB.api("/me?fields=birthday", function (response) {
                    if (response && !response.error) {
                        console.log(response.birthday);
                    }
                });
            }
            else {

                /* Prompts the user to authenticate using a login dialog */
                FB.login(function (response) {
                    if (response.authResponse) {
                        console.log('Welcome!  Fetching your information.... ');
                        FB.api('/me', function (response) {
                            console.log('Good to see you, ' + response.name + '.');
                        });
                    }
                    else {
                        console.log('User cancelled login or did not fully authorize.');
                    }
                }, {
                    scope: 'user_birthday',
                    return_scopes: true
                });
            }
        });
    });


});
