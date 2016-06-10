# angular-jwt-module
JWT Authorization module for angular js 1.5.x


Its flexible to support api's from Sails or express, may work with others too 

It depends on ngStorage for storing jwt tokens in browsers storage


Usage:
  Include the script in html file after angular.js 
  
  <script src="path/to/file/angular-jwt.js"></script>
  
  include angular-jwt dependency in your main module
  
  angular.module('mainModule', ['angular-jwt'])
  
  
  #You can set multiple options for your backend api's using jwtAuthProvider in your app config
  
  For example: 
  
  for a user api like 
  http://localhost:3000/user/login    //for login 
  http://localhost:3000/user/register   //for sign up
  

  angular.module('mainApp', ['angular-jwt'])
    .config(function(jwtAuthProvider) {
      jwtAuthProvider.setBaseApiUrl('/user');  //also jwtAuthProvider.baseApiUrl;
      jwtAuthProvider.loginRoute = '/login';
      jwtAuthProvider.signinRoute = '/register';
    });
    
  #OR 
  these properties can also be set by providing and object to the jwtAuthProvider.initializeAuthService({
    baseApiUrl: '/user',
    loginRoute: 'login',
    signupRoute: 'register',
  });
  
  for signing in and registering include jwtAuthService in your controller 
  methods: 
    jwtAuthService.login(data, onSuccess, onError)
    jwtAuthService.signup(data, onSuccess, onError)
    
    onSuccess and onError are callbacks for promises' then and error
    
    jwtAuthService.getTokenClaim() function decodes the payload and return the data in the payload
  
      
  
