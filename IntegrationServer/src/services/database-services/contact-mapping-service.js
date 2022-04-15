const { ContactMapping } = require('../../db/models');

const getContactMapping = async (itemID) => {
  try {
    const queryResult = await ContactMapping.findByPk(itemID);
	console.log(queryResult);
    return queryResult;
  } catch (err) {
    console.error(err);
  }
};

const createContactMapping = async (attributes) => {
	const {itemID, resourceName, etag} = attributes;
	try{
		const newContactMapping = await ContactMapping.create( {
			id: itemID,
			resourceName,
			etag,
		});	
		//console.log(newContactMapping);
	}
	catch (err) {
		console.log(err);
	}	
}

const updateContactMapping = async (itemID, updates) => {
  const {resourceName, etag} = updates;
  try {
    const updatedContactMapping = await ContactMapping.update(
		{resourceName, etag},
		{
			where: {
				id: itemID,
			},
		}
    );
    return updatedContactMapping;
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
	getContactMapping,
	createContactMapping,
	updateContactMapping
};