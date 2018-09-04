const { curry } = require('ramda');

const { convertPrice, convertAmount } = require('../../../../../utils/satoshi');

const AMUR_DECIMALS = 8;

/**
 * @typedef {object} PairDbResponse
 * @property {BigNumber} a_decimals
 * @property {BigNumber} p_decimals
 * @property {BigNumber} first_price
 * @property {BigNumber} last_price
 * @property {BigNumber} volume
 * @property {BigNumber} volume_price_asset
 * @property {BigNumber} [avg_price_with_amur]
 * @property {BigNumber} [price_asset_with_amur]
 */

/**
 * @typedef {object} PairInfoRaw
 * @property {BigNumber} first_price
 * @property {BigNumber} last_price
 * @property {BigNumber} volume
 * @property {BigNumber} volume_amur
 */

/**
 * DB task returns array of values:
 * [aDecimals, pDecimals, firstPrice, lastPrice, volume, -volumeInPriceAsset, -avgPriceWithAmur]
 * depending on pair (does it have AMUR and if does, in which position)
 * Possible cases:
 *  1. AMUR — amount asset. Volume in amur = volume
 *  2. AMUR — price asset. Volume in amur = volume_in_price_asset
 *  3. AMUR is not in pair
 *    3a. Correct pair AMUR/priceAsset. Volume in amur = volume_in_price_asset / avg_price to AMUR
 *    3b. Correct pair priceAsset/AMUR. Volume in amur = volume_in_price_asset * avg_price to AMUR
 * @typedef {function} transformResults
 * @returns PairInfoRaw
 */
const transformResults = curry(({ amountAsset, priceAsset }, result) => {
  if (result === null) return null;

  const {
    a_decimals: aDecimals,
    p_decimals: pDecimals,
    last_price: lastPrice,
    first_price: firstPrice,
    volume,
    volume_price_asset: volumePriceAsset,
    ...withAmur
  } = result;

  const resultCommon = {
    first_price: convertPrice(aDecimals, pDecimals, firstPrice),
    last_price: convertPrice(aDecimals, pDecimals, lastPrice),
    volume: convertAmount(aDecimals, volume),
  };

  switch (true) {
    case amountAsset === 'AMUR':
      return {
        ...resultCommon,
        volume_amur: resultCommon.volume,
      };
    case priceAsset === 'AMUR': {
      return {
        ...resultCommon,
        volume_amur: convertAmount(AMUR_DECIMALS, volumePriceAsset),
      };
    }
    default: {
      const {
        avg_price_with_amur: avgPriceWithAmur,
        price_asset_with_amur: priceAssetWithAmur,
      } = withAmur;

      if (avgPriceWithAmur === null)
        return {
          ...resultCommon,
          volume_amur: null,
        };

      const volumeConverted = convertAmount(pDecimals, volumePriceAsset);

      if (priceAssetWithAmur === 'AMUR') {
        const priceConverted = convertPrice(
          pDecimals,
          AMUR_DECIMALS,
          avgPriceWithAmur
        );
        return {
          ...resultCommon,
          volume_amur: volumeConverted.multipliedBy(priceConverted),
        };
      } else {
        const priceConverted = convertPrice(
          AMUR_DECIMALS,
          pDecimals,
          avgPriceWithAmur
        );
        return {
          ...resultCommon,
          volume_amur: volumeConverted.dividedBy(priceConverted),
        };
      }
    }
  }
});

module.exports = transformResults;
