import express from 'express';
import { handleBuildRequest } from '../controllers/build.controller.js';

const router = express.Router();

router.post('/build', handleBuildRequest);

export default router;