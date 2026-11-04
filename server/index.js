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

// Endpoint لجلـب الأساطير متقسمين صفحات
app.get("/", async (req, res) => {
  //ترتيب الاوامر في الكيوري مهم بتحط وير اول بعد كدا شروطك كلها بعدين ليميت واوفسيت
  try {
    const page = parseInt(req.query.page) || 1;
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
    `;
    // console.log("Generated Query:", countQuery);
    const countResult = await db.query(countQuery, queryParams);
    // console.log("countResult", countResult);
    const totalPlayers = parseInt(countResult.rows[0].count); // الرقم الحقيقي (مثلاً 35)
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
    `;

    const playersParams = [...queryParams, limit, offset];
    const playersResult = await db.query(playersQuery, playersParams);

    // 4. الرد النهائي للفرونت إند
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
  try {
    const response = await db.query("select * from teams");
    res.status(200).json(response.rows);
  } catch (err) {
    console.log(err);
  }
});
app.get("/getcountries", async (req, res) => {
  let result = await db.query("select  DISTINCT  country from players");
  result = result.rows;
  res.status(200).json(result);
});

app.get("/getbio", async (req, res) => {
  const id = parseInt(req.query.id);
  // console.log(id);
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
    const information = result.rows[0];
    res.status(201).json(information);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/add-favorite", async (req, res) => {
  try {
    const playerId = req.body.playerId;
    const result = await db.query(
      "insert into user_fav (user_id,player_id) values ($1,$2)",
      [1, playerId],
    );
    res.status(201).json({ message: "Added to favorites successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
