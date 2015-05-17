var Firebase = require("firebase");
var FbRef = new Firebase(<url to your Firebase>);
var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();
var devicesRef;
var passedDevicesRef;
var devicesFoundInThisLastInquire=[];


//
// Add a device to the currently present list
//
addDevice = function(address, name){
	if(devicesRef){
		devicesRef.orderByChild("address").equalTo(address).once("value", function(snapshot) {
			if(!snapshot.exists()){
				var newDeviceRef = devicesRef.push();
				newDeviceRef.set({ 'address': address, 'name': name, 'timestampIn': Firebase.ServerValue.TIMESTAMP });
				console.log("Added");
			}
		});
	}
}


//
// Start searching for nearby bluetooth devices
//
searchDevices = function(){
	console.log("searching...");
	devicesFoundInThisLastInquire.length = 0;
	btSerial.inquire();
}

//
// Move to history the devices that are not nearby anymore
//
updateNonPresentDevices = function(){
	devicesRef.once('value', function(dataSnapshot) {
		dataSnapshot.forEach(function(childSnapshot) {
			var device = childSnapshot.val();
			if(!device.timestampOut && devicesFoundInThisLastInquire.indexOf(device.address) < 0){
				console.log(device.address, " not present anymore");
				var newPassedDeviceRef = passedDevicesRef.push();
				newPassedDeviceRef.set(device);
				newPassedDeviceRef.update({
					"timestampOut": Firebase.ServerValue.TIMESTAMP
				});
				var deviceRef = devicesRef.child(childSnapshot.key())
				deviceRef.remove();
			}
		});
	});
}

//
// Stop the server/scanner after a defined time period
//
var tobeClosed = false;
closeTimeoutObject = setTimeout(function() {
	tobeClosed = true;
	console.log("to be closed");
	}, 1200000); // 20 minutes

//
// authenticate using email/password
//
FbRef.authWithPassword({
	//
	// NEVER DO THIS!!! ALWAYS KEEP YOUR USER/PASS CRYPTED
	//
	"email": "you@yourserver.org",
	"password": "yourpass"
	}, function(error, authData) {
	if (error) {
		console.log("Login Failed!", error);
	} else {
		devicesRef = FbRef.child("devices");
		passedDevicesRef = FbRef.child("passedDevices");

		// All data is removed
		devicesRef.remove();
		passedDevicesRef.remove();

		devicesRef.once('value', function(dataSnapshot) {
			dataSnapshot.forEach(function(childSnapshot) {
				console.log("Moving devices to passed");
				var device = childSnapshot.val();
				var newPassedDeviceRef = passedDevicesRef.push();
				newPassedDeviceRef.set(device);
				if(!device.timestampOut){
					newPassedDeviceRef.update({
						"timestampOut": 'unknown'
					});
				}
			});
			devicesRef.remove();
		});

		searchDevices();
	}
});

//
// Bluetooth events
//
btSerial.on('found', function(address, name) {
	console.log(address, name);

	addDevice(address, name);
	devicesFoundInThisLastInquire.push(address);
});

btSerial.on('finished', function() {
	console.log("finished");

	updateNonPresentDevices();
	if(tobeClosed)
		btSerial.close();
	else
		setTimeout(searchDevices, 5000);

});

btSerial.on('closed', function() {
	console.log("closed");
	process.exit(0);
});


//
// Running...
//
console.log("running...");


