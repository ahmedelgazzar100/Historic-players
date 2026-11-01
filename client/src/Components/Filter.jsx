import "../styling/Filters.css";
import { useEffect, useState } from "react";
import axios from "axios";
const Filters = (props) => {
  const [countries, setCountries] = useState([]);
  // const [filter, setFilter] = useState({
  //   country: "",
  //   pos: "",
  // });

  useEffect(() => {
    async function getCountries() {
      try {
        const response = await axios.get("http://localhost:5000/getcountries");
        const data = response.data;
        setCountries(data);
      } catch (err) {
        console.log(err);
      }
    }
    getCountries();
  }, []);

  const [filter, setFilter] = useState({
    country: "",
    pos: "",
  });
  function handleChange(event) {
    const { name, value } = event.target;
    const updatedFilter = {
      ...filter,
      [name]: value,
    };
    setFilter(updatedFilter);
    props.onFilter(updatedFilter);
  }

  return (
    <div className="filters-container">
      <div className="container">
        <div className="filter-group">
          <label>position</label>
          <select name="pos" onChange={handleChange}>
            <option value="">All Positions</option>
            <optgroup label="Attackers (الهجوم)">
              <option value="ST">ST (Striker - مهاجم صريح)</option>
              <option value="CF">CF (Center Forward - مهاجم متأخر)</option>
              <option value="LW">LW (Left Winger - جناح أيسر)</option>
              <option value="RW">RW (Right Winger - جناح أيمن)</option>
            </optgroup>
            <optgroup label="Midfielders (الوسط)">
              <option value="CM">CM (Central Midfielder - وسط ملعب)</option>
              <option value="CDM">
                CDM (Defensive Midfielder - وسط دفاعي)
              </option>
              <option value="CAM">
                CAM (Attacking Midfielder - صانع ألعاب)
              </option>
              <option value="LM">LM (Left Midfielder - وسط أيسر)</option>
              <option value="RM">RM (Right Midfielder - وسط أيمن)</option>
            </optgroup>
            <optgroup label="Defenders (الدفاع)">
              <option value="CB">CB (Center Back - قلب دفاع)</option>
              <option value="LB">LB (Left Back - ظهير أيسر)</option>
              <option value="RB">RB (Right Back - ظهير أيمن)</option>
              <option value="LWB">
                LWB (Left Wing Back - ظهير أيسر مهاجم)
              </option>
              <option value="RWB">
                RWB (Right Wing Back - ظهير أيمن مهاجم)
              </option>
            </optgroup>
            <optgroup label="Goalkeeper (حراسة المرمى)">
              <option value="GK">GK (Goalkeeper - حارس مرمى)</option>
            </optgroup>
          </select>
        </div>

        <div className="filter-group">
          <label>الجنسية</label>
          <select name="country" onChange={handleChange}>
            <option value="">All nationalities</option>
            {countries.map((item, index) => (
              <option value={item.country} key={index}>
                {item.country}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>النادي/الفريق</label>
          <select>
            <option value="">كل الأندية</option>
          </select>
        </div>

        <button className="reset-btn">إعادة ضبط</button>
      </div>
    </div>
  );
};

export default Filters;
