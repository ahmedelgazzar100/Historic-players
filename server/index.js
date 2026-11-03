import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
env.config();

const db = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "Historic",
  password: "123456",
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.post("/add-player", async (req, res) => {
  const { name, position, country, birth_year, img, teams } = req.body;

  try {
    const playerResult = await db.query(
      "INSERT INTO players (name, position, country,birth_year,img) VALUES ($1, $2, $3,$4,$5) RETURNING id",
      [name, position, country, birth_year, img],
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

// Endpoint لجلـب الأساطير متقسمين صفحات
app.get("/", async (req, res) => {
  try {
    // 1. استقبال رقم الصفحة من الـ Query Params (لو متبعتش بنفترض إنه صفحة 1)
    const page = parseInt(req.query.page) || 1;
    const { country, position, club } = req.query;
    const limit = 10; // عدد اللعيبة في الصفحة الواحدة
    const offset = (page - 1) * limit;
    console.log(req.query);
    // 2. استعلام يجيب عدد اللعيبة الكلي في الداتابيز (عشان نحسب عدد الصفحات)
    const countResult = await db.query("SELECT COUNT(*) FROM players");
    const totalPlayers = parseInt(countResult.rows[0].count);

    // 3. حساب عدد الصفحات الكلي (بنستخدم Math.ceil عشان نقرّب للأكبر)
    const totalPages = Math.ceil(totalPlayers / limit);

    let query = `
    SELECT DISTINCT players.* 
    FROM players 
     JOIN player_teams ON players.id = player_teams.player_id 
     JOIN teams ON player_teams.team_id = teams.id 
     WHERE 1=1
  `; //join now u have new table u can add query to search

    let queryParams = [];
    let index = 1;

    if (country) {
      query += ` AND players.country = $${index}`;
      queryParams.push(country);
      index++;
    }

    if (position) {
      query += ` AND $${index} = ANY(players.position)`;
      queryParams.push(position);
      index++;
    }

    if (club) {
      query += ` AND teams.team_name = $${index}`;
      queryParams.push(club);
      index++;
    }
    // 4. إضافة الـ ORDER BY والـ LIMIT و OFFSET في الآخر خالص وربطهم بالأرقام اللي بعد الشروط
    query += ` ORDER BY players.id ASC LIMIT $${index} OFFSET $${index + 1}`;
    queryParams.push(limit, offset); // هيدخلوا كآخر اتنين parameters

    // 5. استعلام يجيب اللعيبة بتوع الصفحة الحالية فقط
    const playersResult = await db.query(query, queryParams);
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

app.get("/getcountries", async (req, res) => {
  let result = await db.query("select  DISTINCT  country from players");
  result = result.rows;
  res.status(200).json(result);
});

// app.get("/filter", async (req, res) => {
//   const { country, position, club } = req.query;

//   let query = `
//     SELECT DISTINCT players.*
//     FROM players
//      JOIN player_teams ON players.id = player_teams.player_id
//      JOIN teams ON player_teams.team_id = teams.id
//     WHERE 1=1
//   `; //join now u have new table u can add query to search

//   let queryParams = [];
//   let index = 1;

//   if (country) {
//     query += ` AND players.country = $${index}`;
//     queryParams.push(country);
//     index++;
//   }

//   if (position) {
//     query += ` AND $${index} = ANY(players.position)`;
//     queryParams.push(position);
//     index++;
//   }

//   if (club) {
//     query += ` AND teams.team_name = $${index}`;
//     queryParams.push(club);
//     index++;
//   }

//   try {
//     let result = await db.query(query, queryParams);
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.log("error", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// });

app.get("/filterName", async (req, res) => {
  const { name } = req.query;
  try {
    let result = await db.query("select * from players where name Ilike ($1)", [
      `%${name}%`,
    ]);
    result = result.rows;
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/getTeams", async (req, res) => {
  try {
    const response = await db.query("select * from teams");
    res.status(200).json(response.rows);
  } catch (err) {
    console.log(err);
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
