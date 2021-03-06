const { path } = require('ramda');
const JSONBig = require('@amur/json-bigint');

const getValueFromCtx = path(['state', 'returnValue']);

module.exports = async (ctx, next) => {
  await next();
  const value = getValueFromCtx(ctx);
  if (value !== undefined) ctx.body = JSONBig.stringify(value);
};
