const mysql = require('mysql');
const axios = require('axios');

let connection = null; // Declare a global variable to hold the MySQL connection values

const getRoot = (request, h) => {
  if (!connection) {
    return h.response({ message: 'No database connection established' }).code(503);
  }

  return h.response({ message: 'This is the root node for wawasan API' }).type('application/json');
};

const connectToDatabase = (request, h) => {
  // Request variables from the front end
  const { username, password, host, port, database } = request.payload;

  return new Promise((resolve, reject) => {
    // Create MySQL database connection
    connection = mysql.createConnection({
      host,
      port,
      user: username,
      password,
      database,
    });

    // Connect to the MySQL server
    connection.connect((err) => {
      if (err) {
        console.error('Failed to connect to the database:', err);
        reject(new Error('Failed to connect to the database'));
        return;
      }

      // Response message with the provided values if the connection was successful
      const message = `Connected to the database successfully: username=${username}, password=${password}, host=${host}, port=${port}, database=${database}`;

      resolve({ success: true, message });
    });
  });
};

const getSupplierName = (request, h) => {
  if (!connection || !connection.config.database) {
    return h.response({ message: 'No database connection established' }).code(503);
  }

  return new Promise((resolve, reject) => {
    // Perform GET to all query data with the specified table from dummy db
    connection.query(
      `SELECT DISTINCT nama FROM ${connection.config.database}.supplier INNER JOIN ${connection.config.database}.pembelian ON ${connection.config.database}.supplier.kode = ${connection.config.database}.pembelian.supplier WHERE ${connection.config.database}.supplier.kode NOT LIKE 'has%' ORDER BY nama`,
      (error, results) => {
        if (error) {
          console.error('Failed to execute the SELECT query:', error);
          reject(new Error('Failed to execute the SELECT query'));
          return;
        }

        // Process and output the query results
        console.log('Query results:', results);

        // Response message with the provided values if the connection was successful
        resolve({ success: true, data: results });
      }
    );
  });
};

