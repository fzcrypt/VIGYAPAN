import React from 'react';

type Props = {
  navigate: (page: 'landing' | 'login' | 'register' | 'app') => void;
};

export default function LandingPage({ navigate }: Props) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="page-landing min-h-screen">
      {/* NAV */}
      <nav className="flex items-center justify-between px-[6%] py-[18px] fixed top-0 w-full z-50 bg-[#0D0700]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="logo" onClick={() => navigate('landing')}><em>Vigyapan</em>AI 🇮🇳</div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }} className="text-[var(--muted)] text-sm font-medium hover:text-[var(--gold)] transition-colors cursor-pointer">Features</a>
          <a href="#how" onClick={(e) => { e.preventDefault(); scrollTo('how'); }} className="text-[var(--muted)] text-sm font-medium hover:text-[var(--gold)] transition-colors cursor-pointer">How It Works</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollTo('pricing'); }} className="text-[var(--muted)] text-sm font-medium hover:text-[var(--gold)] transition-colors cursor-pointer">Pricing</a>
          <a href="#reviews" onClick={(e) => { e.preventDefault(); scrollTo('reviews'); }} className="text-[var(--muted)] text-sm font-medium hover:text-[var(--gold)] transition-colors cursor-pointer">Reviews</a>
        </div>
        <div className="flex gap-2">
          <button className="bg-transparent border border-[var(--border)] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:border-[var(--saffron)] hover:text-[var(--saffron)] transition-all" onClick={() => navigate('login')}>Login</button>
          <button className="bg-gradient-to-br from-[var(--saffron)] to-[var(--gold)] text-[#1A0700] px-6 py-2 rounded-xl text-sm font-extrabold shadow-[0_4px_20px_rgba(255,107,0,0.3)] hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(255,107,0,0.45)] transition-all" onClick={() => navigate('register')}>मुफ्त शुरू करें 🚀</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-[6%] pt-[140px] pb-[80px]">
        <div className="inline-flex items-center gap-2 bg-[#ffb8001a] border border-[#ffb8004d] px-5 py-1.5 rounded-full text-[0.8rem] font-semibold text-[var(--gold)] mb-7 animate-[fadeUp_0.6s_ease_both]">
          <div className="badge-dot"></div>🇮🇳 India's #1 AI Ad Creator — अब हिंदी में!
        </div>
        <p className="hero-tag">अपना विज्ञापन, AI से बनाएं — सिर्फ 30 सेकंड में</p>
        <h1 className="hero-title">Create Viral <em>Indian Ads</em><br/>with AI — in Your Language</h1>
        <p className="hero-sub">
          Hinglish, Hindi, Tamil, Telugu & <strong>20+ Indian languages.</strong><br/>
          No agency. No studio. Just type your product and get 4 ready-to-post ad scripts instantly.
        </p>
        <div className="flex gap-4 justify-center flex-wrap animate-[fadeUp_0.6s_0.4s_ease_both] mb-16">
          <button className="bg-gradient-to-br from-[var(--saffron)] to-[var(--gold)] text-[#1A0700] px-10 py-4 rounded-2xl border-none cursor-pointer text-lg font-extrabold font-['Baloo_2'] shadow-[0_8px_32px_rgba(255,107,0,0.4)] hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(255,107,0,0.55)] transition-all" onClick={() => navigate('register')}>✨ Start ₹1 Trial (10 Ads) 🚀</button>
          <button className="bg-white/5 text-white px-9 py-4 rounded-2xl border border-white/15 cursor-pointer text-base font-semibold transition-colors hover:bg-white/10" onClick={() => scrollTo('how')}>देखें कैसे काम करता है →</button>
        </div>
        <div className="flex gap-14 justify-center flex-wrap animate-[fadeUp_0.6s_0.5s_ease_both]">
          <div className="text-center"><div className="stat-num">50,000+</div><div className="text-[0.78rem] text-[var(--muted)] mt-1">Indian Creators & Brands</div></div>
          <div className="text-center"><div className="stat-num">30 सेकंड</div><div className="text-[0.78rem] text-[var(--muted)] mt-1">Ad Ready in 30 Seconds</div></div>
          <div className="text-center"><div className="stat-num">20+</div><div className="text-[0.78rem] text-[var(--muted)] mt-1">Indian Languages</div></div>
          <div className="text-center"><div className="stat-num">97%</div><div className="text-[0.78rem] text-[var(--muted)] mt-1">Cost Savings</div></div>
        </div>
      </div>

      <div className="tricolor"></div>

      {/* TICKER */}
      <div className="py-5 bg-[rgba(255,107,0,0.05)] border-b border-[var(--border)] overflow-hidden">
        <div className="ticker flex w-max gap-14">
          {[1,2].map((group) => (
            <React.Fragment key={group}>
              <div className="whitespace-nowrap text-[0.82rem] text-[var(--muted)] flex items-center gap-2.5 before:content-['✦'] before:text-[var(--saffron)]">Meesho Sellers</div>
              <div className="whitespace-nowrap text-[0.82rem] text-[var(--muted)] flex items-center gap-2.5 before:content-['✦'] before:text-[var(--saffron)]">Amazon India</div>
              <div className="whitespace-nowrap text-[0.82rem] text-[var(--muted)] flex items-center gap-2.5 before:content-['✦'] before:text-[var(--saffron)]">D2C Founders</div>
              <div className="whitespace-nowrap text-[0.82rem] text-[var(--muted)] flex items-center gap-2.5 before:content-['✦'] before:text-[var(--saffron)]">Local Businesses</div>
              <div className="whitespace-nowrap text-[0.82rem] text-[var(--muted)] flex items-center gap-2.5 before:content-['✦'] before:text-[var(--saffron)]">Fashion Brands</div>
              <div className="whitespace-nowrap text-[0.82rem] text-[var(--muted)] flex items-center gap-2.5 before:content-['✦'] before:text-[var(--saffron)]">Kirana Stores</div>
              <div className="whitespace-nowrap text-[0.82rem] text-[var(--muted)] flex items-center gap-2.5 before:content-['✦'] before:text-[var(--saffron)]">EdTech Startups</div>
              <div className="whitespace-nowrap text-[0.82rem] text-[var(--muted)] flex items-center gap-2.5 before:content-['✦'] before:text-[var(--saffron)]">Real Estate</div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="py-24 px-[6%] scroll-mt-20">
        <div className="text-[0.72rem] font-bold tracking-widest text-[var(--saffron)] uppercase mb-3.5 font-['Baloo_2']">Features — विशेषताएं</div>
        <div className="text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.2] mb-3.5 sec-title">India के लिए बना,<br/><em>India का Ad Tool</em></div>
        <p className="text-[var(--muted)] text-base max-w-[520px] leading-[1.7]">Not a global tool with an Indian flag — built from scratch for Bharat.</p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-6 mt-16">
          {/* Feature Cards */}
          {[
            {icon: '🗣️', title: '20+ Indian Languages', hi: 'हिंदी, तमिल, तेलुगु और भी', desc: 'Hinglish, Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada, Punjabi & more.'},
            {icon: '🎭', title: '4 Ad Types Per Generation', hi: 'हर बार 4 विज्ञापन', desc: 'Hook Ad, Storytelling Ad, Offer Ad & Testimonial — 4 ready scripts every time.'},
            {icon: '✍️', title: 'Hinglish AI Copywriter', hi: 'हिंग्लिश में स्क्रिप्ट', desc: 'Writes like a real Indian creator — Yaar, bhai, mast. Culturally tuned hooks.'},
            {icon: '🪔', title: 'Festival Ad Templates', hi: 'त्योहार विज्ञापन', desc: 'Diwali, Holi, Eid, Dussehra, Republic Day — seasonal ad scripts ready in one click.'},
            {icon: '📱', title: 'Platform-Optimised Format', hi: 'हर प्लेटफॉर्म के लिए', desc: 'Instagram Reels, YouTube Shorts, Facebook, Meesho, WhatsApp Status & Moj.'},
            {icon: '💰', title: '₹ Indian Pricing', hi: 'भारतीय बजट में', desc: 'Starting ₹999/month. No dollar billing. Affordable for startups, SMBs and solo sellers.'},
            {icon: '🎬', title: 'Free AI Video Editor', hi: 'मुफ़्त एआई वीडियो एडिटर', desc: 'Built-in tools to trim, add auto-captions, and perfect the Veo 3.1 videos before publishing.'},
            {icon: '🚀', title: '1-Click Social Push', hi: 'एक क्लिक में सोशल', desc: 'Instantly publish your generated video ads to YouTube Shorts, Instagram Reels, and Facebook.'}
          ].map((f, i) => (
            <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-[20px] p-8 transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(255,107,0,0.12)]">
              <div className="feat-icon">{f.icon}</div>
              <h3 className="text-[1.05rem] font-bold mb-1.5">{f.title}</h3>
              <div className="feat-hi">{f.hi}</div>
              <p className="text-[var(--muted)] text-[0.88rem] leading-[1.65]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-[rgba(255,107,0,0.03)] border-t border-b border-[var(--border)] py-24 px-[6%] scroll-mt-20">
        <div className="text-[0.72rem] font-bold tracking-widest text-[var(--saffron)] uppercase mb-3.5 font-['Baloo_2']">कैसे काम करता है</div>
        <div className="text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.2] mb-3.5 sec-title">3 Steps में <em>Ad Ready</em></div>
        <p className="text-[var(--muted)] text-base max-w-[520px] leading-[1.7]">Seriously — itna aasaan hai.</p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mt-16">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[20px] p-8 relative overflow-hidden transition-colors hover:border-[rgba(255,184,0,0.4)]">
            <div className="step-n">01</div>
            <h3 className="text-base font-bold mb-1.5">Type Your Product</h3>
            <div className="step-hi">प्रोडक्ट का नाम लिखें</div>
            <p className="text-[var(--muted)] text-[0.85rem] leading-[1.6]">Just enter your product name and a short description. No design skills needed.</p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[20px] p-8 relative overflow-hidden transition-colors hover:border-[rgba(255,184,0,0.4)]">
            <div className="step-n">02</div>
            <h3 className="text-base font-bold mb-1.5">Choose Language & Tone</h3>
            <div className="step-hi">भाषा और टोन चुनें</div>
            <p className="text-[var(--muted)] text-[0.85rem] leading-[1.6]">Pick from 20+ Indian languages and set your ad tone — funny, emotional, urgent or inspiring.</p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[20px] p-8 relative overflow-hidden transition-colors hover:border-[rgba(255,184,0,0.4)]">
            <div className="step-n">03</div>
            <h3 className="text-base font-bold mb-1.5">Copy & Post</h3>
            <div className="step-hi">कॉपी करें और पोस्ट करें</div>
            <p className="text-[var(--muted)] text-[0.85rem] leading-[1.6]">Get 4 ad scripts instantly. Copy, paste into your caption or hand off to your video editor. Done.</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-[6%] text-center scroll-mt-20">
        <div className="text-[0.72rem] font-bold tracking-widest text-[var(--saffron)] uppercase mb-3.5 font-['Baloo_2']">Pricing — मूल्य</div>
        <div className="text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.2] mb-3.5 sec-title">पारदर्शी कीमत,<br/><em>असली परिणाम</em></div>
        <p className="text-[var(--muted)] text-base max-w-[520px] mx-auto leading-[1.7] mb-8">No dollar billing. Pure ₹ rupees. Cancel anytime.</p>
        
        {/* LIMITED TIME ₹1 TRIAL PROMO */}
        <div className="bg-gradient-to-r from-[rgba(255,107,0,0.15)] to-[rgba(255,184,0,0.1)] border border-[rgba(255,107,0,0.3)] rounded-2xl p-6 max-w-3xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-2 opacity-10 blur-xl">
             <div className="w-32 h-32 bg-[var(--saffron)] rounded-full"></div>
           </div>
           
           <div className="text-left relative z-10">
             <div className="inline-block bg-[var(--saffron)] text-[#1A0700] text-[0.65rem] font-black uppercase tracking-wider px-2 py-0.5 rounded mb-2">Limited Time Offer</div>
             <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">Experience the full power for <span className="text-[var(--gold)]">just ₹1</span></h3>
             <p className="text-[var(--muted)] text-sm m-0">Generate 10 cinematic AI ads in your native language, complete with hooks, copy, and Veo 3.1 videos. No commitment.</p>
           </div>
           
           <div className="shrink-0 relative z-10 w-full md:w-auto">
             <button onClick={() => navigate('register')} className="w-full md:w-auto bg-gradient-to-br from-[var(--saffron)] to-[var(--gold)] text-[#1A0700] px-8 py-3.5 rounded-xl font-bold text-[0.95rem] border-none shadow-[0_8px_24px_rgba(255,107,0,0.3)] hover:-translate-y-1 transition-all cursor-pointer whitespace-nowrap">
               Claim ₹1 Trial Now
             </button>
             <div className="text-[0.65rem] text-[var(--muted)] text-center mt-2.5">Takes 30 seconds. No questions asked.</div>
           </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-6 text-left items-start">
          <div className="bg-[var(--card)] border border-white/10 rounded-3xl p-9 flex flex-col transition-transform hover:-translate-y-1">
            <div className="text-base font-bold mb-1">Starter — शुरुआत</div>
            <div className="plan-hi">Solo creators & freelancers</div>
            <div className="text-[2.8rem] font-extrabold leading-none"><sup className="text-[1.2rem] text-[var(--gold)] align-top mt-2">₹</sup>999</div>
            <div className="text-[var(--muted)] text-[0.82rem] mb-6 mt-1">per month</div>
            <ul className="list-none flex-1 mb-7">
              <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">30 Ad Generations/month</li>
              <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">All 20+ Indian Languages</li>
              <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">4 Ad types per generation</li>
              <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">All Platforms</li>
            </ul>
            <button className="mt-auto p-3.5 rounded-xl font-bold text-[0.92rem] cursor-pointer border border-white/20 bg-transparent text-white transition-colors hover:bg-white/10 text-center w-full" onClick={() => navigate('register')}>Get Started</button>
          </div>
          <div className="price-card pop rounded-3xl p-9 flex flex-col transition-transform hover:-translate-y-1">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--saffron)] to-[var(--gold)] text-[#1A0700] text-[0.72rem] font-extrabold py-1 px-[18px] rounded-full whitespace-nowrap">🔥 सबसे लोकप्रिय</div>
            <div className="text-base font-bold mb-1">Growth — विकास</div>
            <div className="plan-hi">D2C brands & small agencies</div>
            <div className="text-[2.8rem] font-extrabold leading-none"><sup className="text-[1.2rem] text-[var(--gold)] align-top mt-2">₹</sup>3,499</div>
            <div className="text-[var(--muted)] text-[0.82rem] mb-6 mt-1">per month</div>
            <ul className="list-none flex-1 mb-7">
              <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">150 Ad Generations/month</li>
              <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">All 20+ Indian Languages</li>
              <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">4 Ad types per generation</li>
              <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">Priority Support</li>
            </ul>
            <button className="mt-auto p-3.5 rounded-xl font-bold text-[0.92rem] cursor-pointer border-none bg-gradient-to-br from-[var(--saffron)] to-[var(--gold)] text-[#1A0700] transition-shadow hover:shadow-[0_8px_24px_rgba(255,107,0,0.4)] text-center w-full" onClick={() => navigate('register')}>Start ₹1 Trial</button>
          </div>
          <div className="bg-[var(--card)] border border-white/10 rounded-3xl p-9 flex flex-col transition-transform hover:-translate-y-1">
            <div className="text-base font-bold mb-1">Agency — एजेंसी</div>
            <div className="plan-hi">Large brands & agencies</div>
            <div className="text-[2.8rem] font-extrabold leading-none"><sup className="text-[1.2rem] text-[var(--gold)] align-top mt-2">₹</sup>9,999</div>
            <div className="text-[var(--muted)] text-[0.82rem] mb-6 mt-1">per month</div>
            <ul className="list-none flex-1 mb-7">
              <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">999 Ad Generations/month</li>
              <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">White-label Option</li>
              <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">10 Team Seats</li>
              <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">API Access</li>
            </ul>
            <button className="mt-auto p-3.5 rounded-xl font-bold text-[0.92rem] cursor-pointer border border-white/20 bg-transparent text-white transition-colors hover:bg-white/10 text-center w-full" onClick={() => navigate('register')}>Contact Sales</button>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="bg-[rgba(255,107,0,0.03)] border-t border-[var(--border)] py-24 px-[6%] scroll-mt-20">
        <div className="text-[0.72rem] font-bold tracking-widest text-[var(--saffron)] uppercase mb-3.5 font-['Baloo_2']">Reviews — समीक्षाएं</div>
        <div className="text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.2] mb-3.5 sec-title">Indian Brands <em>Love It</em></div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-6 mt-14">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[18px] p-7 transition-transform hover:-translate-y-1">
            <div className="stars">★★★★★</div>
            <p className="text-[0.9rem] leading-[1.72] text-white/80 mb-4.5">"Pehle ek ad ke liye ₹50,000 studio cost lagti thi. Ab ₹3,500/month mein unlimited scripts. Bhai game changer hai!"</p>
            <div className="flex items-center gap-3">
              <div className="t-av">👨‍💼</div>
              <div><div className="font-bold text-[0.9rem]">Rahul Agarwal</div><div className="text-[0.75rem] text-[var(--muted)]">Founder, ClothKart</div><div className="text-[0.72rem] text-[var(--saffron)] mt-0.5">📍 Surat, Gujarat</div></div>
            </div>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[18px] p-7 transition-transform hover:-translate-y-1">
            <div className="stars">★★★★★</div>
            <p className="text-[0.9rem] leading-[1.72] text-white/80 mb-4.5">"Hamari Diwali campaign mein 4.2x ROAS mila! Hindi ads ne Instagram par viral kar diya. Absolutely love this tool."</p>
            <div className="flex items-center gap-3">
              <div className="t-av">👩‍💼</div>
              <div><div className="font-bold text-[0.9rem]">Priya Sharma</div><div className="text-[0.75rem] text-[var(--muted)]">Marketing Head, NaturalGlow</div><div className="text-[0.72rem] text-[var(--saffron)] mt-0.5">📍 Delhi NCR</div></div>
            </div>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[18px] p-7 transition-transform hover:-translate-y-1">
            <div className="stars">★★★★★</div>
            <p className="text-[0.9rem] leading-[1.72] text-white/80 mb-4.5">"Tamil language support superb hai. Namma customers ko real UGC jaisa lagta hai. Meesho sales double ho gaya!"</p>
            <div className="flex items-center gap-3">
              <div className="t-av">👨‍🎨</div>
              <div><div className="font-bold text-[0.9rem]">Karthik Rajan</div><div className="text-[0.75rem] text-[var(--muted)]">Meesho Seller</div><div className="text-[0.72rem] text-[var(--saffron)] mt-0.5">📍 Chennai, Tamil Nadu</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-[6%] max-w-4xl mx-auto scroll-mt-20">
        <div className="text-center mb-14">
          <div className="text-[0.72rem] font-bold tracking-widest text-[var(--saffron)] uppercase mb-3.5 font-['Baloo_2']">FAQ — सवाल-जवाब</div>
          <div className="text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.2] mb-3.5 sec-title">The ₹1 <em>Question</em></div>
          <p className="text-[var(--muted)] text-base max-w-[600px] mx-auto leading-[1.7]">The psychology behind why top Indian brands are ditching agencies for VigyapanAI.</p>
        </div>

        <div className="space-y-4">
          <details className="group bg-white/5 border border-white/10 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-lg select-none">
              <span>Why should I pay ₹1 when I can use free AI tools?</span>
              <span className="text-[var(--gold)] text-2xl transition-transform duration-300 group-open:rotate-45">+</span>
            </summary>
            <div className="p-6 pt-0 text-[var(--muted)] leading-relaxed border-t border-white/5 mt-2">
              <strong className="text-white">Time is money.</strong> You can spend days tweaking prompts and getting generic, robotic ads. Our platform gives you access to a highly-engineered proprietary prompt engine that guarantees mind-blowing results instantly. For just ₹1, you unlock a complete ecosystem: <strong>Our precise prompt technology + Platform Access + Image Ads + Veo 3.1 Video Ads + Editing Tools + 1-Click Social Media Push</strong>. It's an entire marketing agency condensed into a single click.
            </div>
          </details>

          <details className="group bg-white/5 border border-white/10 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-lg select-none">
              <span>Will this actually convert my specific Indian audience?</span>
              <span className="text-[var(--gold)] text-2xl transition-transform duration-300 group-open:rotate-45">+</span>
            </summary>
            <div className="p-6 pt-0 text-[var(--muted)] leading-relaxed border-t border-white/5 mt-2">
              Absolutely. Ad success in India relies on <em>Bhaav</em> (Emotion) and deep cultural relevance. We don't just translate English to Hindi or Tamil—our AI is psychologically calibrated to understand regional nuances, local slang, and purchasing triggers. Whether you target Gen-Z in metro cities or homemakers in Tier-3 towns, the messaging hits home every single time.
            </div>
          </details>

          <details className="group bg-white/5 border border-white/10 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-lg select-none">
              <span>I have zero video editing skills. Can I still make Reel & Shorts ads?</span>
              <span className="text-[var(--gold)] text-2xl transition-transform duration-300 group-open:rotate-45">+</span>
            </summary>
            <div className="p-6 pt-0 text-[var(--muted)] leading-relaxed border-t border-white/5 mt-2">
              Yes! We have integrated Google's state-of-the-art <strong>Veo 3.1</strong> under the hood. You don't need a timeline, fancy software, or an editor. Just select your product and tone, and our system generates cinematic, high-converting video ads dynamically. You can then push them straight to your social media channels with our single-click service.
            </div>
          </details>

          <details className="group bg-white/5 border border-white/10 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-lg select-none">
              <span>Are there any video editing tools included? How do I post?</span>
              <span className="text-[var(--gold)] text-2xl transition-transform duration-300 group-open:rotate-45">+</span>
            </summary>
            <div className="p-6 pt-0 text-[var(--muted)] leading-relaxed border-t border-white/5 mt-2">
              Absolutely! Not only do we generate the video using Veo 3.1, but we also include <strong>free AI video editing tools</strong> right in your dashboard so you're completely comfortable fine-tuning your ad. Once it's perfect, our <strong>single click push to social media</strong> lets you instantly publish to YouTube Shorts, Instagram Reels, and Facebook Ads—or just download the MP4—all included in your ₹1 trial.
            </div>
          </details>

          <details className="group bg-white/5 border border-white/10 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-lg select-none">
              <span>Is it really just ₹1? What's the catch?</span>
              <span className="text-[var(--gold)] text-2xl transition-transform duration-300 group-open:rotate-45">+</span>
            </summary>
            <div className="p-6 pt-0 text-[var(--muted)] leading-relaxed border-t border-white/5 mt-2">
              No catch. Pure, transparent ₹1 to verify your account and stop spam. We know that once you experience the power of generating 10 professional, revenue-driving campaigns in 30 seconds, you'll never go back to paying expensive agency retainers. We're investing in your first 10 ads because we know you'll stay for the ROI.
            </div>
          </details>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="text-center bg-gradient-to-br from-[rgba(255,107,0,0.12)] to-[rgba(255,184,0,0.06)] border-t border-b border-[rgba(255,107,0,0.2)] py-20 px-6">
        <div className="font-['Baloo_2'] text-[1.4rem] text-[var(--gold)] mb-3">अभी शुरू करें — देर किस बात की?</div>
        <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold mb-3">India's Ad Revolution<br/>Starts Here</h2>
        <p className="text-[var(--muted)] max-w-[500px] mx-auto text-base mb-9">Unlock instant AI copywriting. Securely test the tool with a ₹1 verification charge to try 10 ad generations today.</p>
        <button className="bg-gradient-to-br from-[var(--saffron)] to-[var(--gold)] text-[#1A0700] px-10 py-4 rounded-2xl border-none cursor-pointer text-lg font-extrabold font-['Baloo_2'] shadow-[0_8px_32px_rgba(255,107,0,0.4)] hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(255,107,0,0.55)] transition-all" onClick={() => navigate('register')}>✨ ₹1 Trial 🚀</button>
      </section>

      {/* FOOTER */}
      <footer className="pt-14 px-[6%] pb-9 border-t border-white/5">
        <div className="flex justify-between flex-wrap gap-10 mb-11">
          <div className="max-w-[260px]">
            <div className="logo"><em>Vigyapan</em>AI 🇮🇳</div>
            <p className="text-[var(--muted)] text-[0.83rem] leading-[1.7] mt-2.5">India's AI ad copy creator for Bharat. 20+ Indian languages. Built for Indian businesses.</p>
          </div>
        </div>
        <div className="flex justify-between items-center flex-wrap gap-3 pt-6 border-t border-white/5">
          <p className="text-white/30 text-[0.78rem]">© 2026 VigyapanAI. Made with ❤️ in 🇮🇳 India.</p>
        </div>
      </footer>
    </div>
  );
}
