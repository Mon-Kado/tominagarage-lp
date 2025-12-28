import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Loader2, ShieldCheck, Layout, Activity, ArrowLeft, ArrowRight, ExternalLink,
  Package, Droplets, Settings, Check, Star, Quote, MessageCircle, Send,
  ClipboardList, CreditCard, Hammer, Truck, ChevronDown, ChevronUp,
  Ruler, Weight, Layers, Wrench, Phone, Mail, Car, User, MapPin, Heart, Clock, Coffee
} from 'lucide-react';

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

// --- ロゴコンポーネント ---
const Logo = ({ variant = 'horizontal', color = 'text-white' }) => {
  const isSquare = variant === 'square';

  return (
    <div className={`flex ${isSquare ? 'flex-col items-center text-center' : 'items-center space-x-4'} font-bold tracking-tighter ${color}`}>
      <div className={`relative ${isSquare ? 'mb-4 w-20 h-20' : 'w-10 h-10'} flex items-center justify-center group`}>
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current transition-transform duration-700 group-hover:rotate-90">
          <path d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z" fill="none" stroke="currentColor" strokeWidth="6" />
          <rect x="44" y="25" width="4" height="50" rx="1" />
          <rect x="52" y="25" width="4" height="50" rx="1" />
          <rect x="36" y="30" width="4" height="40" rx="1" className="opacity-40" />
          <rect x="60" y="30" width="4" height="40" rx="1" className="opacity-40" />
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

// --- セクションタイトル ---
const SectionTitle = ({ subtitle, title, description, align = 'left' }) => (
  <div className={`mb-16 ${align === 'center' ? 'text-center' : ''}`}>
    <span className="text-sm font-black text-olive-500 tracking-[0.5em] uppercase mb-4 block">{subtitle}</span>
    <h3 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
      {title}
    </h3>
    {description && (
      <p className={`text-neutral-400 text-lg leading-relaxed font-light ${align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-md'}`}>
        {description}
      </p>
    )}
  </div>
);

// --- 商品カード ---
const ProductCard = ({ name, price, features, image, badge, popular }) => (
  <div className={`relative bg-neutral-900/50 border ${popular ? 'border-olive-500' : 'border-white/10'} rounded-sm overflow-hidden group hover:border-olive-500/50 transition-all duration-500`}>
    {badge && (
      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-olive-600 text-white text-[10px] font-black tracking-wider uppercase">
        {badge}
      </div>
    )}
    <BrandImage 
      prompt={image} 
      aspectRatio="aspect-[4/3]" 
      className="group-hover:scale-105 transition-transform duration-700"
    />
    <div className="p-6">
      <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">{name}</h4>
      <p className="text-olive-500 text-2xl font-black mb-4">{price}</p>
      <ul className="space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-neutral-400 text-sm">
            <Check size={14} className="text-olive-500 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <a href="#contact" className="block w-full py-3 bg-olive-600/20 text-olive-500 text-center text-xs font-black tracking-widest uppercase hover:bg-olive-600 hover:text-white transition-all">
        詳細を問い合わせる
      </a>
    </div>
  </div>
);

// --- Before/After 比較スライダー ---
const BeforeAfterSlider = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video overflow-hidden rounded-sm cursor-ew-resize select-none"
      onMouseMove={(e) => e.buttons === 1 && handleMove(e)}
      onMouseDown={handleMove}
      onTouchMove={handleMove}
    >
      {/* After (背景) */}
      <div className="absolute inset-0">
        <BrandImage 
          prompt="Jeep Wrangler JL trunk with beautiful wooden luggage board installed, organized camping gear neatly stored, premium aesthetic, bright and clean"
          aspectRatio="aspect-video"
          className="w-full h-full"
        />
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-olive-600 text-white text-xs font-black tracking-wider uppercase">
          After
        </div>
      </div>
      
      {/* Before (クリップ) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <BrandImage 
          prompt="Messy Jeep Wrangler JL trunk with scattered bags and camping gear, disorganized cargo area, cluttered look"
          aspectRatio="aspect-video"
          className="w-full h-full"
        />
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-neutral-700 text-white text-xs font-black tracking-wider uppercase">
          Before
        </div>
      </div>
      
      {/* スライダーライン */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl">
          <ArrowLeft size={14} className="text-neutral-800" />
          <ArrowRight size={14} className="text-neutral-800" />
        </div>
      </div>
    </div>
  );
};

// --- レビューカード ---
const ReviewCard = ({ text, author, rating }) => (
  <div className="bg-neutral-900/30 border border-white/5 p-6 rounded-sm hover:border-olive-500/30 transition-all">
    <div className="flex gap-1 mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} size={14} className="fill-olive-500 text-olive-500" />
      ))}
    </div>
    <Quote size={24} className="text-olive-500/30 mb-3" />
    <p className="text-neutral-300 leading-relaxed mb-4">{text}</p>
    <p className="text-neutral-500 text-sm">— {author}</p>
  </div>
);

