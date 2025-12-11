'use client';

import { useState } from 'react';
import AudioPlayer from './components/AudioPlayer';
import LoginModal from './components/LoginModal';

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      {/* Header */}
      <header style={{ padding: '16px 0', borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ fontSize: '20px', fontWeight: 'bold', textDecoration: 'none', color: '#000' }}>
            <span style={{ display: 'inline-block', width: '32px', height: '32px', background: '#6366f1', color: 'white', borderRadius: '8px', textAlign: 'center', lineHeight: '32px', marginRight: '8px' }}>H</span>
            Huggnote2
          </a>
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <a href="#examples" style={{ textDecoration: 'none', color: '#666' }}>Examples</a>
            <a href="#how" style={{ textDecoration: 'none', color: '#666' }}>How it works</a>
            <a href="#pricing" style={{ textDecoration: 'none', color: '#666' }}>Pricing</a>
            <a href="#faq" style={{ textDecoration: 'none', color: '#666' }}>FAQ</a>
            <button onClick={() => setShowLoginModal(true)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>Login</button>
            <a href="#pricing" style={{ padding: '8px 16px', background: '#6366f1', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>Start Your Gift</a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section style={{ padding: '80px 20px', background: '#f9fafb' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#6366f1', fontWeight: '600', marginBottom: '16px' }}>Custom Holiday Songs</div>
              <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.2' }}>The most magical gift they'll get this Christmas.</h1>
              <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>
                Turn your memories into a custom holiday song. Delivered as a magical, interactive experience with snow, hearts, and music.
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a href="#pricing" style={{ padding: '12px 24px', background: '#6366f1', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Start Your Gift</a>
                <a href="#examples" style={{ padding: '12px 24px', background: 'white', color: '#6366f1', border: '2px solid #6366f1', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Listen to Examples</a>
              </div>
            </div>
            <div>
              <AudioPlayer
                title="Christmas Magic"
                artist="For Sarah"
                audioSrc="/preview-sample.wav"
              />
            </div>
          </div>
        </section>

        {/* Examples Section */}
        <section id="examples" style={{ padding: '80px 20px', background: '#fff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ fontSize: '14px', color: '#6366f1', fontWeight: '600', marginBottom: '8px' }}>Example Songs</div>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>Hear the magic</h2>
              <p style={{ color: '#666' }}>Listen to examples of songs created for other customers.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <ExamplePlayer title="First Christmas Together" meta="Pop Ballad • For Wife" />
                <ExamplePlayer title="Grandma's Cookies" meta="Classic Jazz • For Grandma" />
                <ExamplePlayer title="Baby's First Snow" meta="Acoustic Folk • For Daughter" />
              </div>
              <div>
                <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>Every song is unique.</h3>
                <p style={{ color: '#666', marginBottom: '24px' }}>We use your stories—the inside jokes, the special dates, the memories—to craft lyrics that could only be for them. Then we set it to the holiday vibe of your choice.</p>
                <a href="#pricing" style={{ padding: '12px 24px', background: 'white', color: '#6366f1', border: '2px solid #6366f1', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', display: 'inline-block' }}>Create Your Own</a>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how" style={{ padding: '80px 20px', background: '#f9fafb' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '48px' }}>
              <div style={{ fontSize: '14px', color: '#6366f1', fontWeight: '600', marginBottom: '8px' }}>How It Works</div>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>From your story to their ears</h2>
              <p style={{ color: '#666' }}>Simple, secure, and magical.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              <StepCard number="1" title="Choose Package & Pay" description="Select the Single or Multi pack and complete our secure checkout first." />
              <StepCard number="2" title="Tell Your Story" description="Fill out a simple form with the recipient's name, your relationship, and key memories." />
              <StepCard number="3" title="We Create" description="Our AI generates your custom song(s). Use your included regenerations to get it perfect." />
              <StepCard number="4" title="Review & Share" description="Select your favorite version and get a unique, magical URL to share with them." />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" style={{ padding: '80px 20px', background: '#fff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '48px' }}>
              <div style={{ fontSize: '14px', color: '#6366f1', fontWeight: '600', marginBottom: '8px' }}>Pricing</div>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold' }}>Give the perfect gift</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <PricingCard
                badge=""
                title="Single Pack"
                subtitle="One special song"
                description="Perfect for a partner, parent, or child."
                price="$79"
                priceUnit="/ gift"
                features={['1 Custom Song', '5 Regenerations included', 'Magical Gift Link', 'Downloadable MP3']}
                buttonText="Buy Single Pack"
                highlighted={false}
              />
              <PricingCard
                badge="Best Value"
                title="Multi Pack"
                subtitle="Five special songs"
                description="Cover the whole family and save."
                price="$299"
                priceUnit="/ 5 gifts"
                savings="Save $96!"
                features={['Up to 5 Custom Songs', '5 Regenerations per song', 'Magical Gift Links', 'Downloadable MP3s', 'Priority Generation']}
                buttonText="Buy Multi Pack"
                highlighted={true}
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" style={{ padding: '80px 20px', background: '#f9fafb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '32px' }}>FAQ</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FAQItem
                question="Do I pay before creating the song?"
                answer="Yes. To start the custom generation process, please select a package and complete payment. You'll then be directed immediately to the form to tell your story."
              />
              <FAQItem
                question="What if I don't like the first version?"
                answer="No problem! The Single Pack comes with 5 regenerations, and the Multi Pack includes 5 regenerations for each of the 5 songs, so you can tweak the style or lyrics until it's perfect."
              />
              <FAQItem
                question="How do I share it?"
                answer="You'll receive a unique link (e.g., huggnote.com/gift/xyz) that opens a beautiful snowy page with your song. You can send this via WhatsApp, Email, or SMS."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ padding: '60px 20px', background: '#000', color: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>
            <span style={{ display: 'inline-block', width: '32px', height: '32px', background: '#6366f1', borderRadius: '8px', textAlign: 'center', lineHeight: '32px', marginRight: '8px' }}>H</span>
            Huggnote2
          </div>

          <nav style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '24px' }}>
            <a href="#how" style={{ color: '#999', textDecoration: 'none' }}>How it works</a>
            <a href="#pricing" style={{ color: '#999', textDecoration: 'none' }}>Pricing</a>
            <a href="#faq" style={{ color: '#999', textDecoration: 'none' }}>FAQ</a>
          </nav>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px', color: '#999' }}>
            <a href="#" style={{ color: '#999', textDecoration: 'none' }}>Instagram</a>
            <a href="#" style={{ color: '#999', textDecoration: 'none' }}>TikTok</a>
            <a href="#" style={{ color: '#999', textDecoration: 'none' }}>YouTube</a>
            <span>•</span>
            <a href="mailto:hello@huggnote.com" style={{ color: '#999', textDecoration: 'none' }}>hello@huggnote.com</a>
          </div>

          <p style={{ color: '#666', fontSize: '14px' }}>© 2025 Huggnote2. Crafted with care for the holidays.</p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </>
  );
}

// Helper Components
function ExamplePlayer({ title, meta }: { title: string; meta: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer', fontSize: '18px' }}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', fontSize: '15px' }}>{title}</div>
        <div style={{ fontSize: '13px', color: '#666' }}>{meta}</div>
      </div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>{number}</div>
      <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{title}</h4>
      <p style={{ color: '#666', fontSize: '14px' }}>{description}</p>
    </div>
  );
}

function PricingCard({ badge, title, subtitle, description, price, priceUnit, savings, features, buttonText, highlighted }: any) {
  return (
    <div style={{
      background: 'white',
      padding: '32px',
      borderRadius: '12px',
      border: highlighted ? '2px solid #6366f1' : '1px solid #e5e5e5',
      position: 'relative'
    }}>
      {badge && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{badge}</div>}

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'inline-block', background: '#f3f4f6', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>{title}</div>
        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{subtitle}</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>{description}</p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '48px', fontWeight: 'bold' }}>{price}</span>
        <span style={{ color: '#666', fontSize: '16px' }}> {priceUnit}</span>
      </div>

      {savings && <p style={{ color: '#10b981', fontWeight: '600', marginBottom: '24px' }}>{savings}</p>}

      <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
        {features.map((feature: string, i: number) => (
          <li key={i} style={{ padding: '8px 0', color: '#666' }}>✓ {feature}</li>
        ))}
      </ul>

      <button style={{ width: '100%', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }}>
        {buttonText}
      </button>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
      <summary style={{ fontWeight: '600', cursor: 'pointer', fontSize: '16px' }}>{question}</summary>
      <p style={{ marginTop: '12px', color: '#666' }}>{answer}</p>
    </details>
  );
}
