import express from 'express';
import db from '../database/db.js';

const router = express.Router();

/**
 * GET all users
 */
router.get('/users', async (req, res) => {
    try {
        const users = await db.all('SELECT id, name, email, role FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * POST a new user (Signup)
 */
router.post('/users', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        await db.run(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password, role]
        );
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Database insert error' });
    }
});

/**
 * DELETE a user by ID
 */
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.run('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Database delete error' });
    }
});

export default router;
