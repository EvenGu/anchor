'use strict';
const Joi = require('joi');
const Assert = require('assert');
const AnchorModel = require('../anchor/anchor-model');
const Hoek = require('hoek');

class Backup extends AnchorModel {

  static async create(document){

    Assert.ok(document.filename, 'Missing filename');

    const backup = await this.insertOne(document);

    return backup[0];
  }
}


Backup.collectionName = 'backups';


Backup.schema = Joi.object({
  _id: Joi.object(),
  filename: Joi.string().required(),
  local: Joi.boolean(),
  s3: Joi.boolean(),
  createdAt: Joi.date(),
  updatedAt: Joi.date()
});

Backup.payload = Joi.object({
  filename: Joi.string().required(),
  data: Joi.object().required()
});

Backup.routes = Hoek.applyToDefaults(AnchorModel.routes, {
  create: {
    disabled: false,
    payload: Backup.payload
  },
  update: {
    disabled: false,
    payload: Backup.payload
  },
  delete: {
    disabled: false,
    payload: Backup.payload
  }
});


Backup.indexes = [
  { key: { filename: 1 } }
];


module.exports = Backup;
