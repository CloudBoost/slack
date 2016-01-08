angular.module('slackApp')
    .controller('MessagesCtrl', function($scope, $stateParams){

        var channel = JSON.parse(localStorage.getItem('channel') ||'{}');
        var user = JSON.parse(localStorage.getItem('user'));
        $scope.channelName = channel.channelName;
        $scope.channelId = channel.channelId;
        $scope.message = '';
        $scope.initChannelMessages = function(){
        var channelMessages = new CB.CloudQuery('ChannelMessages');
        channelMessages.equalTo('channelId',$scope.channelId);
        channelMessages.find({
            success: function(messages){
                $scope.messages = messages;
            },
            error: function(err){
                console.log(err);
            }
           });
          }
          $scope.initChannelMessages();

        $scope.sendMessage = function(){
            if($scope.body.length > 0){
                var channelMessage = new CB.CloudObject('ChannelMessages');
                channelMessage.set('username',user.username);
                channelMessage.set('body',$scope.body);
                channelMessage.set('channelId',channel.channelId);
                channelMessage.save({
                    success: function(channelMessage){
                        $scope.messages='';
                    },
                    error: function(err){
                        console.log(err);
                    }
                });

            }
        };
    });
