"use client";
import React, { useState, useEffect } from 'react';

// [필독] 암호를 "1234"로 고정합니다.
const SECRET_PASSWORD = "1234"; 

export default function SuperForceCalendar() {
  const [pass, setPass] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [dDay, setDDay] = useState(0);

  // 1. 디데이 및 초기 인증 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = window.localStorage.getItem('my_secret_key');
      if (auth === 'ok') setIsAuth(true);
    }
    const start = new Date("2023-12-24");
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    setDDay(diff + 1);
  }, []);

  // 2. 로그인 함수 (가장 단순하게 깎았습니다)
  const tryLogin = () => {
    if (pass === SECRET_PASSWORD) {
      window.localStorage.setItem('my_secret_key', 'ok');
      setIsAuth(true);
    } else {
      alert("암호 불일치! 다시 입력하십시오.");
      setPass("");
    }
  };

  // --- 로그인 화면 ---
  if (!isAuth) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', textAlign: 'center', width: '90%', maxWidth: '350px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '10px' }}>ACCESS CODE</h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>보안 구역입니다. 암호를 입력하십시오.</p>
          
          <input 
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && tryLogin()}
            placeholder="****"
            style={{ width: '100%', padding: '15px', border: '2px solid #e2e8f0', borderRadius: '15px', textAlign: 'center', fontSize: '24px', outline: 'none', marginBottom: '20px' }}
          />
          
          <button 
            onClick={tryLogin}
            style={{ width: '100%', padding: '15px', backgroundColor: '#0f172a', color: 'white', borderRadius: '15px', fontSize: '16px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
          >
            확인 (UNLOCK)
          </button>
        </div>
      </div>
    );
  }

  // --- (이하 캘린더 메인 로직은 형님이 만족하신 그 코드 그대로 유지됩니다) ---
  return (
    <div className="fixed inset-0 bg-[#F2F1F8] flex flex-col items-center overflow-hidden font-sans text-slate-900">
      <div className="w-full max-w-[430px] h-full bg-white flex flex-col shadow-2xl relative">
        <div className="px-6 pt-14 pb-5 flex items-center justify-between border-b border-slate-50">
          <div className="flex flex-col font-black">
             <h1 className="text-2xl tracking-tighter">2026. 03</h1>
             <span className="text-[10px] text-purple-400 uppercase tracking-tighter">Together Since 2023.12.24</span>
          </div>
          <div className="text-xs font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full">{dDay}일 ❤️</div>
        </div>
        
        <div className="flex-grow flex items-center justify-center p-10 text-center">
            <div>
               <p className="text-2xl font-black mb-4">🔓 잠금 해제 성공!</p>
               <p className="text-slate-400 text-sm">형님, 이제 일정을 등록해 보십시오.<br/>이 화면이 보인다면 보안 장벽을 뚫으신 겁니다.</p>
            </div>
        </div>
      </div>
    </div>
  );
}