import { Canvas } from '../model/dao/canvas/Canvas';
import { DB } from '../model/dao/mysql/Database';
import { GradeService } from '../model/service/GradeService';
import { MockGradeFactory } from './mock/mockGradeFactory';

const db = new DB();
const canvas = new Canvas();
const mockGradeFactory = new MockGradeFactory();
const gradeService = new GradeService(db, canvas, mockGradeFactory);
