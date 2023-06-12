const mysql = require('mysql');

let connection = null; // Declare a global variable to hold the MySQL connection values

const getRoot = (request, h) => {
  if (!connection) {
    return h.response({ message: 'No database connection established' }).code(503);
  }

  return h.response({ message: 'OK' }).type('application/json');
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
      `SELECT DISTINCT nama FROM ${connection.config.database}.supplier_01_04_2023 INNER JOIN ${connection.config.database}.pembelian_01_04_2023 ON ${connection.config.database}.supplier_01_04_2023.kode = ${connection.config.database}.pembelian_01_04_2023.supplier WHERE ${connection.config.database}.supplier_01_04_2023.kode NOT LIKE 'has%' ORDER BY nama`,
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

const sendSupplierDetails = async (request, h) => {
  if (!connection || !connection.config.database) {
    return h.response({ message: 'No database connection established' }).code(503);
  }

  try {
    const { supplierName } = request.payload;

    // Step 1: Get the supplier code and name
    const getSupplierQuery = `SELECT DISTINCT kode, nama FROM ${connection.config.database}.supplier_01_04_2023 WHERE nama = '${supplierName}'`;
    const supplierResults = await executeQuery(getSupplierQuery);

    if (supplierResults.length === 0) {
      return h.response({ message: 'Supplier not found' }).code(404);
    }

    const supplierCode = supplierResults[0].kode;
    const foundSupplierName = supplierResults[0].nama;

    // Step 2: Get a list of items sold by that supplier
    const getItemsQuery = `SELECT DISTINCT kode FROM ${connection.config.database}.barang_01_04_2023 WHERE supplier = '${supplierCode}'`;
    const itemsResults = await executeQuery(getItemsQuery);

    // If there are no items
    if (itemsResults.length === 0) {
      return h.response({ message: 'No items found for the supplier' }).code(404);
    }

    // Step 3: Get the date and quantity for each item
    const itemDetails = [];
    for (const item of itemsResults) {
      const kode_barang = item.kode;
      const getDateQuantityQuery = `
        SELECT tanggal, kode_barang, SUM(qty) FROM ${connection.config.database}.itempenjualan_01_04_2023
        INNER JOIN ${connection.config.database}.penjualan_01_04_2023 ON itempenjualan_01_04_2023.kode = penjualan_01_04_2023.kode
        INNER JOIN ${connection.config.database}.barang_01_04_2023 ON itempenjualan_01_04_2023.kode_barang = barang_01_04_2023.kode
        WHERE barang_01_04_2023.supplier = '${supplierCode}' AND tanggal BETWEEN DATE_SUB('2023-04-01', INTERVAL 20 DAY) AND '2023-04-01'
        GROUP BY tanggal, kode_barang
        ORDER BY kode_barang, tanggal ASC`;
      const dateQuantityResults = await executeQuery(getDateQuantityQuery);

      itemDetails.push({ kode_barang, data: dateQuantityResults });
    }

    return h.response({ success: true, supplierCode, supplierName: foundSupplierName, data: itemDetails }).code(200);
  } catch (error) {
    console.error('Error executing queries:', error);
    return h.response({ message: 'Failed to retrieve supplier details' }).code(500);
  }
};

module.exports = {
  getRoot,
  connectToDatabase,
  getSupplierName,
  sendSupplierDetails
};
