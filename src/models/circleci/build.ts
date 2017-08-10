import * as _ from 'lodash';
import * as moment from 'moment';

import { Commit } from './commit';
import { Outcome } from './outcome';
import { Status } from './status';
import { User } from './user';

class Build {
  commits: Array<Commit>;
  id: number;
  url: string;
  outcome: Outcome;
  status: Status;
  stopTime: moment.Moment;
  user: User;
  vcsRevision: string;
  vcsUrl: string;

  constructor(commits: Array<Commit>, id: number, url: string, outcome: Outcome, status: Status,
              stopTime: moment.Moment, user: User, vcsRevision: string, vcsUrl: string) {
    this.commits = commits;
    this.id = id;
    this.url = url;
    this.outcome = outcome;
    this.status = status;
    this.stopTime = stopTime;
    this.user = user;
    this.vcsRevision = vcsRevision;
    this.vcsUrl = vcsUrl;
  }

  toJSON(): Build.JSON {
    return {
      all_commit_details: _(this.commits).map((commit: Commit) => commit.toJSON()).value(),
      build_num: this.id,
      build_url: this.url,
      outcome: this.outcome.toJSON(),
      status: this.status.toJSON(),
      stop_time: this.stopTime.toISOString(),
      user: this.user.toJSON(),
      vcs_revision: this.vcsRevision,
      vcs_url: this.vcsUrl
    };
  }
}

namespace Build {
  export function parse(data: Build.JSON): Build {
    return new Build(
      _(data.all_commit_details)
        .map((commitJson: Commit.JSON) => Commit.parse(commitJson))
        .value(),
      data.build_num,
      data.build_url,
      Outcome.parse(data.outcome),
      Status.parse(data.status),
      moment(data.stop_time),
      User.parse(data.user),
      data.vcs_revision,
      data.vcs_url
    );
  }

  export interface JSON {
    all_commit_details: Array<Commit.JSON>;
    build_num: number;
    build_url: string;
    outcome: Outcome.JSON;
    status: Status.JSON;
    stop_time: string;
    user: User.JSON;
    vcs_revision: string;
    vcs_url: string;
  }
}

export { Build };