const executeQuery = (query) => {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

const SendSupplierItemLists = async (request, h) => {
  if (!connection || !connection.config.database) {
    return h.response({ message: 'No database connection established' }).code(503);
  }

  try {
    const { supplierName } = request.payload;

    // Step 1: Get the supplier code and name
    const getSupplierQuery = `SELECT DISTINCT kode, nama FROM ${connection.config.database}.supplier WHERE nama = '${supplierName}'`;
    const supplierResults = await executeQuery(getSupplierQuery);

    if (supplierResults.length === 0) {
      return h.response({ message: 'Supplier not found' }).code(404);
    }

    const supplierCode = supplierResults[0].kode;
    const foundSupplierName = supplierResults[0].nama;

    // Step 2: Get a list of items sold by that supplier
    const getItemsQuery = `SELECT DISTINCT kode FROM ${connection.config.database}.barang WHERE supplier = '${supplierCode}'`;
    const itemsResults = await executeQuery(getItemsQuery);

    // If no items were found, return a 404
    if (itemsResults.length === 0) {
      return h.response({ message: 'No items found for the supplier' }).code(404);
    }

    return h.response({ success: true, supplierCode, supplierName: foundSupplierName, data: itemsResults }).code(200);
  } catch (error) {
    console.error('Error executing queries:', error);
    return h.response({ message: 'Failed to retrieve supplier item lists' }).code(500);
  }
};


const SendSupplierItemDetails = async (request, h) => {
  if (!connection || !connection.config.database) {
    return h.response({ message: 'No database connection established' }).code(503);
  }

  try {
    const { supplierName } = request.payload;

    // Step 1: Get the supplier code and name
    const getSupplierQuery = `SELECT DISTINCT kode, nama FROM ${connection.config.database}.supplier WHERE nama = '${supplierName}'`;
    const supplierResults = await executeQuery(getSupplierQuery);

    if (supplierResults.length === 0) {
      return h.response({ message: 'Supplier not found' }).code(404);
    }

    const supplierCode = supplierResults[0].kode;
    const foundSupplierName = supplierResults[0].nama;

    // Step 2: Get the date, item code, and total quantity for each item
    const getDateQuantityQuery = `
      SELECT tanggal, kode_barang, SUM(qty) AS total_qty
      FROM ${connection.config.database}.itempenjualan
      INNER JOIN ${connection.config.database}.penjualan ON itempenjualan.kode = penjualan.kode
      RIGHT JOIN ${connection.config.database}.barang ON itempenjualan.kode_barang = barang.kode
      WHERE barang.supplier = '${supplierCode}' AND tanggal BETWEEN DATE_SUB('2023-04-01', INTERVAL 20 DAY) AND '2023-04-01'
      GROUP BY tanggal, kode_barang
      ORDER BY kode_barang, tanggal ASC`;

    const dateQuantityResults = await executeQuery(getDateQuantityQuery);

    return h.response({ success: true, supplierCode, supplierName: foundSupplierName, data: dateQuantityResults }).code(200);
  } catch (error) {
    console.error('Error executing queries:', error);
    return h.response({ message: 'Failed to retrieve supplier details' }).code(500);
  }
};

const SendSupplierData = async (request, h) => {
  if (!connection || !connection.config.database) {
    return h.response({ message: 'No database connection established' }).code(503);
  }

  try {
    const { supplierName } = request.payload;

    // Step 1: Get the supplier code and name
    const getSupplierQuery = `SELECT DISTINCT kode, nama FROM ${connection.config.database}.supplier WHERE nama = '${supplierName}'`;
    const supplierResults = await executeQuery(getSupplierQuery);

    if (supplierResults.length === 0) {
      return h.response({ message: 'Supplier not found' }).code(404);
    }

    const supplierCode = supplierResults[0].kode;
    const foundSupplierName = supplierResults[0].nama;

    // Step 2: Get a list of items sold by that supplier
    const getItemsQuery = `SELECT DISTINCT kode FROM ${connection.config.database}.barang WHERE supplier = '${supplierCode}'`;
    const itemsResults = await executeQuery(getItemsQuery);

    if (itemsResults.length === 0) {
      return h.response({ message: 'No items found for the supplier' }).code(404);
    }

    // Step 3: Get the item details
    const getDateQuantityQuery = `
    SELECT tanggal, kode_barang, SUM(qty) AS total_qty
    FROM ${connection.config.database}.itempenjualan
    INNER JOIN ${connection.config.database}.penjualan ON itempenjualan.kode = penjualan.kode
    RIGHT JOIN ${connection.config.database}.barang ON itempenjualan.kode_barang = barang.kode
    WHERE barang.supplier = '${supplierCode}' AND tanggal BETWEEN DATE_SUB('2023-04-01', INTERVAL 20 DAY) AND '2023-04-01'
    GROUP BY tanggal, kode_barang
    ORDER BY kode_barang, tanggal ASC`;

    const dateQuantityResults = await executeQuery(getDateQuantityQuery);

    return h.response({ success: true, supplierCode, supplierName: foundSupplierName, items: itemsResults, details: dateQuantityResults }).code(200);
  } catch (error) {
    console.error('Error executing queries:', error);
    return h.response({ message: 'Failed to retrieve supplier data' }).code(500);
  }
};

const getPredictionValue = async (request, h) => {
  try {
    const supplierName = request.params.supplierName;
    const apiUrl = `http://34.101.74.248:5000/predict/${encodeURIComponent(supplierName)}`;

    const response = await axios.get(apiUrl);
    const predictionValue = response.data; // Assuming the API returns the prediction value directly

    return h.response({ prediction: predictionValue }).code(200);
  } catch (error) {
    console.error('Error retrieving prediction value:', error);
    return h.response({ message: 'Failed to retrieve prediction value' }).code(500);
  }
};

module.exports = {
  getRoot,
  connectToDatabase,
  getSupplierName,
  SendSupplierItemLists,
  SendSupplierItemDetails,
  SendSupplierData,
  getPredictionValue
};
