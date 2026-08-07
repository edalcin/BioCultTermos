import { Router } from 'express';
import { findLastAcquisitionLog } from '../../../models/AcquisitionLog.js';
import * as AcquisitionService from '../../../services/AcquisitionService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const db = req.app.locals.db;

    const countByStatus = (status) =>
      db.prepare(`SELECT COUNT(*) as n FROM etnotermos WHERE status = ?`).get(status).n;

    const candidate = countByStatus('candidate');
    const active = countByStatus('active');
    const deprecated = countByStatus('deprecated');
    const lastAcq = findLastAcquisitionLog(db);

    res.render('dashboard', {
      stats: { candidate, active, deprecated },
      lastAcq,
      acquisitionRunning: AcquisitionService.isRunning(),
      acquisitionRunningSince: AcquisitionService.runningSinceIso(),
      user: req.user,
      currentPage: 'dashboard',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
