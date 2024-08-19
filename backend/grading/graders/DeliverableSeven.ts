import { User } from '../../model/domain/User';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { Grader } from './Grader';

interface DeliverableSevenRubric {
  versionArchiveInS3: number;
  githubReleases: number;
  continuousStagingDeployment: number;
  triggeredProductionDeployment: number;
  comments: string;
}
export class DeliverableSeven implements Grader {
  private tools: GradingTools;
  private github: Github;

  constructor(tools: GradingTools, github: Github) {
    this.tools = tools;
    this.github = github;
  }

  async grade(user: User, gradeAttemptId: string): Promise<[number | string, DeliverableSevenRubric]> {
    let points = 0;
    let rubric: DeliverableSevenRubric = {
      versionArchiveInS3: 0,
      githubReleases: 0,
      continuousStagingDeployment: 0,
      triggeredProductionDeployment: 0,
      comments: '',
    };

    // Read ci file
    const ci = await this.github.readWorkflowFile(user, 'jwt-pizza', gradeAttemptId);
    // Get most recent release
    const oldReleaseJson = await this.github.getMostRecentRelease(user, 'jwt-pizza', gradeAttemptId);
    // Check it has 'push:'
    const onPush = ci.includes('push:');
    // Check that it copies to the version directory in s3
    const regex = /aws s3 cp dist s3:\/\/[^\/]+\/\$version/;
    const pushesVersionToS3 = regex.test(ci);
    if (pushesVersionToS3) {
      points += 10;
      rubric.versionArchiveInS3 += 10;

      // Trigger it and wait for completion
      // Run the workflow
      await this.github.triggerWorkflowAndWaitForCompletion(user, 'jwt-pizza', 'ci.yml', gradeAttemptId);

      // Check for successful run
      const stagingRunSuccess = await this.github.checkRecentRunSuccess(user, 'jwt-pizza', 'ci.yml', gradeAttemptId);
      if (stagingRunSuccess) {
        points += 10;
        rubric.versionArchiveInS3 += 10;

        if (onPush) {
          points += 10;
          rubric.continuousStagingDeployment += 10;
        } else {
          rubric.comments += 'Staging workflow does not run on push.\n';
        }
        // Check for new release created in github
        const stagingReleaseJson = await this.github.getMostRecentRelease(user, 'jwt-pizza', gradeAttemptId);
        if (stagingReleaseJson.id !== oldReleaseJson.id) {
          points += 10;
          rubric.githubReleases += 10;
          // Fetch version number from release
          const stagingReleaseVersion = stagingReleaseJson.name.match(/\d{8}\.\d{6}/)?.[0];
          // Fetch version number from staging site
          const hostname = this.tools.getHostnameFromWebsite(user.website);
          const stagingSiteVersion = (await this.tools.readPageJson(`stage-pizza.${hostname}/version.json`)).version;
          // Check they match
          if (stagingReleaseVersion === stagingSiteVersion) {
            points += 20;
            rubric.continuousStagingDeployment += 20;
          } else {
            rubric.comments += 'Staging release version does not match staging site version';
          }
          // Take version number and trigger production release
          const inputs = {
            version: stagingReleaseVersion,
            description: 'Autograder Production Release',
          };
          await this.github.triggerWorkflowAndWaitForCompletion(user, 'jwt-pizza', 'release.yml', gradeAttemptId, inputs);
          // Need to wait for completion
          const productionRunSuccess = await this.github.checkRecentRunSuccess(user, 'jwt-pizza', 'release.yml', gradeAttemptId);
          if (productionRunSuccess) {
            points += 10;
            rubric.triggeredProductionDeployment += 10;

            const productionReleaseJson = await this.github.getMostRecentRelease(user, 'jwt-pizza', gradeAttemptId);

            if (productionReleaseJson.id !== stagingReleaseJson.id) {
              points += 10;
              rubric.githubReleases += 10;
              // Fetch version number from release
              const productionReleaseVersion = productionReleaseJson.name.match(/\d{8}\.\d{6}/)?.[0];
              // Check production site for valid version (matches release)
              const productionSiteVersion = (await this.tools.readPageJson(`${user.website}/version.json`)).version;
              if (productionReleaseVersion === productionSiteVersion) {
                points += 20;
                rubric.triggeredProductionDeployment += 20;
              } else {
                rubric.comments += 'Production release version does not match production site version';
              }
            } else {
              rubric.comments += 'Production release not created.\n';
            }
          } else {
            rubric.comments += 'Production deployment failed.\n';
          }
        } else {
          rubric.comments += 'Staging deployment did not create a new release.\n';
        }
      } else {
        rubric.comments += 'Staging deployment failed.\n';
      }
    } else {
      rubric.comments += 'Workflow does not push latest version to S3.\n';
    }

    return [points, rubric];
  }
}
