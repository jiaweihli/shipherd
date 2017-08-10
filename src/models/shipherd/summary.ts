import * as _ from 'lodash';
import * as moment from 'moment';
import { None, Option } from 'monapt';
import { default as Rematch } from 'rematch';
import * as when from 'when';

import { Attachment } from '../slack/attachment';
import { Build } from '../circleci/build';
import { BuildStatus } from './build_status';
import { Channel } from '../slack/channel';
import { CircleCIService } from '../../services/circleci_service';
import { Field } from '../slack/field';
import { Outcome } from '../circleci/outcome';
import { User as SlackUser } from '../slack/user';
import { SlackService } from '../../services/slack_service';
import { Status } from '../circleci/status';

class Summary {
  authorAvatarUrl: string;
  authorGithubUrl: string;
  authorName: string;
  breakageDuration: string;
  breakingAuthorName: string;
  breakingAuthorSlackUser: Option<SlackUser>;
  breakingBuildUrl: string;
  branchUrl: string;
  buildUrl: string;
  commitHash: string;
  commitSubject: string;
  commitUrl: string;
  isGreen: boolean;
  projectSlackChannelName: string;

  constructor(authorAvatarUrl: string, authorGithubUrl: string, authorName: string,
              branchUrl: string, breakageDuration: string, breakingAuthorName: string,
              breakingAuthorSlackUser: Option<SlackUser>, breakingBuildUrl: string,
              buildUrl: string, commitHash: string, commitSubject: string,
              commitUrl: string, isGreen: boolean, projectSlackChannelName: string) {
    this.authorAvatarUrl = authorAvatarUrl;
    this.authorGithubUrl = authorGithubUrl;
    this.authorName = authorName;
    this.breakageDuration = breakageDuration;
    this.breakingAuthorName = breakingAuthorName;
    this.breakingAuthorSlackUser = breakingAuthorSlackUser;
    this.breakingBuildUrl = breakingBuildUrl;
    this.branchUrl = branchUrl;
    this.buildUrl = buildUrl;
    this.commitHash = commitHash;
    this.commitSubject = commitSubject;
    this.commitUrl = commitUrl;
    this.isGreen = isGreen;
    this.projectSlackChannelName = projectSlackChannelName;
  }

  toAttachment(): Promise<Attachment> {
    return Promise.resolve(
      when(SlackService.INSTANCE.channelByName())
        .then((channelByName: {[name: string]: Channel}): Attachment => {
          const authorInfo: string = this.breakingAuthorSlackUser
            .map((user: SlackUser) => `<@${user.id}|${user.username}>`)
            .getOrElse(() => this.breakingAuthorName);

          const channelInfo: string = Option(channelByName[this.projectSlackChannelName])
            .map((channel: Channel) => `<#${channel.id}|${channel.name}>`)
            .getOrElse(() => this.projectSlackChannelName);

          const status: BuildStatus = Rematch(this.isGreen, [
            Rematch.Value(true, () => BuildStatus.FIXED),
            Rematch.Value(false, () => BuildStatus.BROKEN)
          ]);

          const blurb: string = Rematch(status, [
            Rematch.Value(BuildStatus.BROKEN, () => {
              /* tslint:disable:max-line-length */
              return `*<${this.branchUrl}|master> is <${this.buildUrl}|broken> since <${this.breakingBuildUrl}|${this.breakageDuration} ago>!* (${authorInfo} | ${channelInfo})`;
              /* tslint:enable:max-line-length */
            }),
            Rematch.Value(BuildStatus.FIXED, () => {
              /* tslint:disable:max-line-length */
              return `*<${this.branchUrl}|master> is <${this.buildUrl}|fixed> after ${this.breakageDuration}!* (${authorInfo} | ${channelInfo})`;
              /* tslint:enable:max-line-length */
            })
          ]);

          const color: string = Rematch(status, [
            Rematch.Value(BuildStatus.BROKEN, () => 'danger'),
            Rematch.Value(BuildStatus.FIXED, () => 'good')
          ]);

          const commitHashSliceLength: number = 10;

          return new Attachment(
            this.authorAvatarUrl,
            this.authorGithubUrl,
            this.authorName,
            color,
            [
              new Field(
                'Project',
                'leanplum-2',
                true
              ),
              new Field(
                'Commit',
                `<${this.commitUrl}|${this.commitHash.substr(0, commitHashSliceLength)}>`,
                true
              ),
              new Field(
                'Subject',
                this.commitSubject,
                false
              )
            ],
            ['pretext'],
            blurb
          );
        })
    );
  }

