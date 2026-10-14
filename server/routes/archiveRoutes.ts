import { Router } from 'express';
import {
  ChatRequestSchema,
  ExtractUrlSchema,
  IngestArchiveSchema,
  SearchQuerySchema,
  UpdateArchiveSchema,
} from '../../shared/schemas';
import { ArchiveController } from '../controllers/archiveController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validationMiddleware';

const router = Router();

// Apply Supabase Authentication middleware to all archive API routes
router.use(authMiddleware);

// Core Ingestion Endpoint: POST /api/v1/archive
router.post('/', validateBody(IngestArchiveSchema), ArchiveController.ingest);

// List & filtering
router.get('/', ArchiveController.list);

// Stats & breakdown
router.get('/stats', ArchiveController.getStats);

// Hybrid Semantic Vector Search
router.post('/search', validateBody(SearchQuerySchema), ArchiveController.search);

// Conversational AI Assistant over Archives
router.post('/chat', validateBody(ChatRequestSchema), ArchiveController.chat);

// URL metadata extraction preview
router.post('/extract-url', validateBody(ExtractUrlSchema), ArchiveController.extractUrl);

// Clear all archives endpoint
router.post('/clear-all', ArchiveController.clearAll);

// Single item CRUD
router.get('/:id', ArchiveController.getById);
router.patch('/:id', validateBody(UpdateArchiveSchema), ArchiveController.update);
router.delete('/:id', ArchiveController.delete);

export default router;
