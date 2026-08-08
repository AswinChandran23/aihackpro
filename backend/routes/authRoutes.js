import express from 'express';
import { registerTeacher, loginTeacher } from '../controllers/authController.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateRegistration, registerTeacher);
router.post('/login', validateLogin, loginTeacher);

export default router;
