const config = require("../global-api/config");
const { warn } = require("./debug");
const { isPromise } = require("./misc");

function handleError(err, cm, info) {
  if (cm) {
    let cur = cm;
    while ((cur = cur.$parent)) {
      const hooks = cur.$options.errorCaptured;
      if (hooks) {
        for (let i = 0; i < hooks.length; i++) {
          try {
            const capture = hooks[i].call(cur, err, cm, info) === false;
            if (capture) return;
          } catch (e) {
            globalHandleError(e, cur, "errorCaptured hook");
          }
        }
      }
    }
  }
  globalHandleError(err, cm, info);
}
exports.handleError = handleError;

function invokeWithErrorHandling(handler, context, args, cm, info) {
  let res;
  try {
    res = args ? handler.apply(context, args) : handler.call(context);
    if (res && isPromise(res) && !res._handled) {
      res.catch((e) => handleError(e, cm, info + ` (Promise/async)`));
      // avoid catch triggering multiple times when nested calls
      res._handled = true;
    }
  } catch (e) {
    handleError(e, cm, info);
  }
  return res;
}
exports.invokeWithErrorHandling = invokeWithErrorHandling;

function globalHandleError(err, cm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, cm, info);
    } catch (e) {
      // if the user intentionally throws the original error in the handler,
      // do not log it twice
      if (e !== err) {
        logError(e, null, "config.errorHandler");
      }
    }
  }
  logError(err, cm, info);
}

function logError(err, cm, info) {
  if (process.env.NODE_ENV !== "production") {
    warn(`Error in ${info}: "${err.toString()}"`, cm);
  }
  throw err;
}
