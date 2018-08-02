'use strict';
const Backup = require('../models/backup');
const Fs = require('fs');
const Path = require('path');


const register = function (server, serverOptions) {

  server.route({
    method: 'POST',
    path: '/api/backup',
    options: {
      auth: false
    },
    handler: async function (request, h) {

      return await createBackup();
    }
  });


  server.route({
    method: 'POST',
    path: '/api/backup/internal',
    options: {
      auth: false,
      isInternal: true
    },
    handler: async function (request, h) {

      return await createBackup();
    }
  });


  server.route({
    method: 'GET',
    path: '/api/backup/{id}/data',
    options: {
      auth: false
    },
    handler: async function (request, h) {

      const backup = await Backup.findById(request.params.id);
      const path = Path.join(__dirname,'../backups/',backup.filename);

      backup.data = await new Promise((resolve, reject) => {

        Fs.readFile(path, 'utf8', (err, data) => {

          if (err) {
            return reject(err);
          }
          resolve(JSON.parse(data));
        });
      });

      return backup;
    }
  });

  server.route({
    method: 'POST',
    path: '/api/backup/data',
    options: {
      auth: false,
      validate: {
        payload: Backup.payload
      }
    },
    handler: async function (request, h) {

      const filename = request.payload.filename + '.json';
      const path = Path.join(__dirname,'../backups/', filename);

      await writeFile(path, request.payload.data);

      return await Backup.create({
        filename,
        local: true
      });
    }
  });

  const createBackup = async () => {

    const data = {};
    for (const collectionName in  server.plugins['hapi-anchor-model'].models) {
      data[collectionName] = await server.plugins['hapi-anchor-model'].models[collectionName].find({});
    }

    const filename = new Date().toISOString() + '.json';
    const path = Path.join(__dirname,'../backups/',filename);

    await writeFile(path, data);

    return await Backup.create({
      filename,
      local: true
    });

  };

  const writeFile = (path, data) => {

    return new Promise((resolve, reject) => {

      Fs.writeFile(path,JSON.stringify(data), (err) => {

        if (err) {
          return reject(err);
        }
        resolve(true);
      });
    });

  };
};

module.exports = {
  name: 'api-backups',
  dependencies: [
    'hapi-auth-basic',
    'hapi-auth-cookie',
    'hapi-anchor-model',
    'hapi-remote-address'
  ],
  register
};
