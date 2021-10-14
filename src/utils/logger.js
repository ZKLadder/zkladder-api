/**
 * Generic logger object
 * @TODO Integrate a logging service
 */
const Logger = {
  log: (args) => {
    console.log(...args);
  },
  error: (error, args) => {
    console.error(error, ...args);
  },
  warn: (args) => {
    console.warn(...args);
  },
  info: (args) => {
    console.info(...args);
  },
};

module.exports = Logger;
