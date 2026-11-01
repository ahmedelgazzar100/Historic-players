import Filters from "../Components/Filter";
import axios from "axios";
import { useState, useEffect } from "react";
import PlayerCard from "../Components/card";
export default function Home() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    async function getPlayers() {
      try {
        const response = await axios.get("http://localhost:5000/", {
          withCredentials: true,
        });
        setCards(response.data);
      } catch (error) {
        console.log("error", error);
      }
    }
    getPlayers();
  }, []);
  console.log(cards);

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
