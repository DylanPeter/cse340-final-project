import express from 'express';
import db from '../database/db.js';
import { isLoggedIn, isAdmin } from '../middleware/admin.js'; 

const router = express.Router();

router.get('/admin', isLoggedIn, isAdmin, async (req, res) => {
    try {
        const users = await db.all('SELECT id, username, role FROM users');
        const gigs = await db.all('SELECT id, title, date, user_id FROM gigs');
        const successMessage = req.session.successMessage || '';
        req.session.successMessage = ''; 
        
        res.render('admin', {
          title: 'Admin Dashboard',
          currentUser: req.session.user,
          users,
          gigs,
          successMessage
        });
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        res.status(500).send('Error loading dashboard.');
    }
});

router.delete('/admin/users/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await db.run('DELETE FROM users WHERE id = ?', [id]);
      res.redirect('/admin');
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).send('Error deleting user.');
    }
  });
  
  router.delete('/admin/gigs/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await db.run('DELETE FROM gigs WHERE id = ?', [id]);
      res.redirect('/admin');
    } catch (error) {
      console.error('Error deleting gig:', error);
      res.status(500).send('Error deleting gig.');
    }
  });

router.post('/admin/users/:id/role', isLoggedIn, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).send('Invalid role.');
  }

  try {
    await db.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    // If admin is changing their own role, update session role too
    if (req.session.user.id == id) {
      req.session.user.role = role;
    }

    req.session.successMessage = `Role updated successfully for user ID ${id}.`;
    res.redirect('/admin');
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).send('Failed to update user role.');
  }
});

router.post('/admin/users/:id/role', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
  
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).send('Invalid role.');
    }
  
    try {
      await db.run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  
      // If admin is changing their own role, update session role too
      if (req.session.user.id == id) {
        req.session.user.role = role;
      }
  
      res.redirect('/admin');
    } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).send('Failed to update user role.');
    }
  });
  
  
export default router;
