"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// 비밀 금고 연결 열쇠 (Vercel 환경변수 연동 완료)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Event {
  id: string;
  text: string;
  person: '홍윤' | '윤우';
  event_date: string;
}

export default function MissionControlCalendar() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [viewDate, setViewDate] = useState(new Date()); 
  const [events, setEvents] = useState<{[key: string]: Event[]}>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [eventText, setEventText] = useState("");
  const [activePerson, setActivePerson] = useState<'홍윤' | '윤우'>('홍윤');
  const [dDay, setDDay] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    const start = new Date("2023-12-24");
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    setDDay(diff + 1);
    
    if (localStorage.getItem("our-log-login") === "true") setIsUnlocked(true);
    
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*');
    if (error) {
      console.error("금고 털기 실패:", error);
      return;
    }
    if (data) {
      const grouped: {[key: string]: Event[]} = {};
      data.forEach((ev: any) => {
        if (!grouped[ev.event_date]) grouped[ev.event_date] = [];
        grouped[ev.event_date].push(ev);
      });
      setEvents(grouped);
    }
  };

  const handleUnlock = () => {
    if (accessCode === "1234") {
      setIsUnlocked(true);
      localStorage.setItem("our-log-login", "true");
    } else { alert("비밀번호가 틀렸습니다."); }
  };

  const saveEvent = async () => {
    if (!eventText.trim() || !selectedDate) return;
    
    const { data, error } = await supabase.from('events').insert([
      { text: eventText, person: activePerson, event_date: selectedDate }
    ]).select();

    if (error) {
      alert("금고 저장 실패! 막내를 부르십시오.");
      return;
    }

    if (data) {
      const newEvent = data[0];
      setEvents(prev => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), newEvent]
      }));
      setIsModalOpen(false);
      setEventText("");
    }
  };

  const deleteEvent = async (id: string, date: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) {
      setEvents(prev => ({
        ...prev,
        [date]: prev[date].filter(ev => ev.id !== id)
      }));
    }
  };

  if (!isMounted) return null;

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-[#F8F7FF] flex items-center justify-center font-sans">
        <div className="w-full max-w-[400px] p-10 text-center bg-white rounded-3xl shadow-xl border border-purple-50">
          <h2 className="text-3xl font-black mb-2 tracking-tighter italic text-purple-900">OUR LOG</h2>
          <p className="text-xs font-bold text-purple-300 mb-10 uppercase tracking-widest">Global Sync System Ready</p>
          <input type="password" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUnlock()} placeholder="비밀번호" className="w-full bg-purple-50 border-none rounded-2xl p-5 text-center text-lg font-black shadow-inner outline-none mb-4 focus:ring-4 focus:ring-purple-200 transition-all placeholder:text-purple-200" />
          <button onClick={handleUnlock} className="w-full bg-purple-600 text-white p-5 rounded-2xl text-sm font-black shadow-lg active:scale-95 transition-all italic tracking-tight">ACCESS CLOUD</button>
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
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col items-center font-sans text-slate-900 overflow-hidden">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative bg-white shadow-2xl">
        <div className="px-6 pt-16 pb-6 flex items-end justify-between border-b border-purple-50">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-purple-950">{month + 1}월</h1>
            <span className="text-purple-300 font-bold font-mono">{year}</span>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs font-black text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full shadow-sm">{dDay}일 ❤️</span>
            <div className="flex gap-1.5">
               <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 text-purple-200 font-black">{"<"}</button>
               <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1 text-purple-200 font-black">{">"}</button>
            </div>
          </div>
        </div>

        <motion.div 
          key={month}
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
          className="px-2 pt-4 flex-grow"
        >
          <div className="grid grid-cols-7 mb-3 text-[10px] font-black text-center text-purple-200 uppercase italic">
            {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((d, i) => <div key={d} className={i === 0 ? 'text-red-300' : i === 6 ? 'text-blue-300' : ''}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 text-center gap-1">
            {blanks.map(b => <div key={`b-${b}`} className="min-h-[4rem] bg-purple-50/30 rounded-lg" />)}
            {days.map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events[dateStr] || [];
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              return (
                <div key={day} onClick={() => { setSelectedDate(dateStr); setEventText(""); setIsModalOpen(true); }}
                  className={`relative flex flex-col items-center justify-start pt-1.5 pb-1 rounded-lg border transition-all min-h-[4rem] overflow-hidden ${isToday ? 'bg-purple-100 border-purple-200 shadow-inner' : 'bg-white border-transparent active:bg-purple-50'}`}>
                  <span className={`text-sm font-black mb-1 ${isToday ? 'text-purple-800' : 'text-slate-700'}`}>{day}</span>
                  <div className="w-full px-1 flex flex-col gap-0.5">
                    {dayEvents.slice(0, 2).map((ev, i) => (
                      <div key={i} className={`text-[9px] font-bold px-1 py-0.5 rounded-sm truncate w-full text-left ${ev.person === '홍윤' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                        {ev.text}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="fixed inset-0 z-[100] bg-purple-950/20 backdrop-blur-sm flex items-end justify-center"
              onClick={() => setIsModalOpen(false)}
            >
              <div className="w-full max-w-[430px] bg-white rounded-t-[2.5rem] p-8 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-purple-950 italic">{selectedDate}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="bg-purple-50 text-purple-600 px-5 py-2.5 rounded-xl text-xs font-black">닫기</button>
                </div>
                <div className="space-y-3 mb-8">
                  {events[selectedDate]?.map(ev => (
                    <div key={ev.id} className={`flex justify-between items-center p-4 rounded-2xl border ${ev.person === '홍윤' ? 'bg-blue-50 border-blue-100' : 'bg-pink-50 border-pink-100'}`}>
                      <span className="text-[13px] font-black italic">[{ev.person}] {ev.text}</span>
                      <button onClick={() => deleteEvent(ev.id, selectedDate)} className="text-slate-300 text-xs font-bold">삭제</button>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <input type="text" value={eventText} onChange={(e) => setEventText(e.target.value)} placeholder="일정 입력" className="w-full bg-purple-50 border-none rounded-2xl p-4.5 font-black text-sm outline-none" />
                  <div className="flex gap-2">
                    <button onClick={() => setActivePerson('홍윤')} className={`flex-1 py-3.5 rounded-xl text-xs font-black ${activePerson === '홍윤' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>홍윤</button>
                    <button onClick={() => setActivePerson('윤우')} className={`flex-1 py-3.5 rounded-xl text-xs font-black ${activePerson === '윤우' ? 'bg-pink-500 text-white' : 'bg-slate-50 text-slate-400'}`}>윤우</button>
                  </div>
                  <button onClick={saveEvent} className="w-full bg-purple-900 text-white p-4.5 rounded-2xl font-black mt-5">일정 등록 (서버 동기화)</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}