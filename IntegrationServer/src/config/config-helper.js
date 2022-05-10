const fs = require('fs');
/*
var workPhoneId = '';
var mobilePhoneID = '';
var primaryEmailID = '';
var secondaryEmailID = ''
var notesID = ''; */


const configVariables = {
	"workPhoneId": '',
	"mobilePhoneID": '',
	"primaryEmailID": '',
	"secondaryEmailID": '',
	"notesID": '',
	"clientId": ' ',
	"clientSecret": ' ',
	"backToUrl": ' ',
	"createNewDatabase": true
}

async function setConfigVariables (config){
	let {columnIds, settings} = config;
	
	let index = 0;
	while(index < columnIds.length)
	{
		let currentSection = columnIds[index]
		switch(currentSection.title){
			case process.env.WORK_PHONE_TITLE:
				console.log(currentSection.id);
				configVariables.workPhoneId = currentSection.id;
				break;
			case process.env.MOBILE_PHONE_TITLE:
				console.log(currentSection.id);
				configVariables.mobilePhoneID = currentSection.id;
				break;
			case process.env.EMAIL_PRIMARY_TITLE:
				console.log(currentSection.id);
				configVariables.primaryEmailID = currentSection.id;
				break;
			case process.env.EMAIL_SECONDARY_TITLE:
				console.log(currentSection.id);
				configVariables.secondaryEmailID = currentSection.id;
				break;
			case process.env.NOTES_TITLE:
				console.log(currentSection.id);
				configVariables.notesID = currentSection.id;
				break;
			case process.env.MONDAY_CLIENT_ID:
				console.log(currentSection.id);
				configVariables.clientId = currentSection.id;
				break;
			case process.env.MONDAY_CLIENT_SECRET:
				console.log(currentSection.id);
				configVariables.clientSecret = currentSection.id;
				break;
			case process.env.BACK_TO_URL:
				console.log(currentSection.id);
				configVariables.backToUrl = currentSection.id;
				break;
			}
		index++;
	}
	if(settings.createNewDatabase != undefined)
	{
		console.log("Create new database upon sync = " + settings.createNewDatabase);
		configVariables.createNewDatabase = settings.createNewDatabase;
	}
}

module.exports = {
	configVariables,
	setConfigVariables
}