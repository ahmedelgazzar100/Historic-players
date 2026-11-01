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
  let result = await db.query("select country from players");
  result = result.rows;
  res.status(200).json(result);
});

app.get("/filter", async (req, res) => {
  const { country, position } = req.query;

  let query = "SELECT * FROM players WHERE 1=1";
  let queryParams = [];
  let index = 1;

  if (country) {
    query += ` AND country = $${index}`;
    queryParams.push(country);
    index++;
  }

  // لو المستخدم اختار مركز، بنزوده للبحث
  if (position) {
    query += ` AND position = $${index}`;
    queryParams.push(position);
    index++;
  }

  try {
    let result = await db.query(query, queryParams);
    console.log(result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
