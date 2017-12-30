// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ionic-toast', 'ngMessages', 'firebase'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true)
        cordova.plugins.Keyboard.disableScroll(true)
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault()
      }
    })
  })

  .factory('Piedb', function ($firebaseArray) {
    var config = {
      apiKey: 'AIzaSyDy9NHunVyAitjsZIgCowHPpWvOgrG7d1E',
      authDomain: 'pieintheface-96e28.firebaseapp.com',
      databaseURL: 'https://pieintheface-96e28.firebaseio.com',
      storageBucket: 'pieintheface-96e28.appspot.com'
    }
    firebase.initializeApp(config)
    var ref = firebase.database().ref()
    return ref
  })

  .factory('SettingsService', function (Piedb, $firebaseArray) {
    var ref = Piedb.child('settings')

    var settings = $firebaseArray(ref)
    settings.$loaded()
      .then(function () {
        var record = settings.$getRecord('single')
        console.log(record.$value)
      })

    return settings
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })

      .state('app.contest', {
        url: '/contest',
        views: {
          'menuContent': {
            templateUrl: 'templates/contest.html',
            controller: 'ContestCtrl'
          }
        }
      })
      .state('app.details', {
        url: '/details',
        views: {
          'menuContent': {
            templateUrl: 'templates/details.html',
            controller: 'DetailsCtrl'
          }
        }
      })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/contest')
  })
