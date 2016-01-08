angular.module('slackApp')
    .controller('ChannelsCtrl', function($scope, $state){
        $scope.profile= {};
        $scope.profile.displayName = localStorage.getItem('username');
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
