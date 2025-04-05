import express from 'express';
import bcrypt from 'bcrypt';
import db from '../database/db.js';

const router = express.Router();

/**
 * GET /signup - Show the signup form
 */
router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up', error: null });
});

/**
 * POST /signup - Handle signup form
 */
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('signup', { title: 'Sign Up', error: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.run(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        // ✅ Auto login after successful signup
        req.session.user = {
            id: result.lastID,
            username
        };

        res.redirect('/gigs');
    } catch (error) {
        console.error('Signup error:', error);
        res.render('signup', { title: 'Sign Up', error: 'Username already taken.' });
    }
});


/**
 * GET /login - Show login form
 */
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login', error: null });
});

/**
 * POST /login - Handle login form
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

        if (!user) {
            return res.render('login', { title: 'Login', error: 'Invalid username or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('login', { title: 'Login', error: 'Invalid username or password.' });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role 
          };
          
        res.redirect('/gigs');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Something went wrong.');
    }
});

/**
 * GET /logout - Log out the user
 */
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

export default router;
