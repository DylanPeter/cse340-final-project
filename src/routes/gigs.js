import express from 'express';
import db from '../database/db.js';
import { isAdmin } from '../middleware/admin.js';


const router = express.Router();

function isLoggedIn(req, res, next) {
    if (req.session.user) {
        return next(); // user is logged in
    }
    res.redirect('/login'); // redirect to login if not authenticated
}

/** 
 * ✅ API: Get all gigs (returns JSON)
 */
router.get('/api/gigs', isLoggedIn, isAdmin, async (req, res) => {
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
router.get('/api/gigs/:id', isLoggedIn, isAdmin, async (req, res) => {
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
    const { search, startDate, endDate } = req.query;
    const successMessage = req.session.successMessage || '';
    req.session.successMessage = '';

    let query = 'SELECT * FROM gigs WHERE 1=1';
    const params = [];

    if (search) {
        query += ' AND (title LIKE ? OR location LIKE ?)';
        const likeTerm = `%${search}%`;
        params.push(likeTerm, likeTerm);
    }

    if (startDate) {
        query += ' AND date >= ?';
        params.push(startDate);
    }

    if (endDate) {
        query += ' AND date <= ?';
        params.push(endDate);
    }

    try {
        const gigs = await db.all(query, params);
        res.render('gigs', {
            title: 'All Gigs',
            gigs,
            successMessage,
            searchTerm: search,
            startDate,
            endDate
        });
    } catch (error) {
        console.error('Error loading gigs with filters:', error);
        res.status(500).send('Error loading gigs.');
    }
});


/** 
 * ✅ View Route: Show the "Add Gig" form
 */
router.get('/add-gig', isLoggedIn, isAdmin, (req, res) => {
    res.render('add-gig', { title: 'Add a New Gig', errors: [] });
});

/** 
 * ✅ View Route: Handle Gig Form Submission (Server-Side Validation)
 */
router.post('/add-gig', isLoggedIn, isAdmin, async (req, res) => {
    const { title, description, date, location } = req.body;
    const userId = req.session.user.id;

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
        return res.render('add-gig', { title: 'Add a New Gig', errors });
    }

    try {
        await db.run(
            'INSERT INTO gigs (title, description, date, location, musician_id, venue_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, date, location, null, null, userId]
        );

        req.session.successMessage = 'Gig added successfully!';
        res.redirect('/gigs');
    } catch (error) {
        console.error('Database insert error:', error);
        res.status(500).send('Error adding gig');
    }
});


/**
 * ✅ GET: Render the "Edit Gig" page
 */
router.get('/edit-gig/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    const currentUser = req.session.user;

    try {
        const gig = await db.get('SELECT * FROM gigs WHERE id = ?', [id]);

        if (!gig) return res.status(404).send('Gig not found.');

        // 🔐 Only allow editing if the user owns the gig
        if (gig.user_id !== currentUser.id) {
            return res.status(403).send('You are not authorized to edit this gig.');
        }

        res.render('edit-gig', { title: 'Edit Gig', gig, errors: [] });
    } catch (error) {
        console.error('Error fetching gig:', error);
        res.status(500).send('Error loading edit page.');
    }
});

router.post('/edit-gig/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    const currentUser = req.session.user;
    const { title, description, date, location } = req.body;
    const errors = [];

    const gigDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!title || !date || !location) {
        errors.push('Title, date, and location are required.');
    }

    if (gigDate < today) {
        errors.push('The gig date must be in the future.');
    }

    try {
        const gig = await db.get('SELECT * FROM gigs WHERE id = ?', [id]);

        if (!gig) return res.status(404).send('Gig not found.');

        // 🔐 Prevent unauthorized edit
        if (gig.user_id !== currentUser.id) {
            return res.status(403).send('You are not authorized to edit this gig.');
        }

        if (errors.length > 0) {
            return res.render('edit-gig', { title: 'Edit Gig', gig: { ...gig, title, description, date, location }, errors });
        }

        await db.run(
            'UPDATE gigs SET title = ?, description = ?, date = ?, location = ? WHERE id = ?',
            [title, description, date, location, id]
        );

        req.session.successMessage = 'Gig updated successfully!';
        res.redirect('/gigs');
    } catch (error) {
        console.error('Error updating gig:', error);
        res.status(500).send('Error updating gig.');
    }
});


/**
 * ✅ POST: Delete a gig
 */
router.post('/delete-gig/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    const currentUser = req.session.user;

    try {
        const gig = await db.get('SELECT * FROM gigs WHERE id = ?', [id]);

        if (!gig) return res.status(404).send('Gig not found.');

        // 🔐 Prevent unauthorized delete
        if (gig.user_id !== currentUser.id) {
            return res.status(403).send('You are not authorized to delete this gig.');
        }

        await db.run('DELETE FROM gigs WHERE id = ?', [id]);
        req.session.successMessage = 'Gig deleted successfully!';
        res.redirect('/gigs');
    } catch (error) {
        console.error('Error deleting gig:', error);
        res.status(500).send('Error deleting gig.');
    }
});



/** 
 * ✅ API: Delete a gig (returns JSON)
 */
router.delete('/api/gigs/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.run('DELETE FROM gigs WHERE id = ?', [id]);
        res.json({ message: 'Gig deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Database delete error' });
    }
});
/**
 * ✅ GET: Render the "My Gig" page
 */
router.get('/my-gigs', isLoggedIn, isAdmin, async (req, res) => {
    const userId = req.session.user.id;
    const { search, startDate, endDate } = req.query;
    const successMessage = req.session.successMessage || '';
    req.session.successMessage = '';

    let query = 'SELECT * FROM gigs WHERE user_id = ?';
    const params = [userId];

    if (search) {
        query += ' AND (title LIKE ? OR location LIKE ?)';
        const likeTerm = `%${search}%`;
        params.push(likeTerm, likeTerm);
    }

    if (startDate) {
        query += ' AND date >= ?';
        params.push(startDate);
    }

    if (endDate) {
        query += ' AND date <= ?';
        params.push(endDate);
    }

    try {
        const gigs = await db.all(query, params);
        res.render('my-gigs', {
            title: 'My Gigs',
            gigs,
            successMessage,
            searchTerm: search,
            startDate,
            endDate
        });
    } catch (error) {
        console.error('Error loading filtered user gigs:', error);
        res.status(500).send('Error loading your gigs.');
    }
});
/**
 * ✅ POST: Render the "RSVP" page
 */
router.post('/gigs/:id/rsvp', isLoggedIn, isAdmin, async (req, res) => {
    const gigId = req.params.id;
    const userId = req.session.user.id;

    try {
        await db.run('INSERT OR IGNORE INTO rsvps (user_id, gig_id) VALUES (?, ?)', [userId, gigId]);
        req.session.successMessage = 'You successfully RSVP’d!';
    } catch (error) {
        console.error('Error RSVPing:', error);
        req.session.successMessage = 'RSVP failed or already exists.';
    }

    res.redirect('/gigs');
});
/**
 * ✅ GET: Render the "My-RSVP" page
 */
router.get('/my-rsvps', isLoggedIn, isAdmin, async (req, res) => {
    const userId = req.session.user.id;

    try {
        const gigs = await db.all(`
            SELECT gigs.* FROM gigs
            JOIN rsvps ON gigs.id = rsvps.gig_id
            WHERE rsvps.user_id = ?
        `, [userId]);

        res.render('my-rsvps', { title: 'My RSVPs', gigs });
    } catch (error) {
        console.error('Error loading RSVPs:', error);
        res.status(500).send('Error loading RSVP list.');
    }
});


export default router;