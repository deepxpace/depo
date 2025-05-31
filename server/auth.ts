import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "./db";
import bcrypt from "bcrypt";

declare global {
  namespace Express {
    interface User {
      id: number;
      name: string;
      email: string;
      role: string;
      phone?: string;
      address?: string;
    }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

async function comparePasswords(supplied: string, stored: string) {
  return await bcrypt.compare(supplied, stored);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "neptokart-nepal-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    },
    name: 'connect.sid',
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' }, // Use email instead of username
      async (email, password, done) => {
        try {
          const user = await db('users').where('email', email).first();
          if (!user) {
            return done(null, false, { message: "User not found" });
          }
          
          const passwordMatch = await comparePasswords(password, user.password);
          if (!passwordMatch) {
            return done(null, false, { message: "Invalid password" });
          }
          
          // Remove password from user object
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        } catch (error) {
          console.error("Login error:", error);
          return done(error);
        }
      }
    )
  );

  // Google OAuth Strategy - only register if environment variables exist
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email found in Google profile"), null);
            }

            // Check if user already exists
            let user = await db('users').where('email', email).first();

            if (!user) {
              // Create new user with Google profile
              const [newUser] = await db('users')
                .insert({
                  name: profile.displayName || 'Google User',
                  email: email,
                  password: await hashPassword(randomBytes(32).toString("hex")), // Random password for OAuth users
                  role: "customer",
                })
                .returning('*');

              const { password: _, ...userWithoutPassword } = newUser;
              return done(null, userWithoutPassword);
            }

            const { password: _, ...userWithoutPassword } = user;
            return done(null, userWithoutPassword);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await db('users').where('id', id).first();
      if (!user) {
        return done(null, false);
      }
      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Registration request body:", req.body);
      const { name, email, password, phone, address, role = "customer" } = req.body;
      
      // Validate required fields
      if (!name || !email || !password) {
        console.log("Missing required fields:", { name: !!name, email: !!email, password: !!password });
        return res.status(400).json({ error: "Name, email and password are required" });
      }

      const existingUser = await db('users').where('email', email).first();
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const [user] = await db('users')
        .insert({
          name,
          email,
          password: await hashPassword(password),
          phone,
          address,
          role,
        })
        .returning('*');

      const { password: _, ...userWithoutPassword } = user;

      req.login(userWithoutPassword, (err) => {
        if (err) {
          console.error("Login after registration error:", err);
          return next(err);
        }
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      
      if (!user) {
        console.log("Login failed:", info?.message || "Invalid credentials");
        return res.status(400).json({ error: info?.message || "Invalid credentials" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Login error:", loginErr);
          return res.status(500).json({ error: "Login failed" });
        }
        
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    // Handle session-based logout
    if (req.logout) {
      req.logout((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ error: "Logout failed" });
        }
        return res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      // For JWT-based auth, just return success (client will clear token)
      return res.status(200).json({ message: "Logged out successfully" });
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Google OAuth routes - only if Google strategy is configured
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get("/api/auth/google", 
      passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get("/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/auth" }),
      (req, res) => {
        // Successful authentication, redirect to home
        res.redirect("/");
      }
    );
  }
}