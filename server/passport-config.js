var localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')

module.exports = function(passport, con) {

    //passport credential authentication
    passport.use(new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, function(email, password, done) {

        //email and password validation
        con.query("SELECT * FROM `administrator` WHERE `email` = '" + email + "'", async function(err, rows) {
            if (err)
                return done(err);
            if (!rows.length) {
                return done(null, false, { message: 'akun belum terdaftar' })
            }
            try {
                if (await bcrypt.compare(password, rows[0].password)) {
                    return done(null, rows[0])
                } else {
                    return done(null, false, { message: 'email dan password tidak sesuai' })
                }
            } catch (error) {
                return done(error)

            }
        });
    }))
    passport.serializeUser(function(user, done) {
        done(null, user.id)
    })

    passport.deserializeUser(function(id, done) {
        con.query("select * from administrator where id = " + id, function(err, rows) {
            done(err, rows[0]);
        });
    });


};