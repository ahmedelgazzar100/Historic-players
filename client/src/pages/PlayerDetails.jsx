import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styling/player.css";

export default function PlayerDetails() {
  const { playerId } = useParams();
  const [player, setPlayer] = useState();
  useEffect(() => {
    async function getBio() {
      try {
        const result = await axios.get("http://localhost:5000/getbio", {
          params: {
            id: playerId,
          },
          withCredentials: true,
        });
        setPlayer(result.data);
      } catch (error) {
        console.log(error);
      }
    }
    getBio();
  }, [playerId]);

  if (!player) {
    return <div className="loading-text">Loading player data...</div>;
  }

  return (
    <div className="player-page-container">
      {/* 1. قسم الهيدر (صورة اللاعب والبيانات الأساسية) */}
      <header className="player-header">
        <div className="player-img-wrapper">
          <img src={player.img} alt={player.name} className="player-img" />
        </div>

        <div className="player-main-info">
          <h1 className="player-name">{player.name}</h1>
          <p className="player-country">📍 {player.country}</p>
          <p className="player-age">🎂 {player.birth_year} Years Old</p>
          {/* عرض المراكز كـ Array بلفه عليها أو عرضها بـ join */}
          <div className="player-positions">
            {player.position.map((pos, index) => (
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

      {/* 2. قسم السيرة الذاتية (Bio) تحت الهيدر */}
      <section className="player-bio-section">
        <h2>Biography</h2>
        <p className="player-bio-text">
          {player.bio || "No biography available for this player yet."}
        </p>
      </section>
    </div>
  );
}
