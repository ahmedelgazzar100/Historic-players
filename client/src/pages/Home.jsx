import Filters from "../Components/Filter";
import { useState } from "react";
import PlayerCard from "../Components/card";
export default function Home() {
  const [cards, setCards] = useState([
    {
      id: 1,
      name: "Lionel Messi",
      img: "https://i.pinimg.com/1200x/94/c1/b7/94c1b794a9b2d64c6c1b56c3a9100bd0.jpg",
    },
  ]);

  return (
    <>
      <Filters />
      <div className="players-grid">
        {cards.map((player, index) => {
          return <PlayerCard name={player.name} img={player.img} key={index} />;
        })}
      </div>
    </>
  );
}
