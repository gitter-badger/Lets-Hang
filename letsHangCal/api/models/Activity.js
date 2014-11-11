/**
* Activity.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	lat: {
  		type: 'float',
  		required: true
  	},
  	lng: {
  		type: 'float',
  		required: true
  	},
  	name: {
  		type: 'string',
  		required: true
  	},
  	creator: {
  		type: 'integer',
  		required: true
  	},
  	startDate: {
  		type: 'date',
  		required: true
  	},
  	endDate: {
  		type: 'date'
  	},
  	startTime: {
  		type: 'string',
  		required: true
  	},
  	endTime: {
  		type: 'string'
  	},
  	invited: {
  		type: 'array',
  		required: true
  	}
  }
};

