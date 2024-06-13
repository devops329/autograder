import express from 'express';
import cors from 'cors';
import { GradeService } from './model/service/GradeService';
import { UserService } from './model/service/UserService';
import { DB } from './model/dao/mysql/Database';
import { Canvas } from './model/dao/canvas/Canvas';
import { config } from './config';

const app = express();

const db = new DB();
const canvas = new Canvas();
// Build services
const gradeService = new GradeService(db, canvas);
const userService = new UserService(db);

app.use(
  cors({
    origin: '*', // Allow requests from this origin
    methods: ['GET', 'POST'], // Allow only GET and POST requests
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  })
);

// Serve up the applications static content
app.use(express.static('public'));

// JSON body parsing using built-in middleware
app.use(express.json());

// Trust headers that are forwarded from the proxy so we can determine IP addresses
app.set('trust proxy', true);

// Router for service endpoints
const apiRouter = express.Router();
app.use(`/api`, apiRouter);

apiRouter.post('/login', async function (req, res) {
  const user = await userService.login();
  const submissions = await gradeService.getSubmissions('fakeNetId');
  res.send(JSON.stringify({ user, submissions }));
  // const redirectUrl = req.query.redirectUrl;
  // const casLoginUrl = 'https://cas.byu.edu/cas/login';
  // const serviceUrl = encodeURIComponent(`${config.app.hostname}/cas-callback?redirectUrl=${redirectUrl}`);
  // // Redirect the user to the CAS login page
  // res.redirect(`${casLoginUrl}?service=${serviceUrl}`);
});

app.get('/cas-callback', async (req, res) => {
  const ticket = req.query.ticket;
  const redirectUrl = req.query.redirectUrl;
  const casValidateUrl = `https://cas.byu.edu/serviceValidate?ticket=${ticket}&service=${encodeURIComponent(`${config.app.hostname}/cas-callback`)}`;

  try {
    const response = await fetch(casValidateUrl);
    const data = await response.text();
    console.log(data);

    // const user = await userService.login();
    // const submissions = await gradeService.getSubmissions('fakeNetId');

    res.redirect(redirectUrl as string);
  } catch (error) {
    console.error('CAS authentication failed', error);
    res.status(500).send('Authentication failed');
  }
});

apiRouter.post('/grade', async function (req, res) {
  const submissions = await gradeService.grade(req.body.assignmentPhase, 'fakeNetId');
  res.send(JSON.stringify(submissions));
});

apiRouter.post('/user', async function (req, res) {
  const user = await userService.getUser(req.body.netId);
  res.send(JSON.stringify(user));
});

apiRouter.post('/submissions', async function (req, res) {
  const submissions = await gradeService.getSubmissions(req.body.netId);
  res.send(JSON.stringify(submissions));
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  console.log(_req.url);
  res.sendFile('index.html', { root: 'public' });
});

const port = 3001;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
