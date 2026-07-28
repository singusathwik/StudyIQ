import React, { useEffect, useRef, useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  HelpCircle, 
  Mic, 
  BarChart3, 
  Flame, 
  Award, 
  FileText, 
  Share2, 
  CheckCircle2, 
  ArrowRight, 
  Brain, 
  Zap, 
  Clock, 
  BookOpen,
  Star,
  TrendingUp,
  Target,
  ChevronDown
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Brain size={26} />,
    color: 'bg-purple',
    title: 'SM-2 Spaced Repetition',
    desc: 'Our intelligent algorithm tracks memory decay and schedules reviews right before you forget. Scientifically proven to boost long-term retention by up to 200%.',
    tag: 'Memory Science'
  },
  {
    icon: <FileText size={26} />,
    color: 'bg-blue',
    title: 'Instant PDF & DOCX Import',
    desc: 'Upload lecture slides, research papers, or Word documents. Text extracted safely in your browser using PDF.js — zero data leaves your device.',
    tag: 'Privacy First'
  },
  {
    icon: <Sparkles size={26} />,
    color: 'bg-purple',
    title: 'Claude AI Generation',
    desc: 'Anthropic Claude 3.5 Sonnet transforms your raw notes into structured flashcards, MCQs, True/False and Fill-in-the-blank questions in seconds.',
    tag: 'Claude AI'
  },
  {
    icon: <Mic size={26} />,
    color: 'bg-green',
    title: 'Hands-Free Voice Quiz',
    desc: 'Answer MCQ and True/False questions out loud using the Web Speech API. Perfect for commutes, gym sessions, or deep-focus vocal recall practice.',
    tag: 'Voice Mode'
  },
  {
    icon: <Flame size={26} />,
    color: 'bg-fire',
    title: 'Gamified Streaks & XP',
    desc: 'Earn XP for every correct answer, level up your profile, maintain daily study streaks, and unlock achievement badges that celebrate every milestone.',
    tag: 'Gamification'
  },
  {
    icon: <BarChart3 size={26} />,
    color: 'bg-orange',
    title: 'Performance Analytics',
    desc: 'Track accuracy trends with live Recharts graphs, identify weak concepts with automated error-rate visualisations, and pinpoint exactly where to focus.',
    tag: 'Analytics'
  }
];

const STEPS = [
  {
    number: '01',
    title: 'Paste Notes or Upload File',
    desc: 'Drop in any text, upload a PDF or DOCX, or pick a preset sample topic to begin immediately.',
    icon: <FileText size={28} />
  },
  {
    number: '02',
    title: 'AI Builds Your Study Kit',
    desc: 'Claude AI extracts key concepts and creates 3D flip flashcards, MCQs, True/False, and fill-in-the-blank questions.',
    icon: <Brain size={28} />
  },
  {
    number: '03',
    title: 'Practice & Ace Your Exams',
    desc: 'Review due cards with SM-2 scheduling, take timed voice quizzes, earn XP, track trends, and export PDFs.',
    icon: <Target size={28} />
  }
];

const TESTIMONIALS = [
  {
    name: 'Priya S.',
    role: 'Medical Student',
    text: 'I went from struggling with pharmacology to scoring 94% in my finals. The SM-2 spaced repetition is genuinely life-changing.',
    rating: 5,
    avatar: '👩‍⚕️'
  },
  {
    name: 'Arjun M.',
    role: 'CS Engineering',
    text: 'Uploading my DSA notes and having quiz questions auto-generated saved me weeks of prep time. Absolutely incredible tool.',
    rating: 5,
    avatar: '👨‍💻'
  },
  {
    name: 'Fatima K.',
    role: 'Law Graduate',
    text: 'The voice quiz mode is perfect for reviewing case law while commuting. StudyIQ completely changed how I prepare for moot court.',
    rating: 5,
    avatar: '⚖️'
  }
];

