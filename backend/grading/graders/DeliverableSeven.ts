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
  async grade(user: User, gradeAttemptId: string): Promise<[number | string, DeliverableSevenRubric]> {
    let points = 0;
    let rubric: DeliverableSevenRubric = {
      versionArchiveInS3: 0,
      githubReleases: 0,
      continuousStagingDeployment: 0,
      triggeredProductionDeployment: 0,
      comments: '',
    };
    const github = new Github(user, 'jwt-pizza');
    const gradingTools = new GradingTools();
    // Read ci file
    const ci = await github.readWorkflowFile();
    // Get most recent release
    const oldReleaseJson = await github.getMostRecentRelease();
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
      await github.triggerWorkflowAndWaitForCompletion('ci.yml');

      // Check for successful run
      const stagingRunSuccess = await github.checkRecentRunSuccess('ci.yml');
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
        const stagingReleaseJson = await github.getMostRecentRelease();
        if (stagingReleaseJson.id !== oldReleaseJson.id) {
          points += 10;
          rubric.githubReleases += 10;
          // Fetch version number from release
          const stagingReleaseVersion = stagingReleaseJson.name.match(/\d{8}\.\d{6}/)?.[0];
          // Fetch version number from staging site
          const siteParts = user.website.split('.');
          const hostname = siteParts.slice(-2).join('.');
          const stagingSiteVersion = (await gradingTools.readPageJson(`stage-pizza.${hostname}/version.json`)).version;
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
          await github.triggerWorkflowAndWaitForCompletion('release.yml', inputs);
          // Need to wait for completion
          const productionRunSuccess = await github.checkRecentRunSuccess('release.yml');
          if (productionRunSuccess) {
            points += 10;
            rubric.triggeredProductionDeployment += 10;

            const productionReleaseJson = await github.getMostRecentRelease();

            if (productionReleaseJson.id !== stagingReleaseJson.id) {
              points += 10;
              rubric.githubReleases += 10;
              // Fetch version number from release
              const productionReleaseVersion = productionReleaseJson.name.match(/\d{8}\.\d{6}/)?.[0];
              // Check production site for valid version (matches release)
              const productionSiteVersion = (await gradingTools.readPageJson(`${user.website}/version.json`)).version;
              console.log('Production site version:', productionSiteVersion);
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
