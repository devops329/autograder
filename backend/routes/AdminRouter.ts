// import express from 'express';

// const adminApiRouter = express.Router();

// adminApiRouter.use(async (req, res, next) => {
//   if (!req.isAdmin) {
//     res.status(401).send({ msg: 'Unauthorized' });
//     return;
//   }
//   next();
// });

// // Impersonate a user
// adminApiRouter.post('/impersonate', async function (req, res) {
//   const searchString = req.body.searchString;
//   const user = await userService.getUserFuzzySearch(searchString);
//   if (!user) {
//     res.status(404).send({ msg: 'User not found' });
//     return;
//   }
//   const submissions = await gradeService.getSubmissions(user.netId);
//   res.send(JSON.stringify({ user, submissions }));
// });

// // Get stats for all deliverables
// adminApiRouter.post('/stats', async function (req, res) {
//   const stats = await adminService.getStats();
//   res.send(JSON.stringify(stats));
// });

// // Get all netids for a specific deliverable
// adminApiRouter.post('/stats/netids', async function (req, res) {
//   const netIds = await adminService.getNetIdsForDeliverablePhase(req.body.phase);
//   res.send(JSON.stringify(netIds));
// });

// // End/Start the semester
// adminApiRouter.post('/toggle-submissions', async function (req, res) {
//   const semesterOver = gradeService.toggleSemesterOver();
//   res.send(semesterOver);
// });
