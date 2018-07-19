'use strict';
const Auth = require('../../server/auth');
const Code = require('code');
const Hapi = require('hapi');
const Fixtures = require('./fixtures');
const Lab = require('lab');
const Manifest = require('../../manifest');
const lab = exports.lab = Lab.script();
const User = require('../../server/models/user');
const Session = require('../../server/models/session');

let server;

lab.before(async () => {

  server = Hapi.Server();

  const plugins = Manifest.get('/register/plugins')
    .filter((entry) => Auth.dependencies.includes(entry.plugin))
    .map((entry) => {

      entry.plugin = require(entry.plugin);

      return entry;

    });

  plugins.push(Auth);
  plugins.push({
    plugin: require('../../server/anchor/hapi-anchor-model'),
    options: Manifest.get('/register/plugins')[0].options
  });

  await server.register(plugins);
  await server.start();
  await Fixtures.Db.removeAllData();

  server.route({
    method: 'GET',
    path: '/',
    options: {
      auth: false
    },
    handler: async function (request, h) {

      try {
        await request.server.auth.test('simple', request);
        return { valid: true };
      }

      catch (err) {
        return { valid: false };
      }
    }
  });
});

lab.after(async () => {

  await Fixtures.Db.removeAllData();
  await server.stop();
});

lab.experiment('Simple Auth Strategy', () => {

  lab.test('it returns as invalid without authentication provided', async () => {

    const request = {
      method: 'GET',
      url: '/'
    };

    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);

    Code.expect(response.result.valid).to.equal(false);
  });


  lab.test('it returns as invalid when the session query misses', async () => {

    const sessionId = '000000000000000000000001';
    const sessionKey = '01010101-0101-0101-0101-010101010101';
    const request = {
      method: 'GET',
      url: '/',
      headers: {
        authorization: Fixtures.Creds.authHeader(sessionId, sessionKey)
      }
    };

    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.valid).to.equal(false);

  });


  lab.test('it returns as invalid when the user query misses', async () => {

    const session = await Session.create({
      userId: 'ren',
      ip: 'ip',
      userAgent: 'userAgent'
    });
    const request = {
      method: 'GET',
      url: '/',
      headers: {
        authorization: Fixtures.Creds.authHeader(session._id, session.key)
      }
    };
    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.valid).to.equal(false);


  });

  lab.test('it returns as invalid because the user is inactive', async () => {

    const { user } = await Fixtures.Creds.createUser('Ren', '321!abc', 'ren@stimpy.show', 'Stimpy');


    const session = await Session.create({
      userId: `${user._id}`,
      ip: 'ip',
      userAgent: 'userAgent'
    });

    const update = {
      $set: {
        isActive: false
      }
    };

    await User.findByIdAndUpdate(user.id, update);

    const request = {
      method: 'GET',
      url: '/',
      headers: {
        authorization: Fixtures.Creds.authHeader(session._id, session.key)

      }
    };
    const response = await server.inject(request);

    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.valid).to.equal(false);
  });


  lab.test('it returns as valid because the user active and the session is created', async () => {

    const { session } = await Fixtures.Creds.createUser('Ren', '321!abc', 'ren@stimpy.show', 'Stimpy');

    const request = {
      method: 'GET',
      url: '/',
      headers: {
        authorization: Fixtures.Creds.authHeader(session._id.toString(), session.key)
      }
    };

    const response = await server.inject(request);


    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.valid).to.equal(true);

  });
});
