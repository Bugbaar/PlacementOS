import express from 'express';
import {
  createCompany,
  listCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getMyCompany,
} from '../controllers/companyController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody, companyCreateSchema, companyUpdateSchema } from '../utils/validator.js';

const router = express.Router();

router.get('/my-company', authenticate, authorize('RECRUITER'), getMyCompany);
router.post('/', authenticate, authorize('RECRUITER', 'ADMIN'), validateBody(companyCreateSchema), createCompany);
router.get('/', authenticate, listCompanies);
router.get('/:id', authenticate, getCompanyById);
router.put('/:id', authenticate, authorize('RECRUITER', 'ADMIN'), validateBody(companyUpdateSchema), updateCompany);
router.delete('/:id', authenticate, authorize('RECRUITER', 'ADMIN'), deleteCompany);

export default router;
