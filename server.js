import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDB, ObjectId } from './db.js';
import { extractDecisionReasoning, generateContextAwareResponse } from './gemini.js';
import { retrieveRelevantMemories } from './similarity.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware //for prototype testing allow all origins
app.use(cors({ origin: '*' }));
app.use(express.json());

// Temporary storage for deleted decisions (for undo)
const deletedDecisions = new Map();

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HAMCS Backend is running' });
});

// Get all decisions
app.get('/api/decisions', async (req, res) => {
  try {
    const db = getDB();
    const decisions = await db
      .collection('decisions')
      .find({})
      .sort({ pinned: -1, createdAt: -1 })
      .toArray();

    res.json(decisions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new decision with reasoning extraction
app.post('/api/decisions', async (req, res) => {
  try {
    const { decision, category } = req.body;
    if (!decision || decision.trim().length === 0) {
      return res.status(400).json({ error: 'Decision cannot be empty' });
    }

    // Extract reasoning using Gemini
    const reasoning = await extractDecisionReasoning(decision);

    // Store in MongoDB
    const db = getDB();
    const result = await db.collection('decisions').insertOne({
      decision,
      category: category || 'general',
      pinned: false,
      ...reasoning,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json({
      _id: result.insertedId,
      decision,
      category: category || 'general',
      pinned: false,
      ...reasoning,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error creating decision:', error);
    const statusCode = error.code === 'RATE_LIMIT' ? 429 : 500;
    res.status(statusCode).json({
      error: error.message || 'Failed to process decision',
      code: error.code || 'UNKNOWN',
      retryAfter: error.retryAfter || null
    });
  }
});

// Get a single decision
app.get('/api/decisions/:id', async (req, res) => {
  try {
    const db = getDB();
    const decision = await db
      .collection('decisions')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!decision) {
      return res.status(404).json({ error: 'Decision not found' });
    }

    res.json(decision);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle pin status
app.patch('/api/decisions/:id/pin', async (req, res) => {
  try {
    const db = getDB();
    const decision = await db.collection('decisions').findOne({ _id: new ObjectId(req.params.id) });

    if (!decision) {
      return res.status(404).json({ error: 'Decision not found' });
    }

    await db.collection('decisions').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { pinned: !decision.pinned, updatedAt: new Date() } }
    );

    res.json({ ...decision, pinned: !decision.pinned });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update decision category
app.patch('/api/decisions/:id/category', async (req, res) => {
  try {
    const { category } = req.body;
    const db = getDB();

    await db.collection('decisions').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { category, updatedAt: new Date() } }
    );

    const decision = await db.collection('decisions').findOne({ _id: new ObjectId(req.params.id) });
    res.json(decision);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a decision (with undo support)
app.delete('/api/decisions/:id', async (req, res) => {
  try {
    const db = getDB();
    const decision = await db.collection('decisions').findOne({ _id: new ObjectId(req.params.id) });

    if (!decision) {
      return res.status(404).json({ error: 'Decision not found' });
    }

    // Store for undo (expires after 30 seconds)
    const undoId = Date.now().toString();
    deletedDecisions.set(undoId, decision);
    setTimeout(() => deletedDecisions.delete(undoId), 30000);

    await db.collection('decisions').deleteOne({ _id: new ObjectId(req.params.id) });

    res.json({ message: 'Decision deleted', deletedId: req.params.id, undoId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Undo delete
app.post('/api/decisions/undo/:undoId', async (req, res) => {
  try {
    const { undoId } = req.params;
    const decision = deletedDecisions.get(undoId);

    if (!decision) {
      return res.status(404).json({ error: 'Undo expired or not found' });
    }

    const db = getDB();
    await db.collection('decisions').insertOne(decision);
    deletedDecisions.delete(undoId);

    res.json(decision);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all decisions
app.delete('/api/decisions', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('decisions').deleteMany({});

    res.json({ message: 'All decisions cleared', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Context-aware chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question cannot be empty' });
    }

    // Retrieve all decisions
    const db = getDB();
    const decisions = await db
      .collection('decisions')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Get relevant memories
    const relevantMemories = retrieveRelevantMemories(question, decisions);

    // Generate context-aware response
    const response = await generateContextAwareResponse(question, relevantMemories);

    res.json({
      response,
      relevantMemories: relevantMemories.map(m => ({
        id: m._id,
        summary: m.summary,
        goal: m.goal,
        reasoning: m.reasoning,
        tags: m.tags
      }))
    });
  } catch (error) {
    console.error('Error in chat:', error);
    const statusCode = error.code === 'RATE_LIMIT' ? 429 : 500;
    res.status(statusCode).json({
      error: error.message || 'Failed to generate response',
      code: error.code || 'UNKNOWN',
      retryAfter: error.retryAfter || null
    });
  }
});

// Start server
async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\nHAMCS Backend running on http://localhost:${PORT}`);
      console.log(`Decisions: GET /api/decisions`);
      console.log(`Chat: POST /api/chat\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
