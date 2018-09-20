'use strict';
const Joi = require('joi');
const Assert = require('assert');
const AnchorModel = require('../anchor/anchor-model');
const Hoek = require('hoek');

class Feedback extends AnchorModel {

  static async create(document){

    Assert.ok(document.title,'Missing title');
    Assert.ok(document.description, 'Missing description');
    Assert.ok(document.userId,'Missing userid');

    document =  {
      title: document.title,
      description: document.description,
      userId: document.userId,
      resolved: false,
      comments: []
    };

    const feedback =  await this.insertOne(document);

    return feedback[0];
  }
}

Feedback.collectionName = 'feedbacks';

Feedback.schema = Joi.object({
  _id: Joi.object(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  userId: Joi.string().required(),
  resolved: Joi.boolean().default(false),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
  comments: Joi.array().items(Joi.object({
    message: Joi.string().required(),
    userId: Joi.string().required(),
    createdAt: Joi.date().required()
  }))
});

Feedback.payload = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required()
});

Feedback.routes = Hoek.applyToDefaults(AnchorModel.routes, {
  create: {
    payload: Feedback.payload,
    disabled: true
  },
  update: {
    payload: Feedback.payload,
    disabled: true
  },
  getAll: {
    disabled: true
  },
  getId: {
    disabled: true
  },
  delete: {
    disabled: true
  }
});

Feedback.lookups = [{
  from: require('./user'),
  local: 'userId',
  foreign: '_id',
  as: 'user',
  one: true
}];

Feedback.sidebar = {
  name: 'Feedback',
  disabled: true
};

Feedback.columns = [
  {
    headerName: 'Feedback',
    children: [
      { headerName: 'Id', field: '_id' },
      { headerName: 'Title', field: 'title' },
      { headerName: 'Description', field: 'description' },
      { headerName: 'Resolved', field: 'resolved' },
      { headerName: 'Created At', field: 'createdAt', render: (x) => new Date(x).toLocaleString() },
      { headerName: 'Updated At', field: 'updatedAt', render: (x) => new Date(x).toLocaleString() }
    ]
  },
  {
    headerName: 'User',
    children: [
      { headerName: 'Name', field: 'user.name' },
      { headerName: 'Username', field: 'user.username' },
      { headerName: 'Email', field: 'user.email' }
    ]
  }
];

Feedback.indexes = [
  { key: { title: 1 } }
];

module.exports = Feedback;
