import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, ShieldCheck, Layout, Activity, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

const apiKey = ""; // 実行環境から自動提供されます

// --- カスタムフック: マウス位置の追跡 ---
const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
};

// --- 画像生成フック ---
const useGeneratedImage = (prompt) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const generateImage = useCallback(async (retryCount = 0) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: { sampleCount: 1 }
          }),
        }
      );

      if (!response.ok) throw new Error('API Error');
      const result = await response.json();
      const base64Data = result.predictions[0].bytesBase64Encoded;
      setImageUrl(`data:image/png;base64,${base64Data}`);
      setLoading(false);
    } catch (err) {
      if (retryCount < 5) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => generateImage(retryCount + 1), delay);
      } else {
        setError(true);
        setLoading(false);
      }
    }
  }, [prompt]);

  useEffect(() => {
    generateImage();
  }, [generateImage]);

  return { imageUrl, loading, error };
};

// --- 画像表示コンポーネント ---
const BrandImage = ({ prompt, className, aspectRatio = "aspect-video" }) => {
  const { imageUrl, loading, error } = useGeneratedImage(prompt);

  return (
    <div className={`relative overflow-hidden bg-neutral-900 ${aspectRatio} ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-olive-500/50">
          <Loader2 className="animate-spin mb-2" size={32} />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-900/50">
          <span className="text-[10px]">Error</span>
        </div>
      )}
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt="Brand Visual" 
          className="w-full h-full object-cover animate-in fade-in duration-1000"
        />
      )}
    </div>
  );
};

// --- スクロール表示用 ---
const RevealOnScroll = ({ children, className = "", delay = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-[1200ms] ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'} ${className} ${delay}`}>
      {children}
    </div>
  );
};

// --- 斜めスライダー ---
const DiagonalMarquee = ({ prompts, speed = 'normal', reverse = false, className = "" }) => {
  const speedClass = reverse ? 'animate-marquee-reverse' : speed === 'slow' ? 'animate-marquee-slow' : 'animate-marquee-normal';

  return (
    <div className={`flex flex-col gap-6 ${speedClass} ${className}`}>
      {[...prompts, ...prompts].map((prompt, j) => (
        <BrandImage 
          key={j}
          prompt={prompt}
          className="w-full h-[300px] rounded-sm grayscale group-hover:grayscale-0 transition-all duration-1000"
          aspectRatio="aspect-square"
        />
      ))}
    </div>
  );
};

// --- ロゴコンポーネント (メディカル×ラングラー融合版) ---
const Logo = ({ variant = 'horizontal', color = 'text-white' }) => {
  const isSquare = variant === 'square';

  return (
    <div className={`flex ${isSquare ? 'flex-col items-center text-center' : 'items-center space-x-4'} font-bold tracking-tighter ${color}`}>
      <div className={`relative ${isSquare ? 'mb-4 w-20 h-20' : 'w-10 h-10'} flex items-center justify-center group`}>
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current transition-transform duration-700 group-hover:rotate-90">
          {/* 六角ナットの枠 */}
          <path d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z" fill="none" stroke="currentColor" strokeWidth="6" />
          {/* メディカル・タクティカル・クロス */}
          {/* 縦：JEEPスロットの意匠 */}
          <rect x="44" y="25" width="4" height="50" rx="1" />
          <rect x="52" y="25" width="4" height="50" rx="1" />
          <rect x="36" y="30" width="4" height="40" rx="1" className="opacity-40" />
          <rect x="60" y="30" width="4" height="40" rx="1" className="opacity-40" />
          {/* 横：ラゲッジボードの意匠 */}
          <rect x="25" y="44" width="50" height="12" rx="1" stroke="currentColor" fill="none" strokeWidth="2" />
        </svg>
      </div>
      <div>
        <h1 className={`${isSquare ? 'text-2xl' : 'text-2xl'} uppercase leading-none font-black tracking-tight`}>
          Tomina<span className="text-olive-500">Garage</span>
        </h1>
        <p className={`text-[9px] tracking-[0.3em] uppercase opacity-60 mt-1 font-bold`}>
          Social Work & Craftsmanship
        </p>
      </div>
    </div>
  );
};

