'use strict';
const Joi  = require('joi');
const Assert = require('assert');
const AnchorModel = require('../anchor/anchor-model');

class Role extends AnchorModel {

  static async create(document) {

    Assert.ok(document.name, 'Missing name');
    Assert.ok(document.permissions, 'Missing permissions');
    Assert.ok(document.filter, 'Missing filter');
    Assert.ok(document.userId, 'Missing userId');

    document = {
      name: document.name,
      permissions: document.permissions,
      filter: document.filter,
      userId: document.userId
    };

    const role = await this.insertOne(document);

    return role[0];

  }
}

Role.collectionName = 'roles';


Role.schema = Joi.object({
  _id: Joi.object(),
  name: Joi.string().required(),
  userId: Joi.string().required(),
  permissions: Joi.object({
    placeholder:Joi.string()
  }),
  filter: Joi.array().items(Joi.object({
    placeholder: Joi.string()
  })),
  createdAt: Joi.date(),
  updatedAt: Joi.date()
});


Role.payload = Joi.object({
  name: Joi.string().required(),
  userId: Joi.string().required(),
  permissions: Joi.object({
    placeholder: Joi.string()
  }),
  filter: Joi.array().items(Joi.object({
    placeholder: Joi.string()
  }))

});

Role.indexes = [
  { key: { name: 1 }  }];


module.exports = Role;
