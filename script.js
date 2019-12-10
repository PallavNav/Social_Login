var myApp = angular.module( 'myApp', [ 'angular-jwt', 'ngStorage', 'ngCookies' ] );

myApp.config( function Config( $httpProvider, jwtOptionsProvider, jwtInterceptorProvider, $localStorageProvider ) {
     
    jwtOptionsProvider.config( {
      //  unauthenticatedRedirectPath: '/index.html',
        unauthenticatedRedirector: ['$state', function($state) {
            $state.go('sign_out.html');
          }],
        tokenGetter: [ 'options',function ( options) {
            var getToken = $localStorageProvider.get('idToken');
            whiteListedDomains: ['apis.google.com'];
            blacklistedRoutes: ['localhost'];
            $localStorageProvider.setKeyPrefix('');
            return getToken;
        } ]
    } );

    jwtInterceptorProvider.authPrefix = 'JWT ';
    jwtInterceptorProvider.authHeader = 'id_token';
    $httpProvider.interceptors.push( 'jwtInterceptor' );
} );

myApp.controller( 'myController', [ '$scope', '$window', '$http', 'jwtHelper', '$localStorage', '$sessionStorage', '$cookies', function ( $scope, $window, $http, jwtHelper, $localStorage, $sessionStorage, $cookies ) {
    $scope.gmail = {
        username: "",
        email: ""
    };

    $scope.facebook = {
        username: "",
        email: ""
    };

    $scope.onGoogleLogin = function () {
        $scope.isGoogleAuthenticated = false;
        var params = {
            'clientid': "525855396997-e88cfhpomos25e284jigs76mo2unhiae.apps.googleusercontent.com",
            'cookiepolicy': 'single_host_origin',
            'callback': function ( result ) {
                if ( result[ 'status' ][ 'signed_in' ] ) {
                    var request = gapi.client.plus.people.get( {
                        'userId': 'me'
                    } );
                    request.execute( function ( resp ) {
                        $scope.$apply( function () {
                            $scope.gmail.username = resp.displayName;
                            $scope.gmail.email = resp.emails[ 0 ].value;
                            $scope.g_image = resp.image.url;
                            $scope.isGoogleAuthenticated = true;
                        }, //$scope.getTokenFromBrowser()
                        );
                    } );
                }

            },
            'approvalprompt': 'force',
            'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read'
        };
        gapi.auth.signIn( params );

    };

    $scope.onFacebookLogin = function(){
        
        $scope.isFacebookAuthenticated = false;
        FB.login(function(response){
            if(response.authResponse) {
                FB.api('/me', 'GET', {fields: 'email, first_name, name, id, picture'}, function(response){
                    $scope.$apply( function () {
                        $scope.facebook.username = response.name;
                        $scope.facebook.email = response.email;
                        $scope.fb_image = response.picture.data.url;
                        $scope.isFacebookAuthenticated = true;
                    }, //$scope.getTokenFromBrowser()
                    );
                })
            }else{
                // not authorize, show some error
            }
        }, {
            scope: 'email, user_likes',
            return_scopes: true
        })
    }


    $scope.getTokenFromBrowser = function () {
        var idToken, tokenStorage, tokenPayload,
            getIDTokenSignature, jsonPayload, date,
            tokenExpirationFlag;

        idToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkpRc3NNY056ZG94YXNFZGZhZEJFVHl5WWdhZyJ9.eyJzdWIiOiJOUEFMTEFWIiwiYXVkIjoiYTM4YzY5OTUtYzg4Yi00ZjhlLTg5MDktYjQ4MTE2NmE0NWQ3IiwianRpIjoib2N0N0Y0RFhoc21oeWtySm56YmNPSCIsImlzcyI6Imh0dHBzOi8vbG9naW4taW50LmRhaW1sZXIuY29tIiwiaWF0IjoxNTY4Mjg5MjY0LCJleHAiOjE1NjgyOTAxNjQsInVwZGF0ZWRfYXQiOjIwMTkwODI3LCJuYW1lIjoiTkFWIFBBTExBViIsImdpdmVuX25hbWUiOiJOYXYiLCJmYW1pbHlfbmFtZSI6IlBhbGxhdiIsInBpLnNyaSI6ImxSaV9sbmdyV3FWSWRBOHdvN2JuaGhYenBfWSJ9.HPpDTjiVwdN4JgKQV7Pe07hfPA25rCLvIOwMWVJeYFSfDEUU1fxrA1liOMeigVj4NkhBlpBE8r63i_SBSEeCmQOfnL5abZUBP9RDgFwvyp94TjzNaaxJdskVJ5mlYQQnKn2JHbG0nZPHGk7abnjFh3Yw4mZ6hNug26wpExB8rZ5z785GzgJAewOevwDbzzBUI-c3JqKyVHKfkO7lfbCcEW0LMgwL4pruI4jsNXhg4vnvmAz86xS3GjD_KnFm1cQPk4iEx6cu7AqgLwoTAAlBa04tAPxTrt9yG4w6_8tCOtmI0wOcWAhZyVkBb7NDcNG2u41qkCukKzg_fGvQGEFLKg';
        
        $localStorage.idToken = idToken;
        $cookies.put('cookieIdToken', idToken);

        tokenStorage = {
            get: function () {
                return $localStorage.idToken;
            },
            set: function ( object ) {
                $localStorage.object = object;
            },
            clear: function ( $window ) {
                $localStorage.$reset();
            },
            key: function ( index ) {
                $window.sessionStorage.getItem( 'token' );
            },
            length: function () {
                $window.sessionStorage.length
            }
        };


        tokenPayload = jwtHelper.decodeToken( tokenStorage.get() );
        console.log( tokenPayload );

        getIDTokenSignature = idToken.split( "." )[ 2 ];
        console.log( getIDTokenSignature );

        jsonPayload = jwtHelper.urlBase64Decode( idToken.split( "." )[ 0 ] );
        console.log( JSON.parse( jsonPayload ) );

        date = jwtHelper.getTokenExpirationDate( idToken );
        console.log( date );

        tokenExpirationFlag = jwtHelper.isTokenExpired( idToken );
        console.log( tokenExpirationFlag );

        $scope.serviceCallToJWKS( idToken );

    }

    $scope.serviceCallToJWKS = function ( idToken ) {
        $http( {
                url: 'jkws.json',
                skipAuthorization: false,
                method: 'GET'
            } )
            .then( function ( response ) {
                $scope.getPublicKeys = response.data.keys;
                $scope.getTokenFromBrowser();
                $scope.isGoogleAuthenticated = true;
            } );
    }

    $scope.logOut = function() {
        $window.location.href = 'https://sso.i.daimler.com/idp/startSLO.ping';
    }
} ] );

myApp.run( function (authManager){
    console.log(authManager);
    authManager.checkAuthOnRefresh();
    authManager.redirectWhenUnauthenticated();
});
