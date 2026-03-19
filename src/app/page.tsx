"use client";
import React, { useState, useEffect } from 'react';

interface Event {
  id: number;
  text: string; // title에서 text로 변경
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
  const [viewDate, setViewDate] = useState(new Date()); 
  const [events, setEvents] = useState<EventsState>({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // 입력 폼 상태 (제목 -> 일정 텍스트로 변경)
  const [eventText, setEventText] = useState("");
  const [activePerson, setActivePerson] = useState<'홍윤' | '그분'>('홍윤');
  const [allDay, setAllDay] = useState(false);
  const [endDateStr, setEndDateStr] = useState("");
  const [startH, setStartH] = useState("18");
  const [startM, setStartM] = useState("00");
  const [endH, setEndH] = useState("19");
  const [endM, setEndM] = useState("00");

  const [dDay, setDDay] = useState(0);

  useEffect(() => {
    const start = new Date("2025-07-22");
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    setDDay(diff + 1);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const changeMonth = (offset: number) => {
    const newDate = new Date(year, month + offset, 1);
    if (newDate.getFullYear() <= 2030 && newDate.getFullYear() >= 2025) setViewDate(newDate);
  };

  const openModal = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setEndDateStr(dateStr);
    setEventText("");
    setIsModalOpen(true);
  };

  const saveEvent = () => {
    if (!eventText.trim() || !selectedDate || !endDateStr) return;

    const start = new Date(selectedDate);
    const end = new Date(endDateStr);
    const eventId = Date.now();
    const newEvents = { ...events };

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const curStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const newEntry: Event = { 
        id: eventId, 
        text: eventText, 
        person: activePerson,
        allDay,
        startDate: selectedDate,
        endDate: endDateStr,
        startTime: `${startH}:${startM}`,
        endTime: `${endH}:${endM}`
      };
      newEvents[curStr] = [...(newEvents[curStr] || []), newEntry].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    setEvents(newEvents);
    setEventText("");
  };

  const deleteEvent = (date: string, id: number) => {
    const newEvents = { ...events };
    newEvents[date] = newEvents[date].filter(ev => ev.id !== id);
    setEvents(newEvents);
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="fixed inset-0 bg-[#F2F1F8] flex flex-col items-center overflow-hidden font-sans text-slate-900">
      <div className="w-full max-w-[430px] h-full bg-white flex flex-col shadow-2xl relative">
        
        {/* 헤더 */}
        <div className="px-6 pt-14 pb-5 flex items-center justify-between border-b border-slate-50">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter">{year}. {String(month + 1).padStart(2, '0')}</h1>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-tighter">Our Log Since 2025.07.22</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full">{dDay}일 ❤️</span>
            <div className="flex gap-1">
              <button onClick={() => changeMonth(-1)} className="p-1 text-slate-300 font-black">{"<"}</button>
              <button onClick={() => changeMonth(1)} className="p-1 text-slate-300 font-black">{">"}</button>
            </div>
          </div>
        </div>

        {/* 캘린더 그리드 (시간 제거 버전) */}
        <div className="flex-grow p-2 overflow-y-auto">
          <div className="grid grid-cols-7 mb-2 font-black text-[10px] text-center text-slate-300 uppercase italic">
            {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((d, i) => <div key={d} className={i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-px border-t border-l border-slate-50">
            {blanks.map(b => <div key={`b-${b}`} className="bg-slate-50/20 aspect-[3/4] border-r border-b border-slate-50" />)}
            {days.map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events[dateStr] || [];
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

              return (
                <div key={day} onClick={() => openModal(day)}
                  className={`relative flex flex-col pt-1 border-r border-b border-slate-50 min-h-[100px] transition-colors ${isToday ? 'bg-purple-50/30' : 'bg-white'}`}>
                  <span className={`text-[11px] font-black ml-1.5 ${isToday ? 'text-purple-600' : 'text-slate-400'}`}>{day}</span>
                  <div className="w-full space-y-0.5 mt-1">
                    {dayEvents.slice(0, 4).map((ev) => (
                      <div key={ev.id} className={`text-[8px] font-black px-1 py-0.5 truncate border-l-2 ${ev.person === '홍윤' ? 'bg-blue-50 text-blue-700 border-blue-400' : 'bg-pink-50 text-pink-700 border-pink-400'}`}>
                        {ev.text} {/* 시간은 과감히 뺐습니다! */}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 일정 상세 확인 + 등록 모달 */}
        {isModalOpen && (
          <div className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end">
            <div className="w-full bg-white rounded-t-[2.5rem] p-7 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
              
              <div className="flex justify-between items-center mb-5">
                <div className="flex flex-col text-slate-800">
                  <h2 className="text-xl font-black uppercase tracking-tighter">{selectedDate}</h2>
                  <span className="text-[10px] font-bold text-slate-400">현재 등록된 일정 목록</span>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-xs font-black">닫기</button>
              </div>

              {/* 일정 목록 확인 섹션 */}
              <div className="flex-grow space-y-2 mb-6 overflow-y-auto pr-1 min-h-[120px]">
                {events[selectedDate]?.length ? (
                  events[selectedDate].map(ev => (
                    <div key={ev.id} className={`flex justify-between items-center p-3 rounded-2xl border ${ev.person === '홍윤' ? 'bg-blue-50 border-blue-100' : 'bg-pink-50 border-pink-100'}`}>
                      <div className="flex flex-col">
                        <span className={`text-[13px] font-black ${ev.person === '홍윤' ? 'text-blue-800' : 'text-pink-800'}`}>
                          [{ev.person}] {ev.text}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 italic">
                          {ev.allDay ? '하루종일' : `${ev.startTime} - ${ev.endTime}`}
                        </span>
                      </div>
                      <button onClick={() => deleteEvent(selectedDate, ev.id)} className="text-slate-300 font-black text-[10px] p-2">삭제</button>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl py-10">
                    <p className="text-slate-300 text-xs font-bold italic">등록된 일정이 없습니다.</p>
                  </div>
                )}
              </div>

              {/* 일정 등록 섹션 */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <input type="text" value={eventText} onChange={(e)=>setEventText(e.target.value)} placeholder="새로운 일정 내용 입력" 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-black outline-none focus:ring-2 focus:ring-purple-200" />

                <div className="flex gap-2">
                  <button onClick={()=>setActivePerson('홍윤')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${activePerson==='홍윤'?'bg-blue-600 text-white shadow-lg':'bg-slate-50 text-slate-400'}`}>홍윤</button>
                  <button onClick={()=>setActivePerson('그분')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${activePerson==='그분'?'bg-pink-500 text-white shadow-lg':'bg-slate-50 text-slate-400'}`}>그분</button>
                  <div className="flex items-center gap-2 px-3 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-black text-slate-400">하루종일</span>
                    <input type="checkbox" checked={allDay} onChange={(e)=>setAllDay(e.target.checked)} className="w-4 h-4 accent-purple-600" />
                  </div>
                </div>

                {!allDay && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex gap-1 bg-slate-50 p-2 rounded-xl justify-center">
                      <select value={startH} onChange={(e)=>setStartH(e.target.value)} className="bg-transparent text-xs font-bold outline-none">{hours.map(h=><option key={h} value={h}>{h}</option>)}</select>
                      <span className="text-xs font-bold">:</span>
                      <select value={startM} onChange={(e)=>setStartM(e.target.value)} className="bg-transparent text-xs font-bold outline-none"><option value="00">00</option><option value="30">30</option></select>
                    </div>
                    <div className="flex gap-1 bg-slate-50 p-2 rounded-xl justify-center">
                      <select value={endH} onChange={(e)=>setEndH(e.target.value)} className="bg-transparent text-xs font-bold outline-none">{hours.map(h=><option key={h} value={h}>{h}</option>)}</select>
                      <span className="text-xs font-bold">:</span>
                      <select value={endM} onChange={(e)=>setEndM(e.target.value)} className="bg-transparent text-xs font-bold outline-none"><option value="00">00</option><option value="30">30</option></select>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-300 ml-1 uppercase tracking-widest">일정 종료 날짜 (연속 등록 시)</span>
                  <input type="date" value={endDateStr} onChange={(e)=>setEndDateStr(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl text-xs font-bold outline-none border border-slate-100" />
                </div>

                <button onClick={saveEvent} className="w-full bg-slate-900 text-white p-4 rounded-2xl text-sm font-black shadow-xl active:scale-95 transition-all uppercase italic">Register Mission</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}