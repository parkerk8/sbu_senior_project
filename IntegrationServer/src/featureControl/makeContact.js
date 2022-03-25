const fs = require('fs');
async function makeNewContact(req, res) {
    contact = {
        ItemID: req.body.payload.inboundFieldValues.itemId,
        ContactName: req.body.payload.inboundFieldValues.itemMapping.name,
    }
    console.log(contact);

    //takes monday.com data and formats it for a json object
    json = JSON.stringify(contact);

    //Creates/replaces the json file of data to be pushed
    fs.writeFile('./contact.json', json, (err) => {
        if (!err) {
            console.log('yes');
        }
    })

  console.log('Item ID: ', JSON.stringify(req.body.payload.inboundFieldValues.itemId));	
  console.log('Contact Name: ', JSON.stringify(req.body.payload.inboundFieldValues.itemMapping.name));
  console.log(" ");
  return res.status(200).send({});
};

module.exports = {
	makeNewContact
};