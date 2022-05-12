const initMondayClient = require('monday-sdk-js');

/**
 * It takes a token and a boardId as parameters, and returns the items on the board.
 * @param token - The token you get from the OAuth flow
 * @param boardId - The ID of the board you want to get items from.
 * @returns [ { name: 'Test',
 *     updated_at: '2019-10-29T15:00:00.000Z',
 *     column_values: [ [Object], [Object], [Object], [Object], [Object] ] },
 *   { name: 'Test',
 *     updated_at: '2019-10-29T15:00:
 */
const getBoardItems = async (token, boardId) => {
  try {
    const mondayClient = initMondayClient();
    mondayClient.setToken(token);

    const query = `query ($boardId: [Int]){
					boards(limit:1 ids:$boardId) {
						name
						items {
							name 
							updated_at
							column_values {
								id
								title
								text
							}
						}
					}
				}`;
    const variables = {boardId};

    const response = await mondayClient.api(query, { variables });
	//console.log(response.data);
    return response.data.boards[0].items;
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getBoardItems,
};