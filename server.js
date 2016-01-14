var path = require('path');
var express =       require('express');
var bodyParser =    require('body-parser');
var fs =            require('fs');
var app =           express();
var http = require('http').Server(app);
var port ='5000';
if (!process.env.PORT) {
    global.isDevelopment = true;
} else {
    if (process.env.PORT === port ) {
        global.isDevelopment = true;
    } else {
        global.isDevelopment = false;
    }
}

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'app')));



app.set('port', port);
//Server kickstart:
http.listen(app.get('port'), function() {
    console.log('Is Development :'+global.isDevelopment);
    servicesKickstart();
});

function servicesKickstart() {
    console.log("Yo! The API is up on " + app.get('port'));


}
