const { google } = require('googleapis');
const fs = require('fs');
const schedule = require('node-schedule');

const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient

var page_size_value = 1000;
var contact_information_array = [];

async function backupme() {
	await sleep(1000);
	var service = google.people({ version: 'v1', auth: OAuth2Client });
	console.log(OAuth2Client);
	ReadContact(service);
}

//repeat runs
schedule.scheduleJob('* * * * * 6', backupme);


let ts = Date.now();

let date_ob = new Date(ts);
let date = date_ob.getDate();
let month = date_ob.getMonth() + 1;
let year = date_ob.getFullYear();


//writes contact info into an array
async function ReadContact(service, nxt_token = null) {
	fetch_contact_data(service, nxt_token, function (data) {
		var connections = data.connections;
		connections.forEach((person) => {
			contact_information_array.push(person);
		});
		nxt_token = data.nxt_page_token;
		if (nxt_token != undefined) {
			read_contacts(service, nxt_token);
		} else {
			write_contact_data();
		}
	});
}

// funtion-total items
async function total_items(service, callback) {
	service.people.connections.list({
		resourceName: 'people/me',
		pageSize: 1,
		personFields: 'names',
	}, (err, res) => {
		const connections = res.data.connections;
		if (connections) {
			callback(res.data.totalItems);
		} else {
			console.log('No connections found.');
			callback(0);
		}
	});
}


//Pulls contact data
async function fetch_contact_data(service, page_token, callback) {
	service.people.connections.list({
		resourceName: 'people/me',
		pageSize: page_size_value,
		pageToken: page_token,
		personFields: 'names,emailAddresses,phoneNumbers,',
	}, (err, res) => {
		if (err) console.log(err);
		const connections = res;
		if (connections) {
			callback(res.data);
		} //else {
		//	console.log('fail');
		//}
	});
}
//writes the information to a json file
async function write_contact_data() {
	//write informaiton to a Json file, with the date as the name.
	fs.writeFile("./backups/" + year + "-" + month + "-" + date + ".json", JSON.stringify(contact_information_array), (err) => {
			if (err) console.error(err);
		console.log('The contact infromation was stored to' + year + "-" + month + "-" + date);
	});
}


function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
