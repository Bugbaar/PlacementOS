import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;
        const name = profile.displayName;

        if (!email) {
          return done(new Error('No email from Google profile'), null);
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name,
              password: '', 
              avatar,
              isVerified: true,
              role: 'STUDENT',
            },
          });

          await prisma.student.create({
            data: { userId: user.id },
          });

          logger.info({ event: 'oauth_user_created', userId: user.id, email });
        } else {
          if (avatar && user.avatar !== avatar) {
            await prisma.user.update({
              where: { id: user.id },
              data: { avatar, isVerified: true },
            });
          }
          logger.info({ event: 'oauth_user_login', userId: user.id, email });
        }

        return done(null, user);
      } catch (err) {
        logger.error({ event: 'oauth_error', error: err.message });
        return done(err, null);
      }
    }
  )
);

export default passport;
