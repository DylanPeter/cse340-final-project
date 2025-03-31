import express from 'express';
import db from '../database/db.js';

const router = express.Router();

/** 
 * ✅ API: Get all gigs (returns JSON)
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
 * ✅ API: Get a single gig by ID (returns JSON)
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
 * ✅ View Route: Render all gigs in EJS
 */
router.get('/gigs', async (req, res) => {
    try {
        const gigs = await db.all('SELECT * FROM gigs');
        const successMessage = req.session.successMessage || ''; // ✅ Retrieve success message
        req.session.successMessage = ''; // ✅ Clear message after displaying

        res.render('gigs', { title: 'All Gigs', gigs, successMessage });
    } catch (error) {
        res.status(500).send('Error loading gigs');
    }
});

/** 
 * ✅ View Route: Show the "Add Gig" form
 */
router.get('/add-gig', (req, res) => {
    res.render('add-gig', { title: 'Add a New Gig', errors: [] });
});

/** 
 * ✅ View Route: Handle Gig Form Submission (Server-Side Validation)
 */
router.post('/add-gig', async (req, res) => {
    const { title, description, date, location, musician_id, venue_id } = req.body;
    const errors = [];

    // ✅ Validate required fields
    if (!title || !date || !location) {
        errors.push('Title, date, and location are required.');
    }

    // ✅ Validate date (must be in the future)
    const gigDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of the day

    if (gigDate < today) {
        errors.push('The gig date must be in the future.');
    }

    // ✅ If validation fails, re-render the form with errors
    if (errors.length > 0) {
        return res.render('add-gig', { title: 'Add a New Gig', errors });
    }

    try {
        await db.run(
            'INSERT INTO gigs (title, description, date, location, musician_id, venue_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, date, location, musician_id || null, venue_id || null]
        );
        res.redirect('/gigs'); // ✅ Redirect to gigs page after success
    } catch (error) {
        console.error('Database insert error:', error);
        res.status(500).send('Error adding gig');
    }
});

/**
 * ✅ GET: Render the "Edit Gig" page
 */
router.get('/edit-gig/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const gig = await db.get('SELECT * FROM gigs WHERE id = ?', [id]);
        if (!gig) return res.status(404).send('Gig not found.');
        res.render('edit-gig', { title: 'Edit Gig', gig, errors: [] });
    } catch (error) {
        console.error('Error fetching gig:', error);
        res.status(500).send('Error loading edit page.');
    }
});

router.post('/edit-gig/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, date, location } = req.body;
    const errors = [];

    if (!title || !date || !location) {
        errors.push('Title, date, and location are required.');
    }

    const gigDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (gigDate < today) {
        errors.push('The gig date must be in the future.');
    }

    if (errors.length > 0) {
        const gig = { id, title, description, date, location };
        return res.render('edit-gig', { title: 'Edit Gig', gig, errors });
    }

    try {
        await db.run(
            'UPDATE gigs SET title = ?, description = ?, date = ?, location = ? WHERE id = ?',
            [title, description, date, location, id]
        );

        req.session.successMessage = 'Gig updated successfully!'; // ✅ Store success message
        res.redirect('/gigs'); // Redirect after success
    } catch (error) {
        console.error('Error updating gig:', error);
        res.status(500).send('Error updating gig.');
    }
});

/**
 * ✅ POST: Delete a gig
 */
router.post('/delete-gig/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.run('DELETE FROM gigs WHERE id = ?', [id]);

        req.session.successMessage = 'Gig deleted successfully!'; // ✅ Store success message
        res.redirect('/gigs'); // Redirect after success
    } catch (error) {
        console.error('Error deleting gig:', error);
        res.status(500).send('Error deleting gig.');
    }
});


/** 
 * ✅ API: Delete a gig (returns JSON)
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

export default router;