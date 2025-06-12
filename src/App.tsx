import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import profileImg from './assets/profile.png';

interface Job {
  role: string;
  period: string;
  description: string;
  stack: string;
}

interface Project {
  name: string;
  description: string;
  stack: string;
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

  return (
    <main className="resume-container">
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
              <span className="job-role">{job.role}</span>
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
              <div className="project-name">{proj.name}</div>
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
  );
}

export default App;
