const fs = require('fs');
async function updateContactInfo(req, res) {
    //puts monday.com data into one place
    contact = {
        ItemID: req.body.payload.inboundFieldValues.itemId,
        ColumnID: req.body.payload.inboundFieldValues.columnId,
        NewValue: req.body.payload.inboundFieldValues.columnValue,
        NewVersionOfItem: req.body.payload.inboundFieldValues.itemMapping
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
    //jsonfile.writeFile('Item ID: ', JSON.stringify(req.body.payload.inboundFieldValues.itemId)
  
  console.log('Item ID: ', JSON.stringify(req.body.payload.inboundFieldValues.itemId));	
  console.log('Column ID: ', JSON.stringify(req.body.payload.inboundFieldValues.columnId));
  console.log('New Value: ', JSON.stringify(req.body.payload.inboundFieldValues.columnValue));
  console.log('New version of item: ', JSON.stringify(req.body.payload.inboundFieldValues.itemMapping));
  console.log(" ");
  return res.status(200).send({});
};

module.exports = {
	updateContactInfo,
};