const handler = require('./handler');

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: handler.getRoot,
  },
  {
    method: 'POST',
    path: '/api/connect-to-database',
    handler: handler.connectToDatabase,
  },
  {
    method: 'GET',
    path: '/api/get-supplier-name',
    handler: handler.getSupplierName,
  }
];

module.exports = routes;