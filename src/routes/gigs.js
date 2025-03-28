import express from 'express';
import db from '../database/db.js';

const router = express.Router();

/**
 * API: GET all gigs (returns JSON)
 */
router.get('/api/gigs', async (req, res) => {
    try {
        const gigs = await db.all('SELECT * FROM gigs');
        res.json(gigs);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * API: GET a single gig by ID (returns JSON)
 */
router.get('/api/gigs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const gig = await db.get('SELECT * FROM gigs WHERE id = ?', [id]);
        if (!gig) return res.status(404).json({ error: 'Gig not found' });
        res.json(gig);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * API: POST a new gig (inserts into database)
 */
router.post('/api/gigs', async (req, res) => {
    const { title, description, date, location, musician_id, venue_id } = req.body;
    try {
        await db.run(
            'INSERT INTO gigs (title, description, date, location, musician_id, venue_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, date, location, musician_id, venue_id]
        );
        res.status(201).json({ message: 'Gig added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Database insert error' });
    }
});

/**
 * API: DELETE a gig by ID
 */
router.delete('/api/gigs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.run('DELETE FROM gigs WHERE id = ?', [id]);
        res.json({ message: 'Gig deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Database delete error' });
    }
});

/**
 * View Route: Render the gigs page (renders EJS)
 */
router.get('/gigs', async (req, res) => {
    try {
        const gigs = await db.all('SELECT * FROM gigs');
        res.render('gigs', { title: 'All Gigs', gigs });
    } catch (error) {
        res.status(500).send('Error loading gigs');
    }
});

export default router;