export function LandingPage({ onLaunchDashboard }) {
  const [heroVisible, setHeroVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  // Auto-cycle active feature every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % FEATURES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="lp-root">

      {/* ── HERO ── */}
      <section className={`lp-hero ${heroVisible ? 'lp-hero--visible' : ''}`}>

        {/* Background orb glow effects */}
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div className="lp-orb lp-orb-3" />

        <div className="lp-hero-inner">
          <div className="lp-hero-badge">
            <Sparkles size={14} />
            <span>Powered by Claude 3.5 Sonnet · SM-2 Algorithm</span>
          </div>

          <h1 className="lp-hero-title">
            Study smarter.
            <br />
            <span className="lp-gradient-word">Remember everything.</span>
          </h1>

          <p className="lp-hero-sub">
            Transform any lecture notes, PDF, or textbook into an AI-powered study kit — 
            3D flashcards, adaptive quizzes, spaced repetition, and live analytics — all in one place.
          </p>

          <div className="lp-hero-actions">
            <button className="lp-btn-cta" onClick={onLaunchDashboard}>
              <Sparkles size={18} />
              <span>Start Studying for Free</span>
              <ArrowRight size={16} />
            </button>
            <a href="#how-it-works" className="lp-btn-ghost">
              <span>See How It Works</span>
              <ChevronDown size={16} />
            </a>
          </div>

          {/* Social Proof Mini Strip */}
          <div className="lp-social-proof">
            <div className="lp-avatars">
              {['👩‍🎓','👨‍💻','👩‍⚕️','👨‍🔬','👩‍⚖️'].map((emoji, i) => (
                <span key={i} className="lp-avatar">{emoji}</span>
              ))}
            </div>
            <div className="lp-proof-text">
              <div className="lp-stars">
                {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="currentColor" />)}
              </div>
              <span>Loved by 10,000+ students worldwide</span>
            </div>
          </div>
        </div>

        {/* Floating Stats Cards */}
        <div className="lp-floating-stats">
          <div className="lp-float-card lp-float-card--1">
            <Flame size={20} className="lp-float-icon fire" />
            <div>
              <div className="lp-float-num">12-Day</div>
              <div className="lp-float-lbl">Study Streak</div>
            </div>
          </div>
          <div className="lp-float-card lp-float-card--2">
            <TrendingUp size={20} className="lp-float-icon green" />
            <div>
              <div className="lp-float-num">+87%</div>
              <div className="lp-float-lbl">Retention Rate</div>
            </div>
          </div>
          <div className="lp-float-card lp-float-card--3">
            <Zap size={20} className="lp-float-icon gold" />
            <div>
              <div className="lp-float-num">2,450 XP</div>
              <div className="lp-float-lbl">Earned Today</div>
            </div>
          </div>
        </div>

      </section>

      {/* ── STAT BAR ── */}
      <section className="lp-stats-bar">
        {[
          { num: '200%', label: 'Better Retention' },
          { num: 'SM-2', label: 'SuperMemo Algorithm' },
          { num: '3x', label: 'Faster Study Speed' },
          { num: '100%', label: 'Private & Secure' }
        ].map((s, i) => (
          <div key={i} className="lp-stat-item">
            <span className="lp-stat-num">{s.num}</span>
            <span className="lp-stat-lbl">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="lp-section">
        <div className="lp-section-hd">
          <span className="lp-section-tag">FEATURES</span>
          <h2 className="lp-section-title">Everything you need to <span className="lp-gradient-word">master any subject</span></h2>
          <p className="lp-section-sub">Built on cognitive science and powered by AI — every feature is designed to help you learn faster and remember longer.</p>
        </div>

        {/* Interactive Feature Grid */}
        <div className="lp-features-layout">
          {/* Left: Feature Cards */}
          <div className="lp-feature-cards">
            {FEATURES.map((f, i) => (
              <div 
                key={i}
                className={`lp-feature-card ${activeFeature === i ? 'active' : ''}`}
                onMouseEnter={() => setActiveFeature(i)}
              >
                <div className={`lp-feature-icon ${f.color}`}>{f.icon}</div>
                <div className="lp-feature-text">
                  <div className="lp-feature-tag">{f.tag}</div>
                  <h3 className="lp-feature-title">{f.title}</h3>
                  <p className="lp-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Active Feature Spotlight */}
          <div className="lp-feature-spotlight">
            <div className={`lp-spotlight-card ${FEATURES[activeFeature].color}`}>
              <div className="lp-spotlight-icon">{FEATURES[activeFeature].icon}</div>
              <h3 className="lp-spotlight-title">{FEATURES[activeFeature].title}</h3>
              <p className="lp-spotlight-desc">{FEATURES[activeFeature].desc}</p>
              <div className="lp-spotlight-dots">
                {FEATURES.map((_, i) => (
                  <button 
                    key={i} 
                    className={`lp-dot ${activeFeature === i ? 'active' : ''}`}
                    onClick={() => setActiveFeature(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="lp-section lp-how-section">
        <div className="lp-section-hd">
          <span className="lp-section-tag">HOW IT WORKS</span>
          <h2 className="lp-section-title">Go from <span className="lp-gradient-word">raw notes to exam-ready</span> in 3 steps</h2>
        </div>

        <div className="lp-steps-row">
          {STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <div className="lp-step-card">
                <div className="lp-step-num">{step.number}</div>
                <div className="lp-step-icon-ring">{step.icon}</div>
                <h4 className="lp-step-title">{step.title}</h4>
                <p className="lp-step-desc">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="lp-step-arrow">
                  <ArrowRight size={20} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="lp-section">
        <div className="lp-section-hd">
          <span className="lp-section-tag">TESTIMONIALS</span>
          <h2 className="lp-section-title">Students are <span className="lp-gradient-word">acing their exams</span></h2>
        </div>

        <div className="lp-testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="lp-testimonial-card glass-panel">
              <div className="lp-t-header">
                <span className="lp-t-avatar">{t.avatar}</span>
                <div>
                  <div className="lp-t-name">{t.name}</div>
                  <div className="lp-t-role">{t.role}</div>
                </div>
                <div className="lp-t-stars">
                  {Array(t.rating).fill(0).map((_, s) => (
                    <Star key={s} size={13} fill="var(--color-gold)" color="var(--color-gold)" />
                  ))}
                </div>
              </div>
              <p className="lp-t-text">"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-cta-section">
        <div className="lp-cta-orb" />
        <div className="lp-cta-inner">
          <div className="lp-hero-badge" style={{ justifyContent: 'center' }}>
            <Award size={14} />
            <span>Join 10,000+ high-performing students</span>
          </div>
          <h2 className="lp-cta-title">
            Ready to <span className="lp-gradient-word">transform</span> how you study?
          </h2>
          <p className="lp-cta-sub">
            No sign-up required. No data stored on servers. Start studying smarter in under 30 seconds.
          </p>
          <button className="lp-btn-cta lp-cta-big" onClick={onLaunchDashboard}>
            <Sparkles size={20} />
            <span>Open AI Study Generator</span>
            <ArrowRight size={18} />
          </button>
          <div className="lp-cta-perks">
            {['✓ Free forever', '✓ No login needed', '✓ 100% private', '✓ Works offline'].map((p, i) => (
              <span key={i} className="lp-cta-perk">{p}</span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
