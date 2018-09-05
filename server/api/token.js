'use strict';
const Boom = require('boom');
const Joi = require('joi');
const Token = require('../models/token');

const register = function (server,serverOptions) {

  server.route({
    method:'POST',
    path: '/api/tokens',
    options: {
      tags: ['api','tokens'],
      description: 'Create a new API token',
      auth: {
        strategies: ['simple','session','token']
      },
      pre: [{
        assign: 'permissions',
        method: async function (request,h) {

          const result = await server.inject({
            method: 'GET',
            url: '/api/permissions/available',
            headers: request.headers
          });

          return result.result;
        }
      }, {
        assign: 'schema',
        method: function (request,h) {

          return Joi.object().keys(request.pre.permissions.reduce((a,v) => {

            a[v.key] = Joi.boolean();
            return a;
          }, {}));
        }
      },
      {
        assign: 'validate',
        method: function (request,h) {

          const { error } = Joi.validate(request.payload.permissions, request.pre.schema);
          if (error) {
            throw Boom.badRequest(error.message);
          }
          return h.continue;
        }

      }]
    },
    handler: async function (request,h) {

      request.payload.userId = request.auth.credentials.user._id.toString();

      return await Token.create(request.payload);
    }
  });

  server.route({
    method: 'PUT',
    path: '/api/tokens/{id}/active',
    options: {
      tags: ['api','tokens'],
      description: 'Set token to active',
      auth: {
        strategies: ['simple','session','token']
      }
    },
    handler: async function (request,h) {

      const id = request.params.id;
      return await Token.findByIdAndUpdate(id,{ $set: { isActive: true } });
    }
  });

  server.route({
    method:'PUT',
    path:'/api/tokens/{id}/inactive',
    options: {
      tags: ['api','tokens'],
      description: 'Set token to inactive',
      auth: {
        strategies: ['simple','session','token']
      }
    },
    handler: async function (request,h) {

      const id = request.params.id;
      return await Token.findByIdAndUpdate(id,{ $set: { isActive: false } });
    }
  });
};

module.exports = {
  name: 'api-token',
  dependencies: [
    'auth',
    'hapi-auth-basic',
    'hapi-auth-cookie',
    'hapi-auth-jwt2',
    'hapi-anchor-model',
    'hapi-remote-address'
  ],
  register
};
