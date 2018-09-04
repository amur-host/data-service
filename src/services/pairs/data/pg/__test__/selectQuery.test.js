const selectQuery = require('../adapter/selectQuery');
const sql = require('../sql');

describe('Pair db adapter `selectQuery` function', () => {
  it('covers case when AMUR — amount asset', () => {
    const pair = {
      amountAsset: 'AMUR',
      priceAsset: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
    };
    expect(selectQuery(sql, pair)).toEqual(sql.query(pair));
  });

  it('covers case when AMUR — price asset', () => {
    const pair = {
      amountAsset: '474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu',
      priceAsset: 'AMUR',
    };
    expect(selectQuery(sql, pair)).toEqual(sql.query(pair));
  });

  it('covers case when AMUR is neither price nor amount asset', () => {
    const pair = {
      amountAsset: '474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu',
      priceAsset: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
    };
    expect(selectQuery(sql, pair)).toEqual(sql.queryWithAmur(pair));
  });
});
