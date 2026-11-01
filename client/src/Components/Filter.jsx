import "../styling/Filters.css"; // لو حابب تفصل الاستايل

const Filters = () => {
  return (
    <div className="filters-container">
      <div className="container">
        <div className="filter-group">
          <label>position</label>
          <select>
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
          <select>
            <option value="">كل الجنسيات</option>
            <option value="brazil">البرازيل</option>
            <option value="argentina">الأرجنتين</option>
            {/* ... الخ */}
          </select>
        </div>

        <div className="filter-group">
          <label>النادي/الفريق</label>
          <select>
            <option value="">كل الأندية</option>
            <option value="real-madrid">ريال مدريد</option>
            <option value="milan">ميلان</option>
            {/* ... الخ */}
          </select>
        </div>

        <button className="reset-btn">إعادة ضبط</button>
      </div>
    </div>
  );
};

export default Filters;
