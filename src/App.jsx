import { useState, useEffect } from "react";

const TABS = ["主页", "训练", "饮食", "体重", "历史"];

const WORKOUT_TEMPLATES = {
  A: [
    { name: "卧推", sets: 5, reps: 5, weight: 50 },
    { name: "辅助引体向上", sets: 5, reps: 8, weight: 40 },
    { name: "哑铃侧平举", sets: 4, reps: 15, weight: 10 },
    { name: "臀桥", sets: 3, reps: 15, weight: 0 },
  ],
  B: [
    { name: "硬拉", sets: 1, reps: 5, weight: 100 },
    { name: "杠铃推举", sets: 5, reps: 5, weight: 35 },
    { name: "高位下拉", sets: 4, reps: 10, weight: 60 },
    { name: "面拉", sets: 3, reps: 15, weight: 20 },
    { name: "臀桥", sets: 3, reps: 15, weight: 0 },
  ],
  C: [
    { name: "深蹲", sets: 5, reps: 5, weight: 90 },
    { name: "哑铃肩推", sets: 4, reps: 10, weight: 20 },
    { name: "哑铃侧平举", sets: 3, reps: 15, weight: 10 },
    { name: "平板支撑", sets: 3, reps: 1, weight: 0 },
  ],
  有氧: [],
};

const EXERCISE_MET = {
  卧推: 3.5,
  辅助引体向上: 4.0,
  哑铃侧平举: 3.0,
  臀桥: 3.5,
  硬拉: 6.0,
  杠铃推举: 4.0,
  高位下拉: 4.0,
  面拉: 3.0,
  深蹲: 6.0,
  哑铃肩推: 3.5,
  平板支撑: 3.5,
};

function estimateExerciseCalories(exercises, bodyweightKg = 92) {
  let total = 0;
  for (const ex of exercises) {
    const met = EXERCISE_MET[ex.name] || 3.5;
    const sets = parseFloat(ex.sets) || 0;
    const durationHours = (sets * 2.7) / 60;
    total += met * bodyweightKg * durationHours;
  }
  total += 3.5 * bodyweightKg * (10 / 60);
  return Math.round(total);
}

function estimateCardioCalories(cardioText, bodyweightKg = 92) {
  if (!cardioText) return 0;
  const t = cardioText.toLowerCase();
  let met = 5.0;
  let minutes = 30;
  const minMatch = t.match(/(\d+)\s*分钟/);
  if (minMatch) minutes = parseInt(minMatch[1], 10);
  if (t.includes("骑车") || t.includes("自行车")) met = 6.0;
  else if (t.includes("椭圆")) met = 5.0;
  else if (t.includes("跑步") || t.includes("跑")) met = 8.0;
  else if (t.includes("快走")) met = 4.5;
  else if (t.includes("游泳")) met = 7.0;
  return Math.round(met * bodyweightKg * (minutes / 60));
}

const DAILY_GOALS = { cal: 2100, protein: 160, carbs: 180, fat: 60 };
const BODY_WEIGHT = 92;
const START_WEIGHT = 92;
const TARGET_WEIGHT = 84;

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function formatDate(d) {
  return new Date(d).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}
function getWeekDates() {
  const today = new Date();
  const day = today.getDay() === 0 ? 6 : today.getDay() - 1;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - day + i);
    return d.toISOString().split("T")[0];
  });
}

const S = {
  app: {
    minHeight: "100vh",
    background: "#0D0D0D",
    color: "#F0EDE8",
    fontFamily: "'Noto Sans SC','PingFang SC',sans-serif",
    fontWeight: 300,
    maxWidth: 480,
    margin: "0 auto",
    paddingBottom: 80,
  },
  header: {
    background: "#161616",
    borderBottom: "2px solid #E8352A",
    padding: "18px 20px 14px",
  },
  headerTitle: {
    fontFamily: "Georgia,serif",
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 2,
    marginBottom: 2,
  },
  headerSub: { fontSize: 11, color: "#666", letterSpacing: 1 },
  tabs: {
    display: "flex",
    background: "#161616",
    borderBottom: "1px solid #2A2A2A",
    position: "sticky",
    top: 0,
    zIndex: 10,
    overflowX: "auto",
  },
  tab: (a) => ({
    flex: "0 0 auto",
    padding: "12px 16px",
    fontSize: 12,
    fontWeight: a ? 700 : 400,
    color: a ? "#E8352A" : "#666",
    background: "none",
    border: "none",
    borderBottom: a ? "2px solid #E8352A" : "2px solid transparent",
    cursor: "pointer",
    letterSpacing: 1,
    whiteSpace: "nowrap",
  }),
  sec: { padding: "16px" },
  lbl: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#E8352A",
    textTransform: "uppercase",
    marginBottom: 8,
    display: "block",
  },
  card: {
    background: "#1F1F1F",
    border: "1px solid #2A2A2A",
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
  },
  inp: {
    width: "100%",
    background: "#161616",
    border: "1px solid #2A2A2A",
    borderRadius: 4,
    color: "#F0EDE8",
    padding: "10px 12px",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
  inpSm: {
    background: "#161616",
    border: "1px solid #2A2A2A",
    borderRadius: 4,
    color: "#F0EDE8",
    padding: "6px 4px",
    fontSize: 12,
    fontFamily: "inherit",
    outline: "none",
    width: 52,
    textAlign: "center",
  },
  btn: (v = "primary") => ({
    background:
      v === "primary"
        ? "#E8352A"
        : v === "green"
          ? "#2E7D32"
          : v === "ghost"
            ? "transparent"
            : "#2A2A2A",
    color: v === "ghost" ? "#666" : "#fff",
    border: v === "ghost" ? "1px solid #2A2A2A" : "none",
    borderRadius: 4,
    padding: "10px 20px",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1,
    cursor: "pointer",
    fontFamily: "inherit",
  }),
  btnSm: (a) => ({
    background: a ? "#E8352A" : "#2A2A2A",
    color: a ? "#fff" : "#666",
    border: "none",
    borderRadius: 3,
    padding: "6px 12px",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: 1,
  }),
  statBox: {
    background: "#161616",
    border: "1px solid #2A2A2A",
    borderRadius: 4,
    padding: "10px 6px",
    textAlign: "center",
  },
  statVal: {
    fontSize: 22,
    fontWeight: 700,
    color: "#E8352A",
    lineHeight: 1,
    fontFamily: "Georgia,serif",
  },
  statLbl: { fontSize: 9, color: "#666", letterSpacing: 1, marginTop: 4 },
  exRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 0",
    borderBottom: "1px solid #2A2A2A",
  },
  histItem: {
    background: "#1F1F1F",
    border: "1px solid #2A2A2A",
    borderLeft: "3px solid #E8352A",
    borderRadius: "0 6px 6px 0",
    padding: 12,
    marginBottom: 8,
  },
  empty: { textAlign: "center", color: "#444", fontSize: 13, padding: "32px 0" },
  macroBar: {
    display: "flex",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    margin: "8px 0 4px",
  },
  pRow: { marginBottom: 10 },
  pLabel: { display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 },
  pBg: { background: "#2A2A2A", borderRadius: 3, height: 8, overflow: "hidden" },
  pFill: (pct, color) => ({
    width: `${Math.min(100, Math.max(0, pct))}%`,
    height: "100%",
    background: color,
    borderRadius: 3,
    transition: "width 0.5s",
  }),
};

