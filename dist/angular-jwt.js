var app = angular.module('angular-jwt', ['ngStorage']);

//Service for auth
app.config(function($httpProvider,jwtAuthProvider) {
    $httpProvider.interceptors.push(function($q, $state, $storage) { //intercepting http request before processing and response after processing 
        return {
            'request': function(config) { //intecepting http request and set the jwt-auth header if available
                config.headers = config.headers || {};
                if($localStorage.token) {
                    config.headers.Authorization = "Bearer " + $localStorage.token;
                }
                return config;
            },
            'responseError': function(response) {
                if(response.status == 401 || response.status == 400) {
                    $state.go(jwtAuthProvider.getProperty('loginState')); // go to login state after any error
                }

                return $q.reject(response); //reject promise on error
            }
        }
    });
});


app.service('jwtAuthService', function jwtAuthService(config, $localStorage, $state) {

    //Decoding token payload
     function urlBase64Decode(str) {
        var output = str.replace('-', '+').replace('_', '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw 'Illegal base64url string!';
        }
        return window.atob(output);
    }

    function DecodeToken(token) {
        var tokenParts = token.split(' ');
        if(tokenParts.length !== 3) { //jwt token has 3 parts 
            throw new Error("Token is invalid, A valid token has three parts");
        }
        var decodedToken = urlBase64Decode(tokenParts[1]); //send payload for decoding
        if(!decodedToken) {
            throw new Error("Token not decoded");
        }

        return JSON.parse(decodedToken);
    }

    //retrieve claims(user) from returned token if available
    function retrieveClaimsFromToken() {
        var token = $localStorage.token;
        var user = {};
        if(typeof token !== 'undefined') {  //check is the token is present
            var user = DecodeToken(token);
            return user;
        }
    }

    //Signing In onSuccess and onError callbacks defined by the user in a controller
    this.login = function(data, onSuccess, onError) {
        $http.post(config.baseApiUrl+config.loginRoute, data)
            .then(function(response) {
                if(onSuccess) {
                    onSuccess(response);
                } else {
                    $localStorage.token = response.token;
                    $state.go('home');
                }
            },
            function(error) {
                if(onError) {
                    onError(error);
                }
            });
    }

    this.getTokenClaims = retrieveClaimsFromToken(); 

    //Signing up
    this.signup = function(data, onSuccess, onError) {

        $http.post(config.baseApiUrl + config.signupRoute, data)
            .then(function(response) {
                if(onSuccess) {
                    onSuccess(response);
                } else {
                    $localStorage.token = response.token;
                    $state.go('home');
                }
            },
            function(error) {
                if(onError) {
                    onError(error);
                }
            });
    }
})

app.provider('jwtAuth', function jwtAuthServiceProvider() {
    this.baseUrl = '/';
    this.baseUrl = '/api';
    //Frontend Angular UI States
    this.homeState = 'home';
    this.loginState = 'login';
    this.signupState = 'signup';

    //Backend Routes
    this.homeRoute = this.baseApiUrl + '/home';
    this.loginRoute = this.baseApiUrl + '/login';
    this.signupRoute = this.baseApiUrl + '/signup';
    
    self = this;

    this.setBaseUrl = function(baseUrl) {
        this.baseUrl = baseUrl;
    }

    this.setBaseApiUrl = function(baseApiUrl) {
        this.baseApiUrl = baseApiUrl;
    }
    
    this.getProperty = function(propertyName) {
        return this[propertyName];
    };

    this.initializeAuthservice = function (args) {
        self.baseApiUrl = args.baseApiUrl;
        self.loginState = args.loginState;
        self.homeState = args.homeState;
        self.signupState = args.signupState;
    };

    this.$get = function() {
        return new jwtAuthService(self);
    }
});