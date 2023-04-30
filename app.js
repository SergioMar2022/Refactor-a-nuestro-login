const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;

const app = express();

// Configuración de passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    // Verificar si el email existe en la base de datos
    User.findOne({ email: email }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'El email no está registrado.' });
      // Verificar la contraseña con bcrypt
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) return done(err);
        if (!result) return done(null, false, { message: 'Contraseña incorrecta.' });
        return done(null, user);
      });
    });
  }
));
passport.use(new GitHubStrategy(
  {
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    // Verificar si el usuario existe en la base de datos
    User.findOne({ githubId: profile.id }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'El usuario de GitHub no está registrado.' });
      return done(null, user);
    });
  }
));
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
