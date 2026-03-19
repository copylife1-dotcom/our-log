"use client";

import React, { useState, useEffect } from "react";

export default function OurLogCalendar() {
  const [accessCode, setAccessCode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 기준일: 2023년 12월 24일
  const startDate = new Date("2023-12-24");
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUnlock = () => {
    if (accessCode === "1234") {
      setIsUnlocked(true);
    } else {
      alert("비밀번호가 틀렸습니다, 형님.");
    }
  };

  if (!mounted) return null;

  if (!isUnlocked) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#f8f9fa", fontFamily: "sans-serif" }}>
        <h2 style={{ marginBottom: "20px", color: "#333" }}>ACCESS CODE</h2>
        <p style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>보안 구역입니다. 암호를 입력하십시오.</p>
        <input
          type="password"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          placeholder="****"
          style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px", textAlign: "center", fontSize: "18px", marginBottom: "20px", width: "200px" }}
        />
        <button
          onClick={handleUnlock}
          style={{ padding: "12px 40px", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
        >
          확인 (UNLOCK)
        </button>
      </div>
    );
  }

  // 캘린더 생성 로직
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const monthName = new Intl.DateTimeFormat("ko-KR", { month: "long" }).format(today);
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div style={{ padding: "20px", maxWidth: "450px", margin: "0 auto", fontFamily: "sans-serif", backgroundColor: "#fff", minHeight: "100vh" }}>
      {/* 헤더 섹션 */}
      <div style={{ textAlign: "center", marginBottom: "30px", paddingTop: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "0" }}>OUR LOG</h1>
        <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#fff0f0", borderRadius: "15px", display: "inline-block" }}>
          <span style={{ fontSize: "20px", color: "#ff4d4d", fontWeight: "bold" }}>{diffDays}일 ❤️</span>
        </div>
        <p style={{ color: "#888", fontSize: "14px", marginTop: "5px" }}>2023.12.24 ~ing</p>
      </div>

      {/* 캘린더 섹션 */}
      <div style={{ border: "1px solid #eee", borderRadius: "20px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <span style={{ fontWeight: "bold", fontSize: "18px" }}>{currentYear}년 {monthName}</span>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px", textAlign: "center" }}>
          {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
            <div key={idx} style={{ fontSize: "12px", color: idx === 0 ? "#ff4d4d" : idx === 6 ? "#4d79ff" : "#bbb", fontWeight: "bold" }}>{day}</div>
          ))}
          
          {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
          
          {daysArray.map((day) => {
            const isToday = day === today.getDate();
            return (
              <div key={day} style={{
                padding: "10px 0",
                fontSize: "14px",
                position: "relative",
                backgroundColor: isToday ? "#ff4d4d" : "transparent",
                color: isToday ? "#fff" : "#333",
                borderRadius: "10px",
                fontWeight: isToday ? "bold" : "normal"
              }}>
                {day}
                {isToday && <div style={{ fontSize: "8px", marginTop: "2px" }}>TODAY</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 메모 섹션 */}
      <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "15px" }}>
        <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6", margin: "0" }}>
          📍 <strong>오늘의 기록:</strong> <br/>
          형님과 그분의 소중한 시간이 쌓여가는 중입니다. 
          앞으로 이 공간을 두 분만의 추억으로 더 채워가시죠.
        </p>
      </div>
    </div>
  );
}