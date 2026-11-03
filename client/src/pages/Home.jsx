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
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    async function getPlayers() {
      try {
        const response = await axios.get("http://localhost:5000/", {
          params: {
            page: currentPage,
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
  ]);

  async function handleFilter(filter) {
    // setFilter(filter);
    // try {
    //   const response = await axios.get("http://localhost:5000/", {
    //     params: {
    //       page: currentPage,
    //       club: filter.club,
    //       country: filter.country,
    //       position: filter.pos,
    //     },
    //     withCredentials: true,
    //   });
    //   setFilter(filterItems);
    //   setCards(response.data.players);
    // } catch (err) {
    //   console.log(err);
    // }
    // بنحدث الـ filterItems بالقيم الجديدة
    setFilter(filter);

    // بنرجع اليوزر للصفحة الأولى أوتوماتيك عشان نتائج الفلتر تبدأ من الأول
    setCurrentPage(1);
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
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </>
  );
}