// --- FAQ アイテム ---
const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-white/10">
    <button 
      onClick={onClick}
      className="w-full py-6 flex items-center justify-between text-left group"
    >
      <span className="text-white font-bold text-lg group-hover:text-olive-500 transition-colors">{question}</span>
      {isOpen ? <ChevronUp className="text-olive-500" /> : <ChevronDown className="text-neutral-500" />}
    </button>
    <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
      <p className="text-neutral-400 leading-relaxed">{answer}</p>
    </div>
  </div>
);

// --- フロー ステップ ---
const FlowStep = ({ number, icon, title, description, isLast }) => (
  <div className="flex gap-6">
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 bg-olive-600 rounded-full flex items-center justify-center text-white shrink-0">
        {icon}
      </div>
      {!isLast && <div className="w-[2px] h-full bg-olive-600/30 my-2" />}
    </div>
    <div className="pb-12">
      <span className="text-olive-500 text-xs font-black tracking-widest uppercase">Step {number}</span>
      <h4 className="text-xl font-black text-white uppercase tracking-tight mt-1 mb-2">{title}</h4>
      <p className="text-neutral-400 leading-relaxed">{description}</p>
    </div>
  </div>
);

// --- スキルバー ---
const SkillBar = ({ label, level, maxLevel = 5 }) => (
  <div className="flex items-center gap-3">
    <span className="text-neutral-400 text-sm w-20">{label}</span>
    <div className="flex gap-1">
      {[...Array(maxLevel)].map((_, i) => (
        <div 
          key={i} 
          className={`w-4 h-4 rounded-sm ${i < level ? 'bg-olive-500' : 'bg-neutral-800'}`}
        />
      ))}
    </div>
  </div>
);

