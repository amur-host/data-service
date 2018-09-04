const { renameKeys } = require('ramda-adjunct');
const { compose } = require('ramda');

/** transformPairInfo:: RawPairInfo -> PairInfo */
const transformPairInfo = compose(
  renameKeys({
    last_price: 'lastPrice',
    first_price: 'firstPrice',
    volume_amur: 'volumeAmur',
  })
);

module.exports = { transformPairInfo };
