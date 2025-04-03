import express from 'express';
import session from 'express-session'; 
import path from 'path';
import { fileURLToPath } from 'url';


// Fix for ESM module imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Start the server on the specified port
const port = process.env.PORT || 3000;
const mode = process.env.MODE || 'production';

// route imports
import gigsRoutes from './src/routes/gigs.js';
import usersRoutes from './src/routes/users.js';
import authRoutes from './src/routes/auth.js';


// starts app 
const app = express();
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true
}));

// Set EJS as the view engine and record the location of the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true })); // Enable form data parsing
app.use(express.json()); // Support JSON payloads

// When in development mode, start a WebSocket server for live reloading
if (mode.includes('dev')) {
    const ws = await import('ws');

    try {
        const wsPort = parseInt(port) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });

        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });

        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}
// Register Routes
app.use('/', gigsRoutes);
app.use('/api', usersRoutes);
app.use('/', authRoutes);


// Home Route
app.get('/', (req, res) => {
    res.render('index', { title: 'Concert & Gig Finder' });
});

// Start the Express server
app.listen(port, async () => {
    console.log(`Server running on http://127.0.0.1:${port}`);
});
