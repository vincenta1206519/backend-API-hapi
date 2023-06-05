const mysql = require('mysql');

let connection; // Declare a global variable to hold the MySQL connection

const getRoot = (request, h) => {
  return h.response({ message: 'OK' }).type('application/json');;
};

const connectToDatabase = (request, h) => {
  //request variables from the front end
  const { username, password, host, port, database } = request.payload;

  return new Promise((resolve, reject) => {
    // Create MysQL database connection
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

      //Response message with the provided values is the connection was successful
      const message = `Connected to the database successfully: username=${username}, password=${password}, host=${host}, port=${port}, database=${database}`;

      resolve({ success: true, message });
    });
  });
};

const listDatabases = (request, h) => {
  return new Promise((resolve, reject) => {
    // Get the list of databases
    connection.query('SHOW DATABASES', (error, results) => {
      if (error) {
        console.error('Failed to get the list of databases:', error);
        reject(new Error('Failed to get the list of databases'));
        return;
      }

      // Process the query results
      const databases = results.map((row) => row['Database']);

      // Build the response with the list of databases
      resolve({ success: true, databases });
    });
  });
};


const getDatabaseData = (request, h) => {
  const { tableName } = request.params;
  const database = connection.config.database; // Get the database name from the connection configuration

  return new Promise((resolve, reject) => {
    // Perform get all query data  with the specified table and database
    connection.query(`SELECT * FROM ${database}.${tableName} LIMIT 5`, (error, results) => {
      if (error) {
        console.error('Failed to execute the SELECT query:', error);
        reject(new Error('Failed to execute the SELECT query'));
        return;
      }

      // Process and output of the query results
      console.log('Query results:', results);

      // Build the response with the query results
      resolve({ success: true, data: results });
    });
  });
};

const getSupplierName = (request, h) => {
  const database = connection.config.database; // Get the database name from the connection configuration


  return new Promise((resolve, reject) => {
    // Perform get all query data  with the specified table from database 
    connection.query(`SELECT DISTINCT nama FROM ${database}.supplier_31_12_2022  INNER JOIN ${database}.pembelian_31_12_2022 ON ${database}.supplier_31_12_2022.kode = ${database}.pembelian_31_12_2022.supplier WHERE ${database}.supplier_31_12_2022.kode not like 'has%' order by nama`, (error, results) => {

      if (error) {
        console.error('Failed to execute the SELECT query:', error);
        reject(new Error('Failed to execute the SELECT query'));
        return;
      }

      //Process and output of the query results
      console.log('Query results:', results);

      // Build the response with the query results
      resolve({ success: true, data: results });
    });
  });
};


//create a handler when the user click the text it will send then the data of the supplier will be shown in the table
const getSupplierData = (request, h) => {
  const database = connection.config.database; // Get the database name from the connection configuration


  return new Promise((resolve, reject) => {
    // Perform get all query data  with the specified supplier data from database
    connection.query(`SELECT * FROM ${database}.supplier_31_12_2022 WHERE nama = 'PT. ABBOTT INDONESIA';`, (error, results) => {
      if (error) {
        console.error('Failed to see the supplier data:', error);
        reject(new Error('Failed to see the supplier data'));
        return;
      }

      //Process and output of the query results
      console.log('Query results:', results);

      // Build the response with the query results
      resolve({ success: true, data: results });
    });
  });
};

module.exports = {
  getRoot,
  connectToDatabase,
  listDatabases,
  getDatabaseData,
  getSupplierName,
};
