const express = require('express');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const path = require('path');
const auth = require('http-auth');

const basic = auth.basic({
    realm: "site owners only",
    file: path.join(__dirname, '../users.htpasswd'),
  });

const router = express.Router();
const Registration = mongoose.model('Registration');

router.get('/', (req, res) => {
  res.render('form', { title: 'Contact form'});
});

router.get('/registrations', basic.check((req, res) => {
    Registration.find()
      .then((registrations) => {
        res.render('index', { title: 'Listing registrations', registrations });
      })
      .catch(() => { res.send('Sorry! Something went wrong.'); });
}));

router.post('/',
    [
        check('name')
        .isLength({ min: 1 })
        .isAscii()
        .withMessage('Please enter a valid name'),
        check('email')
        .isEmail({ allow_utf8_local_part: false })
        .withMessage('Please enter a valid email address'),
    ],
(req, res) => {
    const errors = validationResult(req);
    console.log(req.body, errors);
    if (errors.isEmpty()) {
        const registration = new Registration(req.body);
        registration.save()
          .then(() => { res.send('Thank you for your registration!'); })
          .catch((err) => {
            console.log(err);
            res.send('Sorry! Something went wrong.');
          });
      } else {
        res.render('form', {
          title: 'Registration form',
          errors: errors.array(),
          data: req.body,
        });
      }
  });

module.exports = router;