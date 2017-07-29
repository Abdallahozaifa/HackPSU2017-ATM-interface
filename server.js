var express = require('express');
var fs = require('fs');
var app = express();
var bodyParser = require("body-parser");
var oxford = require('project-oxford'),
    client = new oxford.Client('83417845d20f48d5aa832b5589f34894');
var path = require('path');

app.use('/CapitalOne', express.static('CapitalOne'));
app.use('/tracking-min.js', express.static('bower_components/tracking/build/tracking-min.js'));
app.use('/face-min.js', express.static('bower_components/tracking/build/data/face-min.js'));
app.use('/dat.gui.min.js', express.static('bower_components/dat-gui/build/dat.gui.min.js'));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, 'CapitalOne')));

var multer = require('multer');
var upload = multer();

app.use(bodyParser.json());
app.use('/tracking-min.js', express.static(__dirname + '/node_modules/tracking/build/tracking-min.js'));
app.use('/face-min.js', express.static(__dirname + '/node_modules/tracking/build/data/face-min.js'));
app.use('/dat.gui.min.js', express.static(__dirname + '/node_modules/dat.gui/build/dat.gui.min.js'));

app.get('/', function(req, res) {
    fs.readFile('CapitalOne/index.html', 'utf8', function(err, data) {
        if (!err) res.send(data);
        else return console.log(err);
    });
});

app.get('/tracking', function(req, res) {
    fs.readFile('tracking.html', 'utf8', function(err, data) {
        if (!err) res.send(data);
        else return console.log(err);
    });
});

var filePath = path.join(__dirname, '', 'photoTaken.png');
app.post('/sendImage', upload.fields([]), (req, res) => {
    var formData = req.body;

    fs.writeFile(__dirname + "/photoTaken.png", formData.image_data.toString(), 'base64', function(err, data) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Filed Saved Successfully");

            client.face.detect({
                path: __dirname + '/hozaifa.jpeg',
                returnFaceId: true
            }).then(function(response) {
                if (response.length != 0) {
                    var face1Id = response[0].faceId;
                    console.log("Face 1 ID: " + face1Id);

                    client.face.detect({
                        path: __dirname + '/photoTaken.png',
                        returnFaceId: true
                    }).then(function(response) {
                        if (response.length != 0) {
                            var face2Id = response[0].faceId;
                            console.log("Face 2 ID: " + face2Id);

                            client.face.verify([face1Id, face2Id]).then(function(result) {
                                if (result.length != 0) {
                                    console.log("This is the same person: " + JSON.stringify(result));
                                    if (result.isIdentical == true) {
                                        res.send({
                                            status: "Facial Recognition Successfully Authenticated!"
                                        });
                                    }
                                    else {
                                        res.send({
                                            status: "Facial Recognition Authorization Failed, Please try again!"
                                        });
                                    }
                                }
                                else {
                                    res.send({
                                        status: "Facial Recognition Authorization Failed, Please try again!"
                                    });
                                }
                            });
                        }
                        else {
                            res.send({
                                status: "Facial Recognition Authorization Failed, Please try again!"
                            });
                        }
                    });
                }
                else {
                    res.send({
                        status: "Facial Recognition Authorization Failed, Please try again!"
                    });
                }

            });
        }
    });
});

var server = app.listen(process.env.PORT || '8080', '0.0.0.0', function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('running at http://' + host + ':' + port);
});
