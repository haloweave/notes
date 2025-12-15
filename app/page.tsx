'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
/* import styles from './landing.module.css'; */ /* Removed bad module */
import { AuthModal } from '@/components/auth/AuthModal';

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="msg-landing">
      <header className="nav">
        <div className="container nav-inner">
          <Link className="logo" href="/">
            <Image src="/logo.png" alt="Huggnote Logo" width={40} height={40} style={{ borderRadius: '10px' }} />
            Huggnote
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div className="mobile-overlay" onClick={closeMobileMenu} />
          )}

          <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {/* Close button for mobile */}
            <button
              className="mobile-menu-btn"
              onClick={closeMobileMenu}
              style={{ position: 'absolute', top: '20px', right: '20px' }}
              aria-label="Close menu"
            >
              ✕
            </button>

            <a href="#examples" onClick={closeMobileMenu}>Examples</a>
            <a href="#how" onClick={closeMobileMenu}>How it works</a>
            <a href="#pricing" onClick={closeMobileMenu}>Pricing</a>
            <a href="#faq" onClick={closeMobileMenu}>FAQ</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setIsAuthOpen(true); closeMobileMenu(); }}>Login</a>
            <a className="btn btn-mindblowing" href="#" onClick={(e) => { e.preventDefault(); setIsAuthOpen(true); closeMobileMenu(); }}><span className="btn-text-content">Start Your Gift</span></a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">

          <div className="container hero-grid">
            <div className="hero-content">
              <div className="hero-eyebrow">Custom Holiday Songs</div>
              <h1>The most magical gift they&apos;ll get this Christmas.</h1>
              <p>
                Turn your memories into a custom holiday song. Delivered as a magical, interactive experience with snow, hearts, and music.
              </p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#" onClick={(e) => { e.preventDefault(); setIsAuthOpen(true); }}>
                  Start Your Gift
                </a>
                <a className="btn btn-secondary" href="#examples">Listen to Examples</a>
              </div>
            </div>

            <div className="preview-card" style={{ padding: 0, border: 'none', boxShadow: 'none', background: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <article className="media-card" id="track-card">
                <div className="media-card__loading hidden" id="track-loader">
                  <span className="material-symbols-outlined">progress_activity</span>
                </div>

                <div className="media-card__header">
                  <div className="media-card__header__logo">
                    <Image src="/logo.png" alt="Huggnote Logo" width={32} height={32} style={{ borderRadius: '8px' }} />
                  </div>
                </div>

                <div className="media-card__content">
                  <div className="media-card__content__info">
                    <h4 id="track-name">Christmas Magic</h4>
                    <p id="track-artist">For Sarah</p>
                  </div>

                  <button className="media-card__content__btn" id="hero-play-btn">
                    <span className="material-symbols-outlined">play_arrow</span>
                  </button>
                </div>

                <div className="media-card__controls">
                  <button className="media-card__controls__btn">
                    <span className="material-symbols-outlined">skip_previous</span>
                  </button>

                  <div id="slider" className="slider" style={{ '--value': 0 } as any}>
                    <span className="slider__before"></span>
                    <span id="thumb" className="slider__thumb"></span>
                    <span className="slider__after"></span>
                  </div>

                  <button className="media-card__controls__btn">
                    <span className="material-symbols-outlined">skip_next</span>
                  </button>
                </div>

                {/* Audio elements commented out as they require valid src */}
                {/* <audio id="hero-audio" src="assets/img/preview-sample.wav" preload="metadata"></audio> */}
              </article>
            </div>
          </div>
        </section>

        <section id="examples" className="section" style={{ background: 'var(--color-surface-2)' }}>
          <div className="container">
            <div className="section-header text-center" style={{ margin: '0 auto 48px', maxWidth: '600px' }}>
              <div className="section-label">Example Songs</div>
              <h2 className="section-title">Hear the magic</h2>
              <p className="section-subtitle">Listen to examples of songs created for other customers.</p>
            </div>

            <div className="two-column" style={{ alignItems: 'center' }}>
              <div>
                <div className="example-player">
                  <button className="play-button">▶</button>
                  <div className="track-info">
                    <div className="track-title">First Christmas Together</div>
                    <div className="track-meta">Pop Ballad • For Wife</div>
                  </div>
                </div>

                <div className="example-player">
                  <button className="play-button">▶</button>
                  <div className="track-info">
                    <div className="track-title">Grandma&apos;s Cookies</div>
                    <div className="track-meta">Classic Jazz • For Grandma</div>
                  </div>
                </div>

                <div className="example-player">
                  <button className="play-button">▶</button>
                  <div className="track-info">
                    <div className="track-title">Baby&apos;s First Snow</div>
                    <div className="track-meta">Acoustic Folk • For Daughter</div>
                  </div>
                </div>
              </div>
              <div>
                <h3>Every song is unique.</h3>
                <p>We use your stories—the inside jokes, the special dates, the memories—to craft lyrics that could only be for them. Then we set it to the holiday vibe of your choice.</p>
                <a href="#pricing" className="btn btn-secondary">Create Your Own</a>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <div className="section-label">How It Works</div>
                <h2 className="section-title">From your story to their ears</h2>
                <p className="section-subtitle">Simple, secure, and magical.</p>
              </div>
            </div>
            <div className="steps">
              <article className="step-card">
                <div className="step-number">1</div>
                <h4>Choose Package & Pay</h4>
                <p>Select the Single or Multi pack and complete our secure checkout first.</p>
              </article>
              <article className="step-card">
                <div className="step-number">2</div>
                <h4>Tell Your Story</h4>
                <p>Fill out a simple form with the recipient&apos;s name, your relationship, and key memories.</p>
              </article>
              <article className="step-card">
                <div className="step-number">3</div>
                <h4>We Create</h4>
                <p>Our AI generates your custom song(s). Use your included regenerations to get it perfect.</p>
              </article>
              <article className="step-card">
                <div className="step-number">4</div>
                <h4>Review & Share</h4>
                <p>Select your favorite version and get a unique, magical URL to share with them.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="pricing" className="section">
          <div className="container pricing">
            <div className="section-header">
              <div>
                <div className="section-label">Pricing</div>
                <h2 className="section-title">Give the perfect gift</h2>
              </div>
            </div>
            <div className="pricing-grid">
              <div className="pricing-card">
                <div>
                  <p className="pill">Single Pack</p>
                  <h3>One special song</h3>
                  <p className="muted">Perfect for a partner, parent, or child.</p>
                </div>
                <div className="price">$79 <small>/ gift</small></div>
                <ul className="pricing-features">
                  <li>1 Custom Song</li>
                  <li><strong>5 Regenerations</strong> included</li>
                  <li>Magical Gift Link</li>
                  <li>Downloadable MP3</li>
                </ul>
                <a className="btn btn-primary" href="#">
                  Buy Single Pack
                </a>
              </div>
              <div className="pricing-card highlighted">
                <div className="badge pricing-badge">Best Value</div>
                <div>
                  <p className="pill">Multi Pack</p>
                  <h3>Five special songs</h3>
                  <p className="muted">Cover the whole family and save.</p>
                </div>
                <div className="price">$299 <small>/ 5 gifts</small></div>
                <p className="success">Save $96!</p>
                <ul className="pricing-features">
                  <li>Up to 5 Custom Songs</li>
                  <li><strong>5 Regenerations</strong> per song</li>
                  <li>Magical Gift Links</li>
                  <li>Downloadable MP3s</li>
                  <li>Priority Generation</li>
                </ul>
                <a className="btn btn-primary" href="#">
                  Buy Multi Pack
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="section section-sm" style={{ background: 'var(--color-surface-2)' }}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">FAQ</h2>
            </div>
            <div className="accordion-container">
              <details className="accordion-item">
                <summary className="accordion-summary"><h4>Do I pay before creating the song?</h4></summary>
                <p>Yes. To start the custom generation process, please select a package and complete payment. You&apos;ll then be directed immediately to the form to tell your story.</p>
              </details>
              <details className="accordion-item">
                <summary className="accordion-summary"><h4>What if I don&apos;t like the first version?</h4></summary>
                <p>No problem! The Single Pack comes with 5 regenerations, and the Multi Pack includes 5 regenerations for <em>each</em> of the 5 songs, so you can tweak the style or lyrics until it&apos;s perfect.</p>
              </details>
              <details className="accordion-item">
                <summary className="accordion-summary"><h4>How do I share it?</h4></summary>
                <p>You&apos;ll receive a unique link (e.g., huggnote.com/gift/xyz) that opens a beautiful snowy page with your song. You can send this via WhatsApp, Email, or SMS.</p>
              </details>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="footer">
        <div className="container footer-centered">
          <Link className="logo" href="/" style={{ marginBottom: '24px' }}>
            <Image src="/logo.png" alt="Huggnote Logo" width={40} height={40} style={{ borderRadius: '10px' }} />
            Huggnote
          </Link>

          <nav className="footer-nav-row">
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="footer-social-row">
            <a href="#">Instagram</a>
            <a href="#">TikTok</a>
            <a href="#">YouTube</a>
            <span className="muted" style={{ margin: '0 8px' }}>•</span>
            <a href="mailto:hello@huggnote.com">hello@huggnote.com</a>
          </div>

          <p className="muted copyright">
            © 2025 Huggnote. Crafted with care for the holidays.
          </p>
        </div>
      </footer>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
