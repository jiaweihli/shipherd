import * as _ from 'lodash';
import Axios, { AxiosResponse } from 'axios';
import * as config from 'config';

import { Build } from '../models/circleci/build';

class CircleCIService {
  static INSTANCE: CircleCIService = new CircleCIService(
    config.get<string>('circle.api.token'),
    config.get<string>('circle.api.url')
  );

  apiToken: string;
  apiUrl: string;

  constructor(apiToken: string, apiUrl: string) {
    this.apiToken = apiToken;
    this.apiUrl = apiUrl;
  }

  completedBuilds(): Promise<Array<Build>> {
    return Axios.get(this.apiUrl, {
      params: {
        'circle-token': this.apiToken,
        filter: 'completed',
        limit: 100
      }
    })
      .then((response: AxiosResponse): Array<Build> => {
        return _(response.data)
          .map((buildJSON: Build.JSON) => Build.parse(buildJSON))
          .value();
      });
  }

  originalFailingBuild(build: Build): Promise<Build> {
    const previousSuccessfulBuild: Promise<Build> = Axios.get(this.apiUrl, {
      params: {
        'circle-token': this.apiToken,
        filter: 'successful',
        limit: 100
      }
    })
      .then((response: AxiosResponse) => {
        const successfulBuilds: Array<Build> = _(response.data)
          .map((buildJSON: Build.JSON) => Build.parse(buildJSON))
          .value();

        return _(successfulBuilds).find((successfulBuild: Build) => {
          return successfulBuild.id < build.id;
        });
      });

    return previousSuccessfulBuild
      .then((previousSuccessfulBuild: Build) => {
        return Axios.get(this.apiUrl, {
          params: {
            'circle-token': this.apiToken,
            filter: 'failed',
            limit: 100
          }
        })
          .then((response: AxiosResponse) => {
            const failingBuilds: Array<Build> = _(response.data)
              .map((buildJSON: Build.JSON) => Build.parse(buildJSON))
              .value();

            return _(failingBuilds).findLast((failingBuild: Build) => {
              return failingBuild.id > previousSuccessfulBuild.id;
            });
          });
      });
  }
}

export { CircleCIService };