// --- スプラッシュ画面 (メディカル要素を追加した面白さバージョン) ---
const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing...");

  const statusMessages = [
    "Triaging Gear...",
    "Intaking Nature's Needs...",
    "Consulting with Wrangler...",
    "Discharge Planning for Adventure...",
    "Ready for Home Visit."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1200);
          return 100;
        }
        const diff = Math.random() * 20;
        const next = Math.min(old + diff, 100);
        
        const msgIndex = Math.floor((next / 100) * (statusMessages.length - 1));
        setStatusText(statusMessages[msgIndex]);
        
        return next;
      });
    }, 180);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-50 p-6 overflow-hidden">
      {/* センターロゴ */}
      <div className="mb-20 animate-in fade-in zoom-in duration-1000">
        <Logo variant="square" />
      </div>

      {/* 心電図（ECG）風のアニメーション */}
      <div className="relative w-64 h-16 mb-8 overflow-hidden">
        <svg viewBox="0 0 200 60" className="w-full h-full stroke-olive-500 fill-none stroke-[2]">
          <path d="M0,30 L40,30 L45,10 L50,50 L55,30 L90,30 L95,15 L100,45 L105,30 L140,30 L145,5 L150,55 L155,30 L200,30" className="animate-ecg" />
        </svg>
      </div>

      {/* 進捗バー & クロールするラングラー */}
      <div className="w-64 relative">
        <div 
          className="absolute -top-7 transition-all duration-300 ease-out"
          style={{ left: `${progress}%`, transform: 'translateX(-100%)' }}
        >
          <svg viewBox="0 0 100 60" className={`w-12 h-8 fill-white transition-all ${progress < 100 ? 'animate-bounce-short' : ''}`}>
            <path d="M10,50 L90,50 L90,30 L75,30 L75,15 L25,15 L25,30 L10,30 Z" />
            <circle cx="25" cy="50" r="10" fill="#000" stroke="#fff" strokeWidth="2" />
            <circle cx="75" cy="50" r="10" fill="#000" stroke="#fff" strokeWidth="2" />
            <circle cx="90" cy="30" r="8" fill="#fff" stroke="#000" strokeWidth="2" />
            <rect x="30" y="20" width="35" height="10" fill="#fff" />
          </svg>
        </div>
        
        <div className="h-[2px] w-full bg-neutral-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-olive-500 transition-all duration-300 shadow-[0_0_10px_rgba(101,123,80,0.8)]" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-[10px] text-olive-500 font-black tracking-widest animate-pulse uppercase italic">
            {statusText}
          </span>
          <span className="text-[10px] text-neutral-600 font-mono tracking-tighter">
            {Math.floor(progress)}%
          </span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(2deg); }
        }
        .animate-bounce-short {
          animation: bounce-short 0.4s infinite;
        }
        @keyframes ecg-anim {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-ecg {
          animation: ecg-anim 3s linear infinite;
        }
      `}} />
    </div>
  );
};

// --- メインページ ---
const MainPreview = () => {
  const mouse = useMousePosition();
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const { current } = sliderRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-neutral-200 font-sans selection:bg-olive-500 selection:text-white overflow-x-hidden">
      {/* ナビゲーション */}
      <header className="bg-black/90 backdrop-blur-md p-4 flex justify-between items-center sticky top-0 z-40 border-b border-white/5">
        <Logo />
        <nav className="hidden md:flex space-x-10 text-[11px] font-black text-neutral-500 tracking-[0.2em]">
          {['COLLECTION', 'CRAFT', 'ORDER'].map(item => (
            <a key={item} href="#" className="hover:text-white transition-colors relative group">
              {item}
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-olive-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </nav>
      </header>

      {/* ヒーローセクション */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 -rotate-12 scale-150 origin-center">
          <div className="flex h-full gap-6 justify-center">
            <DiagonalMarquee prompts={["Dark green Jeep Wrangler forest", "Wood board texture close up", "Camping gear aesthetic"]} speed="slow" className="w-[18vw]" />
            <DiagonalMarquee prompts={["Artisan tools workshop moody", "Black Jeep Wrangler trunk open", "Custom hardware detail"]} speed="normal" reverse={true} className="w-[18vw]" />
            <DiagonalMarquee prompts={["Adventure car travel mountain", "Carpenter hands wood work", "Tactical car accessory"]} speed="slow" className="w-[18vw]" />
            <DiagonalMarquee prompts={["Offroad tires muddy terrain", "Craftsman workshop shelf", "Jeep Wrangler sunset"]} speed="normal" reverse={true} className="w-[18vw]" />
            <DiagonalMarquee prompts={["High end wood storage car", "Metal bracket artisan", "Jeep Wrangler offroad expedition"]} speed="slow" className="w-[18vw]" />
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/70 to-[#0f0f0f]/30" />
        
        <div className="relative z-10 text-center px-6" style={{ transform: `translate(${mouse.x}px, ${mouse.y}px)` }}>
          <div className="inline-block px-3 py-1 border border-olive-500/50 text-olive-500 text-[10px] tracking-[0.4em] uppercase mb-8 bg-olive-950/20 backdrop-blur-sm">
            Clinical Precision. Rugged Passion.
          </div>
          <h2 className="text-6xl md:text-9xl font-black mb-8 uppercase tracking-tighter leading-none italic animate-in slide-in-from-bottom duration-1000">
            Rugged <br /> 
            <span className="text-transparent stroke-text">Bespoke</span> <br />
            Real.
          </h2>
          <p className="text-neutral-400 text-sm md:text-lg max-w-xl mx-auto font-light leading-relaxed tracking-wide mb-12 opacity-80">
            病院のような精密な診断と、ガレージのような情熱。 <br />
            MSWの視点で、あなたのラングラーライフに「安心」をプラスする。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-12 py-5 bg-olive-600 text-white font-black text-xs tracking-widest uppercase hover:bg-olive-500 transition-all transform hover:-translate-y-1 shadow-2xl">
              Consult Collection
            </button>
            <button className="px-12 py-5 border border-white/20 text-white font-black text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-all transform hover:-translate-y-1">
              Our Therapy
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30 animate-bounce">
          <div className="w-[1px] h-16 bg-white" />
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* スペック & クオリティ */}
      <section className="relative min-h-screen border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center h-full">
          <RevealOnScroll className="z-20 relative">
            <div className="mb-12">
              <h3 className="text-sm font-black text-olive-500 tracking-[0.5em] uppercase mb-4">Quality & Care</h3>
              <h4 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-8 text-shadow-lg">
                Engineered for <br /><span className="text-transparent stroke-text">Adventure</span>
              </h4>
              <p className="text-neutral-400 text-lg leading-relaxed max-w-md font-light">
                ソーシャルワーカーの資質を活かした、徹底的な「傾聴」から始まるモノづくり。
              </p>
            </div>
            <div className="space-y-12">
              {[
                { title: 'Safe Design', icon: <ShieldCheck size={28} />, desc: '病院の安全管理基準をヒントにした、耐荷重と安全性を追求した構造。' },
                { title: 'Supportive Utility', icon: <Layout size={28} />, desc: '利用者のニーズ（荷室の使い勝手）を解決するための、論理的な収納設計。' },
                { title: 'Bespoke Therapy', icon: <Activity size={28} />, desc: 'あなたのライフスタイルをアセスメントし、最適な一台を処方します。' }
              ].map((item, i) => (
                <div key={i} className="group cursor-pointer flex gap-6">
                  <div className="shrink-0 p-4 bg-olive-900/20 text-olive-500 rounded-sm group-hover:bg-olive-600 group-hover:text-white transition-all duration-500">
                    {item.icon}
                  </div>
                  <div>
                    <h5 className="text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-olive-500 transition-colors mb-2">
                      {item.title}
                    </h5>
                    <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-16 flex items-center gap-4 text-white font-black text-xs tracking-widest uppercase hover:text-olive-500 transition-colors group">
              Start Assessment <ExternalLink size={16} className="transform transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
          </RevealOnScroll>

          <div className="relative h-[100vh] w-full hidden lg:block">
            <div className="absolute inset-0 rotate-12 origin-center scale-125">
              <div className="flex h-full gap-4 group justify-end">
                <DiagonalMarquee prompts={["Industrial dark wood grain", "Heavy metal hook detail", "Jeep trunk storage box"]} speed="normal" className="w-1/3" />
                <DiagonalMarquee prompts={["Jeep Wrangler offroad muddy", "Aged oak luggage board", "Artisan measuring wood"]} speed="slow" reverse={true} className="w-1/3" />
                <DiagonalMarquee prompts={["Camping stove on wood board", "Tool set in leather bag", "Sunset at mountain Jeep"]} speed="normal" className="w-1/3" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-l from-[#0f0f0f] via-transparent to-[#0f0f0f]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-[#0f0f0f]" />
          </div>
        </div>
      </section>

      {/* ギャラリー */}
      <section className="py-32 border-t border-white/5 overflow-hidden relative bg-[#0a0a0a]">
        <RevealOnScroll className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end relative z-10">
          <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">In the Wild</h3>
          <div className="flex gap-4">
            <button onClick={() => scroll('left')} className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all"><ArrowLeft size={20} /></button>
            <button onClick={() => scroll('right')} className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all"><ArrowRight size={20} /></button>
          </div>
        </RevealOnScroll>
        <div ref={sliderRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-8 px-8 pb-12">
          {[
            "Jeep Wrangler driving through a forest at dawn",
            "Modern aesthetic luggage board detail wood grain",
            "Camping at night with a Jeep Wrangler roof top tent",
            "Luxury outdoor lifestyle gear in car trunk",
            "Tactical style Jeep Wrangler modification",
            "Handmade wooden carpenter table in garage"
          ].map((p, i) => (
            <div key={i} className="snap-center shrink-0 w-[80vw] md:w-[40vw] lg:w-[30vw]">
              <BrandImage prompt={p} aspectRatio="aspect-[4/3]" className="rounded-sm shadow-2xl hover:-translate-y-4 transition-transform duration-700" />
            </div>
          ))}
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-black py-24 px-6 relative overflow-hidden">
        <RevealOnScroll className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
          <Logo variant="square" />
          <div className="mt-16 flex flex-wrap justify-center gap-12 text-[10px] font-bold text-neutral-500 tracking-widest uppercase">
             {['Instagram', 'X / Twitter', 'Order Inquiry', 'Privacy Policy'].map(link => (link && <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>))}
          </div>
          <p className="mt-16 text-neutral-800 text-[9px] tracking-[0.5em] uppercase font-black">Built by Pride. 2025 TOMINA GARAGE.</p>
        </RevealOnScroll>
        <div className="absolute -bottom-10 -right-10 text-[25rem] font-black text-white/[0.02] pointer-events-none select-none italic leading-none">TMN</div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text { -webkit-text-stroke: 1px rgba(255,255,255,0.4); }
        .text-shadow-lg { text-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes marquee { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        @keyframes marquee-reverse { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }
        .animate-marquee-slow { animation: marquee 80s linear infinite; }
        .animate-marquee-normal { animation: marquee 50s linear infinite; }
        .animate-marquee-reverse { animation: marquee-reverse 60s linear infinite; }
      `}} />
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);
  return loading ? <SplashScreen onComplete={() => setLoading(false)} /> : <MainPreview />;
};

export default App;

