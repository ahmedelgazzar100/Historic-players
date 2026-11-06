import Filters from "../Components/Filter";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const handlePageChange = (newPage) => {
    setSearchParams({
      page: newPage,
      club: currentClub,
      country: currentCountry,
      position: currentPosition,
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
  //use search params to make single way of truth and to change the url so u can go forward and back and refresh and save page
  const handleFilter = (filter) => {
    setSearchParams({
      page: 1, // نرجع لأول صفحة مع كل فلتر جديد
      club: filter.club || "",
      country: filter.country || "",
      position: filter.position || "",
      name: currentName,
    });
  };

  useEffect(
    () => {
      async function getPlayers() {
        try {
          // 1. نتأكد الأول إن اليوزر مسجل دخول
          await axios.get("http://localhost:5000/api/check-auth", {
            withCredentials: true,
          });

          // 2. لو عدى السطر اللي فوق من غير إيرور، معناه إنه مسجل، نجيب اللعيبة عادي
          const response = await axios.get("http://localhost:5000/", {
            params: {
              page: currentPage,
              name: currentName,
              club: currentClub,
              country: currentCountry,
              position: currentPosition,
            },
            withCredentials: true, //to tell the browser that i know it differ domain but send this request i told u so he send the cookie with session id
          });

          setCards(response.data.players);
          setTotalPages(response.data.totalPages);
        } catch (error) {
          // 3. لو حصل إيرور بسبب إن اليوزر مش مسجل (401)، اطرده لبرة فوراً
          if (error.response && error.response.status === 401) {
            navigate("/");
          }
          //لو حصل ايرور عشان بيطلب حاجه مش موجوده
          if (error.response && error.response.status === 404) {
            navigate("/not-found");
          }
        }
      }

      getPlayers();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      currentPage,
      currentClub,
      currentCountry,
      currentPosition,
      currentName,
      searchParams,
    ],
  );

  function handleClick(playerId) {
    navigate(`/players/${playerId}`);
  }
  const handleLogout = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/logout", {
        withCredentials: true,
      });

      console.log(response.data.message);

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  function onFav() {
    navigate("/userfav");
  }

  return (
    <>
      <Header onName={handleName} onFavClick={onFav} />
      <Filters onFilter={handleFilter} />
      <div className="players-grid">
        {cards.map((player) => {
          return (
            <PlayerCard
              name={player.name}
              img={player.img}
              key={player.id}
              id={player.id}
              onClick={handleClick}
            />
          );
        })}
      </div>
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      <button
        onClick={handleLogout}
        style={{
          background: "none",
          border: "none",
          color: "#666",
          fontSize: "0.95rem",
          fontWeight: "600",
          cursor: "pointer",
          padding: "6px 12px",
          transition: "color 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#7b9acc")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
      >
        Logout
      </button>
    </>
  );
}
