const { curry } = require('ramda');

const createNamedType = require('./createNamedType');

/** fromMaybe :: Type -> Maybe a -> (Type a | Type Nil) */
const fromMaybe = curry((Type, mb) =>
  mb.matchWith({
    Just: ({ value }) => Type(value),
    Nothing: () => Type(),
  })
);

module.exports = {
  Asset: createNamedType('asset'),
  Alias: createNamedType('alias'),
  Pair: createNamedType('pair'),
  Transaction: createNamedType('transaction'),
  List: require('./List'),
  fromMaybe,
};
