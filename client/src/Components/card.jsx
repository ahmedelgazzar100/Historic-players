import "../styling/PlayerCard.css";

export default function PlayerCard(props) {
  function handleClick() {
    props.onClick(props.id);
  }
  return (
    <div className="player-card" onClick={handleClick}>
      <div className="player-image-wrapper">
        <img src={props.img} alt={props.name} className="player-image" />
      </div>
      <div className="player-info">
        <h3>{props.name}</h3>
      </div>
    </div>
  );
}
