#Introduction

[![Join the chat at https://gitter.im/cloudboost/help](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/cloudboost/help?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)  [![Build Status](http://cbjenkins.cloudapp.net:8080/buildStatus/icon?job=DataServicesPushProduction)](http://cbjenkins.cloudapp.net:8080/job/DataServicesPushProduction)  [![npm version](https://badge.fury.io/js/cloudboost.svg)](http://badge.fury.io/js/cloudboost)  [![Bower version](https://badge.fury.io/bo/cloudboost.svg)](http://badge.fury.io/bo/cloudboost)

This is the JavaScript and NodeJS SDK for CloudBoost. It is available both on NPM and Bower. If you want to have a look into documentation, you can check them out here : [https://tutorials.cloudboost.io](https://tutorials.cloudboost.io) and API reference is available here : [https://docs.cloudboost.io](https://docs.cloudboost.io)

## NPM Installation
```
npm install cloudboost
```

### NodeJS Usage

``` js

var CB = require('cloudboost');

```

### Bower Installation
```
bower install cloudboost
```

### JavaScript Usage

``` js
<script src="bower_components/cloudboost/dist/cloudboost.js"><script>
```

### Sample Code

``` js

// AppID and AppKey are your App ID and key of the application created in CloudBoost Dashboard.

//Init your Application
CB.CloudApp.init('YourAppId','YourAppKey');

//Data Storage : Create a CloudObject of type 'Custom' (Note: You need to create a table 'Custom' on CloudBoost Dashboard)

var obj = new CB.CloudObject('Custom');

//Set the property 'name' (Note: Create a column 'name' of type text on CloudBoost Dashboard)
obj.set('name','CloudBoost');

//Save the object
obj.save({
    success:function(res){
        console.log("object saved successfully");
    },
    error:function(err){
        console.log("error while saving object");
    }
});

```

<img align="right" height="150" src="https://cloud.githubusercontent.com/assets/5427704/7724257/b7f45d6c-ff0d-11e4-8f60-06024eaa1508.png">
#### Documentation

Visit the [CloudBoost Docs](http://docs.cloudboost.io) for documentation.

