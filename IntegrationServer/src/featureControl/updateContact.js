async function updateContactInfo (req, res){
  console.log(JSON.stringify(req.body));
  console.log('Item ID: ', JSON.stringify(req.body.payload.inboundFieldValues.itemId));	
  console.log('Column ID: ', JSON.stringify(req.body.payload.inboundFieldValues.columnId));
  console.log('New Value: ', JSON.stringify(req.body.payload.inboundFieldValues.columnValue));
  console.log('New version of item: ', JSON.stringify(req.body.payload.inboundFieldValues.itemMapping));
  console.log(" ");
  
  let hi = req.body.payload.inboundFieldValues.itemMapping.name;
  let hi2 = req.body.payload.inboundFieldValues.itemMapping.namehfhfhfhf;
  console.log(hi);
  console.log(hi2);
  
  
  return res.status(200).send({});
};

module.exports = {
	updateContactInfo,
};