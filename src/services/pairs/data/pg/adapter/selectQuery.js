const { curry } = require('ramda');

const selectQuery = curry(({ query, queryWithAmur }, pair) => {
  if (pair.priceAsset === 'AMUR' || pair.amountAsset === 'AMUR')
    return query(pair);
  else return queryWithAmur(pair);
});

module.exports = selectQuery;
