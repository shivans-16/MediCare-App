// const passport = require('passport');
// const googlestrategy = require('passport-google-oauth20').Strategy;
// const Patient = require('../model/patient')
// const Doctor = require('../model/doctor')

// require('dotenv').config();

// passport.use('google', new googlestrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: process.env.GOOGLE_CALLBACK_URL,
//     passReqToCallback: true
// },
//     async (req, accessToken, refreshToken, Profiler, done) => {
//         try {
//             const userType = req.query.state || 'patient';
//             const { emails, displayName, photos } = Profile;
//             const email = emails?.[0]?.value;
//             const photo = photo?.[0]?.value;

//             if (userType === 'doctor') {
//                 let user = await Doctor.findOne({ email });
//                 if (!user) {
//                     user = await Doctor.create({
//                         googleId: profile.id,
//                         email,
//                         name: displayName,
//                         profileimage: photo,
//                         isVerified: true,
//                     });

//                 } else {
//                     if (!user.googleId) {
//                         user.googleId = profile.id;
//                         user.profileimage = photo;
//                         await user.save();
//                     }
//                 }
//                 return done(null, { user, type: 'doctor' });
//             } else {
//                 let user = await Patient.findOne({ email });
//                 if (!user) {
//                     user = await Patient.create({
//                         googleId: profile.id,
//                         email,
//                         name: displayName,
//                         profileimage: photo,
//                         isVerified: true,
//                     });

//                 } else {
//                     if (!user.googleId) {
//                         user.googleId = profile.id;
//                         user.profileimage = photo;
//                         await user.save();
//                     }
//                 }
//                 return done(null, { user, type: 'patient' });
//             }

//         } catch (error) {
//             return done(error);
//         }
//     }
// ));

// module.exports=passport;




const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Patient = require('../model/patient');
const Doctor = require('../model/doctor');

require('dotenv').config();

passport.use('google', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
},
    async (req, accessToken, refreshToken, profile, done) => {  // ✅ 'profile'
        try {
            const userType = req.query.state || 'patient';
            const { emails, displayName, photos } = profile;    // ✅ from 'profile'

            const email = emails?.[0]?.value;
            const photo = photos?.[0]?.value;                   // ✅ from 'photos'

            if (userType === 'doctor') {
                let user = await Doctor.findOne({ email });
                if (!user) {
                    user = await Doctor.create({
                        googleId: profile.id,                   // ✅ works now
                        email,
                        name: displayName,
                        profileimage: photo,
                        isVerified: true,
                    });
                } else {
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.profileimage = photo;
                        await user.save();
                    }
                }
                return done(null, { user, type: 'doctor' });

            } else {
                let user = await Patient.findOne({ email });
                if (!user) {
                    user = await Patient.create({
                        googleId: profile.id,                   // ✅ works now
                        email,
                        name: displayName,
                        profileimage: photo,
                        isVerified: true,
                    });
                } else {
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.profileimage = photo;
                        await user.save();
                    }
                }
                return done(null, { user, type: 'patient' });
            }

        } catch (error) {
            return done(error);
        }
    }
));

module.exports = passport;