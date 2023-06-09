const Hapi = require('@hapi/hapi');
const routes = require('./routes');

const init = async () => {
  const server = Hapi.server({
    port: port,
    host: '0.0.0.0',
  });

  await server.register(require('hapi-boom-decorators'));
  await server.register(require('@hapi/inert'));

  server.route(routes);

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
  process.exit(1);
});

init();
