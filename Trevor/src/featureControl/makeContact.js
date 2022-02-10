async function makeNewContact (req, res){
  console.log('Item ID: ', JSON.stringify(req.body.payload.inboundFieldValues.itemId));	
  console.log('Contact Name: ', JSON.stringify(req.body.payload.inboundFieldValues.itemMapping.name));
  console.log(" ");
  return res.status(200).send({});
};

module.exports = {
	makeNewContact
};