var app = angular.module('angular-jwt', ['ngStorage']);

//Service for auth
app.config(function($httpProvider,jwtAuthProvider) {
    $httpProvider.interceptors.push(function($q, $localStorage) { //intercepting http request before processing and response after processing 
        return {
            'request': function(jwtAuth) { //intecepting http request and set the jwt-auth header if available
                jwtAuth.headers = jwtAuth.headers || {};
                if($localStorage.token) {
                    jwtAuth.headers.Authorization = "Bearer " + $localStorage.token;
                }
                return jwtAuth;
            },
            'responseError': function(response) {
                return $q.reject(response); //reject promise on error
            }
        }
    });
});


app.service('jwtAuthService', function jwtAuthService(jwtAuth, $localStorage, $http) {

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
        $http.post(jwtAuth.baseApiUrl+jwtAuth.signinRoute, data)
            .then(function(response) {
                if(onSuccess) {
                    $localStorage.token = response.data.token;
                    onSuccess(response);
                } else {
                    $localStorage.token = response.data.token;
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

        $http.post(jwtAuth.baseApiUrl + jwtAuth.signupRoute, data)
            .then(function(response) {
                if(onSuccess) {
                    $localStorage.token = response.data.token;
                    onSuccess(response);
                } else {
                    $localStorage.token = response.data.token;
                }
            },
            function(error) {
                if(onError) {
                    onError(error);
                }
            });
    }
})

app.provider('jwtAuth', function ProviderJwtAuth() {
    this.baseUrl = '/api';
    this.homeState = 'home';
    this.loginState = 'login';
    this.signupState = 'signup';
    this.signinState = 'signin';

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
        self.signinState = args.signinState;
        self.loginState = args.loginState;
        self.homeState = args.homeState;
        self.signupState = args.signupState;
    };

    this.$get = function() {
        return self;
    }
});