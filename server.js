import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for ESM module imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Start the server on the specified port
const port = process.env.PORT || 3000;
const mode = process.env.MODE || 'production';


import gigsRoutes from './src/routes/gigs.js';
import usersRoutes from './src/routes/users.js';

// starts app 
const app = express();
app.use(express.json());

// Set EJS as the view engine and record the location of the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

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

// Home Route
app.get('/', (req, res) => {
    res.render('index', { title: 'Concert & Gig Finder' });
});

// Start the Express server
app.listen(port, async () => {
    console.log(`Server running on http://127.0.0.1:${port}`);
});
