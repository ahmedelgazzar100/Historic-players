import Filters from "../Components/Filter";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PlayerCard from "../Components/card";
import Header from "../Components/Header";
import Pagination from "../Components/Pagination";
export default function Home() {
  const [cards, setCards] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const currentClub = searchParams.get("club") || "";
  const currentCountry = searchParams.get("country") || "";
  const currentPosition = searchParams.get("position") || "";
  const currentName = searchParams.get("name") || "";

  const handlePageChange = (newPage) => {
    setSearchParams({
      page: newPage,
      club: currentClub,
      country: currentCountry,
      position: currentPosition,
      name: currentName,
    });
  };

  const handleFilter = (filter) => {
    setSearchParams({
      page: 1, // نرجع لأول صفحة مع كل فلتر جديد
      club: filter.club || "",
      country: filter.country || "",
      position: filter.position || "",
      name: currentName,
    });
  };

  const handleName = (playerName) => {
    setSearchParams({
      page: 1, // نرجع لأول صفحة مع كل بحث جديد
      club: currentClub,
      country: currentCountry,
      position: currentPosition,
      name: playerName,
    });
  };

  useEffect(() => {
    async function getPlayers() {
      try {
        const response = await axios.get("http://localhost:5000/", {
          params: {
            page: currentPage,
            name: currentName,
            club: currentClub,
            country: currentCountry,
            position: currentPosition,
          },
          withCredentials: true,
        });
        setCards(response.data.players);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.log("error", error);
      }
    }
    getPlayers();
  }, [
    currentPage,
    currentClub,
    currentCountry,
    currentPosition,
    currentName,
    searchParams,
  ]);

  return (
    <>
      <Header onName={handleName} />
      <Filters onFilter={handleFilter} />
      <div className="players-grid">
        {cards.map((player, index) => {
          return <PlayerCard name={player.name} img={player.img} key={index} />;
        })}
      </div>
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </>
  );
}
