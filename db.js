// Handle to wait for db connection
var mongo = require('mongodb');

const databaseName = 'sugarizerDb';

//- Utility functions

// Init database
exports.waitConnection = function(callback) {
	var waitTime = 5;
	if (waitTime) {
		var timer = setInterval(function() {

			var client = createConnection();

			// Open the db
			client.connect(function(err, client) {
				if (!err) {
                    clearInterval(timer);
                    var db = client.db(databaseName);
					callback(db);
				} else {
					console.log("Waiting for DB... ("+err.name+")");
				}
			});
		}, waitTime*1000);
	} else {
		var client = createConnection();

		// Open the db
		client.connect(function(err, client) {
			if (!err) {
                var db = client.db(databaseName);
				callback(db);
			} else {
				callback();
			}
		});
	}
};

function createConnection() {
	return new mongo.MongoClient(
		(process.env.MONGO_URL || 'mongodb://localhost:27017')+'/'+ databaseName,
		{auto_reconnect: false, w:1, useNewUrlParser: true, useUnifiedTopology: true });
}
