const { configVariables } = require('../config/config-helper.js');

async function nameSplit(name) {
    let nameArr = await name.split(" ");

  //If there is no middle, the last name needs to be assigned to nameArr[2] for the api call
  switch (nameArr.length == 2) {
    case 1 :
        nameArr[1]= "";
        nameArr[2]= "";
        break;
    case 2 :
        nameArr[2] = nameArr[1];
        nameArr[1] = "";
        break;
    case 3 :
      break;
  }
  return nameArr;
}

async function phoneFormat(phone) {
	//Try to format mobile and work phones 
	if(phone != undefined) {
		if(phone.length == 10) {
			phone = await '1 ('+ phone.slice(0,3) + ') ' +  phone.substring(3,6) + '-' + phone.substring(6,10);
		}
	}
  return phone;
}

async function formatColumnValues (itemMap) {
  const {
    primaryEmailID,
    secondaryEmailID,
    workPhoneID,
    mobilePhoneID,
    notesID,
  } = configVariables;

  let workPhone = await phoneFormat(itemMap[workPhoneID]);
  let mobilePhone = await phoneFormat(itemMap[mobilePhoneID]);
  const primaryEmail = itemMap[primaryEmailID];
  const secondaryEmail = itemMap[secondaryEmailID];
  const notes = itemMap[notesID];

  let arrEmails= []
  let arrPhoneNumbers=[]
  let arrNotes = []

  arrEmails.push({ value: primaryEmail, type: 'work', formattedType: 'Work' })
  arrEmails.push({ value: secondaryEmail, type: 'other', formattedType: 'Other' })
  arrPhoneNumbers.push({ value: workPhone, type: 'work', formattedType: 'Work' })
  arrPhoneNumbers.push({ value: mobilePhone, type: 'mobile', formattedType: 'Mobile' })
  arrNotes.push({ value: notes, contentType: 'TEXT_PLAIN' })

  console.log("Emails: ", arrEmails)
  console.log("Phones: ", arrPhoneNumbers)
  console.log("Notes: ", arrNotes)

  return {
    arrEmails,
    arrPhoneNumbers,
    arrNotes,
  }
}

module.exports = {
  formatColumnValues,
  nameSplit
}