// --- 作り手プロフィールカード ---
const CraftsmanProfile = () => (
  <div className="relative">
    {/* 背景のぼかしガレージイメージ */}
    <div className="absolute inset-0 overflow-hidden rounded-sm opacity-20">
      <BrandImage 
        prompt="Dark moody garage workshop with tools on wall, workbench with wood shavings, dramatic lighting, blurred background"
        aspectRatio="aspect-auto"
        className="w-full h-full object-cover blur-sm"
      />
    </div>
    
    <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-8 p-8 md:p-12 bg-gradient-to-br from-neutral-900/90 via-neutral-900/80 to-olive-950/50 border border-white/10 rounded-sm backdrop-blur-sm">
      {/* 左側：シルエット/イメージ */}
      <div className="lg:col-span-2 flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 md:w-56 md:h-56">
          {/* 六角形マスク */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <clipPath id="hexClip">
                  <path d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z" />
                </clipPath>
              </defs>
              <g clipPath="url(#hexClip)">
                <rect x="0" y="0" width="100" height="100" fill="#1a1a1a" />
              </g>
              <path d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z" fill="none" stroke="#657b50" strokeWidth="2" />
            </svg>
          </div>
          
          {/* シルエット画像 */}
          <div className="absolute inset-4 overflow-hidden" style={{ clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)' }}>
            <BrandImage 
              prompt="Silhouette of craftsman from behind working in garage, dramatic backlight, mysterious atmosphere, woodworking, dark aesthetic"
              aspectRatio="aspect-square"
              className="w-full h-full object-cover grayscale"
            />
          </div>
          
          {/* ステータスバッジ */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-olive-600 text-white text-[10px] font-black tracking-widest uppercase whitespace-nowrap">
            Weekend Craftsman
          </div>
        </div>
        
        {/* キャッチコピー */}
        <p className="mt-8 text-olive-500 text-center text-lg md:text-xl font-bold italic">
          "平日は人を支え、週末は木を削る。"
        </p>
      </div>
      
      {/* 右側：プロフィール詳細 */}
      <div className="lg:col-span-3 space-y-6">
        {/* 名前 & 肩書き */}
        <div>
          <h4 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            TOMINA
          </h4>
          <p className="text-olive-500 text-sm font-bold tracking-widest uppercase mt-2">
            Garage Therapist / Weekend Craftsman
          </p>
        </div>
        
        {/* プロフィール文 */}
        <div className="space-y-3 text-neutral-400 leading-relaxed">
          <p className="flex items-start gap-3">
            <MapPin size={16} className="text-olive-500 mt-1 shrink-0" />
            千葉県在住。平日は某病院で「人の退院」を支援するMSW。
          </p>
          <p className="flex items-start gap-3">
            <Hammer size={16} className="text-olive-500 mt-1 shrink-0" />
            週末になると自宅ガレージで「モノの誕生」に没頭する二足のわらじ。
          </p>
          <p className="flex items-start gap-3">
            <Car size={16} className="text-olive-500 mt-1 shrink-0" />
            ラングラー歴5年。愛車はJL Unlimited Sahara。
          </p>
          <p className="flex items-start gap-3">
            <Heart size={16} className="text-olive-500 mt-1 shrink-0" />
            好きな工具：トリマー、丸ノコ、そして木の香り。
          </p>
        </div>
        
        {/* スキルバー */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-neutral-500 text-xs font-bold tracking-widest uppercase mb-4">Skill Stats</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SkillBar label="傾聴力" level={5} />
            <SkillBar label="木工" level={4} />
            <SkillBar label="納期厳守" level={5} />
            <SkillBar label="早起き" level={2} />
          </div>
        </div>
        
        {/* 座右の銘 */}
        <div className="pt-4">
          <div className="flex items-start gap-3 p-4 bg-olive-950/30 border-l-4 border-olive-500 rounded-r-sm">
            <Quote size={20} className="text-olive-500 shrink-0 mt-1" />
            <div>
              <p className="text-white font-bold">困ったら、まず話を聞く。</p>
              <p className="text-neutral-500 text-sm mt-1">— 座右の銘</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- スプラッシュ画面 ---
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
      <div className="mb-20 animate-in fade-in zoom-in duration-1000">
        <Logo variant="square" />
      </div>

      <div className="relative w-64 h-16 mb-8 overflow-hidden">
        <svg viewBox="0 0 200 60" className="w-full h-full stroke-olive-500 fill-none stroke-[2]">
          <path d="M0,30 L40,30 L45,10 L50,50 L55,30 L90,30 L95,15 L100,45 L105,30 L140,30 L145,5 L150,55 L155,30 L200,30" className="animate-ecg" />
        </svg>
      </div>

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
        .animate-bounce-short { animation: bounce-short 0.4s infinite; }
        @keyframes ecg-anim {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-ecg { animation: ecg-anim 3s linear infinite; }
      `}} />
    </div>
  );
};

// --- メインページ ---
const MainPreview = () => {
  const mouse = useMousePosition();
  const sliderRef = useRef(null);
  const [openFAQ, setOpenFAQ] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    vehicle: '',
    message: ''
  });

  const scroll = (direction) => {
    if (sliderRef.current) {
      const { current } = sliderRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('お問い合わせありがとうございます。2〜3営業日以内にご連絡いたします。');
  };

  // 商品データ
  const products = [
    {
      name: 'Standard',
      price: '¥50,000〜',
      badge: null,
      popular: false,
      image: 'Minimalist wooden luggage board for Jeep Wrangler JL, natural wood grain finish, professional product photo on white background',
      features: [
        'JLラングラー専用設計',
        '高品質合板使用',
        '工具不要で簡単設置',
        '2ドア/4ドア対応',
        '送料込み'
      ]
    },
    {
      name: 'Drink Holder',
      price: '¥58,000〜',
      badge: '人気No.1',
      popular: true,
      image: 'Wooden luggage board with built-in cup holders for Jeep Wrangler JL, premium finish, professional product photo',
      features: [
        'Standard全機能',
        'ドリンクホルダー2個付き',
        '小物収納スペース',
        'アウトドアに最適',
        '送料込み'
      ]
    },
    {
      name: 'Custom Order',
      price: '¥65,000〜',
      badge: 'フルオーダー',
      popular: false,
      image: 'Custom made wooden luggage board with various accessories, craftsmanship details, workshop aesthetic',
      features: [
        'サイズ調整対応',
        'オプション自由選択',
        '素材・仕上げ相談可',
        '世界に一つだけの一台',
        '送料込み'
      ]
    }
  ];

  // レビューデータ
  const reviews = [
    { text: 'サイズがぴったりで感動しました。純正かと思うほどのフィット感です。', author: 'JL Unlimited オーナー', rating: 5 },
    { text: '質感が良く、高級感があります。友人にも勧めたいです。', author: 'Rubicon オーナー', rating: 5 },
    { text: '対応がとても丁寧で安心できました。製品も期待以上の仕上がりです。', author: 'Sahara オーナー', rating: 5 },
    { text: '荷室が劇的に使いやすくなりました。もっと早く買えばよかった。', author: 'Sport オーナー', rating: 5 },
  ];

  // FAQ データ
  const faqs = [
    { 
      question: '自分の車に合うか不安です',
      answer: '年式・グレードをお伺いし、適合を確認いたします。必要に応じて採寸データをお送りいただくことも可能です。ご不安な点はLINEやメールでお気軽にご相談ください。'
    },
    {
      question: '届いてから合わなかったらどうすれば？',
      answer: '事前のヒアリングで細かく確認いたしますので、基本的にはぴったりフィットします。万が一の場合も調整対応いたしますのでご安心ください。'
    },
    {
      question: '支払い方法は何がありますか？',
      answer: '銀行振込、PayPayに対応しております。ご希望の方法をお選びください。'
    },
    {
      question: '届くまでどのくらいかかりますか？',
      answer: 'ご入金確認後、約2〜3週間で発送いたします。一つ一つ丁寧に製作しておりますので、お時間をいただいております。'
    },
    {
      question: '取り付けは難しいですか？',
      answer: '工具不要で、誰でも簡単に設置・取り外しができます。説明書も同封いたします。'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-neutral-200 font-sans selection:bg-olive-500 selection:text-white overflow-x-hidden">
      {/* ナビゲーション */}
      <header className="bg-black/90 backdrop-blur-md p-4 flex justify-between items-center sticky top-0 z-40 border-b border-white/5">
        <Logo />
        <nav className="hidden md:flex space-x-8 text-[11px] font-black text-neutral-500 tracking-[0.15em]">
          {[
            { name: 'PRODUCTS', href: '#products' },
            { name: 'SPEC', href: '#spec' },
            { name: 'VOICE', href: '#voice' },
            { name: 'CRAFTSMAN', href: '#craftsman' },
            { name: 'FLOW', href: '#flow' },
            { name: 'CONTACT', href: '#contact' }
          ].map(item => (
            <a key={item.name} href={item.href} className="hover:text-white transition-colors relative group">
              {item.name}
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-olive-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </nav>
        <a href="#contact" className="md:hidden px-4 py-2 bg-olive-600 text-white text-xs font-black tracking-widest uppercase">
          相談
        </a>
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
            JL Wrangler専用ラゲッジボード
          </div>
          <h2 className="text-5xl md:text-8xl font-black mb-8 uppercase tracking-tighter leading-none italic animate-in slide-in-from-bottom duration-1000">
            荷室を、<br /> 
            <span className="text-transparent stroke-text">上質</span>に。
          </h2>
          <p className="text-neutral-400 text-sm md:text-lg max-w-xl mx-auto font-light leading-relaxed tracking-wide mb-12 opacity-80">
            MSW（医療ソーシャルワーカー）の丁寧なヒアリングと、<br />
            ガレージ仕込みの職人技で、あなただけの一台を。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#products" className="px-12 py-5 bg-olive-600 text-white font-black text-xs tracking-widest uppercase hover:bg-olive-500 transition-all transform hover:-translate-y-1 shadow-2xl">
              商品を見る
            </a>
            <a href="#contact" className="px-12 py-5 border border-white/20 text-white font-black text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-all transform hover:-translate-y-1">
              無料で相談する
            </a>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30 animate-bounce">
          <div className="w-[1px] h-16 bg-white" />
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* ===== PRODUCTS セクション ===== */}
      <section id="products" className="py-32 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <RevealOnScroll>
            <SectionTitle 
              subtitle="Products"
              title="JLラングラー専用ラゲッジボード"
              description="JEEP Wrangler JL 2018-2024対応。2ドア/4ドアどちらにもフィットする専用設計。"
              align="center"
            />
          </RevealOnScroll>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <RevealOnScroll key={i} delay={`delay-[${i * 200}ms]`}>
                <ProductCard {...product} />
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll className="mt-16 text-center">
            <p className="text-neutral-500 text-sm">
              ※ 価格は税込・送料込みです。仕様によって変動します。
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ===== Before/After セクション ===== */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <RevealOnScroll>
            <SectionTitle 
              subtitle="Before / After"
              title="劇的ビフォーアフター"
              description="ラゲッジボードを設置するだけで、荷室が見違えるほどスッキリ。"
              align="center"
            />
          </RevealOnScroll>
          
          <RevealOnScroll>
            <BeforeAfterSlider />
            <p className="text-center text-neutral-500 text-sm mt-6">← スライドして比較 →</p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ===== SPEC セクション ===== */}
      <section id="spec" className="relative min-h-screen border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center h-full">
          <RevealOnScroll className="z-20 relative">
            <SectionTitle 
              subtitle="Spec & Quality"
              title={<>Engineered for <span className="text-transparent stroke-text">Adventure</span></>}
              description="ソーシャルワーカーの資質を活かした、徹底的な「傾聴」から始まるモノづくり。"
            />
            
            {/* スペック詳細 */}
            <div className="grid grid-cols-2 gap-6 mb-12">
              {[
                { icon: <Layers size={20} />, label: '素材', value: '高品質合板' },
                { icon: <Ruler size={20} />, label: 'サイズ', value: '車種専用設計' },
                { icon: <Weight size={20} />, label: '耐荷重', value: '約30kg' },
                { icon: <Wrench size={20} />, label: '設置', value: '工具不要' },
              ].map((spec, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-neutral-900/30 border border-white/5 rounded-sm">
                  <div className="text-olive-500">{spec.icon}</div>
                  <div>
                    <p className="text-neutral-500 text-xs uppercase tracking-wider">{spec.label}</p>
                    <p className="text-white font-bold">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              {[
                { title: 'ぴったりフィット', icon: <ShieldCheck size={24} />, desc: 'JLラングラー専用設計。純正のような一体感で、ガタつきゼロ。' },
                { title: '簡単設置・取り外し', icon: <Layout size={24} />, desc: '工具不要で誰でも簡単。キャンプ時は外して、普段使いは設置したまま。' },
                { title: '収納力アップ', icon: <Activity size={24} />, desc: 'ボード下のスペースを有効活用。上下二層で整理整頓。' }
              ].map((item, i) => (
                <div key={i} className="group cursor-pointer flex gap-6">
                  <div className="shrink-0 p-4 bg-olive-900/20 text-olive-500 rounded-sm group-hover:bg-olive-600 group-hover:text-white transition-all duration-500">
                    {item.icon}
                  </div>
                  <div>
                    <h5 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-olive-500 transition-colors mb-2">
                      {item.title}
                    </h5>
                    <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </RevealOnScroll>

          <div className="relative h-[80vh] w-full hidden lg:block">
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

      {/* ===== VOICE セクション ===== */}
      <section id="voice" className="py-32 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <RevealOnScroll>
            <SectionTitle 
              subtitle="Voice"
              title="お客様の声"
              description="メルカリ販売実績20台以上。たくさんの嬉しいお声をいただいています。"
              align="center"
            />
          </RevealOnScroll>

          <RevealOnScroll className="flex items-center justify-center gap-8 mb-16">
            <div className="text-center">
              <p className="text-5xl font-black text-olive-500">20+</p>
              <p className="text-neutral-500 text-sm mt-2">販売実績</p>
            </div>
            <div className="w-[1px] h-16 bg-white/10" />
            <div className="text-center">
              <div className="flex gap-1 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="fill-olive-500 text-olive-500" />
                ))}
              </div>
              <p className="text-neutral-500 text-sm mt-2">平均評価</p>
            </div>
          </RevealOnScroll>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review, i) => (
              <RevealOnScroll key={i} delay={`delay-[${i * 100}ms]`}>
                <ReviewCard {...review} />
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ===== In the Wild ギャラリー ===== */}
      <section className="py-32 border-t border-white/5 overflow-hidden relative">
        <RevealOnScroll className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end relative z-10">
          <div>
            <span className="text-sm font-black text-olive-500 tracking-[0.5em] uppercase mb-4 block">Gallery</span>
            <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">In the Wild</h3>
          </div>
          <div className="flex gap-4">
            <button onClick={() => scroll('left')} className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all"><ArrowLeft size={20} /></button>
            <button onClick={() => scroll('right')} className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all"><ArrowRight size={20} /></button>
          </div>
        </RevealOnScroll>
        <div ref={sliderRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-8 px-8 pb-12">
          {[
            "Jeep Wrangler JL with wooden luggage board, camping trip at dawn",
            "Close up of premium wood grain luggage board installed in Jeep trunk",
            "Camping at night with Jeep Wrangler, organized trunk with luggage board",
            "Outdoor adventure gear neatly organized on wooden board in Jeep",
            "Jeep Wrangler parked at mountain overlook, trunk open showing custom board",
            "Detail shot of handmade wooden board craftsmanship"
          ].map((p, i) => (
            <div key={i} className="snap-center shrink-0 w-[80vw] md:w-[40vw] lg:w-[30vw]">
              <BrandImage prompt={p} aspectRatio="aspect-[4/3]" className="rounded-sm shadow-2xl hover:-translate-y-4 transition-transform duration-700" />
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT THE CRAFTSMAN セクション ===== */}
      <section id="craftsman" className="py-32 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-6">
          <RevealOnScroll>
            <SectionTitle 
              subtitle="About the Craftsman"
              title={<>相談のプロが、<br className="md:hidden" />あなたの<span className="text-transparent stroke-text">ラングラー</span>を診ます。</>}
              description="昼は病院、夜はガレージ。二足のわらじが生み出す、ちょっと変わったモノづくり。"
              align="center"
            />
          </RevealOnScroll>
          
          <RevealOnScroll>
            <CraftsmanProfile />
          </RevealOnScroll>
          
          <RevealOnScroll className="mt-12 text-center">
            <p className="text-neutral-500 text-sm leading-relaxed max-w-2xl mx-auto">
              本業で培った「傾聴」のスキルを活かし、お客様一人ひとりのニーズを丁寧にヒアリング。<br />
              「こんな使い方したいんだけど...」というご相談から、最適な一台を一緒に考えます。
            </p>
            <a href="#contact" className="inline-flex items-center gap-2 mt-8 text-olive-500 font-bold text-sm hover:text-olive-400 transition-colors">
              <MessageCircle size={16} />
              まずは気軽にご相談ください
            </a>
          </RevealOnScroll>
        </div>
      </section>

      {/* ===== FLOW セクション ===== */}
      <section id="flow" className="py-32 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-6">
          <RevealOnScroll>
            <SectionTitle 
              subtitle="Flow"
              title="ご注文の流れ"
              description="お問い合わせから納品まで、丁寧にサポートいたします。"
              align="center"
            />
          </RevealOnScroll>
          
          <RevealOnScroll>
            <div className="mt-16">
              {[
                { icon: <MessageCircle size={24} />, title: 'お問い合わせ', description: 'フォームまたはLINEでお気軽にご連絡ください。ご質問だけでも大歓迎です。' },
                { icon: <ClipboardList size={24} />, title: 'ヒアリング・お見積もり', description: '車種・年式・グレード、ご希望の仕様を確認し、お見積もりをご案内します。' },
                { icon: <CreditCard size={24} />, title: 'ご入金', description: '銀行振込またはPayPayでお支払い。確認後、製作を開始します。' },
                { icon: <Hammer size={24} />, title: '製作', description: '約2〜3週間、一つ一つ丁寧に製作いたします。' },
                { icon: <Truck size={24} />, title: '発送・納品', description: '全国送料無料でお届け。取り付け方法もご案内します。' },
              ].map((step, i, arr) => (
                <FlowStep key={i} number={i + 1} {...step} isLast={i === arr.length - 1} />
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ===== FAQ セクション ===== */}
      <section id="faq" className="py-32 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <RevealOnScroll>
            <SectionTitle 
              subtitle="FAQ"
              title="よくあるご質問"
              align="center"
            />
          </RevealOnScroll>
          
          <RevealOnScroll>
            <div className="mt-8">
              {faqs.map((faq, i) => (
                <FAQItem 
                  key={i} 
                  {...faq} 
                  isOpen={openFAQ === i}
                  onClick={() => setOpenFAQ(openFAQ === i ? -1 : i)}
                />
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ===== CONTACT セクション ===== */}
      <section id="contact" className="py-32 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-6">
          <RevealOnScroll>
            <SectionTitle 
              subtitle="Contact"
              title="お問い合わせ"
              description="まずはお気軽にご相談ください。お見積もり無料です。"
              align="center"
            />
          </RevealOnScroll>

          <RevealOnScroll className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
            {/* 左：LINE & 連絡先 */}
            <div className="space-y-8">
              <div className="bg-[#06C755] p-8 rounded-sm text-center">
                <MessageCircle size={48} className="mx-auto mb-4 text-white" />
                <h4 className="text-white text-xl font-black mb-2">LINEで相談する</h4>
                <p className="text-white/80 text-sm mb-6">気軽にメッセージをどうぞ。<br />24時間以内に返信します。</p>
                <a 
                  href="#" 
                  className="inline-block px-8 py-4 bg-white text-[#06C755] font-black text-sm tracking-wider uppercase hover:bg-neutral-100 transition-all"
                >
                  友だち追加
                </a>
              </div>
              
              <div className="p-6 border border-white/10 rounded-sm">
                <h5 className="text-white font-bold mb-4">その他のお問い合わせ</h5>
                <div className="space-y-4 text-neutral-400 text-sm">
                  <p className="flex items-center gap-3">
                    <Mail size={16} className="text-olive-500" />
                    info@tominagarage.com
                  </p>
                  <p className="flex items-center gap-3">
                    <Car size={16} className="text-olive-500" />
                    対応車種: JEEP Wrangler JL 2018-2024
                  </p>
                </div>
              </div>
            </div>

            {/* 右：フォーム */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-neutral-400 text-sm mb-2">お名前 *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-white rounded-sm focus:outline-none focus:border-olive-500 transition-colors"
                  placeholder="山田 太郎"
                />
              </div>
              <div>
                <label className="block text-neutral-400 text-sm mb-2">メールアドレス *</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-white rounded-sm focus:outline-none focus:border-olive-500 transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-neutral-400 text-sm mb-2">車種・年式</label>
                <input 
                  type="text" 
                  value={formData.vehicle}
                  onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                  className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-white rounded-sm focus:outline-none focus:border-olive-500 transition-colors"
                  placeholder="例: JL Unlimited Sahara 2020"
                />
              </div>
              <div>
                <label className="block text-neutral-400 text-sm mb-2">ご希望・ご質問</label>
                <textarea 
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-neutral-900 border border-white/10 px-4 py-3 text-white rounded-sm focus:outline-none focus:border-olive-500 transition-colors resize-none"
                  placeholder="ドリンクホルダー付きモデルに興味があります..."
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-olive-600 text-white font-black text-sm tracking-widest uppercase hover:bg-olive-500 transition-all flex items-center justify-center gap-2"
              >
                送信する <Send size={16} />
              </button>
              <p className="text-neutral-600 text-xs text-center">
                2〜3営業日以内にご返信いたします
              </p>
            </form>
          </RevealOnScroll>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-black py-24 px-6 relative overflow-hidden">
        <RevealOnScroll className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
          <Logo variant="square" />
          <div className="mt-16 flex flex-wrap justify-center gap-12 text-[10px] font-bold text-neutral-500 tracking-widest uppercase">
            {['Instagram', 'LINE', 'お問い合わせ', 'プライバシーポリシー'].map(link => (
              <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
            ))}
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
