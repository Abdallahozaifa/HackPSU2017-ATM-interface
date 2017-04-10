/**
 * Created by yehyaawad on 3/5/16.
 */
var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var request = require('request');


var app = express();
app.use(bodyParser.json({
  limit: "50mb"
}));
app.use('/car.jpg', express.static('car.jpg'));
app.use('/view', express.static('view'));

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

app.get('/client.js', function (req, res) {
  fs.readFile('client.js', 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    res.send(data);
  });
});

var getPersonCounter = 0;

app.post('/getPerson', function (req, res) {
  uploadToImgur(req.body.img, "brickhacks", function (link) {
    projectOxford.detect(link, function (body) {
      if (body.length > 0) {
        console.log("body.length > 0 Hit!!")
        projectOxford.identify(body[0].faceId, function (body) {
          if (body !== null) {
            if (body[0] !== null) {
              if (body[0].candidates.length > 0) {
                projectOxford.getPerson(body[0].candidates[0].personId, function (body) {
                  var customer = ml.findOrCreateUser(body.name, "");
                  var custInts = null;
                  custInts = customer.getInterest();
                  res.send({
                    "name": body.name,
                    "Likes": body.userData
                  }); //return name and interests
                  console.log(body);
                  //res.send({"name":body.name, "Interests": custInts}); //return name and interests
                })
              }
            }
          }
        })
      }
      else {
        res.send({
          "name": "Searching...",
          "Likes": ""
        });
      }
    });
  });
});

var ml = require("./ml/ml.js");

var mlClasifyObj = {
  probability: "",
  label: ""
};
var mlSentObj = {
  probability: "",
  label: ""
};

//get user interests by person name
app.get('/feedback', function (req, res) {
  // var personName = req.body.name;
  // var user = ml.findOrCreateUser(personName);
  // console.log(JSON.stringify(user.getInterest()));

  ml.setInput("the salad is so amazing");

  ml.classify(function (res) {
    mlClasifyObj.probability = res.result[0][1].probability;
    mlClasifyObj.label = res.result[0][1].label;
  });

  ml.sentiment(function (res) {
    mlSentObj.probability = res.result[0][0].probability;
    mlSentObj.label = res.result[0][0].label;
  });
  res.send(200);
});

//Training person facial

app.post('/createUser', function (req, res) {
  var personName = req.body.name;
  var interest = req.body.userData;
  console.log(req.body);
  //store into DB
  console.log("Find and create user!");
  ml.findOrCreateUser(personName, interest);

  console.log("Get Username!");
  ml.getUsrName(personName, function (data) {
    console.log(data);
  });
  
  res.send({
    status: "successfully created person"
  });
});

app.post('/updateUser', function (req, res) {
  var personName = req.body.name;
  var interest = req.body.userData;
  //store into DB
  ml.findOrCreateUser(personName, interest);
  res.send({
    status: "successfully created person"
  });
});

//post image str query from hololens
app.post('/postQuery', function (req, res) {
  var imgStr = req.body.imgStr; //base64 image str
  if (imgStr.length>0) {
    console.log("received image str");
  }
  //pass to face dect
  uploadToImgur(imgStr, "brickhacks", function (link) {
    projectOxford.detect(link, function (body) {
      if (body.length > 0) {
        console.log("body.length > 0 Hit!!")
        projectOxford.identify(body[0].faceId, function (body) {
          if (body !== null) {
            if (body[0] !== null) {
              if (body[0].candidates.length > 0) {
                projectOxford.getPerson(body[0].candidates[0].personId, function (body) {
                  var customer = ml.getUsrName(body.name, "");
                  console.log("customer "+customer);
                  var custInts = null;
                  //get user interest from our DB
                  custInts = customer.getInterest(); //returning customed structure interest data
                  console.log(body.name + "," + custInts);
                  res.send(body.name + "," + custInts); //separated by comma of name, interest1, interest2 ...
                })
              }
            }
          }
        })
      }
      else {
        console.log("not searching...")
        res.send("Searching...");
      }
    });
  });
});

app.get('/train', function (req, res) {
  projectOxford.train();
  res.send(200);
});

app.use('/node_modules', express.static('node_modules'));
app.use('/bower_components', express.static('bower_components'));

// Project Oxford

function makeid() {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz";

  for (var i = 0; i < 8; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

var AUTHORIZATION_IMGUR = 'Client-ID 5905cd5d81b6fc5';
var GROUP_ID = "pennstatepennstate";

var uploadToImgur = function (base64Data, name, callback) {
  request({
    url: "https://api.imgur.com/3/image",
    method: "POST",
    json: true,
    headers: {
      'Authorization': AUTHORIZATION_IMGUR
    },
    body: {
      image: base64Data,
      title: name
    }
  }, function (error, resp, body) {
    console.log(body.data.link);
    callback(body.data.link);
  });
};

var projectOxford = {
  BASE_URL: 'https://api.projectoxford.ai/face/v1.0/',
  KEY: '62019520219d469da60b347f6d725f5f',
  PERSON_GROUP_ID: null,
  _lastPersonId: null,
  // detects who the person is
  detect: function (url, callback) {
    var data = {
      url: url
    };
    request({
      url: "https://api.projectoxford.ai/face/v1.0/detect",
      method: "POST",
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.KEY
      },
      body: data
    }, function (error, resp, body) {
      callback(body);
    });
  },
  getPerson: function (personId, callback) {
    request({
      url: "https://api.projectoxford.ai/face/v1.0/persongroups/" + GROUP_ID + '/persons/' + personId,
      method: "GET",
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.KEY
      },
      body: {}
    }, function (error, resp, body) {
      if (!error) {
        callback(body);
      }
      else {
        console.log(error);
      }
    });
  },
  identify: function (faceId, callback) {
    request({
      url: "https://api.projectoxford.ai/face/v1.0/identify",
      method: "POST",
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.KEY
      },
      body: {
        "personGroupId": GROUP_ID,
        "faceIds": [faceId],
        "maxNumOfCandidatesReturned": 1
      }
    }, function (error, resp, body) {
      if (!error && resp.statusCode == 200) {
        callback(body);
      }
      else {
        console.log(error);
      }
    });
  },
  train: function (callback) {
    request({
      url: 'https://api.projectoxford.ai/face/v1.0/persongroups/' + GROUP_ID + '/train',
      method: "POST",
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.KEY
      },
      body: {}
    }, function (error, resp, body) {
      if (!error && resp.statusCode == 200) {
        callback(body);
      }
      else {
        console.log(error);
      }
    });
  },
  getTrainingStatus: function (imgUrl, callback) {
    var data = {
      url: imgUrl
    };
    $.ajax({
      url: 'https://api.projectoxford.ai/face/v1.0/persongroups/' + GROUP_ID + '/training',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.KEY
      },
      type: 'POST'
    }).done(function (data) {
      callback(data);
      log('addPersonFace success');
    }).fail(function (err) {
      log('addPersonFace error');
      log(err);
    });
  }
};

var isEquivalent = function (a, b) {
  // Create arrays of property names
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);

  // If number of properties is different,
  // objects are not equivalent
  if (aProps.length != bProps.length) {
    return false;
  }

  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i];

    // If values of same property are not equal,
    // objects are not equivalent
    if (a[propName] !== b[propName]) {
      return false;
    }
  }

  // If we made it this far, objects
  // are considered equivalent
  return true;
};


// /* Listens on the Server Port */
var server = app.listen(process.env.PORT || '8080', '0.0.0.0', function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('running at http://' + host + ':' + port)
});