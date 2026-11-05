import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayerCard from "../Components/card";
import "../styling/PlayerCard.css";
export default function UserFav() {
  const navigate = useNavigate();
  const [favPlayers, setFavPlayers] = useState([]);
  useEffect(() => {
    async function getFav() {
      try {
        await axios.get("http://localhost:5000/api/check-auth", {
          withCredentials: true,
        });

        const result = await axios.get("http://localhost:5000/getfav", {
          withCredentials: true,
        });

        const players = result.data;

        setFavPlayers(players);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/");
        }
      }
    }
    getFav();
  }, []);

  function handleClick(playerId) {
    console.log(playerId);
    navigate(`/players/${playerId}`);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--main-color, #fcf6f5)",
        paddingBottom: "60px",
      }}
    >
      <div
        className="container"
        style={{ padding: "30px 15px", maxWidth: "1200px", margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2
            style={{
              color: "var(--alt-color, #7b9acc)",
              fontSize: "2.2rem",
              fontWeight: "700",
              marginBottom: "10px",
            }}
          >
            ⭐ Your Legends
          </h2>
          <p style={{ color: "#666", fontSize: "1.05rem" }}>
            Here are all the legends you have saved, available for you to review
            at any time.
          </p>
        </div>

        {favPlayers.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#888",
              fontSize: "1.2rem",
            }}
          >
            <p>لا توجد أي لعيبة في قائمتك المفضلة حالياً!</p>
          </div>
        ) : (
          <div className="players-grid">
            {favPlayers.map((player) => (
              <PlayerCard
                name={player.name}
                img={player.img}
                key={player.id}
                id={player.id}
                onClick={handleClick}
              />
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <button
            onClick={() => navigate("/home")}
            style={{
              backgroundColor: "var(--alt-color, #7b9acc)",
              color: "white",
              border: "none",
              padding: "12px 30px",
              borderRadius: "25px",
              fontSize: "1.5rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              transition: "0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.opacity = "0.9")}
            onMouseOut={(e) => (e.target.style.opacity = "1")}
          >
            🏠 (Home)
          </button>
        </div>
      </div>
    </div>
  );
}
