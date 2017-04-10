var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var request = require('request');

//setup the root path
var root = __dirname;

var app = express();
app.use(bodyParser.json({limit: "50mb"}));

app.use(bodyParser.urlencoded({
  extended: true,
  limit: "50mb"
}));

app.get('/', function (req, res) {
  fs.readFile('index.html', 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    res.send(data);
  });
});

app.use('/css', express.static('css'));
app.use('/img', express.static('img'));
app.use('/js', express.static('js'));
app.use('/less', express.static('less'));
app.use('/vendor', express.static('vendor'));
app.use('/bower_components', express.static('bower_components'));

/* Listens on the Server Port */
app.listen(process.env.PORT || '8080', '0.0.0.0', function() {
    if(process.env.PORT){
        console.log("https://bigmoney2020-abdallahozaifa.c9users.io/");
    }else{
        console.log('App listening at http://%s:%s', app.address().address, app.address().port);
    }
});