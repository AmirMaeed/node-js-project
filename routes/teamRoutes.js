const express = require('express');
const router = express.Router();


// Protected Team Route
router.get('/team', (req, res) => {
    res.render('team', { user: res.locals.user });
});

module.exports = router;
