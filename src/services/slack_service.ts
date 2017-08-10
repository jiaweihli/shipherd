import * as _ from 'lodash';
import Axios, { AxiosResponse } from 'axios';
import * as config from 'config';
import * as when from 'when';

import { Attachment } from '../models/slack/attachment';
import { Channel } from '../models/slack/channel';
import { User } from '../models/slack/user';

class SlackService {
  static INSTANCE: SlackService = new SlackService(
    config.get<string>('slack.api.token'),
    config.get<string>('slack.api.url'),
    config.get<string>('slack.webhook.url')
  );

  apiToken: string;
  apiUrl: string;
  webhookUrl: string;

  protected constructor(apiToken: string, apiUrl: string, webhookUrl: string) {
    this.apiToken = apiToken;
    this.apiUrl = apiUrl;
    this.webhookUrl = webhookUrl;
  }

  channelByName(): Promise<{[name: string]: Channel}> {
    return Axios.get(
      `${this.apiUrl}/channels.list`, {
        params: {
          token: this.apiToken
        }
      })
      .then((response: AxiosResponse) => {
        const data: { channels: Array<Channel.JSON> } =
          response.data as { channels: Array<Channel.JSON> };

        const channels: Array<Channel> = _(data.channels)
          .map((channelJSON: Channel.JSON) => Channel.parse(channelJSON))
          .value();

        const channelByName: {[name: string]: Channel} = _(channels)
          .groupBy((channel: Channel) => channel.name)
          .mapValues((channels: Array<Channel>) => channels[0])
          .value();

        return when(channelByName);
      });
  }

  post(channelName: string, attachments: Array<Attachment>): void {
    Axios.post(this.webhookUrl, {
      attachments: attachments,
      channel: channelName
    });
  }

  userByFullName(): Promise<{[name: string]: User}> {
    return Axios.get(
      `${this.apiUrl}/users.list`, {
        params: {
          token: this.apiToken
        }
      })
      .then((response: AxiosResponse) => {
        const data: { members: Array<User.JSON> } = response.data as { members: Array<User.JSON> };

        const users: Array<User> = _(data.members)
          .map((userJSON: User.JSON) => User.parse(userJSON))
          .value();

        const userByFullName: {[name: string]: User} = _(users)
          .groupBy((user: User) => user.name)
          .mapValues((users: Array<User>) => users[0])
          .value();

        return when(userByFullName);
      });
  }
}

export { SlackService };
