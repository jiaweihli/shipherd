module.exports = {
  'circle': {
    'api': {
      'token': '817f70599a8c7e37ea4dc3952020c2aca6b04293',
      'url': 'https://circleci.com/api/v1.1/project/github/my-github-user/my-github-repo/tree/master'
    }
  },
  'slack': {
    'api': {
      'token': 'Go3c-H8vtBwepwcNC-r6u3glNIJLvWzChaj65SSq1v',
      'url': 'https://slack.com/api'
    },
    'notification': {
      'channel': '#my-github-repo-team'
    },
    'webhook': {
      'url': 'https://hooks.slack.com/services/6V5VO2RRY/1QLY9ZZSA/rZngnvLk7aefKpUjnQrZ91FT'
    }
  },
  'storage': {
    'path': './last_circle_build_parsed.txt'
  },
  'updates': {
    'interval-seconds': 60
  }
};
