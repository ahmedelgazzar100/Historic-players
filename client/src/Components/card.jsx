import "../styling/PlayerCard.css";

export default function PlayerCard(props) {
  return (
    <div className="player-card">
      <div className="player-image-wrapper">
        <img
          src="https://i.pinimg.com/1200x/94/c1/b7/94c1b794a9b2d64c6c1b56c3a9100bd0.jpg"
          alt={props.name}
          className="player-image"
        />
      </div>
      <div className="player-info">
        <h3>"Lionel Messi"</h3>
      </div>
    </div>
  );
}
