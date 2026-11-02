import Filters from "../Components/Filter";
import axios from "axios";
import { useState, useEffect } from "react";
import PlayerCard from "../Components/card";
import Header from "../Components/Header";
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

  async function handleFilter(filter) {
    console.log(filter);
    try {
      const response = await axios.get("http://localhost:5000/filter", {
        params: {
          club: filter.club,
          country: filter.country,
          position: filter.pos,
        },
        withCredentials: true,
      });
      setCards(response.data);
    } catch (err) {
      console.log(err);
    }
  }
  async function filterByName(playerName) {
    try {
      const response = await axios.get("http://localhost:5000/filterName", {
        params: {
          name: playerName,
        },
        withCredentials: true,
      });
      const data = response.data;
      setCards(data);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <Header onName={filterByName} />
      <Filters onFilter={handleFilter} />
      <div className="players-grid">
        {cards.map((player, index) => {
          return <PlayerCard name={player.name} img={player.img} key={index} />;
        })}
      </div>
    </>
  );
}
