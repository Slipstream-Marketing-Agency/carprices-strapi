const register = require('./register');
const bootstrap = require('./bootstrap');
const destroy = require('./destroy');
const config = require('./config');
const contentTypes = require('./content-types');
const controllers = require('./controllers');
const routes = require('./routes');
const policies = require('./policies');
const services = require('./services');
const middlewares = require('./middlewares');

module.exports = {
  register({ strapi }) {
    // Register middleware globally
    strapi.server.use(middlewares.cacheResponse());
  },
  bootstrap,
  destroy,
  config,
  controllers,
  routes,
  services,
  contentTypes,
  policies,
  middlewares,
};
