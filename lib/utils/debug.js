const config = require("../global-api/config");
const { noop } = require("./misc");

exports.warn = noop;
exports.tip = noop;
exports.generateComponentTrace = noop;
exports.formatComponentName = noop;

if (process.env.NODE_ENV !== "production") {
  const hasConsole = typeof console !== "undefined";
  const classifyRE = /(?:^|[-_])(\w)/g;
  const classify = (str) =>
    str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");

  let warn = (msg, cm) => {
    const trace = cm ? generateComponentTrace(cm) : "";

    if (config.warnHandler) {
      config.warnHandler.call(null, msg, cm, trace);
    } else if (hasConsole && !config.silent) {
      console.error(`[Campbell warn]: ${msg}${trace}`);
    }
  };
  exports.warn = warn;

  let tip = (msg, cm) => {
    if (hasConsole && !config.silent) {
      console.warn(
        `[Campbell tip]: ${msg}` + (cm ? generateComponentTrace(cm) : "")
      );
    }
  };
  exports.tip = tip;

  let formatComponentName = (cm, includeFile) => {
    if (cm.$root === cm) {
      return "<Root>";
    }
    const options =
      typeof cm === "function" && cm.cid != null
        ? cm.options
        : cm._isCampbell
        ? cm.$options || cm.constructor.options
        : cm;
    let name = options.name || options._componentTag;

    const file = options.__file;
    if (!name && file) {
      const match = file.match(/([^/\\]+)\.vue$/);
      name = match && match[1];
    }

    return (
      (name ? `<${classify(name)}>` : `<Anonymous>`) +
      (file && includeFile !== false ? ` at ${file}` : "")
    );
  };
  exports.formatComponentName = formatComponentName;

  const repeat = (str, n) => {
    let res = "";
    while (n) {
      if (n % 2 === 1) res += str;
      if (n > 1) str += str;
      n >>= 1;
    }
    return res;
  };

  let generateComponentTrace = (cm) => {
    if (cm._isCampbell && cm.$parent) {
      const tree = [];
      let currentRecursiveSequence = 0;
      while (cm) {
        if (tree.length > 0) {
          const last = tree[tree.length - 1];
          if (last.constructor === cm.constructor) {
            currentRecursiveSequence++;
            cm = cm.$parent;
            continue;
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence];
            currentRecursiveSequence = 0;
          }
        }
        tree.push(cm);
        cm = cm.$parent;
      }
      return (
        "\n\nfound in\n\n" +
        tree
          .map(
            (cm, i) =>
              `${i === 0 ? "---> " : repeat(" ", 5 + i * 2)}${
                Array.isArray(cm)
                  ? `${formatComponentName(cm[0])}... (${
                      cm[1]
                    } recursive calls)`
                  : formatComponentName(cm)
              }`
          )
          .join("\n")
      );
    } else {
      return `\n\n(found in ${formatComponentName(cm)})`;
    }
  };
  exports.generateComponentTrace = generateComponentTrace;
}
