import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import profileImg from './assets/profile.png';

interface Job {
  role: string;
  period: string;
  description: string;
  stack: string;
  link?: string;
}

interface Project {
  name: string;
  description: string;
  stack: string;
  link?: string;
}

function App() {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language.startsWith('pt') ? 'pt' : 'en');
  const jobs = t('experience.jobs', { returnObjects: true }) as Job[];
  const projects = t('projects.list', { returnObjects: true }) as Project[];

  const handleLangSwitch = (nextLang: string) => {
    i18n.changeLanguage(nextLang);
    setLang(nextLang);
  };

  const [reveal, setReveal] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const imgFadeRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setShowFade(false), 700);
    return () => clearTimeout(timeout);
  }, []);

  // Mouse/touch handlers for reveal effect
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    let x = 0, y = 0;
    if ('touches' in e && e.touches.length > 0) {
      const rect = imgFadeRef.current?.getBoundingClientRect();
      if (rect) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      }
    } else if ('clientX' in e) {
      const rect = imgFadeRef.current?.getBoundingClientRect();
      if (rect) {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
    }
    setReveal(r => ({ ...r, x, y, active: true }));
  };
  const handleLeave = () => setReveal(r => ({ ...r, active: false }));

  // Starfield animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId: number;
    let running = true;

    // Star properties
    const STAR_COUNT = Math.floor((width * height) / 6000); // was 1200, now 2000 for fewer stars
    const STAR_MIN_RADIUS = 0.4;
    const STAR_MAX_RADIUS = 1.5;
    const STAR_MIN_SPEED = 0.12;
    const STAR_MAX_SPEED = 0.45;

    type Star = { x: number; y: number; r: number; speed: number };
    type Comet = Star & { dx: number; dy: number };
    let stars: Star[] = [];
    let comet: Comet | null = null;
    let cometTrail: { x: number; y: number }[] = [];

    function randomStar(): Star {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: STAR_MIN_RADIUS + Math.random() * (STAR_MAX_RADIUS - STAR_MIN_RADIUS),
        speed: STAR_MIN_SPEED + Math.random() * (STAR_MAX_SPEED - STAR_MIN_SPEED),
      };
    }

    function createStars() {
      stars = Array.from({ length: STAR_COUNT }, randomStar);
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      createStars();
    }

    function maybeSpawnComet() {
      if (!comet && Math.random() < 0.05 / 60) {
        // Diagonal: randomize left/right, always top
        const leftToRight = Math.random() < 0.5;
        comet = {
          x: leftToRight ? -40 : width + 40,
          y: -30,
          r: 2.2 + Math.random() * 1.2,
          speed: 28 + Math.random() * 7, // Even more faster
          dx: leftToRight ? 1 : -1,
          dy: 1,
        };
        cometTrail = [];
      }
    }

    function drawComet(ctx: CanvasRenderingContext2D) {
      if (!comet) return;
      // Draw smooth fading trail as a polyline with gradient
      if (cometTrail.length > 2) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(comet.x, comet.y);
        for (let i = cometTrail.length - 1; i >= 0; i--) {
          const t = cometTrail[i];
          ctx.lineTo(t.x, t.y);
        }
        // Gradient: whiter near comet, gray farther
        const grad = ctx.createLinearGradient(
          comet.x, comet.y,
          cometTrail[0].x, cometTrail[0].y
        );
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.7, 'rgba(200,200,200,0.35)');
        grad.addColorStop(1, 'rgba(120,120,120,0.08)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 7;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 16;
        ctx.globalAlpha = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
      }
      // Draw comet head
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, comet.r, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 22;
      ctx.globalAlpha = 1;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    function updateComet() {
      if (!comet) return;
      cometTrail.push({ x: comet.x, y: comet.y });
      if (cometTrail.length > 16) cometTrail.shift();
      // Move diagonally
      const dx = comet.dx * comet.speed * 0.7;
      const dy = comet.dy * comet.speed;
      comet.x += dx;
      comet.y += dy;
      // Let the comet go much further beyond the viewport
      if (
        comet.y > height + 1000 ||
        comet.x < -1000 ||
        comet.x > width + 1000
      ) {
        comet = null;
        cometTrail = [];
      }
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.7 + 0.3 * Math.random();
        ctx.fill();
        ctx.globalAlpha = 1;
        star.y -= star.speed;
        if (star.y < -star.r) {
          star.x = Math.random() * width;
          star.y = height + star.r;
          star.r = STAR_MIN_RADIUS + Math.random() * (STAR_MAX_RADIUS - STAR_MIN_RADIUS);
          star.speed = STAR_MIN_SPEED + Math.random() * (STAR_MAX_SPEED - STAR_MIN_SPEED);
        }
      }
      maybeSpawnComet();
      if (comet) {
        updateComet();
        drawComet(ctx);
      }
      if (running) animationId = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener('resize', resize);
    running = true;
    animate();

    return () => {
      running = false;
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="starfield-bg"
        style={{
          position: 'fixed',
          zIndex: 0,
          left: 0,
          top: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      <main className="resume-container" style={{ position: 'relative', zIndex: 1 }}>
        <header className="profile-header">
          <div
            className="profile-img-fade"
            ref={imgFadeRef}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            onTouchMove={handleMove}
            onTouchEnd={handleLeave}
          >
            <img
              src={profileImg}
              alt="Gustavo Resende"
              className="profile-img"
              style={{ position: 'absolute', left: 0, top: 0, zIndex: 2 }}
            />
            <img
              src="https://avatars.githubusercontent.com/u/62570230?s=400&u=ab23399c76af171cbd8f533e1e4fb6fc3978d446&v=4"
              alt="Gustavo Resende Github"
              className="profile-img"
              style={showFade ? {
                opacity: 1,
                transition: 'opacity 0.7s',
                zIndex: 3
              } : reveal.active ? {
                WebkitMaskImage: `radial-gradient(circle 55px at ${reveal.x}px ${reveal.y}px, white 70%, transparent 100%)`,
                maskImage: `radial-gradient(circle 55px at ${reveal.x}px ${reveal.y}px, white 70%, transparent 100%)`,
                transition: 'mask-image 0.2s',
                opacity: 1,
                zIndex: 3
              } : {
                opacity: 0,
                pointerEvents: 'none',
                transition: 'opacity 0.2s',
                zIndex: 3
              }}
            />
          </div>
          
          <div className="profile-info">
            <h1>Gustavo Resende</h1>
            <p className="profile-title">{t('about.titleLine')}</p>
          </div>
          <button
            className="lang-switcher-combo"
            onClick={() => handleLangSwitch(lang === 'en' ? 'pt' : 'en')}
            title="Switch language"
            aria-label="Switch language"
          >
            <span style={{ fontSize: lang === 'en' ? '1.15em' : '0.85em', fontWeight: lang === 'en' ? 700 : 400 }}>En</span>
            <span style={{ fontSize: lang === 'pt' ? '1.15em' : '0.85em', fontWeight: lang === 'pt' ? 700 : 400, marginLeft: 4 }}>
              Pt
            </span>
          </button>
        </header>
        <span className="profile-greeting">{t('about.greeting')}</span>
        <section>
          <h2>{t('about.title')}</h2>
          <p className="about-desc">{t('about.description')}</p>
        </section>
        <section>
          <h2>{t('experience.title')}</h2>
          {jobs.map((job, idx) => (
            <div key={idx} className="job-block">
              <div className="job-header">
                {job.link ? (
                  <a href={job.link} target="_blank" rel="noopener noreferrer" className="job-role-link">
                    <span className="job-role">{job.role}</span> <span aria-label="external link" title="external link">↗</span>
                  </a>
                ) : (
                  <span className="job-role">{job.role}</span>
                )}
                <span className="job-period">{job.period}</span>
              </div>
              <div className="job-desc">{job.description}</div>
              <div className="job-stack">{job.stack}</div>
            </div>
          ))}
        </section>
        <section>
          <h2>{t('projects.title')}</h2>
          <ul className="project-list">
            {projects.map((proj, idx) => (
              <li key={idx} className="project-block">
                {proj.link ? (
                  <a href={proj.link} target="_blank" rel="noopener noreferrer" className="project-name-link">
                    <div className="project-name">{proj.name} <span aria-label="external link" title="external link">↗</span></div>
                  </a>
                ) : (
                  <div className="project-name">{proj.name}</div>
                )}
                <div className="project-desc">{proj.description}</div>
                <div className="project-stack">{proj.stack}</div>
              </li>
            ))}
          </ul>
        </section>
        <section className="links-section">
          <h2>{t('links.title')}</h2>
          <ul className="links-list">
            <li><span>GitHub</span><a href="https://github.com/resendegu" target="_blank" rel="noopener noreferrer">resendegu <span aria-label="external link" title="external link">↗</span></a></li>
            <li><span>LinkedIn</span><a href="https://www.linkedin.com/in/resendegu/" target="_blank" rel="noopener noreferrer">resendegu <span aria-label="external link" title="external link">↗</span></a></li>
            <li><span>Instagram</span><a href="https://instagram.com/resendegu" target="_blank" rel="noopener noreferrer">@resendegu <span aria-label="external link" title="external link">↗</span></a></li>
            <li><span>YouTube</span><a href="https://youtube.com/@resendegu" target="_blank" rel="noopener noreferrer">@resendegu <span aria-label="external link" title="external link">↗</span></a></li>
          </ul>
        </section>
        <footer className="footer-easter-egg">
          <small>{t('footer.easterEgg')}</small>
        </footer>
      </main>
    </>
  );
}

export default App;
