module.exports = {
  'circle': {
    'api': {
      'token': undefined, // @type string
      'url': undefined // @type string
    }
  },
  'slack': {
    'api': {
      'token': undefined, // @type string
      'url': undefined // @type string
    },
    'notification': {
      'channel': undefined // @type string
    },
    'webhook': {
      'url': undefined // @type string
    }
  },
  'storage': {
    'path': './last_circle_build_parsed.txt' // @type string
  },
  'updates': {
    'interval-seconds': 60 // @type number
  }
};
