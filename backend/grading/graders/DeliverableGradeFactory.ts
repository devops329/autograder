import { DB } from '../../model/dao/mysql/Database';
import { PizzaFactory } from '../../model/dao/pizzaFactory/PizzaFactory';
import { ChaosService } from '../../model/service/ChaosService';
import { PenTestService } from '../../model/service/PenTestService';
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
  private db: DB = new DB();
  private chaosService: ChaosService = new ChaosService(this.db, new PizzaFactory());
  private penTestService: PenTestService = new PenTestService(this.db);
  deliverableOne: Grader = new DeliverableOne(this.tools);
  deliverableTwo: Grader = new DeliverableTwo(this.github, this.tools);
  deliverableThree: Grader = new DeliverableThree(this.tools, this.github);
  deliverableFour: Grader = new DeliverableFour(this.tools, this.github);
  deliverableFive: Grader = new DeliverableFive(this.tools, this.github);
  deliverableSix: Grader = new DeliverableSix(this.tools, this.github);
  deliverableSeven: Grader = new DeliverableSeven(this.tools, this.github);
  deliverableElevenPartOne: Grader = new DeliverableElevenPartOne(this.chaosService);
  deliverableElevenPartTwo: Grader = new DeliverableElevenPartTwo(this.chaosService);
  deliverableTwelve: Grader = new DeliverableTwelve(this.penTestService);
}
