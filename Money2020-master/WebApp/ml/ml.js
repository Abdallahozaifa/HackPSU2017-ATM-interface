(function () {
		var MonkeyLearn = require('monkeylearn');
		//libs for user system
		var mongoose = require('mongoose');
		var configDB = require('./database.js');
		mongoose.connect(configDB.DB_URL); // connect to database

		// load up the user model
		var User = require('../Model/user.js');

		var mlAPI = new MonkeyLearn('244f215342bd41d81bd23fb1806fe2d0389d3971');
		var ml = {};
		var classify_module_id = 'cl_wahFtyEj';
		var sentiment_module_id = 'cl_xbsqAhvd';
		var text_list = [];
		var p;

		ml.setInput = function (str) {
			text_list[0] = str;
		}

		// return res.result
		ml.classify = function (callback) {
			p = mlAPI.classifiers.classify(classify_module_id, text_list, true);
			p.then(callback);
		}

		// return res.result
		ml.sentiment = function (callback) {
			p = mlAPI.classifiers.classify(sentiment_module_id, text_list, true);
			p.then(callback);
		}


		ml.findOrCreateUser = function (personName, interests) {
			User.findOne({
				'local.displayName': personName
			}, function (err, user) {
				// if there are any errors, return the error before anything else
				if (err) {
					return err;
				}
				else {
					// if user record is found, return the message
					if (user) {
						var dbInts = user.local.interest;
						dbInts = dbInts.concat(interests);
						var uniqueArray = dbInts.filter(function (elem, pos) {
							return dbInts.indexOf(elem) == pos;
						});
						console.log("Unique Array!");
						console.log(uniqueArray);
						user.local.interest = uniqueArray;
						user.save();
						return user;
					}
					else {
						//create new user
						var newUser = new User();
						newUser.local.displayName = personName;
						newUser.local.interest = interests;
						// save our user to the database
						newUser.save(function (err) {
							if (err) {
								throw err;
							}
							// if successful, return the new user
							return newUser;
						});
					}
				}
			});
		};

		ml.getUsrName = function (personName, callback) {
			User.findOne({
				'local.displayName': personName
			}, function (err, user) {
				if(user){
					var usrName = user.local.displayName;
					var interests = user.local.interest;
					var likes = "";
					for(ints in interests){
						likes += interests[ints] + ", ";
					}
					
					var result = usrName + " " + likes
					callback(result);
				}else{
					return null;
				}
			});
		};

	module.exports = ml;

}).call(this);