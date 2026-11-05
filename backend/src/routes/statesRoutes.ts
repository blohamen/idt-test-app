import { Router } from 'express';
import {
  getStatesHandler,
  getStateDetailHandler,
  getHealthHandler,
} from '../controllers/statesController.js';

const router = Router();

router.get('/states', getStatesHandler);
router.get('/state/:name', getStateDetailHandler);
router.get('/health', getHealthHandler);

export default router;
