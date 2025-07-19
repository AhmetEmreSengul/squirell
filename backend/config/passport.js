import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import AppleStrategy from "passport-apple";
import User from "../models/User.js";

// Debug environment variables
console.log("🔍 Checking OAuth environment variables:");
console.log(
  "GOOGLE_CLIENT_ID:",
  process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Not set"
);
console.log(
  "GOOGLE_CLIENT_SECRET:",
  process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Not set"
);
console.log(
  "APPLE_CLIENT_ID:",
  process.env.APPLE_CLIENT_ID ? "✅ Set" : "❌ Not set"
);

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.NODE_ENV === "production"
            ? "https://squirell.onrender.com/api/auth/google/callback"
            : process.env.GOOGLE_CALLBACK_URL ||
              "http://localhost:5000/api/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with same email
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.isEmailVerified = true;
            await user.save();
            return done(null, user);
          }

          // Create new user
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            avatar: profile.photos[0]?.value,
            isEmailVerified: true,
            authProvider: "google",
          });

          await user.save();
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  console.log("✅ Google OAuth strategy initialized");
} else {
  console.log("⚠️  Google OAuth credentials not found - Google OAuth disabled");
  console.log(
    "   GOOGLE_CLIENT_ID:",
    process.env.GOOGLE_CLIENT_ID || "undefined"
  );
  console.log(
    "   GOOGLE_CLIENT_SECRET:",
    process.env.GOOGLE_CLIENT_SECRET ? "***set***" : "undefined"
  );
}

// Apple OAuth Strategy (only if credentials are provided)
if (
  process.env.APPLE_CLIENT_ID &&
  process.env.APPLE_TEAM_ID &&
  process.env.APPLE_KEY_ID
) {
  passport.use(
    new AppleStrategy(
      {
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        privateKeyLocation: process.env.APPLE_PRIVATE_KEY,
        callbackURL:
          process.env.NODE_ENV === "production"
            ? "https://squirell.onrender.com/api/auth/apple/callback"
            : process.env.APPLE_CALLBACK_URL ||
              "http://localhost:5000/api/auth/apple/callback",
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, idToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ appleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with same email
          if (profile.email) {
            user = await User.findOne({ email: profile.email });

            if (user) {
              // Link Apple account to existing user
              user.appleId = profile.id;
              user.isEmailVerified = true;
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          user = new User({
            appleId: profile.id,
            email: profile.email,
            firstName: profile.name?.firstName,
            lastName: profile.name?.lastName,
            isEmailVerified: true,
            authProvider: "apple",
          });

          await user.save();
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  console.log("✅ Apple OAuth strategy initialized");
} else {
  console.log("⚠️  Apple OAuth credentials not found - Apple OAuth disabled");
}

export default passport;