function HomeTab({ records, onTabChange }) {
  const today = todayStr();
  const weekDates = getWeekDates();
  const DAY_LABELS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  const todayWorkouts = records.filter((r) => r.type === "workout" && r.date === today);
  const todayDiet = records.filter((r) => r.type === "diet" && r.date === today);
  const latestWeight = records.filter((r) => r.type === "weight").slice(-1)[0];

  const todayCalIn = todayDiet.reduce((s, r) => s + (r.totalCal || 0), 0);
  const todayCalBurn = todayWorkouts.reduce((s, r) => s + (r.caloriesBurned || 0), 0);
  const bmr = 2050;
  const tdee = bmr + 300;
  const totalBurn = tdee + todayCalBurn;
  const deficit = totalBurn - todayCalIn;

  const weekWorkouts = records.filter(
    (r) => r.type === "workout" && weekDates.includes(r.date),
  );
  const weekDietRecords = records.filter((r) => r.type === "diet" && weekDates.includes(r.date));
  const weekCalIn = weekDietRecords.reduce((s, r) => s + (r.totalCal || 0), 0);
  const weekCalBurn = weekWorkouts.reduce((s, r) => s + (r.caloriesBurned || 0), 0);
  const weekDeficit = tdee * 7 - weekCalIn + weekCalBurn;

  let streak = 0;
  const sortedDates = [
    ...new Set(records.filter((r) => r.type === "workout").map((r) => r.date)),
  ]
    .sort()
    .reverse();
  for (let i = 0; i < sortedDates.length; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (sortedDates[i] === d.toISOString().split("T")[0]) streak += 1;
    else break;
  }

  const progressPct = Math.min(
    100,
    Math.max(
      0,
      ((START_WEIGHT - (latestWeight?.weight || START_WEIGHT)) /
        (START_WEIGHT - TARGET_WEIGHT)) *
        100,
    ),
  );

  return (
    <div style={S.sec}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
          {new Date().getHours() < 12
            ? "早上好 💪"
            : new Date().getHours() < 18
              ? "下午好 💪"
              : "晚上好 💪"}
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>
          {new Date().toLocaleDateString("zh-CN", {
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </div>
      </div>

      <div style={{ ...S.card, borderColor: "#E8352A" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 12, color: "#aaa" }}>减重进度</span>
          <span style={{ fontSize: 11, color: "#666" }}>
            {START_WEIGHT}kg → {TARGET_WEIGHT}kg
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div style={{ ...S.statBox, flex: 1 }}>
            <div style={S.statVal}>{latestWeight?.weight || START_WEIGHT}</div>
            <div style={S.statLbl}>当前 kg</div>
          </div>
          <div style={{ ...S.statBox, flex: 1 }}>
            <div style={{ ...S.statVal, color: "#4CAF50" }}>
              {(START_WEIGHT - (latestWeight?.weight || START_WEIGHT)).toFixed(1)}
            </div>
            <div style={S.statLbl}>已减 kg</div>
          </div>
          <div style={{ ...S.statBox, flex: 1 }}>
            <div style={{ ...S.statVal, color: "#F5A623" }}>
              {Math.max(0, (latestWeight?.weight || START_WEIGHT) - TARGET_WEIGHT).toFixed(1)}
            </div>
            <div style={S.statLbl}>距目标</div>
          </div>
          <div style={{ ...S.statBox, flex: 1 }}>
            <div style={{ ...S.statVal, color: "#5BA3DC", fontSize: 18 }}>
              {Math.round(progressPct)}%
            </div>
            <div style={S.statLbl}>完成度</div>
          </div>
        </div>
        <div style={S.pBg}>
          <div style={S.pFill(progressPct, "linear-gradient(90deg,#E8352A,#F5A623)")} />
        </div>
      </div>

      <div style={S.card}>
        <div
          style={{
            fontSize: 11,
            color: "#E8352A",
            letterSpacing: 2,
            marginBottom: 12,
            fontWeight: 700,
          }}
        >
          TODAY · 热量平衡
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <div style={{ ...S.statBox, flex: 1 }}>
            <div style={{ ...S.statVal, fontSize: 18, color: "#F5A623" }}>
              {Math.round(todayCalIn)}
            </div>
            <div style={S.statLbl}>摄入 kcal</div>
          </div>
          <div style={{ ...S.statBox, flex: 1 }}>
            <div style={{ ...S.statVal, fontSize: 18, color: "#5BA3DC" }}>
              {Math.round(totalBurn)}
            </div>
            <div style={S.statLbl}>总消耗</div>
          </div>
          <div style={{ ...S.statBox, flex: 1, borderColor: deficit > 0 ? "#2E5E2E" : "#5E2E2E" }}>
            <div
              style={{
                ...S.statVal,
                fontSize: 18,
                color: deficit > 0 ? "#4CAF50" : "#E8352A",
              }}
            >
              {deficit > 0 ? "-" : "+"}
              {Math.abs(Math.round(deficit))}
            </div>
            <div style={S.statLbl}>{deficit > 0 ? "热量缺口" : "热量盈余"}</div>
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#555",
            background: "#161616",
            borderRadius: 4,
            padding: "8px 10px",
            lineHeight: 1.6,
          }}
        >
          基础代谢 {bmr} + 日常活动 300
          {todayCalBurn > 0 && ` + 训练消耗 ${Math.round(todayCalBurn)}`} = 总消耗 {Math.round(totalBurn)} kcal
        </div>
        {todayCalIn === 0 && (
          <button
            style={{ ...S.btn("ghost"), marginTop: 10, fontSize: 11, padding: "7px 12px" }}
            onClick={() => onTabChange(2)}
          >
            记录今日饮食 →
          </button>
        )}
      </div>

      <div style={S.card}>
        <div
          style={{
            fontSize: 11,
            color: "#E8352A",
            letterSpacing: 2,
            marginBottom: 12,
            fontWeight: 700,
          }}
        >
          THIS WEEK · 本周训练
        </div>
        <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
          {weekDates.map((date, i) => {
            const hasWorkout = records.some((r) => r.type === "workout" && r.date === date);
            const hasDiet = records.some((r) => r.type === "diet" && r.date === date);
            const isToday = date === today;
            const isFuture = date > today;
            const wRec = records.find((r) => r.type === "workout" && r.date === date);
            return (
              <div key={date} style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 9,
                    color: isToday ? "#E8352A" : "#555",
                    marginBottom: 4,
                    fontWeight: isToday ? 700 : 400,
                  }}
                >
                  {DAY_LABELS[i]}
                </div>
                <div
                  style={{
                    width: "100%",
                    paddingBottom: "100%",
                    borderRadius: 4,
                    position: "relative",
                    background: isFuture
                      ? "#161616"
                      : hasWorkout
                        ? "#E8352A"
                        : hasDiet
                          ? "#2A2A2A"
                          : "#161616",
                    border: isToday ? "1.5px solid #E8352A" : "1px solid #2A2A2A",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                    }}
                  >
                    {!isFuture && (hasWorkout ? (wRec?.workoutType === "有氧" ? "🚴" : "💪") : hasDiet ? "🍽" : "")}
                  </div>
                </div>
                {!isFuture && wRec?.caloriesBurned > 0 && (
                  <div style={{ fontSize: 8, color: "#E8352A", marginTop: 3 }}>
                    {Math.round(wRec.caloriesBurned)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ ...S.statBox, flex: 1 }}>
            <div style={{ ...S.statVal, fontSize: 18 }}>{weekWorkouts.length}</div>
            <div style={S.statLbl}>训练次</div>
          </div>
          <div style={{ ...S.statBox, flex: 1 }}>
            <div style={{ ...S.statVal, fontSize: 18, color: "#5BA3DC" }}>
              {Math.round(weekCalBurn)}
            </div>
            <div style={S.statLbl}>运动消耗</div>
          </div>
          <div
            style={{ ...S.statBox, flex: 1, borderColor: weekDeficit > 0 ? "#2E5E2E" : "#161616" }}
          >
            <div
              style={{
                ...S.statVal,
                fontSize: 18,
                color: weekDeficit > 0 ? "#4CAF50" : "#666",
              }}
            >
              {weekDeficit > 0 ? Math.round((weekDeficit / 7700) * 10) / 10 : "—"}
            </div>
            <div style={S.statLbl}>估算减脂kg</div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#444", marginTop: 8 }}>7700大卡 ≈ 1kg脂肪</div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <div style={{ ...S.card, flex: 1, marginBottom: 0, textAlign: "center" }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: streak > 0 ? "#F5A623" : "#444",
              fontFamily: "Georgia,serif",
            }}
          >
            {streak}
          </div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>连续训练天</div>
          {streak > 0 && <div style={{ fontSize: 16, marginTop: 4 }}>🔥</div>}
        </div>
        <div style={{ ...S.card, flex: 2, marginBottom: 0 }}>
          <div style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>快速记录</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              style={{ ...S.btnSm(false), fontSize: 10, padding: "5px 10px" }}
              onClick={() => onTabChange(1)}
            >
              💪 记录训练
            </button>
            <button
              style={{ ...S.btnSm(false), fontSize: 10, padding: "5px 10px" }}
              onClick={() => onTabChange(2)}
            >
              🍽 记录饮食
            </button>
            <button
              style={{ ...S.btnSm(false), fontSize: 10, padding: "5px 10px" }}
              onClick={() => onTabChange(3)}
            >
              ⚖️ 记录体重
            </button>
          </div>
        </div>
      </div>

      {deficit < 200 && todayCalIn > 0 && (
        <div
          style={{
            background: "#1A1A0A",
            border: "1px solid #3A3A1A",
            borderRadius: 6,
            padding: 12,
            fontSize: 12,
            color: "#C8B060",
            lineHeight: 1.6,
          }}
        >
          ⚠️ 今日热量缺口偏小（{Math.round(deficit)} kcal），目标是每天 500 kcal 缺口。可以减少晚餐碳水或增加有氧。
        </div>
      )}
      {deficit >= 500 && (
        <div
          style={{
            background: "#0A1A0A",
            border: "1px solid #1A3A1A",
            borderRadius: 6,
            padding: 12,
            fontSize: 12,
            color: "#60C860",
            lineHeight: 1.6,
          }}
        >
          ✅ 今日热量缺口 {Math.round(deficit)} kcal，完成目标！继续保持。
        </div>
      )}
    </div>
  );
}

function WorkoutTab({ onSave, records }) {
  const [type, setType] = useState("A");
  const [exercises, setExercises] = useState(WORKOUT_TEMPLATES.A.map((e) => ({ ...e })));
  const [notes, setNotes] = useState("");
  const [cardio, setCardio] = useState("");
  const [saved, setSaved] = useState(false);

  const lastSame = records.filter((r) => r.type === "workout" && r.workoutType === type).slice(-1)[0];

  useEffect(() => {
    if (type === "有氧") {
      setExercises([]);
      return;
    }
    if (lastSame?.exercises) setExercises(lastSame.exercises.map((e) => ({ ...e })));
    else setExercises((WORKOUT_TEMPLATES[type] || []).map((e) => ({ ...e })));
  }, [type]);

  const update = (i, f, v) => {
    const u = [...exercises];
    u[i] = { ...u[i], [f]: v };
    setExercises(u);
  };
  const increaseAll = () =>
    setExercises(
      exercises.map((e) => ({
        ...e,
        weight: e.weight > 0 ? +(e.weight + 2.5).toFixed(1) : 0,
      })),
    );

  const liftCal = estimateExerciseCalories(exercises, BODY_WEIGHT);
  const cardioCal = estimateCardioCalories(cardio, BODY_WEIGHT);
  const totalBurnEstimate = liftCal + cardioCal;

  const handleSave = () => {
    const record = {
      id: Date.now(),
      date: todayStr(),
      type: "workout",
      workoutType: type,
      exercises,
      cardio,
      notes,
      caloriesBurned: totalBurnEstimate,
    };
    onSave(record);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={S.sec}>
      <span style={S.lbl}>今日训练</span>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {["A", "B", "C", "有氧"].map((t) => (
          <button key={t} style={S.btnSm(type === t)} onClick={() => setType(t)}>
            {t === "有氧" ? "纯有氧" : `训练 ${t}`}
          </button>
        ))}
      </div>

      {(totalBurnEstimate > 0 || type === "有氧") && (
        <div
          style={{
            background: "#161616",
            border: "1px solid #2A3A2A",
            borderRadius: 6,
            padding: "10px 14px",
            marginBottom: 12,
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#4CAF50",
                fontFamily: "Georgia,serif",
              }}
            >
              {totalBurnEstimate}
            </div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>预计消耗 kcal</div>
          </div>
          <div style={{ flex: 1, fontSize: 11, color: "#666", lineHeight: 1.6 }}>
            {liftCal > 0 && <div>力量训练 ≈ {liftCal} kcal</div>}
            {cardioCal > 0 && <div>有氧运动 ≈ {cardioCal} kcal</div>}
            <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>基于体重92kg估算</div>
          </div>
        </div>
      )}

      {type !== "有氧" && exercises.length > 0 && (
        <div style={S.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 11, color: "#666" }}>动作 · 组 · 次 · 重量kg</div>
            <button
              style={{ ...S.btn("ghost"), padding: "5px 10px", fontSize: 11 }}
              onClick={increaseAll}
            >
              全部 +2.5kg
            </button>
          </div>
          {exercises.map((ex, i) => (
            <div key={ex.name + i} style={S.exRow}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12 }}>{ex.name}</div>
                <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>
                  ~
                  {Math.round(
                    (EXERCISE_MET[ex.name] || 3.5) * BODY_WEIGHT * ((ex.sets * 2.7) / 60),
                  )}{" "}
                  kcal
                </div>
              </div>
              <input
                style={S.inpSm}
                type="number"
                value={ex.sets}
                onChange={(e) => update(i, "sets", +e.target.value)}
              />
              <span style={{ color: "#444", fontSize: 11 }}>×</span>
              <input
                style={S.inpSm}
                type="number"
                value={ex.reps}
                onChange={(e) => update(i, "reps", +e.target.value)}
              />
              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  onClick={() => update(i, "weight", +(ex.weight - 2.5).toFixed(1))}
                  style={{
                    background: "#2A2A2A",
                    border: "none",
                    color: "#fff",
                    borderRadius: "3px 0 0 3px",
                    padding: "6px 8px",
                    cursor: "pointer",
                    fontSize: 14,
                    lineHeight: 1,
                  }}
                >
                  −
                </button>
                <input
                  style={{
                    ...S.inpSm,
                    borderRadius: 0,
                    width: 44,
                    border: "none",
                    borderTop: "1px solid #2A2A2A",
                    borderBottom: "1px solid #2A2A2A",
                  }}
                  type="number"
                  step="2.5"
                  value={ex.weight}
                  onChange={(e) => update(i, "weight", +e.target.value)}
                />
                <button
                  onClick={() => update(i, "weight", +(ex.weight + 2.5).toFixed(1))}
                  style={{
                    background: "#E8352A",
                    border: "none",
                    color: "#fff",
                    borderRadius: "0 3px 3px 0",
                    padding: "6px 8px",
                    cursor: "pointer",
                    fontSize: 14,
                    lineHeight: 1,
                  }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {type === "有氧" && (
        <div style={{ ...S.card, borderColor: "#F5A623" }}>
          <div style={{ fontSize: 12, color: "#F5A623", marginBottom: 6 }}>纯有氧日</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            在下方填写有氧内容，系统自动估算消耗热量
          </div>
        </div>
      )}

      {lastSame && type !== "有氧" && (
        <div
          style={{
            fontSize: 11,
            color: "#555",
            marginBottom: 10,
            padding: "8px 10px",
            background: "#161616",
            borderRadius: 4,
          }}
        >
          上次 {formatDate(lastSame.date)}：
          {lastSame.exercises?.map((e) => `${e.name} ${e.weight}kg`).join(" · ")}
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        <span style={S.lbl}>有氧记录</span>
        <input
          style={S.inp}
          placeholder="例：骑车30分钟 / 椭圆机35分钟 心率130"
          value={cardio}
          onChange={(e) => setCardio(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: 14 }}>
        <span style={S.lbl}>备注</span>
        <textarea
          style={{ ...S.inp, height: 60, resize: "none" }}
          placeholder="状态、感受..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <button style={S.btn(saved ? "ghost" : "primary")} onClick={handleSave}>
        {saved ? `✓ 已保存（消耗 ${totalBurnEstimate} kcal）` : "保存训练记录"}
      </button>
    </div>
  );
}

async function analyzeFood(foodText) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `你是营养师。分析这份食物，只返回JSON不要其他文字：\n食物：${foodText}\n格式：{"protein":数字,"carbs":数字,"fat":数字,"calories":数字}`,
        },
      ],
    }),
  });
  const data = await res.json();
  return JSON.parse((data.content?.[0]?.text || "{}").replace(/```json|```/g, "").trim());
}

