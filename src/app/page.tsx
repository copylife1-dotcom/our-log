"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// 비밀 금고 연결 열쇠
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Event {
  id: string;
  text: string;
  person: '홍윤' | '윤우' | '우리함께';
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
  const [endDate, setEndDate] = useState<string>("");
  const [eventText, setEventText] = useState("");
  const [activePerson, setActivePerson] = useState<'홍윤' | '윤우' | '우리함께'>('홍윤');
  const [dDay, setDDay] = useState(0);
  
  // 🔥 삭제 확인창 상태 관리
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
    
    let datesToSave = [selectedDate];
    if (endDate && endDate >= selectedDate) {
      datesToSave = [];
      let curr = new Date(selectedDate);
      const end = new Date(endDate);
      while (curr <= end) {
        datesToSave.push(`${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`);
        curr.setDate(curr.getDate() + 1);
      }
    }

    const inserts = datesToSave.map(date => ({
      text: eventText,
      person: activePerson,
      event_date: date
    }));

    const { data, error } = await supabase.from('events').insert(inserts).select();

    if (error) {
      alert("금고 저장 실패! 막내를 부르십시오.");
      return;
    }

    if (data) {
      setEvents(prev => {
        const next = { ...prev };
        data.forEach(newEvent => {
          if (!next[newEvent.event_date]) next[newEvent.event_date] = [];
          next[newEvent.event_date].push(newEvent);
        });
        return next;
      });
      closeModal();
    }
  };

  const deleteSingleEvent = async (id: string, date: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) {
      setEvents(prev => ({
        ...prev,
        [date]: prev[date].filter(ev => ev.id !== id)
      }));
      setDeleteConfirmId(null);
    }
  };

  const deleteAllRelatedEvents = async (evToDelete: Event) => {
    const { error } = await supabase.from('events').delete()
      .eq('text', evToDelete.text)
      .eq('person', evToDelete.person);
      
    if (!error) {
      fetchEvents(); 
      setDeleteConfirmId(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEventText("");
    setEndDate("");
    setActivePerson('홍윤');
    setDeleteConfirmId(null);
  };

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50; 
    if (info.offset.x < -swipeThreshold) {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    } else if (info.offset.x > swipeThreshold) {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    }
  };

  if (!isMounted) return null;

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-[#FAFAFF] flex items-center justify-center font-sans">
        <div className="w-full max-w-[400px] p-10 text-center bg-white rounded-[2rem] shadow-2xl shadow-violet-100/50 border border-violet-50">
          <h2 className="text-3xl font-black mb-2 tracking-tighter text-violet-800">OUR LOG</h2>
          <p className="text-xs font-bold text-violet-300 mb-10 uppercase tracking-widest">Global Sync System</p>
          <input type="password" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUnlock()} placeholder="비밀번호" className="w-full bg-violet-50/50 border-none rounded-2xl p-5 text-center text-lg font-black shadow-inner outline-none mb-4 focus:ring-2 focus:ring-violet-200 transition-all placeholder:text-violet-200 text-violet-800" />
          <button onClick={handleUnlock} className="w-full bg-violet-400 hover:bg-violet-500 text-white p-5 rounded-2xl text-sm font-black shadow-lg shadow-violet-200 active:scale-95 transition-all tracking-wide">입장하기</button>
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
    <div className="min-h-screen bg-[#FAFAFF] flex flex-col items-center font-sans text-slate-800 overflow-hidden">
      <div className="w-full max-w-[430px] flex flex-col min-h-screen relative bg-white shadow-2xl shadow-violet-100/50">
        <div className="px-7 pt-16 pb-6 flex items-end justify-between border-b border-violet-50">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-violet-900">{month + 1}월</h1>
            <span className="text-violet-300 font-bold font-mono text-sm pl-1">{year}</span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-[11px] font-black text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full shadow-sm">D+{dDay} ❤️</span>
            <div className="flex gap-2">
               <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1.5 text-violet-300 hover:text-violet-500 transition-colors font-black">{"<"}</button>
               <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1.5 text-violet-300 hover:text-violet-500 transition-colors font-black">{">"}</button>
            </div>
          </div>
        </div>

        <motion.div 
          key={month}
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="px-3 pt-5 flex-grow w-full cursor-grab active:cursor-grabbing"
        >
          <div className="grid grid-cols-7 mb-4 text-[10px] font-black text-center text-violet-300 uppercase tracking-wider">
            {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((d, i) => <div key={d} className={i === 0 ? 'text-rose-300' : i === 6 ? 'text-sky-300' : ''}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 text-center gap-1.5">
            {blanks.map(b => <div key={`b-${b}`} className="min-h-[4.5rem] bg-violet-50/30 rounded-xl pointer-events-none" />)}
            {days.map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events[dateStr] || [];
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              return (
                <div key={day} onClick={() => { setSelectedDate(dateStr); setIsModalOpen(true); }}
                  className={`relative flex flex-col items-center justify-start pt-2 pb-1 rounded-xl transition-all min-h-[4.5rem] overflow-hidden cursor-pointer ${isToday ? 'bg-violet-50 border border-violet-200 shadow-inner' : 'bg-white border border-transparent hover:bg-violet-50/50'}`}>
                  <span className={`text-sm font-black mb-1.5 ${isToday ? 'text-violet-700' : 'text-slate-600'}`}>{day}</span>
                  <div className="w-full px-1 flex flex-col gap-1">
                    {dayEvents.slice(0, 2).map((ev, i) => {
                      let badgeClass = "bg-violet-50 text-violet-600";
                      if (ev.person === '홍윤') badgeClass = "bg-blue-50/80 text-blue-600";
                      else if (ev.person === '윤우') badgeClass = "bg-pink-50/80 text-pink-600";
                      else if (ev.person === '우리함께') badgeClass = "bg-emerald-50 text-emerald-600"; 

                      return (
                        <div key={i} className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate w-full text-left ${badgeClass}`}>
                          {ev.text}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* 🔥 형님의 스윗한 로맨틱 멘트로 전격 교체! */}
          <div className="text-center text-[11px] text-violet-300 font-black mt-8 tracking-widest opacity-80">
            공주야 사랑해
          </div>
        </motion.div>

        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[100] bg-violet-950/15 backdrop-blur-sm flex items-end justify-center"
              onClick={closeModal}
            >
              <div className="w-full max-w-[430px] bg-white rounded-t-[2.5rem] p-8 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                
                <div className="flex justify-between items-start mb-8">
                  <div className="flex flex-col w-full pr-4">
                    <h2 className="text-2xl font-black text-violet-900 tracking-tight">{selectedDate}</h2>
                    <div className="flex items-center gap-3 mt-3 bg-violet-50/50 px-4 py-3 rounded-2xl border border-violet-100 focus-within:border-violet-300 transition-colors">
                      <span className="text-xs font-bold text-violet-400 whitespace-nowrap">종료일</span>
                      <input type="date" min={selectedDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-violet-700 text-sm font-black outline-none w-full cursor-pointer" />
                    </div>
                  </div>
                  <button onClick={closeModal} className="bg-slate-50 hover:bg-slate-100 text-slate-400 px-4 py-4 rounded-2xl text-xs font-black transition-colors mt-1">✕</button>
                </div>

                <div className="space-y-3 mb-8">
                  {events[selectedDate]?.map(ev => {
                    let cardClass = "bg-violet-50 border-violet-100 text-violet-800";
                    if (ev.person === '홍윤') cardClass = "bg-blue-50/50 border-blue-100 text-blue-800";
                    else if (ev.person === '윤우') cardClass = "bg-pink-50/50 border-pink-100 text-pink-800";
                    else if (ev.person === '우리함께') cardClass = "bg-emerald-50/50 border-emerald-100 text-emerald-800"; 

                    const isConfirming = deleteConfirmId === ev.id;

                    return (
                      <div key={ev.id} className={`flex flex-col p-4 rounded-2xl border transition-all ${cardClass}`}>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[13px] font-black">[{ev.person}] {ev.text}</span>
                          {!isConfirming && (
                            <button onClick={() => setDeleteConfirmId(ev.id)} className="text-slate-400 hover:text-red-400 text-xs font-bold transition-colors">
                              삭제
                            </button>
                          )}
                        </div>
                        
                        {/* 🔥 에러 잡은 고급 삭제 메뉴 (인식표 key 장착 완료!) */}
                        <AnimatePresence>
                          {isConfirming && (
                            <motion.div 
                              key="delete-confirm-menu"
                              initial={{ height: 0, opacity: 0, marginTop: 0 }} 
                              animate={{ height: 'auto', opacity: 1, marginTop: 12 }} 
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              className="flex gap-2 overflow-hidden"
                            >
                              <button onClick={() => deleteSingleEvent(ev.id, selectedDate)} className="flex-1 bg-white/60 hover:bg-white text-violet-600 py-2.5 rounded-xl text-[11px] font-black transition-colors shadow-sm">
                                이 날만 삭제
                              </button>
                              <button onClick={() => deleteAllRelatedEvents(ev)} className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-500 py-2.5 rounded-xl text-[11px] font-black transition-colors shadow-sm">
                                전부 삭제
                              </button>
                              <button onClick={() => setDeleteConfirmId(null)} className="px-4 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-xl text-[11px] font-black transition-colors">
                                취소
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <input type="text" value={eventText} onChange={(e) => setEventText(e.target.value)} placeholder="일정을 입력해주세요" className="w-full bg-violet-50/50 border border-transparent focus:border-violet-200 rounded-2xl p-4.5 font-black text-sm outline-none text-violet-800 placeholder:text-violet-300 transition-all" />
                  
                  <div className="flex gap-2">
                    <button onClick={() => setActivePerson('홍윤')} className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all ${activePerson === '홍윤' ? 'bg-blue-400 text-white shadow-md shadow-blue-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>홍윤</button>
                    <button onClick={() => setActivePerson('윤우')} className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all ${activePerson === '윤우' ? 'bg-pink-400 text-white shadow-md shadow-pink-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>윤우</button>
                    <button onClick={() => setActivePerson('우리함께')} className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all ${activePerson === '우리함께' ? 'bg-emerald-400 text-white shadow-md shadow-emerald-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>우리함께</button>
                  </div>
                  
                  <button onClick={saveEvent} className="w-full bg-violet-400 hover:bg-violet-500 text-white p-4.5 rounded-2xl font-black mt-6 shadow-lg shadow-violet-200 active:scale-[0.98] transition-all tracking-wide">
                    일정 등록
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}