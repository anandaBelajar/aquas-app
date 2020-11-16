var localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')


// function initialize(passport, getUserByEmail, getUserById) {
//     const authenticateUser = async function(email, password, done) {
//         const user = getUserByEmail(email)
//         if (user == null) {
//             return done(null, false, { message: 'akun belum terdaftar' })
//         }

//         try {
//             if (await bcrypt.compare(password, result[0].password)) {
//                 return done(null, user)
//             } else {
//                 return done(null, false, { message: 'email dan password tidak sesuai' })
//             }
//         } catch (error) {
//             return done(error)
//         }
//     }
//     passport.use(new LocalStrategy({
//         usernameField: 'email'
//     }, authenticateUser))
//     passport.serializeuser(function(user, done) {
//         done(null, user.id)
//     })

//     passport.deserializeuser(function(id, done) {
//         return done(null, getUserById(id))
//     })
// }

// module.exports = initialize

// module.exports = function(passport, con) {

//     // =========================================================================
//     // passport session setup ==================================================
//     // =========================================================================
//     // required for persistent login sessions
//     // passport needs ability to serialize and unserialize users out of session

//     // used to serialize the user for the session
//     passport.serializeUser(function(user, done) {
//         done(null, user.id);
//     });

//     // used to deserialize the user
//     passport.deserializeUser(function(id, done) {
//         con.query("select * from users where id = " + id, function(err, rows) {
//             done(err, rows[0]);
//         });
//     });

//     // =========================================================================
//     // LOCAL LOGIN =============================================================
//     // =========================================================================
//     // we are using named strategies since we have one for login and one for signup
//     // by default, if there was no name, it would just be called 'local'

//     passport.use('local-login', new LocalStrategy({
//             // by default, local strategy uses username and password, we will override with email
//             usernameField: 'email',
//             passwordField: 'password',
//             passReqToCallback: true // allows us to pass back the entire request to the callback
//         },
//         function(req, email, password, done) { // callback with email and password from our form

//             con.query("SELECT * FROM `administrator` WHERE `email` = '" + email + "'", async function(err, rows) {
//                 if (err)
//                     return done(err);
//                 if (!rows.length) {
//                     return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
//                 }

//                 // if the user is found but the password is wrong

//                 if (!(await bcrypt.compare(password, result[0].password)))
//                     return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

//                 // all is well, return successful user
//                 return done(null, rows[0]);

//             });



//         }));

// };

//module.exports = initialize

module.exports = function(passport, con) {

    const authenticateUser = async function(email, password, done) {
        const user = getUserByEmail(email)
        if (user == null) {
            return done(null, false, { message: 'Akun belum terdaftar' })
        }

        try {
            if (await bcrypt.compare(password, result[0].password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Email dan password tidak sesuai' })
            }
        } catch (error) {
            return done(error)
        }
    }
    passport.use(new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, function(email, password, done) {

        con.query("SELECT * FROM `administrator` WHERE `email` = '" + email + "'", async function(err, rows) {
            if (err)
                return done(err);
            if (!rows.length) {
                return done(null, false, { message: 'akun belum terdaftar' })
            }

            // if the user is found but the password is wrong
            try {
                if (await bcrypt.compare(password, rows[0].password)) {
                    return done(null, rows[0])
                } else {
                    return done(null, false, { message: 'email dan password tidak sesuai' })
                }
            } catch (error) {
                // all is well, return successful user
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