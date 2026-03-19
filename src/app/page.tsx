"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // 스와이프 애니메이션용

interface Event {
  id: number;
  text: string;
  person: '홍윤' | '윤우'; // '그분' -> '윤우'로 수정
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
  const [activePerson, setActivePerson] = useState<'홍윤' | '윤우'>('홍윤');
  const [allDay, setAllDay] = useState(true);
  const [endDateStr, setEndDateStr] = useState("");
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
    if (savedEvents) { try { setEvents(JSON.parse(savedEvents)); } catch (e) { console.error(e); } }
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem("our-log-events", JSON.stringify(events));
  }, [events, isMounted]);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

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
    let current = new Date(start);
    while (current <= end) {
      const curStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      newEvents[curStr] = [...(newEvents[curStr] || []), { 
        id: eventId, text: eventText, person: activePerson, allDay,
        startDate: selectedDate, endDate: endDateStr,
        startTime: "00:00", endTime: "23:59"
      }];
      current.setDate(current.getDate() + 1);
    }
    setEvents(newEvents);
    setIsModalOpen(false);
    setEventText("");
  };

  if (!isMounted) return null;
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center font-sans">
        <div className="w-full max-w-[400px] p-10 text-center">
          <h2 className="text-2xl font-bold mb-8 italic">OUR LOG</h2>
          <input type="password" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUnlock()} placeholder="비밀번호" className="w-full border-b-2 border-slate-100 p-3 text-center outline-none mb-6" />
          <button onClick={handleUnlock} className="w-full bg-black text-white p-4 rounded-lg font-bold">접속</button>
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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center font-sans text-slate-900 overflow-hidden">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative">
        
        {/* 헤더 */}
        <div className="px-6 pt-16 pb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">{month + 1}월</h1>
            <span className="text-slate-400 font-medium">{year}</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-red-500">{dDay}일 ❤️</span>
          </div>
        </div>

        {/* 캘린더 그리드 + 스와이프 기능 적용 */}
        <motion.div 
          key={month}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(e, info) => {
            if (info.offset.x > 100) changeMonth(-1); // 오른쪽으로 밀면 저번달
            else if (info.offset.x < -100) changeMonth(1); // 왼쪽으로 밀면 다음달
          }}
          className="px-4 flex-grow cursor-grab active:cursor-grabbing"
        >
          <div className="grid grid-cols-7 mb-4 text-xs font-bold text-center text-slate-200 uppercase">
            {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((d, i) => <div key={d} className={i === 0 ? 'text-red-200' : ''}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 text-center">
            {blanks.map(b => <div key={`b-${b}`} className="aspect-square" />)}
            {days.map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events[dateStr] || [];
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              return (
                <div key={day} onClick={() => { setSelectedDate(dateStr); setEndDateStr(dateStr); setEventText(""); setIsModalOpen(true); }}
                  className="aspect-square relative flex flex-col items-center justify-start pt-2">
                  <span className={`text-sm font-medium ${isToday ? 'text-red-500 font-bold' : 'text-slate-700'}`}>{day}</span>
                  <div className="flex gap-0.5 mt-1">
                    {dayEvents.slice(0, 3).map((ev, i) => (
                      <div key={i} className={`w-1 h-1 rounded-full ${ev.person === '홍윤' ? 'bg-blue-400' : 'bg-pink-400'}`} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 하단 설명 */}
        <div className="p-6 text-center text-[10px] text-slate-300 italic">
          옆으로 밀어서 달을 변경하세요
        </div>

        {/* 등록 모달 */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-end justify-center"
            >
              <div className="w-full max-w-[430px] bg-white rounded-t-3xl p-8 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold">{selectedDate}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold">닫기</button>
                </div>
                <div className="space-y-3 mb-8">
                  {events[selectedDate]?.map(ev => (
                    <div key={ev.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                      <span className="text-sm font-bold text-slate-700">[{ev.person}] {ev.text}</span>
                      <button onClick={() => { const n={...events}; n[selectedDate]=n[selectedDate].filter(x=>x.id!==ev.id); setEvents(n); }} className="text-red-300 text-xs font-bold">삭제</button>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <input type="text" value={eventText} onChange={(e) => setEventText(e.target.value)} placeholder="일정 내용" className="w-full border-b border-slate-200 py-3 outline-none focus:border-black font-medium" />
                  <div className="flex gap-2">
                    <button onClick={() => setActivePerson('홍윤')} className={`flex-1 py-3 rounded-xl text-xs font-bold ${activePerson === '홍윤' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>홍윤</button>
                    <button onClick={() => setActivePerson('윤우')} className={`flex-1 py-3 rounded-xl text-xs font-bold ${activePerson === '윤우' ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-400'}`}>윤우</button>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase italic">종료 날짜</span>
                    <input type="date" value={endDateStr} onChange={(e) => setEndDateStr(e.target.value)} className="w-full mt-1 bg-slate-50 p-3 rounded-xl text-xs font-bold" />
                  </div>
                  <button onClick={saveEvent} className="w-full bg-black text-white p-4 rounded-xl font-bold">일정 등록</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}