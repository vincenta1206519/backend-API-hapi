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

module.exports = {
  getRoot,
  connectToDatabase,
  getSupplierName
};