  toJSON(): Summary.JSON {
    return {
      author_avatar_url: this.authorAvatarUrl,
      author_github_url: this.authorGithubUrl,
      author_name: this.authorName,
      branch_url: this.branchUrl,
      breakage_duration: this.breakageDuration,
      breaking_author_name: this.breakingAuthorName,
      breaking_author_slack_user: this.breakingAuthorSlackUser
        .map((user: SlackUser) => user.toJSON())
        .getOrElse((): SlackUser.JSON | undefined => undefined),
      breaking_build_url: this.breakingBuildUrl,
      build_url: this.buildUrl,
      commit_hash: this.commitHash,
      commit_subject: this.commitSubject,
      commit_url: this.commitUrl,
      is_green: this.isGreen,
      project_slack_channel_name: this.projectSlackChannelName
    };
  }
}

namespace Summary {
  export function fromBuild(build: Build): Option<Promise<Summary>> {
    const isNeedsAttention: boolean = _([Status.FAILED, Status.FIXED]).includes(build.status);

    return Rematch(isNeedsAttention, [
      Rematch.Value(false, (): Option<Promise<Summary>> => None),
      Rematch.Value(true, (): Option<Promise<Summary>>  => {
        return Option(
          Promise.resolve(
            when.all([
              SlackService.INSTANCE.userByFullName(),
              CircleCIService.INSTANCE.originalFailingBuild(build)
            ])
              .then(([userByFullName, originalFailingBuild]: [{ [name: string]: SlackUser }, Build]): Summary => {
                return new Summary(
                  build.user.avatarUrl,
                  `https://github.com/${build.user.username}`,
                  build.commits[0].authorName,
                  `${build.vcsUrl}/commits`,
                  ((): string => {
                    const durationInSeconds: number =
                      moment(build.stopTime).unix() - moment(originalFailingBuild.stopTime).unix();

                    return moment.duration({seconds: durationInSeconds}).humanize();
                  })(),
                  originalFailingBuild.commits[0].authorName,
                  Option(userByFullName[originalFailingBuild.commits[0].authorName]),
                  originalFailingBuild.url,
                  build.url,
                  build.vcsRevision,
                  build.commits[0].subject,
                  build.commits[0].url,
                  build.outcome === Outcome.SUCCESS,
                  'front-end-eng'
                );
              })
          )
        );
      })
    ]);
  }

  export function parse(data: Summary.JSON): Summary {
    return new Summary(
      data.author_avatar_url,
      data.author_github_url,
      data.author_name,
      data.branch_url,
      data.breakage_duration,
      data.breaking_author_name,
      Option(data.breaking_author_slack_user)
        .map((userJSON: SlackUser.JSON) => SlackUser.parse(userJSON)),
      data.breaking_build_url,
      data.build_url,
      data.commit_hash,
      data.commit_subject,
      data.commit_url,
      data.is_green,
      data.project_slack_channel_name
    );
  }

  export interface JSON {
    author_avatar_url: string;
    author_github_url: string;
    author_name: string;
    branch_url: string;
    breakage_duration: string;
    breaking_author_name: string;
    breaking_author_slack_user: SlackUser.JSON | undefined;
    breaking_build_url: string;
    build_url: string;
    commit_hash: string;
    commit_subject: string;
    commit_url: string;
    is_green: boolean;
    project_slack_channel_name: string;
  }
}

export { Summary };
