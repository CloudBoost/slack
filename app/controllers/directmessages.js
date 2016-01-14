angular.module('slackApp')
    .controller('DirectCtrl', function($scope, $stateParams){

        var direct = JSON.parse(localStorage.getItem('direct') ||'{}');
        var user = JSON.parse(localStorage.getItem('user'));
        $scope.userName = direct.username;

        $scope.message = '';
        $scope.initDirectMessages = function(){
        var directMessages = new CB.CloudQuery('DirectMessages');
        directMessages.equalTo('toUser',$scope.userName);
        directMessages.find({
            success: function(messages){
                $scope.directmessages = messages;
            },
            error: function(err){
                console.log(err);
            }
           });
          }
          $scope.initDirectMessages();

        $scope.sendDirectMessage = function(){
            if($scope.body.length > 0){
                var directMessage = new CB.CloudObject('DirectMessages');
                directMessage.set('fromUser',user.username);
                directMessage.set('body',$scope.body);
                directMessage.set('toUser',direct.username);
                directMessage.save({
                    success: function(directMessage){
                        console.log(directMessage);
                        $scope.initDirectMessages();
                        $scope.body='';
                    },
                    error: function(err){
                        console.log(err);
                    }
                });

            }
        };
    });
