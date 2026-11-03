import Filters from "../Components/Filter";
import axios from "axios";
import { useState, useEffect } from "react";
import PlayerCard from "../Components/card";
import Header from "../Components/Header";
import Pagination from "../Components/Pagination";
export default function Home() {
  const [cards, setCards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterItems, setFilter] = useState({
    club: "",
    country: "",
    position: "",
  });
  const [name, setName] = useState("");
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    console.log(filterItems.position);
    async function getPlayers() {
      try {
        const response = await axios.get("http://localhost:5000/", {
          params: {
            page: currentPage,
            name: name,
            ...filterItems,
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
    filterItems,
    filterItems.club,
    filterItems.country,
    filterItems.position,
    name,
  ]);

  async function handleFilter(filter) {
    setFilter(filter);
    // بنرجع اليوزر للصفحة الأولى أوتوماتيك عشان نتائج الفلتر تبدأ من الأول
    setCurrentPage(1);
  }

  async function handleName(playerName) {
    setName(playerName);
    setCurrentPage(1);
  }

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
