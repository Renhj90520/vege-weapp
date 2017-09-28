const config = require('../config.js');

module.exports = {
  getUrl(route) {
    return `https://${config.baseUrl}${route}`;
  },
  getAuthUrl(route) {
    return `https://${config.authUrl}${route}`;
  }
}