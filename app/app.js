'use strict';

/**
 * @ngdoc overview
 * @name slack
 * @description
 *
 *
 * Main module of the application.
 */
angular
  .module('slackApp', [
    'angular-md5',
    'ui.router'
  ])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'home/home.html',
      })
      .state('login', {
        url: '/login',
        controller: 'AuthCtrl as authCtrl',
        templateUrl: 'auth/login.html',
      })
      .state('channels',{
        url:'/channels',
        controller:'ChannelsCtrl',
        templateUrl:'channels/index.html',
      })
      .state('channels.create', {
        url:'/create',
        templateUrl:'channels/create.html',
        controller:'ChannelsCtrl',
      })
      .state('channels.messages', {
        url: '/{channelId}/messages',
        templateUrl: 'channels/messages.html',
        controller: 'MessagesCtrl as messagesCtrl',
      })
      .state('channels.direct',{
        url:'/{uid}/messages/direct',
        templateUrl:'channels/directmessages.html',
        controller:'DirectCtrl',
      })
      .state('register', {
        url: '/register',
        controller:'AuthCtrl',
        templateUrl: 'auth/register.html',
      });

    $urlRouterProvider.otherwise('/');
  })
.run(function(){
  CB.CloudApp.init('slack123','VYQFtw3Ntgvvn3Xlmq1m0g==');
});
