import { User } from "../../model/domain/User";
import { Github } from "../tools/Github";
import { GradingTools } from "../tools/GradingTools";
import { Grader } from "./Grader";

interface DeliverableSixRubric {
  ecrEcsFargateDeployment: number;
  awsLoadBalancer: number;
  mySQLDatabase: number;
  githubActionWorkflow: number;
  frontendCallsOwnFunctionalService: number;
  comments: string;
}

export class DeliverableSix implements Grader {
  private tools: GradingTools;
  private github: Github;

  constructor(tools: GradingTools, github: Github) {
    this.tools = tools;
    this.github = github;
  }

  async grade(
    user: User,
    gradeAttemptId: string
  ): Promise<[number, DeliverableSixRubric]> {
    let score = 0;
    const rubric: DeliverableSixRubric = {
      ecrEcsFargateDeployment: 0,
      awsLoadBalancer: 0,
      mySQLDatabase: 0,
      githubActionWorkflow: 0,
      frontendCallsOwnFunctionalService: 0,
      comments: "",
    };

    // Read workflow file
    const workflowFile = await this.github.readWorkflowFile(
      user,
      "jwt-pizza-service",
      gradeAttemptId
    );
    if (!workflowFile) {
      rubric.comments += "Workflow file not found.\n";
      return [score, rubric];
    }
    const pushesToECS = workflowFile.includes("aws ecs update-service");
    const buildsAndPushesToECR =
      workflowFile.includes("docker build") &&
      workflowFile.includes("$ECR_REGISTRY/$ECR_REPOSITORY --push");

    if (pushesToECS && buildsAndPushesToECR) {
      // Run the workflow
      const success = await this.github.triggerWorkflowAndWaitForCompletion(
        user,
        "jwt-pizza-service",
        "ci.yml",
        gradeAttemptId
      );
      if (!success) {
        rubric.comments +=
          "Workflow could not be triggered. Did you add byucs329ta as a collaborator?\n";
        return [score, rubric];
      }

      // Check for successful run
      const runSuccess = await this.github.checkRecentRunSuccess(
        user,
        "jwt-pizza-service",
        "ci.yml",
        gradeAttemptId
      );
      if (runSuccess) {
        score += 50;
        rubric.ecrEcsFargateDeployment += 20;
        rubric.githubActionWorkflow += 30;
      } else {
        rubric.comments +=
          "Your GitHub Action workflow did not complete successfully.\n";
        return [score, rubric];
      }

      // Assumes that their service follows format 'pizza-service.hostname.tld'
      const hostname = this.tools.getHostnameFromWebsite(user.website);
      let serviceUrl = `pizza-service.${hostname}`;

      // Check if service deployed with load balancer
      const deployedWithELB = await this.checkServiceDeployedWithELB(
        serviceUrl,
        gradeAttemptId
      );
      if (deployedWithELB) {
        score += 20;
        rubric.awsLoadBalancer += 20;
      } else {
        rubric.comments +=
          "Your service is not deployed with a load balancer.\n";
        return [score, rubric];
      }

      // Get service url from frontend
      const envFile = await this.github.readGithubFile(
        user,
        "jwt-pizza",
        ".env.production",
        gradeAttemptId
      );
      if (!envFile) {
        rubric.comments += "Could not find .env.production in jwt-pizza.\n";
        return [score, rubric];
      }
      serviceUrl = await this.tools.getEnvVariable(
        envFile,
        "VITE_PIZZA_SERVICE_URL"
      );
      if (!serviceUrl) {
        rubric.comments +=
          "Could not find VITE_PIZZA_SERVICE_URL in jwt-pizza .env.production.\n";
        return [score, rubric];
      }
      const usingOwnService = !serviceUrl.includes("pizza-service.cs329.click");

      if (usingOwnService) {
        // Check that service is functional
        const serviceWorks = await this.tools.createUserAndLogin(
          serviceUrl,
          gradeAttemptId
        );
        if (serviceWorks) {
          score += 30;
          rubric.frontendCallsOwnFunctionalService += 10;
          rubric.mySQLDatabase += 20;
        } else {
          rubric.comments += "Your service does not work as expected.\n";
        }
      } else {
        rubric.comments += "You are using the default service URL.\n";
      }
    } else {
      rubric.comments +=
        "Your GitHub Action workflow does not build and push to ECR and deploy to ECS.\n";
    }

    return [score, rubric];
  }

  async checkServiceDeployedWithELB(
    serviceUrl: string,
    gradeAttemptId: string
  ): Promise<boolean> {
    const service = serviceUrl.replace("https://", "");
    const deployedWithELB = await this.tools.checkDNS(
      service,
      /elb\.amazonaws\.com/,
      gradeAttemptId
    );
    return deployedWithELB;
  }
}