function DietTab({ onSave }) {
  const [meals, setMeals] = useState([
    { name: "早餐", food: "", protein: "", carbs: "", fat: "", cal: "" },
  ]);
  const [water, setWater] = useState("");
  const [saved, setSaved] = useState(false);
  const [analyzing, setAnalyzing] = useState({});

  const updateMeal = (i, f, v) => {
    const u = [...meals];
    u[i] = { ...u[i], [f]: v };
    setMeals(u);
  };
  const addMeal = () =>
    setMeals([...meals, { name: "", food: "", protein: "", carbs: "", fat: "", cal: "" }]);
  const removeMeal = (i) => setMeals(meals.filter((_, idx) => idx !== i));

  const runAI = async (i) => {
    if (!meals[i].food.trim()) return;
    setAnalyzing((a) => ({ ...a, [i]: true }));
    try {
      const r = await analyzeFood(meals[i].food);
      const u = [...meals];
      u[i] = {
        ...u[i],
        protein: r.protein ?? "",
        carbs: r.carbs ?? "",
        fat: r.fat ?? "",
        cal: r.calories ?? "",
      };
      setMeals(u);
    } catch (e) {
      console.error(e);
    }
    setAnalyzing((a) => ({ ...a, [i]: false }));
  };

  const tot = {
    prot: meals.reduce((s, m) => s + (parseFloat(m.protein) || 0), 0),
    carbs: meals.reduce((s, m) => s + (parseFloat(m.carbs) || 0), 0),
    fat: meals.reduce((s, m) => s + (parseFloat(m.fat) || 0), 0),
    cal: meals.reduce((s, m) => s + (parseFloat(m.cal) || 0), 0),
  };

  const rem = {
    cal: DAILY_GOALS.cal - tot.cal,
    prot: DAILY_GOALS.protein - tot.prot,
    carbs: DAILY_GOALS.carbs - tot.carbs,
  };

  const protPct = tot.cal ? (tot.prot * 4 * 100) / tot.cal : 0;
  const carbPct = tot.cal ? (tot.carbs * 4 * 100) / tot.cal : 0;
  const fatPct = Math.max(0, 100 - protPct - carbPct);

  const applyTemplate = () =>
    setMeals([
      {
        name: "早餐",
        food: "鸡蛋3个+燕麦100g+牛奶200ml",
        protein: "35",
        carbs: "55",
        fat: "12",
        cal: "500",
      },
      {
        name: "午餐",
        food: "鸡胸肉200g+米饭一碗+蔬菜",
        protein: "50",
        carbs: "60",
        fat: "8",
        cal: "600",
      },
      {
        name: "训练后",
        food: "蛋白粉+香蕉",
        protein: "28",
        carbs: "30",
        fat: "2",
        cal: "250",
      },
      {
        name: "晚餐",
        food: "鱼150g+蔬菜+少量米饭",
        protein: "40",
        carbs: "25",
        fat: "6",
        cal: "450",
      },
    ]);

  const handleSave = () => {
    onSave({
      id: Date.now(),
      date: todayStr(),
      type: "diet",
      meals,
      water,
      totalProt: tot.prot,
      totalCarbs: tot.carbs,
      totalFat: tot.fat,
      totalCal: tot.cal,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={S.sec}>
      <span style={S.lbl}>今日饮食</span>

      <div style={{ ...S.card, borderColor: "#1A3A1A" }}>
        <div
          style={{
            fontSize: 11,
            color: "#4CAF50",
            letterSpacing: 2,
            marginBottom: 10,
            fontWeight: 700,
          }}
        >
          今日还可以吃多少
        </div>
        {[
          ["热量", tot.cal, DAILY_GOALS.cal, rem.cal, "kcal", "#4CAF50", tot.cal > DAILY_GOALS.cal],
          ["蛋白质", tot.prot, DAILY_GOALS.protein, rem.prot, "g", "#E8352A", false],
          ["碳水", tot.carbs, DAILY_GOALS.carbs, rem.carbs, "g", "#F5A623", tot.carbs > DAILY_GOALS.carbs],
        ].map(([name, cur, goal, remaining, unit, color, over]) => (
          <div key={name} style={S.pRow}>
            <div style={S.pLabel}>
              <span style={{ color: "#aaa" }}>{name}</span>
              <span
                style={{
                  color: over ? "#E8352A" : remaining <= 0 ? "#4CAF50" : color,
                  fontWeight: 600,
                }}
              >
                {over
                  ? `超出 ${Math.round(cur - goal)}${unit}`
                  : remaining <= 0
                    ? "✓ 达标"
                    : `还剩 ${Math.round(remaining)}${unit}`}
              </span>
            </div>
            <div style={S.pBg}>
              <div style={S.pFill(Math.min(100, (cur / goal) * 100), over ? "#E8352A" : color)} />
            </div>
            <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>
              {Math.round(cur)} / {goal}
              {unit}
            </div>
          </div>
        ))}
      </div>

      {tot.cal > 0 && (
        <div style={S.card}>
          <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
            {[
              ["热量", Math.round(tot.cal), "kcal", "#E8352A"],
              ["蛋白", Math.round(tot.prot), "g", "#E8352A"],
              ["碳水", Math.round(tot.carbs), "g", "#F5A623"],
              ["脂肪", Math.round(tot.fat), "g", "#888"],
            ].map(([l, v, u, c]) => (
              <div key={l} style={{ ...S.statBox, flex: 1 }}>
                <div style={{ ...S.statVal, fontSize: 15, color: c }}>
                  {v}
                  <span style={{ fontSize: 9 }}>{u}</span>
                </div>
                <div style={S.statLbl}>{l}</div>
              </div>
            ))}
          </div>
          <div style={S.macroBar}>
            <div style={{ background: "#E8352A", flex: protPct }} />
            <div style={{ background: "#F5A623", flex: carbPct }} />
            <div style={{ background: "#444", flex: Math.max(0, fatPct) }} />
          </div>
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        <button
          style={{ ...S.btn("ghost"), fontSize: 11, padding: "6px 14px" }}
          onClick={applyTemplate}
        >
          套用计划模板
        </button>
      </div>

      {meals.map((meal, i) => (
        <div key={`${meal.name}-${i}`} style={{ ...S.card, borderLeft: "3px solid #E8352A" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <input
              style={{ ...S.inpSm, width: 64, textAlign: "left", padding: "6px 8px" }}
              placeholder="餐次"
              value={meal.name}
              onChange={(e) => updateMeal(i, "name", e.target.value)}
            />
            <button
              style={{
                background: "none",
                border: "none",
                color: "#444",
                cursor: "pointer",
                fontSize: 18,
                marginLeft: "auto",
              }}
              onClick={() => removeMeal(i)}
            >
              ×
            </button>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <input
              style={{ ...S.inp, flex: 1 }}
              placeholder="吃了什么（越详细AI越准）"
              value={meal.food}
              onChange={(e) => updateMeal(i, "food", e.target.value)}
            />
            <button
              style={{
                ...S.btn(analyzing[i] ? "ghost" : "primary"),
                padding: "10px 12px",
                fontSize: 11,
                whiteSpace: "nowrap",
                minWidth: 58,
              }}
              onClick={() => runAI(i)}
              disabled={analyzing[i]}
            >
              {analyzing[i] ? "⏳" : "AI分析"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {[
              ["蛋白g", "protein"],
              ["碳水g", "carbs"],
              ["脂肪g", "fat"],
              ["热量kcal", "cal"],
            ].map(([l, k]) => (
              <div key={k} style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>{l}</div>
                <input
                  style={{
                    ...S.inp,
                    padding: "7px 4px",
                    fontSize: 12,
                    textAlign: "center",
                  }}
                  type="number"
                  placeholder="0"
                  value={meal[k]}
                  onChange={(e) => updateMeal(i, k, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button style={{ ...S.btn("ghost"), width: "100%", marginBottom: 10 }} onClick={addMeal}>
        + 添加一餐
      </button>
      <div style={{ marginBottom: 14 }}>
        <span style={S.lbl}>饮水量</span>
        <input
          style={S.inp}
          placeholder="例：2.5升"
          value={water}
          onChange={(e) => setWater(e.target.value)}
        />
      </div>
      <button style={S.btn(saved ? "ghost" : "primary")} onClick={handleSave}>
        {saved ? "✓ 已保存" : "保存饮食记录"}
      </button>
    </div>
  );
}

function WeightTab({ onSave, records }) {
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const wr = records.filter((r) => r.type === "weight").slice(-12);
  const latest = wr[wr.length - 1];
  const diff = latest ? (latest.weight - START_WEIGHT).toFixed(1) : null;

  const handleSave = () => {
    if (!weight) return;
    onSave({
      id: Date.now(),
      date: todayStr(),
      type: "weight",
      weight: parseFloat(weight),
      waist: parseFloat(waist) || null,
      note,
    });
    setSaved(true);
    setWeight("");
    setWaist("");
    setNote("");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={S.sec}>
      <span style={S.lbl}>体重记录</span>
      {wr.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <div style={{ ...S.statBox, flex: 1 }}>
            <div style={S.statVal}>{latest.weight}</div>
            <div style={S.statLbl}>当前 kg</div>
          </div>
          <div style={{ ...S.statBox, flex: 1 }}>
            <div style={{ ...S.statVal, color: diff < 0 ? "#4CAF50" : "#E8352A" }}>
              {diff > 0 ? "+" : ""}
              {diff}
            </div>
            <div style={S.statLbl}>vs 起始</div>
          </div>
          <div style={{ ...S.statBox, flex: 1 }}>
            <div style={{ ...S.statVal, fontSize: 20, color: "#4CAF50" }}>
              {(START_WEIGHT - (latest?.weight || START_WEIGHT)).toFixed(1)}
            </div>
            <div style={S.statLbl}>已减 kg</div>
          </div>
          <div style={{ ...S.statBox, flex: 1 }}>
            <div style={{ ...S.statVal, fontSize: 20, color: "#F5A623" }}>
              {Math.max(0, (latest?.weight || START_WEIGHT) - TARGET_WEIGHT).toFixed(1)}
            </div>
            <div style={S.statLbl}>距目标</div>
          </div>
        </div>
      )}
      {wr.length > 1 && (
        <div style={{ ...S.card, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "#666", marginBottom: 8, letterSpacing: 1 }}>体重趋势</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 56 }}>
            {wr.map((r, i) => {
              const min = Math.min(...wr.map((x) => x.weight)) - 1;
              const max = Math.max(...wr.map((x) => x.weight)) + 1;
              const h = Math.max(6, ((r.weight - min) / (max - min)) * 50);
              return (
                <div
                  key={r.id ?? i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <div style={{ fontSize: 7, color: "#555" }}>{r.weight}</div>
                  <div
                    style={{
                      width: "100%",
                      height: h,
                      background: i === wr.length - 1 ? "#E8352A" : "#2A2A2A",
                      borderRadius: "2px 2px 0 0",
                    }}
                  />
                  <div style={{ fontSize: 7, color: "#444" }}>{new Date(r.date).getDate()}日</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div style={S.card}>
        <div style={{ marginBottom: 10 }}>
          <span style={S.lbl}>今日体重 (kg)</span>
          <input
            style={S.inp}
            type="number"
            step="0.1"
            placeholder="91.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <span style={S.lbl}>腰围 (cm) 可选</span>
          <input
            style={S.inp}
            type="number"
            step="0.5"
            placeholder="95"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 14 }}>
          <span style={S.lbl}>备注</span>
          <input
            style={S.inp}
            placeholder="昨晚睡得好 / 水肿"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button style={S.btn(saved ? "ghost" : "primary")} onClick={handleSave}>
          {saved ? "✓ 已保存" : "记录今日体重"}
        </button>
      </div>
    </div>
  );
}

function HistoryTab({ records, onClear }) {
  const [filter, setFilter] = useState("all");
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = records
    .filter((r) => filter === "all" || r.type === filter)
    .sort((a, b) => b.id - a.id)
    .slice(0, 60);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `减脂记录-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wCount = records.filter((r) => r.type === "workout").length;
  const dCount = records.filter((r) => r.type === "diet").length;
  const bCount = records.filter((r) => r.type === "weight").length;

  return (
    <div style={S.sec}>
      <span style={S.lbl}>历史记录</span>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[
          ["workout", "训练", wCount],
          ["diet", "饮食", dCount],
          ["weight", "体重", bCount],
        ].map(([t, l, c]) => (
          <div key={t} style={{ ...S.statBox, flex: 1 }}>
            <div style={{ ...S.statVal, fontSize: 20 }}>{c}</div>
            <div style={S.statLbl}>{l}次</div>
          </div>
        ))}
      </div>
      <div style={{ ...S.card, background: "#111A11", borderColor: "#1A3A1A" }}>
        <div style={{ fontSize: 12, color: "#4CAF50", marginBottom: 6, fontWeight: 700 }}>
          💾 数据保存说明
        </div>
        <div style={{ fontSize: 12, color: "#777", lineHeight: 1.7, marginBottom: 10 }}>
          数据保存在此浏览器中，关闭后重开仍在。建议定期导出JSON备份到云盘防丢失。
        </div>
        <button
          style={{ ...S.btn("green"), fontSize: 12, padding: "8px 14px" }}
          onClick={exportData}
        >
          📥 导出全部数据
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, margin: "10px 0", flexWrap: "wrap" }}>
        {[
          ["all", "全部"],
          ["workout", "训练"],
          ["diet", "饮食"],
          ["weight", "体重"],
        ].map(([v, l]) => (
          <button key={v} style={S.btnSm(filter === v)} onClick={() => setFilter(v)}>
            {l}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={S.empty}>暂无记录</div>
      ) : (
        filtered.map((r) => (
          <div
            key={r.id}
            style={{
              ...S.histItem,
              borderLeftColor:
                r.type === "workout" ? "#E8352A" : r.type === "diet" ? "#F5A623" : "#4CAF50",
            }}
          >
            <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>
              {formatDate(r.date)} · {r.type === "workout" ? "训练" : r.type === "diet" ? "饮食" : "体重"}
            </div>
            {r.type === "workout" && (
              <>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 4,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    {r.workoutType === "有氧" ? "纯有氧" : `训练 ${r.workoutType}`}
                    {r.cardio && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#666",
                          marginLeft: 8,
                          fontWeight: 400,
                        }}
                      >
                        {r.cardio}
                      </span>
                    )}
                  </span>
                  {r.caloriesBurned > 0 && (
                    <span style={{ color: "#4CAF50", fontSize: 12 }}>🔥 {r.caloriesBurned} kcal</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "#999", lineHeight: 1.8 }}>
                  {r.exercises?.map((e, i) => (
                    <span key={`${e.name}-${i}`} style={{ marginRight: 10 }}>
                      {e.name} {e.sets}×{e.reps}
                      {e.weight > 0 ? ` @${e.weight}kg` : ""}
                    </span>
                  ))}
                  {r.notes && <div style={{ marginTop: 3, color: "#666" }}>{r.notes}</div>}
                </div>
              </>
            )}
            {r.type === "diet" && (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>
                  {Math.round(r.totalCal)} kcal · 蛋白 {Math.round(r.totalProt)}g · 碳水 {Math.round(r.totalCarbs)}g
                </div>
                <div style={{ fontSize: 11, color: "#999", lineHeight: 1.7 }}>
                  {r.meals?.map((m, i) =>
                    m.food ? (
                      <span key={`${m.name}-${i}`} style={{ marginRight: 8 }}>
                        {m.name}: {m.food}
                      </span>
                    ) : null,
                  )}
                  {r.water && <span style={{ color: "#5BA3DC" }}>💧 {r.water}</span>}
                </div>
              </>
            )}
            {r.type === "weight" && (
              <>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {r.weight} kg {r.waist ? `· 腰围 ${r.waist}cm` : ""}
                </div>
                {r.note && <div style={{ fontSize: 11, color: "#999", marginTop: 3 }}>{r.note}</div>}
              </>
            )}
          </div>
        ))
      )}
      {records.length > 0 && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          {!confirmClear ? (
            <button style={{ ...S.btn("ghost"), fontSize: 11 }} onClick={() => setConfirmClear(true)}>
              清除所有数据
            </button>
          ) : (
            <div style={S.card}>
              <div style={{ fontSize: 13, marginBottom: 10 }}>
                确定清除全部 {records.length} 条？建议先导出备份。
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{ ...S.btn("primary"), flex: 1 }}
                  onClick={() => {
                    onClear();
                    setConfirmClear(false);
                  }}
                >
                  确认
                </button>
                <button
                  style={{ ...S.btn("ghost"), flex: 1 }}
                  onClick={() => setConfirmClear(false)}
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("fitness-records-v2");
        if (res?.value) setRecords(JSON.parse(res.value));
      } catch {
        // no-op
      }
      setLoading(false);
    })();
  }, []);

  const saveRecord = async (record) => {
    const updated = [...records, record];
    setRecords(updated);
    try {
      await window.storage.set("fitness-records-v2", JSON.stringify(updated));
    } catch {
      // no-op
    }
  };

  const clearAll = async () => {
    setRecords([]);
    try {
      await window.storage.delete("fitness-records-v2");
    } catch {
      // no-op
    }
  };

  const today = new Date().toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  if (loading) {
    return (
      <div
        style={{
          ...S.app,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          color: "#444",
        }}
      >
        加载中...
      </div>
    );
  }

  return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={S.headerTitle}>减脂追踪器</div>
        <div style={S.headerSub}>
          {today} · {records.length} 条记录
        </div>
      </div>
      <div style={S.tabs}>
        {TABS.map((t, i) => (
          <button key={t} style={S.tab(tab === i)} onClick={() => setTab(i)}>
            {t}
          </button>
        ))}
      </div>
      {tab === 0 && <HomeTab records={records} onTabChange={setTab} />}
      {tab === 1 && <WorkoutTab onSave={saveRecord} records={records} />}
      {tab === 2 && <DietTab onSave={saveRecord} />}
      {tab === 3 && <WeightTab onSave={saveRecord} records={records} />}
      {tab === 4 && <HistoryTab records={records} onClear={clearAll} />}
    </div>
  );
}
