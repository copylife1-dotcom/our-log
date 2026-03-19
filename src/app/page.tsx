"use client";
import React, { useState, useEffect } from 'react';

interface Event {
  id: number;
  text: string;
  person: '홍윤' | '그분';
  allDay: boolean;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

interface EventsState {
  [key: string]: Event[];
}

export default function MissionControlCalendar() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const [viewDate, setViewDate] = useState(new Date()); 
  const [events, setEvents] = useState<EventsState>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  
  const [eventText, setEventText] = useState("");
  const [activePerson, setActivePerson] = useState<'홍윤' | '그분'>('홍윤');
  const [allDay, setAllDay] = useState(true); // 여행 등 장기 일정은 기본 종일로 세팅
  const [endDateStr, setEndDateStr] = useState(""); // ★ 일정 종료 날짜 상태 복구
  
  const [startH, setStartH] = useState("09");
  const [startM, setStartM] = useState("00");
  const [endH, setEndH] = useState("18");
  const [endM, setEndM] = useState("00");
  const [dDay, setDDay] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    const start = new Date("2023-12-24");
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    setDDay(diff + 1);

    const savedLogin = localStorage.getItem("our-log-login");
    if (savedLogin === "true") setIsUnlocked(true);

    const savedEvents = localStorage.getItem("our-log-events");
    if (savedEvents) {
      try { setEvents(JSON.parse(savedEvents)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem("our-log-events", JSON.stringify(events));
  }, [events, isMounted]);

  const handleUnlock = () => {
    if (accessCode === "1234") {
      setIsUnlocked(true);
      localStorage.setItem("our-log-login", "true");
    } else { alert("비밀번호가 틀렸습니다."); }
  };

  const saveEvent = () => {
    if (!eventText.trim() || !selectedDate || !endDateStr) return;
    
    const start = new Date(selectedDate);
    const end = new Date(endDateStr);
    const eventId = Date.now();
    const newEvents = { ...events };
    
    // ★ 연속성 로직: 시작일부터 종료일까지 루프 돌며 저장
    let current = new Date(start);
    while (current <= end) {
      const curStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      const newEntry: Event = { 
        id: eventId, 
        text: eventText, 
        person: activePerson,
        allDay,
        startDate: selectedDate,
        endDate: endDateStr,
        startTime: allDay ? "00:00" : `${startH}:${startM}`,
        endTime: allDay ? "23:59" : `${endH}:${endM}`
      };
      newEvents[curStr] = [...(newEvents[curStr] || []), newEntry].sort((a, b) => a.startTime.localeCompare(b.startTime));
      current.setDate(current.getDate() + 1);
    }
    
    setEvents(newEvents);
    setIsModalOpen(false);
    setEventText("");
  };

  const deleteEvent = (date: string, id: number) => {
    const newEvents = { ...events };
    newEvents[date] = newEvents[date].filter(ev => ev.id !== id);
    setEvents(newEvents);
  };

  if (!isMounted) return null;
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-[#F2F1F8] flex items-center justify-center font-sans">
        <div className="w-full max-w-[430px] p-10 text-center">
          <h2 className="text-3xl font-black mb-10 italic">OUR LOG</h2>
          <input type="password" value={accessCode} onChange={(e)=>setAccessCode(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&handleUnlock()} placeholder="비밀번호" className="w-full bg-white rounded-2xl p-5 text-center shadow-lg outline-none mb-4 focus:ring-4 focus:ring-purple-200" />
          <button onClick={handleUnlock} className="w-full bg-black text-white p-5 rounded-2xl font-black italic">UNLOCK</button>
        </div>
      </div>
    );
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="fixed inset-0 bg-[#F2F1F8] flex flex-col items-center overflow-hidden font-sans text-slate-900">
      <div className="w-full max-w-[430px] h-full bg-white flex flex-col shadow-2xl relative">
        {/* 헤더 */}
        <div className="px-6 pt-14 pb-5 flex items-center justify-between border-b">
          <div>
            <h1 className="text-2xl font-black">{year}. {String(month + 1).padStart(2, '0')}</h1>
            <span className="text-[10px] font-bold text-purple-400 italic font-mono">SINCE 2023.12.24</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full">{dDay}일 ❤️</span>
            <div className="flex gap-2">
              <button onClick={()=>setViewDate(new Date(year, month-1, 1))} className="text-slate-300 font-bold">{"<"}</button>
              <button onClick={()=>setViewDate(new Date(year, month+1, 1))} className="text-slate-300 font-bold">{">"}</button>
            </div>
          </div>
        </div>

        {/* 캘린더 그리드 */}
        <div className="flex-grow p-2 overflow-y-auto">
          <div className="grid grid-cols-7 mb-2 text-[10px] text-center font-black text-slate-300 uppercase italic">
            {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((d, i) => <div key={d} className={i===0?'text-red-400':i===6?'text-blue-400':''}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-px border-t border-l border-slate-50">
            {blanks.map(b => <div key={`b-${b}`} className="bg-slate-50/20 aspect-[3/4] border-r border-b" />)}
            {days.map(day => {
              const dateStr = `${year}-${String(month+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events[dateStr] || [];
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              return (
                <div key={day} onClick={()=>{setSelectedDate(dateStr); setEndDateStr(dateStr); setEventText(""); setIsModalOpen(true);}}
                  className={`relative flex flex-col pt-1 border-r border-b min-h-[100px] ${isToday ? 'bg-purple-50/30' : 'bg-white'}`}>
                  <span className={`text-[11px] font-black ml-1.5 ${isToday ? 'text-purple-600' : 'text-slate-400'}`}>{day}</span>
                  <div className="w-full space-y-0.5 mt-1 px-0.5">
                    {dayEvents.map((ev) => (
                      <div key={ev.id} className={`text-[8px] font-black px-1 py-0.5 truncate border-l-2 ${ev.person === '홍윤' ? 'bg-blue-50 text-blue-700 border-blue-400' : 'bg-pink-50 text-pink-700 border-pink-400'}`}>
                        {ev.text}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 일정 등록 모달 */}
        {isModalOpen && (
          <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end">
            <div className="w-full bg-white rounded-t-[2.5rem] p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-800 italic uppercase">{selectedDate}</h2>
                  <p className="text-[10px] font-bold text-slate-400">일정 등록 및 관리</p>
                </div>
                <button onClick={()=>setIsModalOpen(false)} className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-black">닫기</button>
              </div>

              {/* 현재 날짜 일정 목록 */}
              <div className="space-y-2 mb-6">
                {events[selectedDate]?.map(ev => (
                  <div key={ev.id} className={`flex justify-between items-center p-3 rounded-2xl border ${ev.person === '홍윤' ? 'bg-blue-50 border-blue-100' : 'bg-pink-50 border-pink-100'}`}>
                    <span className="text-[12px] font-black italic">[{ev.person}] {ev.text}</span>
                    <button onClick={()=>deleteEvent(selectedDate, ev.id)} className="text-slate-300 font-bold text-xs">삭제</button>
                  </div>
                ))}
              </div>

              {/* 일정 입력 폼 */}
              <div className="border-t pt-6 space-y-4">
                <input type="text" value={eventText} onChange={(e)=>setEventText(e.target.value)} placeholder="일정 내용을 입력하세요" className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-sm outline-none focus:ring-2 focus:ring-purple-200" />
                
                <div className="flex gap-2">
                  <button onClick={()=>setActivePerson('홍윤')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${activePerson==='홍윤'?'bg-blue-600 text-white shadow-lg':'bg-slate-50 text-slate-400'}`}>홍윤</button>
                  <button onClick={()=>setActivePerson('그분')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${activePerson==='그분'?'bg-pink-500 text-white shadow-lg':'bg-slate-50 text-slate-400'}`}>그분</button>
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs font-black text-slate-500">하루종일</span>
                  <input type="checkbox" checked={allDay} onChange={(e)=>setAllDay(e.target.checked)} className="w-4 h-4 accent-purple-600" />
                </div>

                {/* ★ 일정 종료 날짜 선택창 복구 ★ */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 ml-1 uppercase italic tracking-wider">일정 종료 날짜 (장기 일정 시 선택)</span>
                  <input type="date" value={endDateStr} onChange={(e)=>setEndDateStr(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold outline-none" />
                </div>

                {!allDay && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex gap-1 bg-slate-50 p-2 rounded-xl justify-center items-center">
                      <select value={startH} onChange={(e)=>setStartH(e.target.value)} className="bg-transparent text-xs font-bold">{hours.map(h=><option key={h} value={h}>{h}</option>)}</select>
                      <span className="text-xs font-bold">:</span>
                      <select value={startM} onChange={(e)=>setStartM(e.target.value)} className="bg-transparent text-xs font-bold"><option value="00">00</option><option value="30">30</option></select>
                    </div>
                    <div className="flex gap-1 bg-slate-50 p-2 rounded-xl justify-center items-center">
                      <select value={endH} onChange={(e)=>setEndH(e.target.value)} className="bg-transparent text-xs font-bold">{hours.map(h=><option key={h} value={h}>{h}</option>)}</select>
                      <span className="text-xs font-bold">:</span>
                      <select value={endM} onChange={(e)=>setEndM(e.target.value)} className="bg-transparent text-xs font-bold"><option value="00">00</option><option value="30">30</option></select>
                    </div>
                  </div>
                )}

                <button onClick={saveEvent} className="w-full bg-black text-white p-4 rounded-2xl font-black italic shadow-xl active:scale-95 transition-all">일정 등록</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}