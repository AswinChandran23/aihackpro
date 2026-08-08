import express from 'express';
import { protect } from '../middleware/auth.js';
import { askDocumentQuestion, ingestDocument, listDocuments } from '../controllers/ragController.js';

const router = express.Router();

router.use(protect);

router.get('/documents', listDocuments);
router.post('/documents', ingestDocument);
router.post('/chat', askDocumentQuestion);

export default router;
