import { GradeFactory } from '../GradeFactory';
import { Github } from '../tools/Github';
import { GradingTools } from '../tools/GradingTools';
import { DeliverableElevenPartOne } from './DeliverableElevenPartOne';
import { DeliverableElevenPartTwo } from './DeliverableElevenPartTwo';
import { DeliverableFive } from './DeliverableFive';
import { DeliverableFour } from './DeliverableFour';
import { DeliverableOne } from './DeliverableOne';
import { DeliverableSeven } from './DeliverableSeven';
import { DeliverableSix } from './DeliverableSix';
import { DeliverableThree } from './DeliverableThree';
import { DeliverableTwelve } from './DeliverableTwelve';
import { DeliverableTwo } from './DeliverableTwo';

import { Grader } from './Grader';

export class DeliverableGradeFactory implements GradeFactory {
  private tools: GradingTools = new GradingTools();
  private github: Github = new Github();
  deliverableOne: Grader = new DeliverableOne(this.tools);
  deliverableTwo: Grader = new DeliverableTwo(this.deliverableOne as DeliverableOne, this.github);
  deliverableThree: Grader = new DeliverableThree(this.tools, this.github);
  deliverableFour: Grader = new DeliverableFour(this.tools, this.github);
  deliverableFive: Grader = new DeliverableFive(this.tools);
  deliverableSix: Grader = new DeliverableSix(this.tools, this.github);
  deliverableSeven: Grader = new DeliverableSeven(this.tools, this.github);
  deliverableElevenPartOne: Grader = new DeliverableElevenPartOne();
  deliverableElevenPartTwo: Grader = new DeliverableElevenPartTwo();
  deliverableTwelve: Grader = new DeliverableTwelve();
}
