-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- Hashed password
    role TEXT CHECK (role IN ('musician', 'venue', 'fan', 'admin')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gigs Table
CREATE TABLE gigs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    location TEXT NOT NULL,
    musician_id INTEGER,
    venue_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (musician_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (venue_id) REFERENCES users(id) ON DELETE SET NULL
);

-- RSVPs Table
CREATE TABLE rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    gig_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE,
    UNIQUE(user_id, gig_id)  -- Prevent duplicate RSVPs
);

-- Reviews Table
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gig_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),  -- Star rating (1-5)
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Requests Table (Musicians applying for gigs)
CREATE TABLE requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    musician_id INTEGER NOT NULL,
    gig_id INTEGER NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (musician_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE,
    UNIQUE(musician_id, gig_id)  -- Prevent duplicate applications
);

-- RSVP Table 
CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  gig_id INTEGER NOT NULL,
  UNIQUE(user_id, gig_id)
);
