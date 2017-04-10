/**
 * Created by yehyaawad on 3/5/16.
 */

Webcam.attach('#my_camera');

Webcam.setSWFLocation('bower_components/webcamjs-bower/webcam.swf');

//var snapshotButton = document.getElementById("snap-button");

function makeid() {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz";

  for (var i = 0; i < 8; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

var AUTHORIZATION_IMGUR = 'Client-ID 489e743cb2a7f9e';
//var GROUP_ID = makeid();
//var GROUP_ID = "secondmoasdad";
var GROUP_ID = "pennstatepennstate";
console.log(GROUP_ID);

var newUploadButton = $('#newup-button');
var newPersonButton = $('#newsnap-button');
var sameUploadButton = $('#sameup-button');
var samePersonButton = $('#samesnap-button');
var detectPersonButton = $('#detect-button');
var trainButton = $('#train-button');
var nameField = $('#name');
var likesField = $('#likes');


newUploadButton.click(function () {
  projectOxford.createPerson(nameField.val(), likesField.val(), function (data) {
    projectOxford.setPersonId(data.personId);
    projectOxford.addPersonFace($("#imgurl").val(), function (data) {
      console.log(data);
    });
  });
});

sameUploadButton.click(function () {
  projectOxford.addPersonFace($("#imgurl").val(), function (data) {
    console.log(data);
  });
});

var log = function (msg) {
  console.log(msg);
};

var newPersonImg = function () {
  var data_uri = Webcam.snap();
  document.getElementById('my_result').innerHTML = '<img src="' + data_uri + '"/>';

  // console.log(data_uri);

  var base64data = data_uri.substring(23);
  log(nameField.val() + likesField.val());
  projectOxford.createPerson(nameField.val(), likesField.val(), function (data) {
    uploadToImgur(base64data, 'BrickHacksII', function (url) {
      projectOxford.setPersonId(data.personId);
      projectOxford.addPersonFace(url, function (data) {
        console.log(data);
      });
    });
  });
};

var train = function () {
  $.ajax("http://10.101.192.67:3000/train", {
    type: "GET"
  })
};

var addExtraFace = function () {
  var data_uri = Webcam.snap();
  document.getElementById('my_result').innerHTML = '<img src="' + data_uri + '"/>';

  // console.log(data_uri);

  var base64data = data_uri.substring(23);
  uploadToImgur(base64data, 'BrickHacksII', function (url) {
    projectOxford.addPersonFace(url, function (data) {
      console.log(data);
    });
  });
};

var findPerson = function () {
  var data_uri = Webcam.snap();
  document.getElementById('my_result').innerHTML = '<img src="' + data_uri + '"/>';

  // console.log(data_uri);

  var base64data = data_uri.substring(23);
  uploadToImgur(base64data, 'BrickHacksII', function (url) {
    projectOxford.detect(url, function (data) {
      var faceId = data[0].faceId;
      projectOxford.identify(faceId, function (data) {
        var personId = data[0].candidates[0].personId;
        var confidence = data[0].candidates[0].confidence;
        projectOxford.getPerson(personId, function (data) {
        });
        console.log(data);
      });
      console.log(data);
    });
  });
};

var uploadToImgur = function (base64Data, name, callback) {
  $.ajax({
    url: 'https://api.imgur.com/3/image',
    headers: {
      'Authorization': AUTHORIZATION_IMGUR
    },
    type: 'POST',
    data: {
      image: base64Data,
      title: name
    },
    success: function (data) {
      callback(data.data.link, data);
    }
  });
};

var projectOxford = {
  BASE_URL: 'https://api.projectoxford.ai/face/v1.0/',
  KEY: '62019520219d469da60b347f6d725f5f',
  PERSON_GROUP_ID: null,
  _lastPersonId: null,
  /**
   *
   * @param personId
   */
  setPersonId: function (personId) {
    this._lastPersonId = personId;
  },
  /**
   *
   * @param groupName
   * @param callback
   */
  createPersonGroup: function (groupName, callback) {
    this.PERSON_GROUP_ID = groupName.replace(/ /g, '');
    $.ajax({
      url: this.BASE_URL + 'persongroups/' + GROUP_ID,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.KEY
      },
      type: 'PUT',
      data: '{"name": "' + groupName + '","userData": ""}'
    }).done(function (data) {
      callback(data);
      log('createPersonGroup success.');
    }).fail(function (err) {
      log('createPersonGroup error.');
      log(err);
    });
  },
  // Adds a person to projectOxford
  /**
   *
   * @param nameString
   * @param likesString
   * @param callback
   */
  createPerson: function (nameString, likesString, callback) {
    var data = {
      name: nameString,
      userData: [likesString]
    };
    $.ajax({
      url: 'https://api.projectoxford.ai/face/v1.0/persongroups/' + GROUP_ID + '/persons',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.KEY
      },
      type: 'POST',
      // Request body
      data: JSON.stringify(data)
    }).done(function (data) {
      callback(data);
      log('Create person success.');
    }).fail(function (err) {
      log('Create person error.');
      log(err);
    });
    
    $.ajax({
      url: '/createUser',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.KEY
      },
      type: 'POST',
      // Request body
      data: JSON.stringify(data)
    }).done(function (data) {
      callback(data);
      log('Create person success.');
    }).fail(function (err) {
      log('Create person error.');
      log(err);
    });
  },
  /**
   *
   * @param nameString
   * @param callback
   */
  addPersonFace: function (imgUrl, callback) {
    var data = {
      url: imgUrl
    };
    $.ajax({
      url: 'https://api.projectoxford.ai/face/v1.0/persongroups/' + GROUP_ID + '/persons/' + this._lastPersonId + '/persistedFaces',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.KEY
      },
      type: 'POST',
      // Request body
      data: JSON.stringify(data)
    }).done(function (data) {
      log('addPersonFace success');
      console.log("Person id: " + projectOxford._lastPersonId);
    }).fail(function (err) {
      log('addPersonFace error');
      log(err);
    });
  },
  // detects who the person is
  detect: function (imgUrl, callback) {
    var data = {
      url: imgUrl
    };
    $.ajax({
      url: 'https://api.projectoxford.ai/face/v1.0/detect',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.KEY
      },
      type: 'POST',
      // Request body
      data: JSON.stringify(data)
    }).done(function (data) {
      console.log(data);
      callback(data);
      log('detect success');
    }).fail(function (err) {
      log('detect error');
      log(err);
    });
  },
  // detects who the person is
  getPerson: function (personId, callback) {
    $.ajax({
      url: 'https://api.projectoxford.ai/face/v1.0/persongroups/' + GROUP_ID + '/persons/' + personId,
      headers: {
        'Content-Type': "application/json",
        'Ocp-Apim-Subscription-Key': this.KEY
      },
      type: 'POST',
      data: {}
    }).done(function (data) {
      console.log(data);
      callback(data);
      log('getPerson success');
    }).fail(function (err) {
      log('getPerson error');
      log(err);
    });
  },
  identify: function (faceId, callback) {
    var data = {
      "personGroupId": GROUP_ID,
      "faceIds": [faceId],
      "maxNumOfCandidatesReturned": 1
    };
    $.ajax({
      url: 'https://api.projectoxford.ai/face/v1.0/identify',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.KEY
      },
      type: 'POST',
      // Request body
      data: JSON.stringify(data)
    }).done(function (data) {
      console.log(data);
      callback(data);
      log('identify success');
    }).fail(function (err) {
      log('identify error');
      log(err);
    });
  },
  train: function (callback) {
    $.ajax({
      url: 'https://bigmoney2020-abdallahozaifa.c9users.io/train',
      headers: {
        'Content-Type': "application/json"
      },
      type: 'Get',
      data: {}
    }).done(function (data) {
      console.log(data);
      //callback(data);
      log('train success');
    }).fail(function (err) {
      log('train error');
      log(err);
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
      console.log(data);
      callback(data);
      log('addPersonFace success');
    }).fail(function (err) {
      log('addPersonFace error');
      log(err);
    });
  }
};

projectOxford.createPersonGroup(GROUP_ID, function (data) {
  log("Person group - check.");
});

newPersonButton.click(newPersonImg);
samePersonButton.click(addExtraFace);
detectPersonButton.click(findPerson);
trainButton.click(projectOxford.train);

var sendImgBtn = $("#image-button");

var convertImgToBase64 = function (url, callback, outputFormat) {
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function () {
    var canvas = document.createElement('CANVAS');
    var ctx = canvas.getContext('2d');
    canvas.height = this.height;
    canvas.width = this.width;
    ctx.drawImage(this, 0, 0);
    var dataURL = canvas.toDataURL(outputFormat || 'image/png');
    callback(dataURL);
    canvas = null;
  };
  img.src = url;
}

sendImgBtn.click(function () {
  var data_uri = Webcam.snap();
  document.getElementById('my_result').innerHTML = '<img src="' + data_uri + '"/>';
  // console.log(data_uri);
  var base64data = data_uri.substring(23);
  $.ajax({
      url: '/getPerson',
      type: 'POST',
      data: {
        img: base64data
      }
    }).done(function(data){
      console.log(data);
    });
    console.log("Image Sent!!");
});