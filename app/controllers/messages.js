angular.module('slackApp')
    .controller('MessagesCtrl', function($scope){
        var messagesCtrl = this;
        // $scope.messages = messages;
        // $scope.channelName = channelName;
        $scope.message = '';
        $scope.initChannelMessages = function(){
        var channelMessages = new CB.CloudQuery('ChannelMessages');
        channelMessages.find({
            success: function(channelMessages){
                $scope.messages = channelMessages;
                console.log($scope.messages);
            },
            error: function(err){
                console.log(err);
            }
           });
          }
          $scope.initChannelMessages();

        $scope.sendMessage = function(){
            if($scope.message.length > 0){
                var channelMessage = new CB.CloudObject('ChannelMessages');
                channelMessage.set('userId','pclZ3jYg');
                channelMessage.set('body',$scope.body);
                channelMessage.set('channelId','Rr56CQk0');
                channelMessage.save({
                    success: function(channelMessage){

                    },
                    error: function(err){
                        console.log(err);
                    }
                });
                // messagesCtrl.messages.$add({
                //     uid: profile.$id,
                //     body: messagesCtrl.message,
                //     timestamp: Firebase.ServerValue.TIMESTAMP
                // }).then(function(){
                //     messagesCtrl.message = '';
                // });
            }
        };
    });
