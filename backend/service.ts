import express from 'express';
import { GradeService } from './model/service/GradeService';
import { UserService } from './model/service/UserService';
import { DB } from './model/dao/mysql/Database';
import { Canvas } from './model/dao/canvas/Canvas';
import cookieParser from 'cookie-parser';
import { PizzaFactory } from './model/dao/pizzaFactory/PizzaFactory';
import { ChaosService } from './model/service/ChaosService';
import logger from './logger';
import saml2 from 'saml2-js';
import fs from 'fs';
import path from 'path';
import { DeliverableGradeFactory } from './grading/graders/DeliverableGradeFactory';

// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      isAdmin?: boolean; // Add the new property
    }
  }
}

const app = express();

const db = new DB();
const canvas = new Canvas();
const pizzaFactory = new PizzaFactory();
const gradeFactory = new DeliverableGradeFactory();
// Build services
const chaosService = new ChaosService(db, pizzaFactory);
const gradeService = new GradeService(db, canvas, gradeFactory, chaosService);
const userService = new UserService(db, pizzaFactory, canvas);

// SAML setup
// Service provider
const sp = new saml2.ServiceProvider({
  entity_id: 'https://cs329.cs.byu.edu/api/metadata.xml',
  private_key: fs.readFileSync(path.resolve(__dirname, 'certs/sp.key')).toString(),
  certificate: fs.readFileSync(path.resolve(__dirname, 'certs/sp.crt')).toString(),
  assert_endpoint: 'https://cs329.cs.byu.edu/api/assert',
});
// Identity provider
const idp = new saml2.IdentityProvider({
  sso_login_url: 'https://cas.byu.edu/cas/idp/profile/SAML2/Redirect/SSO',
  sso_logout_url: 'https://cas.byu.edu/cas/idp/profile/SAML2/POST/SLO',
  certificates: [fs.readFileSync(path.resolve(__dirname, 'certs/byu.crt')).toString()],
});
// every 10 minutes, check for chaos to be triggered
setInterval(async () => {
  await chaosService.checkForChaosToBeTriggered();
}, 600000);

// Serve up the applications static content
app.use(express.static('public'));

// JSON body parsing using built-in middleware
app.use(express.json());

// Middleware to parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Trust headers that are forwarded from the proxy so we can determine IP addresses
app.set('trust proxy', true);

app.use(logger.httpLogger);

// Router for service endpoints
const apiRouter = express.Router();
app.use(`/api`, apiRouter);

const AUTH_COOKIE_NAME = 'token';

apiRouter.get('/metadata.xml', function (req, res) {
  res.type('application/xml');
  res.send(sp.create_metadata());
});

apiRouter.get('/login', function (req, res) {
  res.cookie('redirectUrl', req.query.redirectUrl as string);
  sp.create_login_request_url(idp, {}, function (err, login_url, request_id) {
    if (err != null) return res.send(500);
    res.redirect(login_url);
  });
});

apiRouter.post('/admin', async function (req, res) {
  const netId = req.body.netId;
  const password = req.body.password;
  const isAdmin = await db.checkAdmin(netId, password);
  if (isAdmin) {
    const token = await userService.login(netId);
    res.cookie(AUTH_COOKIE_NAME, token, { secure: true, sameSite: 'none' });
  }
  res.json(isAdmin);
});

// Assert endpoint for when login completes
apiRouter.post('/assert', async (req, res) => {
  const options = { request_body: req.body, allow_unencrypted_assertion: true, sign_get_request: true };
  sp.post_assert(idp, options, async function (err, saml_response) {
    if (err != null) return res.send(500);

    const netId = saml_response.user.attributes!.net_id[0];
    if (!netId) {
      res.status(401).send('Unauthorized');
      return;
    }

    const token = await userService.login(netId as string);
    if (!token) {
      res.status(401).send('Unauthorized');
      return;
    }
    res.cookie(AUTH_COOKIE_NAME, token, { secure: true, sameSite: 'none' });
    const redirectUrl = req.cookies.redirectUrl;
    res.redirect(redirectUrl);
  });
});

apiRouter.post('/logout', async function (req, res) {
  res.clearCookie(AUTH_COOKIE_NAME);
  db.deleteToken(req.cookies[AUTH_COOKIE_NAME]);
  res.send({ msg: 'Logged out' });
});

apiRouter.get('/report', async (req, res) => {
  const apiKey = req.query.apiKey as string;
  const fixCode = req.query.fixCode as string;
  if (!apiKey || !fixCode) {
    res.status(400).send({ msg: 'Missing required parameters' });
    return;
  }
  const chaosResolved = await gradeService.gradeDeliverableEleven(apiKey, fixCode);
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
  try {
    const netIdFromToken = await db.getNetIdByToken(authToken);
    const user = await db.getUser(netIdFromToken);
    if (user?.isAdmin) {
      req.isAdmin = true;
    }
    // Only allows the user to access their own information, unless they are an admin
    if (user!.isAdmin || netIdFromRequest === netIdFromToken || !netIdFromRequest) {
      next();
    } else {
      res.status(401).send({ msg: 'Unauthorized' });
    }
  } catch (e) {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});

// Get stats for all deliverables
secureApiRouter.post('/stats', async function (req, res) {
  if (!req.isAdmin) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }
  const stats = await gradeService.getStats();
  res.send(JSON.stringify(stats));
});

// Get all netids for a specific deliverable
secureApiRouter.post('/stats/netids', async function (req, res) {
  if (!req.isAdmin) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }
  const netIds = await gradeService.getNetIdsForDeliverablePhase(req.body.phase);
  res.send(JSON.stringify(netIds));
});

// Get user's data
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

// Grade a deliverable assignment
secureApiRouter.post('/grade', async function (req, res) {
  const netId = req.body.netId;
  const [message, submissions, rubric] = await gradeService.grade(req.body.assignmentPhase, netId);
  res.send(JSON.stringify({ message, submissions, rubric }));
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

export default app;
