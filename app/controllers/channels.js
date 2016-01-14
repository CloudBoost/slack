angular.module('slackApp')
    .controller('ChannelsCtrl', function($scope, $state){
        $scope.profile= {};
        var user = JSON.parse(localStorage.getItem('user')||'{}');
        $scope.profile.displayName = user.username;
        $scope.profile.id = user.userId;

        console.log(user.userId);
    $scope.channelsInit = function(){
        var query = new CB.CloudQuery('Channel');
        query.find({
            success:function(channels){
                $scope.channels=channels;
            },
            error: function(err){
                console.log(err);
            }
        });
    }

    $scope.getUsers = function(){
        var query = new CB.CloudQuery('User');
        query.find({
            success: function(users){
                $scope.users = users;
                console.log(users);
            },
            error: function(err){
                console.log(err);
            }
        });
    }
    $scope.channelsInit();
    $scope.getUsers();

    $scope.logout = function(){
        localStorage.setItem('channel','{}');
        localStorage.setItem('direct','{}');
        localStorage.setItem('user','{}');

    }
    $scope.setChannel= function(channelName, channelId){

        localStorage.setItem('channel',JSON.stringify({channelName:channelName, channelId:channelId}));
    };
    $scope.setDirectChannel= function(userName, userId){

        localStorage.setItem('direct',JSON.stringify({username:userName, userId:userId}));
    };
    $scope.createChannel = function(){
        var channel = new CB.CloudObject('Channel');
        channel.set('name',$scope.name);
        channel.save({
            success: function(channel){

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
