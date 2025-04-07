# 🎵 Gig Finder

**Gig Finder** is a full-stack web application that allows musicians and venues to post, browse, RSVP to, and manage upcoming gigs. Built with Node.js, Express, EJS, and SQLite, it features full CRUD functionality, user authentication, and an admin dashboard.

---

## 🚀 Features

- ✅ User signup, login, and logout
- ✅ Secure password hashing with bcrypt
- ✅ Create, read, update, and delete gigs
- ✅ RSVP to gigs (and cancel RSVP)
- ✅ Filter gigs by title, location, and date range
- ✅ "My Gigs" and "My RSVPs" views
- ✅ Admin dashboard to manage users and gigs
- ✅ Promote/demote user roles (admin/user)
- ✅ Full custom UI using a color palette & Google Fonts

---

## 🎨 Tech Stack

| Frontend      | Backend      | Database  | Other Tools        |
|---------------|--------------|-----------|--------------------|
| HTML, CSS, EJS | Node.js, Express | SQLite     | bcrypt, express-session, method-override |

---

## 🖌 UI Design

- Custom color palette: [Coolors palette](https://coolors.co/001b2e-294c60-adb6c4-ffefd3-ffc49b)
- Google Fonts: [Poppins](https://fonts.google.com/specimen/Poppins) & [Inter](https://fonts.google.com/specimen/Inter)
- Fully responsive layout with modern styling

---

## 📸 Screenshots

> _(Add screenshots of your homepage, gigs list, and admin dashboard here!)_

---

## 🔐 Authentication & Roles

- Users can create accounts and securely log in/out
- Admins can access `/admin` dashboard
- Admins can delete any user or gig and promote/demote users

---

## 📁 Folder Structure

├── public/ # CSS and client-side JS ├── src/ │ ├── routes/ # All route files │ ├── views/ # EJS templates │ ├── database/ # SQLite DB and setup │ └── middleware/ # Auth and admin checks ├── server.js # App entry point └── .env # Environment variables (not committed)