import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import planController from './planController.js';

const router = express.Router();

// Rotas para organizações consultarem seu plano e features
router.get('/organization/current', authenticate, planController.getOrganizationPlan);
router.get('/features', authenticate, planController.getOrganizationFeatures);
router.get('/features/check/:featureName', authenticate, planController.checkFeatureAccess);
router.post('/features/check-multiple', authenticate, planController.checkMultipleFeatures);
router.get('/usage', authenticate, planController.getUsageInfo);
router.get('/available', authenticate, planController.getAvailablePlans);

export default router;
