const { BigNumber } = require('@amur/data-entities');

const transformResults = require('../adapter/transformResults');

const AMUR_DECIMALS = 8;
const aDecimals = 8;
const pDecimals = 2;

const resultCommon = {
  a_decimals: aDecimals,
  p_decimals: pDecimals,
  first_price: new BigNumber(10).pow(8),
  last_price: new BigNumber(10).pow(8).multipliedBy(2),
  volume: new BigNumber(10).pow(10),
  volume_price_asset: new BigNumber(10).pow(10).multipliedBy(12),
};

describe('Pairs transformResult function', () => {
  it('covers case when AMUR — amount asset', () => {
    const pair = {
      amountAsset: 'AMUR',
      priceAsset: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
    };
    const result = resultCommon;
    const expected = {
      first_price: new BigNumber(10).pow(6),
      last_price: new BigNumber(10).pow(6).multipliedBy(2),
      volume: new BigNumber(10).pow(2),
      volume_amur: new BigNumber(10).pow(2),
    };

    expect(transformResults(pair)(result)).toEqual(expected);
  });

  it('covers case when AMUR — price asset', () => {
    const pair = {
      priceAsset: 'AMUR',
      amountAsset: '474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu',
    };
    const result = resultCommon;
    const expected = {
      first_price: new BigNumber(10).pow(6),
      last_price: new BigNumber(10).pow(6).multipliedBy(2),
      volume: new BigNumber(10).pow(2),
      volume_amur: new BigNumber(10).pow(2).multipliedBy(12),
    };

    expect(transformResults(pair)(result)).toEqual(expected);
  });

  describe('AMUR is neither price nor amount asset', () => {
    const pair = {
      priceAsset: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
      amountAsset: '474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu',
    };

    it('covers case `priceAsset/AMUR` is a valid pair, should multiply by avg_price', () => {
      const volumePriceAsset = new BigNumber(10).pow(10).multipliedBy(2);
      const avgPrice = new BigNumber(10).pow(6).multipliedBy(3);

      const result = {
        ...resultCommon,
        volume_price_asset: volumePriceAsset, // overriding for this test purposes
        avg_price_with_amur: avgPrice,
        price_asset_with_amur: 'AMUR',
      };

      const expected = {
        first_price: new BigNumber(10).pow(6),
        last_price: new BigNumber(10).pow(6).multipliedBy(2),
        volume: new BigNumber(10).pow(2),
        volume_amur: volumePriceAsset
          .multipliedBy(new BigNumber(10).pow(-pDecimals)) // to true volume
          .multipliedBy(avgPrice)
          .multipliedBy(new BigNumber(10).pow(-8 + pDecimals - AMUR_DECIMALS)), // to true price (Amur dec — 8)
      };

      expect(transformResults(pair)(result)).toEqual(expected);
    });

    it('covers case `AMUR/priceAsset` is a valid pair, should divide by avg_price', () => {
      const volumePriceAsset = new BigNumber(10).pow(10).multipliedBy(6);
      const avgPrice = new BigNumber(10).pow(6).multipliedBy(3);

      const result = {
        ...resultCommon,
        volume_price_asset: volumePriceAsset, // overriding for this test purposes
        avg_price_with_amur: avgPrice,
        price_asset_with_amur: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
      };

      const expected = {
        first_price: new BigNumber(10).pow(6),
        last_price: new BigNumber(10).pow(6).multipliedBy(2),
        volume: new BigNumber(10).pow(2),
        volume_amur: volumePriceAsset
          .multipliedBy(new BigNumber(10).pow(-pDecimals)) // to true volume
          .dividedBy(avgPrice)
          .dividedBy(new BigNumber(10).pow(-8 + AMUR_DECIMALS - pDecimals)), // to true price (Amur dec — 8)
      };

      expect(transformResults(pair)(result)).toEqual(expected);
    });
  });

  describe('corner cases', () => {
    it('AMUR — amount asset, no transactions happened within a day', () => {
      const pair = {
        amountAsset: 'AMUR',
        priceAsset: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
      };

      expect(transformResults(pair)(null)).toEqual(null);
    });

    it('AMUR — price asset, no transactions happened within a day', () => {
      const pair = {
        amountAsset: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
        priceAsset: 'AMUR',
      };

      expect(transformResults(pair)(null)).toEqual(null);
    });

    it('AMUR is neither price nor amount, transactions within pair occured, but no transactions priceAsset--AMUR happened', () => {
      const pair = {
        amountAsset: '474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu',
        priceAsset: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
      };
      const result = {
        ...resultCommon,
        avg_price_with_amur: null,
        price_asset_with_amur: null,
      };
      const expected = {
        first_price: new BigNumber(10).pow(6),
        last_price: new BigNumber(10).pow(6).multipliedBy(2),
        volume: new BigNumber(10).pow(2),
        volume_amur: null,
      };

      expect(transformResults(pair)(result)).toEqual(expected);
    });
  });
});
