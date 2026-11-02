import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
env.config();

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Historic",
  password: "123456",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  let result = await db.query("select * from players");
  result = result.rows;
  res.status(200).json(result);
});

app.get("/getcountries", async (req, res) => {
  let result = await db.query("select  DISTINCT  country from players");
  result = result.rows;
  res.status(200).json(result);
});

app.get("/filter", async (req, res) => {
  const { country, position, club } = req.query;

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

  try {
    let result = await db.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Server Error" });
  }
});

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
