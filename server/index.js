import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";
import connectPgSimple from "connect-pg-simple"; //for vercel hosting

const PgSession = connectPgSimple(session);

const app = express();
app.use(express.json());
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
env.config();

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  ssl: { rejectUnauthorized: false },
});

app.set("trust proxy", 1);

app.use(
  session({
    store: new PgSession({ pool: db }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "lax", // لأن الفرونت والباك دومينين مختلفين
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); //مش ضروريه اوي لان احنا فاصلين الفرونت عن الباك ومش شغالين ssd

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if (req.url.startsWith("/api")) {
    req.url = req.url.slice(4) || "/";
  }
  next();
});

app.post("/add-player", async (req, res) => {
  //في البوست مان ببعت معاها في الهدير الكي يبقي كوكي والفاليو connect.sid=وبحط الاسم بتاعها عشان يشوف السيشن
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }
  // 2. التأكد إن الإيميل اللي عامل لوجين هو إيميلي الشخصي (الأدمن)
  const adminEmail = process.env.ADMIN_EMAIL; // my email
  if (req.user.email !== adminEmail) {
    return res
      .status(403)
      .json({ message: "غير مصرح لك بإضافة بيانات، هذه الصلاحية للأدمن فقط" });
  }
  const { name, position, country, birth_year, img, teams, bio } = req.body;

  try {
    const playerResult = await db.query(
      "INSERT INTO players (name, position, country,birth_year,img,bio) VALUES ($1, $2, $3,$4,$5,$6) RETURNING id",
      [name, position, country, birth_year, img, bio],
    );
    const newPlayerId = playerResult.rows[0].id;

    for (let teamName of teams) {
      const teamResult = await db.query(
        "SELECT id FROM teams WHERE team_name = $1",
        [teamName],
      );

      if (teamResult.rows.length > 0) {
        const teamId = teamResult.rows[0].id;

        await db.query(
          "INSERT INTO player_teams (player_id, team_id) VALUES ($1, $2)",
          [newPlayerId, teamId],
        );
      } else {
        const teamResult = await db.query(
          "insert into teams (team_name) values ($1) RETURNING id",
          [teamName],
        );
        const teamid = teamResult.rows[0].id;
        await db.query(
          "INSERT INTO player_teams (player_id, team_id) VALUES ($1, $2)",
          [newPlayerId, teamid],
        );
      }
    }
    res.status(201).send("Player and teams added successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/players", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }
  //ترتيب الاوامر في الكيوري مهم بتحط وير اول بعد كدا شروطك كلها بعدين ليميت واوفسيت
  try {
    let page = parseInt(req.query.page) || 1;
    const { country, club, name } = req.query;
    const position = req.query.position;
    const limit = 10;
    const offset = (page - 1) * limit;

    // 1. الشروط المشتركة للبحث والفلترة
    let whereClause = "WHERE 1=1";
    let queryParams = [];
    let index = 1;
    if (name) {
      whereClause += ` AND players.name Ilike $${index}`;
      queryParams.push(`%${name}%`);
      index++;
    }

    if (country) {
      whereClause += ` AND players.country = $${index}`;
      queryParams.push(country);
      index++;
    }

    if (position) {
      whereClause += ` AND $${index} = ANY(players.position)`;
      queryParams.push(position);
      index++;
    }

    if (club) {
      whereClause += ` AND teams.team_name = $${index}`;
      queryParams.push(club);
      index++;
    }

    // 2. هنجيب العدد الإجمالي الحقيقي (سواء فيه فلتر أو مفيش) باستخدام COUNT
    const countQuery = `
      SELECT COUNT(DISTINCT players.id)  
      FROM players 
      JOIN player_teams ON players.id = player_teams.player_id 
      JOIN teams ON player_teams.team_id = teams.id 
      ${whereClause}
    `; //distinct عشان ميكررش اللعيبه
    // console.log("Generated Query:", countQuery);
    const countResult = await db.query(countQuery, queryParams);
    // console.log("countResult", countResult);
    const totalPlayers = parseInt(countResult.rows[0].count); // الرقم الحقيقي (مثلاً "35")
    const totalPages = Math.ceil(totalPlayers / limit); // عدد الصفحات الحقيقي

    // 3. نجيب لعيبة الصفحة الحالية فقط بالـ LIMIT والـ OFFSET
    let playersQuery = `
      SELECT DISTINCT players.* 
      FROM players 
      JOIN player_teams ON players.id = player_teams.player_id 
      JOIN teams ON player_teams.team_id = teams.id 
      ${whereClause}
      ORDER BY players.id ASC    
      LIMIT $${index} OFFSET $${index + 1}
    `; //مترتبين تصاعدي من الاصغر للاكبر حسب الاي دي

    const playersParams = [...queryParams, limit, offset];
    const playersResult = await db.query(playersQuery, playersParams);

    // 4. الرد النهائي للفرونت إند
    if (page > totalPages && totalPages > 0) {
      return res.status(404).json({ message: "الصفحة غير موجودة" });
    }
    if (totalPages === 0) {
      return res.status(404).json({ message: "الصفحة غير موجودة" });
    }
    res.json({
      players: playersResult.rows,
      currentPage: page,
      totalPages: totalPages,
      totalPlayers: totalPlayers,
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/getTeams", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }
  try {
    const response = await db.query("select * from teams");
    res.status(200).json(response.rows);
  } catch (err) {
    res.status(500);
  }
});
app.get("/getcountries", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }
  let result = await db.query("select  DISTINCT  country from players");
  result = result.rows;
  res.status(200).json(result);
});

app.get("/getbio", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }
  const id = parseInt(req.query.id);
  try {
    const result = await db.query(
      `select   players.*  , ARRAY_AGG (teams.team_name) AS my_teams  
       FROM players  
       join player_teams on players.id = player_teams.player_id 
       JOIN teams ON player_teams.team_id = teams.id  
       where players.id=($1)  
       Group by players.id `,
      [id],
    );
    const userId = req.user.id;
    const isFav = await db.query(
      "select user_id from user_fav where user_id=$1 and player_id=$2",
      [userId, id],
    );
    const information = result.rows[0];
    const isFavorite = isFav.rows.length > 0; // هيرجع true أو false

    res.status(200).json({
      information,
      isFavorite: isFavorite,
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/add-favorite", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }
  try {
    const playerId = req.body.playerId;
    const userId = req.user.id;

    const result = await db.query(
      "insert into user_fav (user_id,player_id) values ($1,$2)",
      [userId, playerId],
    );
    res.status(201).json({ message: "Added to favorites successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

app.delete("/remove-favorite/:playerId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }

  try {
    const playerId = req.params.playerId;
    const userId = req.user.id;

    await db.query(
      "DELETE FROM user_fav WHERE user_id = $1 AND player_id = $2",
      [userId, playerId],
    );

    console.log(`Removed player ${playerId} for user ${userId}`);
    res.status(200).json({ message: "delete is done" });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/getfav", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }

  try {
    const players = await db.query(
      `select players.name,players.img,players.id
       from players 
       join user_fav 
       on players.id=user_fav.player_id 
       join users 
       on users.id=user_fav.user_id
       where users.id =$1
       `,
      [req.user.id],
    );
    const result = players.rows;
    res.status(201).json(result);
  } catch (error) {
    res.status(500);
  }
});

app.get("/check-auth", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res
      .status(401)
      .json({ isAuthenticated: false, message: "غير مسجل الدخول" });
  }
});

app.post("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return console.log("Error destroying session:", err);
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.CLIENT_URL || "http://localhost:5173",
  }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/home`);
  },
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.CALLBACK_URL ||
        "http://localhost:5000/auth/google/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, Profile, cb) => {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          Profile.email,
        ]);
        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO users (email, user_password) VALUES ($1, $2) RETURNING *",
            [Profile.email, "google"],
          );
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    },
  ),
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
}); //run only with login and saved in cookie.

passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    cb(null, result.rows[0]);
  } catch (err) {
    cb(err);
  }
}); //run with every request.

if (!process.env.VERCEL) {
  app.listen(5000, () => console.log("Server started on port 5000"));
}
export default app;
