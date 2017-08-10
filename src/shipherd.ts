import * as _ from 'lodash';
import * as chalk from 'chalk';
import * as config from 'config';
import * as log from 'loglevel';
import * as moment from 'moment';
import { None, Option } from 'monapt';
import { default as Rematch } from 'rematch';

import { Attachment } from './models/slack/attachment';
import { Build } from './models/circleci/build';
import { BuildStatus } from './models/shipherd/build_status';
import { CircleCIService } from './services/circleci_service';
import { Outcome } from './models/circleci/outcome';
import { SlackService } from './services/slack_service';
import { StorageService } from './services/storage_service';
import { Summary } from './models/shipherd/summary';

const POLLING_INTERVAL_SECONDS: number = config.get<number>('updates.interval-seconds');
const SLACK_NOTIFICATION_CHANNEL: string = config.get<string>('slack.notification.channel');

log.setLevel(LogLevel.TRACE);

let lastParsedBuildId: Option<number> = None;

function notifySlack(): void {
  CircleCIService.INSTANCE.completedBuilds()
    .then((builds: Array<Build>): void => {
      log.info(`${moment().format('h:mm:ss a')} - Updating...`);

      const buildStatus: BuildStatus = Rematch.match(lastParsedBuildId.equals(Option(builds[0].id)), [
        Rematch.Value(true, () => BuildStatus.NO_UPDATE),
        Rematch.Value(false, () => {
          return Rematch(builds[0].outcome === Outcome.FAILED, [
            Rematch.Value(true, () => BuildStatus.BROKEN),
            Rematch.Value(false, () => {
              return Rematch(builds[1].outcome === Outcome.FAILED, [
                Rematch.Value(true, () => BuildStatus.FIXED),
                Rematch.Value(false, () => BuildStatus.STILL_PASSING)
              ]);
            })
          ]);
        })
      ]);

      const message: string = Rematch.match(buildStatus, [
        Rematch.Value(BuildStatus.BROKEN, () => chalk.bgRed('Build broken!')),
        Rematch.Value(BuildStatus.FIXED, () => chalk.bgGreen('Build fixed!')),
        Rematch.Value(BuildStatus.NO_UPDATE, () => chalk.yellow('No change.  Waiting...')),
        Rematch.Value(BuildStatus.STILL_PASSING, () => chalk.green('Build still passing.'))
      ]);

      log.info(message);

      if (buildStatus !== BuildStatus.NO_UPDATE) {
        Summary.fromBuild(builds[0])
          .map((summary: Promise<Summary>): Promise<Attachment> => {
            return summary
              .then((summary: Summary) => summary.toAttachment());
          })
          .foreach((attachment: Promise<Attachment>): void => {
            // :KLUDGE: Bug with tslint?
            /* tslint:disable-next-line:no-floating-promises */
            attachment
              .then((attachment: Attachment): void => {
                log.info(chalk.yellow('Posting to slack...'));

                SlackService.INSTANCE.post(SLACK_NOTIFICATION_CHANNEL, [attachment]);
              })
              .catch((error: Error): void => {
                log.info(chalk.red(`Tried to post to slack, failed: ${error.message}`));
              });
          });

        lastParsedBuildId = Option(builds[0].id);
        StorageService.INSTANCE.save(`${lastParsedBuildId.getOrElse(() => -1)}`);
      }
    })
    .catch((error: Error): void => {
      log.info(chalk.red(`Tried to pull builds from CircleCI, failed: ${error.message}`));
    });
}

StorageService.INSTANCE.load()
  .map((idString: string) => Number.parseInt(idString))
  .filterNot((id: number) => _.isNaN(id))
  .foreach((id: number) => {
    lastParsedBuildId = Option(id);
  });

((): void => {
  notifySlack();

  const millisecondsPerSecond: number = 1000;
  setInterval(notifySlack, POLLING_INTERVAL_SECONDS * millisecondsPerSecond);
})();
