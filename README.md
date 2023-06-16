# Features :
- POST Connect to database
- GET supplier names
- POST supplier data
- GET prediction results


# How to run this back-end service :

## A. Locally

1. First fork this project

2. Then open the folders

3. Run npm install to check & update your dependencies

4. Then run npm run start / npm run start-dev if you want to use nodemon


For this endpoint *'/api/get-supplier-name'* you need to use our database table data. 

Otherwise, it will send an **error message**.

## B. Deploying to Google Cloud Compute Engine

1. First create the instance

2. Create firewall rules that allows port 8080 to work

3. SSH directly to the instance

4. Run a git clone to the repository

5. Install all the needed dependencies

```
dependencies: 
    "@hapi/hapi": "^21.3.2",
    "axios": "^1.4.0",
    "mysql": "^2.18.1",
    "nodemon": "^2.0.22",
```
```
engines: 
    "node": "18.15.0",
    "npm": "9.5.0"
```
6. Open server.js file using this command :

```
nano backend-API-hapi/src/server.js
```

7. Change 'localhost' to '0.0.0.0' to allow the server to listen to all network interface

8. Save the changes

9. In the terminal type :
``` 
run npm install 
```

# **Consider using nvm if npm and node.js version can't run the back-end code**

1. Run:
```
npm run start
```

2. Open your instance message status with this endpoint **http://%7Byour-instance-external-ip%7D:8080/**

3. Consider installing **pm2** to keep the back-end server running by writing ```npm install pm2``` then start with 
```
pm2 start src/server.js --name {your-app-name}
```

4. Install **Node.js** and **npm** using a version manager like NVM (Node Version Manager). To install NVM, run the following commands:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
source ~/.bashrc
```
5. Verify that NVM is installed correctly by running:

```
nvm --version
```
6. Use NVM to install the specified Node.js version (18.15.0) by running:

```
nvm install 18.15.0
```
7. After Node.js is installed, switch to the specified version by running:
```
nvm use 18.15.0
```
8. Verify that the correct Node.js version is active by running:


node --version

9. Next, update npm to the specified version (9.5.0) by running:

```
npm install -g npm@9.5.0
```

10. Verify that the correct npm version is installed by running:

```
npm --version
```
11. Once you have the correct versions of Node.js and npm installed, you can proceed with your project setup and dependencies. Run the following command in the project directory to install the dependencies specified in your package.json file:

```
npm install
```
12. Consider using PM2 to set the instance to keep running after closing SSH
