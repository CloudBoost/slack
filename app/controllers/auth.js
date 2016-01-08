angular.module('slackApp')
   .controller('AuthCtrl', function($scope, $state, $rootScope){
    var user = new CB.CloudUser();
    $scope.error={};
      $scope.register = function(){
             user.set('username',$scope.username);
             user.set('email',$scope.email);
             user.set('password',$scope.password);
             user.signUp({
               success : function (user){
                  console.log(user);
                  $state.go('login');

               },error : function(err){
                 $scope.error.message = err;
               }
             });

           }

      $scope.login = function(){
          user.set('username',$scope.username);
          user.set('password', $scope.password);
          user.logIn({
            success: function(user){
              localStorage.setItem('username', user.document.username);
              $state.go('channels');
          },
          error: function(err){
            $scope.error = err;
            console.log(err);
          }
          });
      }

      $scope.logout = function(){
        // CB.CloudUser.current.logOut({
        //    success: function(user) {
        //       //log out successfull
        //      },
        //     error: function(err) {
        //   //Error occured in user registration.
        //  });
        }
   });
