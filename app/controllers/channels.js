angular.module('slackApp')
    .controller('ChannelsCtrl', function($scope, $state){
        $scope.profile= {};
        var user = JSON.parse(localStorage.getItem('user'));
        $scope.profile.displayName = user.username;

        console.log(user.userId);
    $scope.channelsInit = function(){
        var query = new CB.CloudQuery('Channel');
        query.find({
            success:function(channels){
                $scope.channels=channels;
                console.log(channels);
            },
            error: function(err){
                console.log(err);
            }
        });
    }
    $scope.channelsInit();

    $scope.logout = function(){

    }
    $scope.setChannel= function(channelName, channelId){
        // console.log(channelName);
        localStorage.setItem('channel',JSON.stringify({channelName:channelName, channelId:channelId}));
    };
    $scope.createChannel = function(){
        var channel = new CB.CloudObject('Channel');
        channel.set('name',$scope.name);
        channel.save({
            success: function(channel){
                // $scope.channelsInit();
                console.log(channel);
                $state.go('channels.messages', {channelId: channel.document._id});

        },
        error: function(err){
            console.log(err);
        }
        });
    };

    CB.CloudObject.on('Channel', ['created'], function(obj){
        $scope.channelsInit();
    },{
        success: function(){
            console.log('Refreshed');
        },
        error: function(err){
            console.log("Error");
        }
    });
});
