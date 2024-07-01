import express, { NextFunction } from 'express';
import { GradeService } from './model/service/GradeService';
import { UserService } from './model/service/UserService';
import { DB } from './model/dao/mysql/Database';
import { Canvas } from './model/dao/canvas/Canvas';
import { config } from './config';
import cookieParser from 'cookie-parser';
import { PizzaFactory } from './model/dao/pizzaFactory/PizzaFactory';
import { ChaosService } from './model/service/ChaosService';

const app = express();

const db = new DB();
const canvas = new Canvas();
const pizzaFactory = new PizzaFactory();
// Build services
const gradeService = new GradeService(db, canvas);
const userService = new UserService(db, pizzaFactory, canvas);
const chaosService = new ChaosService(db, pizzaFactory);

// every 10 minutes, check for chaos to be triggered
setInterval(async () => {
  await chaosService.checkForChaosToBeTriggered();
}, 600000);

// Serve up the applications static content
app.use(express.static('public'));

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Trust headers that are forwarded from the proxy so we can determine IP addresses
app.set('trust proxy', true);

// Router for service endpoints
const apiRouter = express.Router();
app.use(`/api`, apiRouter);

const AUTH_COOKIE_NAME = 'token';

apiRouter.get('/login', async function (req, res) {
  const netid = req.body.netId ?? 'fakeNetId';
  const token = await userService.login(netid);
  res.cookie(AUTH_COOKIE_NAME, token, { secure: true, sameSite: 'none' });
  const redirectUrl = req.query.redirectUrl;
  res.redirect(redirectUrl as string);
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

apiRouter.get('/report', async (req, res) => {
  const apiKey = req.query.apiKey as string;
  const fixCode = req.query.fixCode as string;
  if (!apiKey || !fixCode) {
    res.status(400).send({ msg: 'Missing required parameters' });
    return;
  }
  const chaosResolved = await chaosService.resolveChaos(apiKey, fixCode);
  if (chaosResolved) {
    res.send({ msg: 'Chaos resolved' });
  } else {
    res.status(500).send({ msg: 'Failed to resolve chaos' });
  }
});

// Secure API routes that require an AuthToken

const secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

// If netid matches the token, or user is admin, proceed
secureApiRouter.use(async (req, res, next) => {
  const authToken = req.cookies[AUTH_COOKIE_NAME];
  if (!authToken) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }
  const netIdFromRequest = req.body.netId;
  const netIdFromToken = await db.getNetIdByToken(authToken);
  const user = await db.getUser(netIdFromToken);
  if (user!.isAdmin || netIdFromRequest === netIdFromToken) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});

// Get logged in user's information
secureApiRouter.post('/user', async function (req, res) {
  let netId = req.body.netId ?? (await db.getNetIdByToken(req.cookies[AUTH_COOKIE_NAME]));
  const user = await userService.getUser(netId);
  if (!user) {
    res.status(404).send({ msg: 'User not found' });
    return;
  }
  const submissions = await gradeService.getSubmissions(netId);
  res.send(JSON.stringify({ user, submissions }));
});

// Update user information
secureApiRouter.post('/update', async function (req, res) {
  const netId = req.body.netId;
  const user = await userService.updateUserInfo(netId, req.body.website, req.body.github, req.body.email);
  res.send(JSON.stringify(user));
});

// Grade an assignment
secureApiRouter.post('/grade', async function (req, res) {
  const netId = req.body.netId;
  const [score, submissions] = await gradeService.grade(req.body.assignmentPhase, netId);
  res.send(JSON.stringify({ score, submissions }));
});

secureApiRouter.post('/logout', async function (req, res) {
  res.clearCookie(AUTH_COOKIE_NAME);
  db.deleteToken(req.cookies[AUTH_COOKIE_NAME]);
  res.send({ msg: 'Logged out' });
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
