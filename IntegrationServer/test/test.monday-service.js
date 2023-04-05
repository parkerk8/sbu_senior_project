const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const { getBoardItems } = require("../src/services/monday-service.js");
const initMondayClient = require('monday-sdk-js');
const mondayClient = initMondayClient();
const aToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI0ODkzNzY4MCwidWlkIjo0MDQ3OTk2OCwiaWFkIjoiMjAyMy0wNC0wNFQxNjoyMjozNC41MTRaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTU3MDM1MDUsInJnbiI6InVzZTEifQ.jFbkOcYiwH-s5bXi74Kv5gegodP9l00rFvXbGGzSKwU';

describe('getBoardItems', () => {
  beforeEach(() => {
    sinon.stub(getBoardItems, 'initMondayClient').returns({
      setToken: sinon.stub(),
      api: sinon.stub()
    });
  });

  afterEach(() => {
    getBoardItems.initMondayClient.restore();
  });

  it('should return an array of board items', async () => {
    // Arrange
    const expectedResponse = [
      {
        name: 'Item 1',
        updated_at: '2022-01-01T00:00:00.000Z',
        column_values: [
          { id: 'column1', title: 'Column 1', text: 'Value 1' },
          { id: 'column2', title: 'Column 2', text: 'Value 2' }
        ]
      },
      {
        name: 'Item 2',
        updated_at: '2022-01-02T00:00:00.000Z',
        column_values: [
          { id: 'column1', title: 'Column 1', text: 'Value 3' },
          { id: 'column2', title: 'Column 2', text: 'Value 4' }
        ]
      }
    ];
    const token = aToken;
    const boardId = 123456789;
    const expectedQuery = `query ($boardId: [Int]){
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
    const expectedVariables = { boardId };
    const mondayClientStub = getBoardItems.initMondayClient();
    mondayClientStub.api.withArgs(expectedQuery, { variables: expectedVariables })
      .returns(Promise.resolve({ data: { boards: [{ items: expectedResponse }] } }));

    // Act
    const result = await getBoardItems(token, boardId);

    // Assert
    expect(result).to.deep.equal(expectedResponse);
    expect(mondayClientStub.setToken.calledWith(token)).to.be.true;
    expect(mondayClientStub.api.calledWith(expectedQuery, { variables: expectedVariables })).to.be.true;
  });

  it('should log an error and return undefined for a failed request', async () => {
    // Arrange
    const token = aToken;
    const boardId = 123456789;
    const expectedError = new Error('Request failed');
    const mondayClientStub = getBoardItems.initMondayClient();
    mondayClientStub.api.rejects(expectedError);
    const consoleStub = sinon.stub(console, 'error');

    // Act
    const result = await getBoardItems(token, boardId);

    // Assert
    expect(result).to.be.undefined;
    expect(consoleStub.calledWith(expectedError)).to.be.true;

    // Clean up
    console.error.restore();
  });
});
