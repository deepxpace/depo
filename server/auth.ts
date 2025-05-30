import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "neptokart-nepal-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
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
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        
        const passwordMatch = await comparePasswords(password, user.password);
        if (!passwordMatch) {
          return done(null, false, { message: "Invalid password" });
        }
        
        return done(null, user);
      } catch (error) {
        console.error("Login error:", error);
        return done(error);
      }
    })
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
            // Check if user already exists
            let user = await storage.getUserByUsername(profile.id);

            if (!user) {
              // Create new user with Google profile
              user = await storage.createUser({
                username: profile.id,
                password: await hashPassword(randomBytes(32).toString("hex")), // Random password for OAuth users
                role: "customer",
              });
            }

            return done(null, user);
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
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Registration request body:", req.body);
      const { username, password, role = "customer" } = req.body;
      
      // Validate required fields
      if (!username || !password) {
        console.log("Missing required fields:", { username: !!username, password: !!password });
        return res.status(400).json({ error: "Username and password are required" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        role,
      });

      req.login(user, (err) => {
        if (err) {
          console.error("Login after registration error:", err);
          return next(err);
        }
        res.status(201).json(user);
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