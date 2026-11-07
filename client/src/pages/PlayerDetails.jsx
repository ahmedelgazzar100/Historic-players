import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styling/player.css";

export default function PlayerDetails() {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const { playerId } = useParams();
  const [player, setPlayer] = useState();
  useEffect(() => {
    async function getBio() {
      try {
        // 1. نتأكد الأول إن اليوزر مسجل دخول
        await axios.get("/api/check-auth", {
          withCredentials: true,
        });

        const result = await axios.get("/api/getbio", {
          params: {
            id: playerId,
          },
          withCredentials: true,
        });
        setPlayer(result.data.information);
        if (result.data.isFavorite) {
          setIsFavorite(true);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/");
        }
      }
    }
    getBio();
  }, [playerId]);

  if (!player) {
    return <div className="loading-text">Loading player data...</div>;
  }

  function handleClick() {
    navigate("/home");
  }

  const toggleFavorite = async () => {
    try {
      if (!isFavorite) {
        const result = await axios.post(
          "/api/add-favorite",
          { playerId: playerId }, //req.body
          { withCredentials: true }, //cookies
        );
        console.log(result.data);
        setIsFavorite(true);
      } else {
        await axios.delete(`/api/remove-favorite/${playerId}`, {
          withCredentials: true,
        });
        setIsFavorite(false);
      }
    } catch (error) {
      console.log("Error updating favorite:", error);
    }
  };

  return (
    <div className="player-page-container">
      <header className="player-header">
        <div className="player-img-wrapper">
          <img src={player.img} alt={player.name} className="player-img" />
        </div>

        <div className="player-main-info">
          <h1 className="player-name">{player.name}</h1>
          <p className="player-country">📍 {player.country}</p>
          <p className="player-age">🎂 {player.birth_year} Years Old</p>
          <div className="player-positions">
            {player.position?.map((pos, index) => (
              <span key={index} className="position-badge">
                {pos}
              </span>
            ))}
          </div>
        </div>
        <div className="player-teams-container">
          <span className="teams-title">Teams: </span>
          <div className="teams-list">
            {player.my_teams?.map((team, index) => (
              <span key={index} className="team-badge">
                {team}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="player-bio-section">
        <h2>Biography</h2>
        <p className="player-bio-text">
          {player.bio || "No biography available for this player yet."}
        </p>
      </section>
      <button className="goHome" onClick={handleClick}>
        Home
      </button>
      <button
        onClick={toggleFavorite}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1.5rem",
        }}
        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      >
        {isFavorite ? (
          <FaHeart style={{ color: "#e74c3c" }} />
        ) : (
          <FaRegHeart style={{ color: "#7b9acc" }} />
        )}
      </button>
    </div>
  );
}
