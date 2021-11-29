async function updateContactInfo (req, res){
  console.log('Item ID: ', JSON.stringify(req.body.payload.inboundFieldValues.itemId));	
  console.log('New Value: ', JSON.stringify(req.body.payload.inboundFieldValues.columnValue));
  console.log('New Column Type: ', JSON.stringify(req.body.payload.inboundFieldValues.columnType));
  console.log('New version of item: ', JSON.stringify(req.body.payload.inboundFieldValues.itemMapping));
  return res.status(200).send({});
};

module.exports = {
	updateContactInfo,
};