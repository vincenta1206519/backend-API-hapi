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
  },
  {
    method: 'POST',
    path: '/api/send-supplier-item-lists',
    handler: handler.SendSupplierItemLists,
  },
  {
    method: 'POST',
    path: '/api/send-supplier-details',
    handler: handler.SendSupplierItemDetails,
  },
  {
    method: 'POST',
    path: '/api/send-supplier-data',
    handler: handler.SendSupplierData,
  },
  {
    method: 'GET',
    path: '/api/get-supplier-name/{supplierName}',
    handler: handler.getPredictionValue,
  }
];

module.exports = routes;
