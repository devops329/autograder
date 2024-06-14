import express from 'express';
import { GradeService } from './model/service/GradeService';
import { UserService } from './model/service/UserService';
import { DB } from './model/dao/mysql/Database';
import { Canvas } from './model/dao/canvas/Canvas';
import { config } from './config';
import cookieParser from 'cookie-parser';
import { PizzaFactory } from './model/dao/pizzaFactory/PizzaFactory';

const app = express();

const db = new DB();
const canvas = new Canvas();
const pizzaFactory = new PizzaFactory();
// Build services
const gradeService = new GradeService(db, canvas);
const userService = new UserService(db, pizzaFactory);

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

apiRouter.post('/login', async function (req, res) {
  const { user, token, firstTime } = await userService.login();
  const submissions = await gradeService.getSubmissions('fakeNetId');
  res.cookie(AUTH_COOKIE_NAME, token, { httpOnly: true, secure: true, sameSite: 'none' });
  res.send(JSON.stringify({ user, submissions, firstTime }));
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

// Secure API routes that require an AuthToken

const secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use(async (req, res, next) => {
  const authToken = req.cookies[AUTH_COOKIE_NAME];
  const user = await db.getNetIdByToken(authToken);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});

secureApiRouter.post('/update', async function (req, res) {
  const user = await userService.updateUserWebsiteAndGithub('fakeNetId', req.body.website, req.body.github);
  res.send(JSON.stringify(user));
});

secureApiRouter.post('/grade', async function (req, res) {
  const submissions = await gradeService.grade(req.body.assignmentPhase, 'fakeNetId');
  res.send(JSON.stringify(submissions));
});

secureApiRouter.post('/user', async function (req, res) {
  const user = await userService.getUser(req.body.netId);
  res.send(JSON.stringify(user));
});

secureApiRouter.post('/submissions', async function (req, res) {
  const submissions = await gradeService.getSubmissions(req.body.netId);
  res.send(JSON.stringify(submissions));
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
