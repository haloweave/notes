'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthModal } from '@/components/auth/AuthModal';
import { PremiumButton } from '@/components/ui/premium-button';
import { Heart, Gift, Sparkles, Play, Menu, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'] });

export default function LandingPage() {
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const testimonials = [
    {
      name: "Lorraine",
      location: "Ireland",
      text: "What better way of making someone's day, then a beautiful Huggnote. I've made so many people smile just by sending a Huggnote. Big fan of Huggnote.",
      rating: 5
    },
    {
      name: "Alson",
      location: "Ireland",
      text: "Absolutely Beautiful, Love this",
      rating: 5
    },
    {
      name: "Yvonne",
      location: "Ireland",
      text: "I am hooked, love it! Sent lots of huggnotes in the last 24 hours!",
      rating: 5
    }
  ];

  const sampleSongs = [
    {
      title: "A Christmas Love Song",
      recipient: "For Sarah",
      description: "A romantic ballad celebrating 10 years together",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
      title: "Mum's Christmas Wish",
      recipient: "For Mom",
      description: "A heartfelt tribute to an amazing mother",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
      title: "Best Friend Forever",
      recipient: "For Emma",
      description: "Celebrating a lifelong friendship",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    }
  ];

  const faqs = [
    {
      question: "How long does it take to create my bespoke song?",
      answer: "Your personalized song is typically ready within minutes! Our AI technology works quickly to craft a unique musical experience based on your inputs."
    },
    {
      question: "Can I request changes to the song?",
      answer: "Yes! We offer variations during the creation process so you can choose the version that resonates most with you."
    },
    {
      question: "What information do you need to create the song?",
      answer: "We'll ask you about the recipient, the occasion, their personality, and your preferred musical style. The more details you provide, the more personalized your song will be!"
    },
    {
      question: "How will the song be delivered?",
      answer: "Your song will be delivered through a beautiful, shareable link with an immersive experience that includes falling snow, your custom message, and the ability to play the song."
    },
    {
      question: "What genres and styles are available?",
      answer: "We offer a wide range of styles including pop, ballad, upbeat, acoustic, and more. You can choose the vibe that best fits your recipient's taste!"
    },
    {
      question: "Is my data secure and private?",
      answer: "Absolutely! We take privacy seriously and are fully GDPR compliant. Your data is encrypted and never shared with third parties."
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="min-h-screen relative flex flex-col" style={{
        backgroundImage: 'url("/web background image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed'
      }}>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a3f]/50 via-[#0f1e30]/45 to-[#1a2a3f]/50"></div>

        {/* Snowfall Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDuration: `${8 + Math.random() * 7}s`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.2,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                backgroundColor: 'white',
                borderRadius: '50%',
                boxShadow: '0 0 3px rgba(255, 255, 255, 0.8)'
              }}
            />
          ))}
        </div>



        {/* Main Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Hero Section */}
          <div className="flex-1 flex items-center justify-center px-4" id="home">
            <div className="text-center max-w-3xl -mt-20 md:-mt-8" style={{ opacity: 1, transform: 'none' }}>
              <img src="/huggnote bespoke logo.png" alt="Huggnote" className="h-40 md:h-48 lg:h-56 w-auto mx-auto mb-8 md:mb-10" />

              <h1 className="text-[#E8DCC0] text-3xl md:text-4xl lg:text-5xl text-center mb-12 md:mb-14 lg:mb-16" style={{ fontFamily: 'Lora, serif' }}>
                The Gift They'll<br className="md:hidden" /> Never Forget
              </h1>

              <div className="mt-0" style={{ opacity: 1, transform: 'none' }}>
                <button onClick={() => router.push('/compose/select-package')} data-slot="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 h-10 has-[>svg]:px-4 bg-gradient-to-br from-[#F5E6B8] to-[#E8D89F] hover:from-[#F8F0DC] hover:to-[#E8DCC0] text-[#1a3d5f] shadow-[0_8px_30px_rgba(135,206,235,0.5),0_0_40px_rgba(135,206,235,0.3)] hover:shadow-[0_12px_40px_rgba(135,206,235,0.7),0_0_60px_rgba(135,206,235,0.5)] active:shadow-[0_12px_40px_rgba(26,61,95,0.8),0_0_60px_rgba(26,61,95,0.6)] px-8 md:px-12 py-4 md:py-6 text-lg md:text-2xl rounded-xl transform hover:scale-105 transition-all duration-200" style={{ fontFamily: 'Lora, serif' }}>Create Your Bespoke Song</button>

                <p className="text-[#87CEEB] text-base md:text-lg lg:text-xl mt-6 italic" style={{ fontFamily: 'Lora, serif' }}>
                  Bespoke Songs, Giftwrapped in Emotion
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative z-10 bg-gradient-to-b from-[#0f1e30]/30 to-[#1a2a3f]/40 -mt-48 md:mt-0 pt-16 pb-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <p className="text-slate-100 leading-relaxed text-center mb-8 md:mb-20 lg:mb-24">
                <span className="text-xl md:text-2xl lg:text-3xl block text-[#E8DCC0]">
                  The most magical gift they'll get this holiday!
                </span>
              </p>

              {/* Feature Icons */}
              <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-md md:max-w-3xl mx-auto mb-12 md:mb-20 lg:mb-24 md:mt-10 lg:mt-12">
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center mb-2 md:mb-3 mx-auto">
                    <Heart className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-[#A8D8F0]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[#E8DCC0] mb-1 md:mb-2 text-sm md:text-base lg:text-lg">Personalised</h3>
                  <p className="hidden md:block text-white/80 italic text-xs lg:text-sm">Crafted uniquely for them</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center mb-2 md:mb-3 mx-auto">
                    <Gift className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-[#A8D8F0]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[#E8DCC0] mb-1 md:mb-2 text-sm md:text-base lg:text-lg">Thoughtful</h3>
                  <p className="hidden md:block text-white/80 italic text-xs lg:text-sm">A gift from the heart</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center mb-2 md:mb-3 mx-auto">
                    <Sparkles className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-[#A8D8F0]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[#E8DCC0] mb-1 md:mb-2 text-sm md:text-base lg:text-lg">Magical</h3>
                  <p className="hidden md:block text-white/80 italic text-xs lg:text-sm">An unforgettable moment</p>
                </div>
              </div>

              <p className="text-slate-100 leading-relaxed text-center px-6 md:px-0 mb-10 md:mb-16 lg:mb-20">
                <span className="text-base md:text-lg lg:text-xl block mb-2">
                  The perfect gift for those you love most. Their own Christmas song - giftwrapped in emotion.
                </span>
                <span className="text-base md:text-lg lg:text-xl block">
                  Ready in minutes and delivered in a magical festive experience.
                </span>
              </p>

              <div className="text-center">
                <button
                  onClick={() => router.push('/compose/select-package')}
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium px-8 md:px-12 py-4 md:py-6 text-lg md:text-2xl rounded-xl bg-gradient-to-br from-[#F5E6B8] to-[#E8D89F] hover:from-[#F8F0DC] hover:to-[#E8DCC0] text-[#1a3d5f] shadow-[0_8px_30px_rgba(135,206,235,0.5),0_0_40px_rgba(135,206,235,0.3)] hover:shadow-[0_12px_40px_rgba(135,206,235,0.7),0_0_60px_rgba(135,206,235,0.5)] transform hover:scale-105 transition-all duration-200 ${lora.className}`}
                >
                  Create Your Bespoke Song
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Songs Section */}
        <div className="relative z-10 bg-gradient-to-b from-[#0f1e30]/30 to-[#1a2a3f]/40 py-16 md:py-24" id="samples">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-6xl mx-auto">
              <h2 className={`text-[#E8DCC0] text-3xl md:text-4xl lg:text-5xl mb-6 md:mb-8 ${lora.className}`}>
                Listen to Sample Songs
              </h2>
              <p className="text-white/80 text-base md:text-lg mb-12 md:mb-16 max-w-2xl mx-auto">
                Hear the magic of personalised bespoke songs created for real customers
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {sampleSongs.map((song, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all duration-200"
                  >
                    <h3 className={`text-[#E8DCC0] text-xl mb-2 font-semibold ${lora.className}`}>
                      {song.title}
                    </h3>
                    <p className="text-[#87CEEB] text-sm mb-1">{song.recipient}</p>
                    <p className="text-white/70 text-sm mb-4 leading-relaxed">{song.description}</p>
                    <button className="w-full bg-gradient-to-br from-[#87CEEB] to-[#1a3d5f] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 font-semibold">
                      <Play className="w-5 h-5" />
                      Play Sample
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="relative z-10 py-16 md:py-24" id="testimonials">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-6xl mx-auto">
              <h2 className={`text-[#E8DCC0] text-3xl md:text-4xl lg:text-5xl mb-6 md:mb-8 ${lora.className}`}>
                What Our Customers Say
              </h2>
              <p className="text-white/80 text-base md:text-lg mb-12 md:mb-16 max-w-2xl mx-auto">
                Real stories from people who've gifted the unforgettable
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20"
                  >
                    <div className="mb-6">
                      <div className="flex gap-1 mb-4 justify-center">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-[#F5E6B8] text-xl">★</span>
                        ))}
                      </div>
                      <p className="text-white/90 italic leading-relaxed mb-4">
                        "{testimonial.text}"
                      </p>
                    </div>
                    <div className="border-t border-white/20 pt-4">
                      <p className="text-[#E8DCC0] font-semibold">{testimonial.name}</p>
                      <p className="text-white/60 text-sm">{testimonial.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="relative z-10 bg-gradient-to-b from-[#0f1e30]/30 to-[#1a2a3f]/40 py-16 md:py-24" id="faq">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className={`text-[#E8DCC0] text-3xl md:text-4xl lg:text-5xl mb-6 md:mb-8 ${lora.className}`}>
                Frequently Asked Questions
              </h2>
              <p className="text-white/80 text-base md:text-lg mb-12 md:mb-16">
                Everything you need to know about Huggnote Bespoke
              </p>

              <div className="space-y-4 text-left">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-all duration-200"
                    >
                      <span className="text-[#E8DCC0] text-lg pr-4 font-semibold">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-6 h-6 text-[#87CEEB] flex-shrink-0 transition-transform duration-200 ${expandedFaq === index ? 'rotate-180' : ''
                          }`}
                      />
                    </button>
                    {expandedFaq === index && (
                      <div className="px-6 pb-5">
                        <p className="text-white/80 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="relative z-10 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 md:p-12 border border-white/20">
                <h2 className={`text-[#E8DCC0] text-2xl md:text-3xl mb-6 font-semibold ${lora.className}`}>
                  Privacy & GDPR Compliance
                </h2>

                <div className="space-y-6 text-white/80 leading-relaxed">
                  <p>
                    At Huggnote, we take your privacy seriously. We are fully compliant with the General Data Protection Regulation (GDPR) and are committed to protecting your personal information.
                  </p>

                  <div>
                    <h3 className="text-[#E8DCC0] text-lg mb-3 font-semibold">What Data We Collect</h3>
                    <p>
                      We collect only the information necessary to create your bespoke song and deliver it to you. This includes your name, email address, payment information, and the details you provide about the song recipient.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[#E8DCC0] text-lg mb-3 font-semibold">How We Use Your Data</h3>
                    <p>
                      Your personal information is used solely to create and deliver your personalised song. We never sell, rent, or share your data with third parties for marketing purposes. All data is encrypted and stored securely on EU-based servers.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[#E8DCC0] text-lg mb-3 font-semibold">Your Rights</h3>
                    <p>
                      Under GDPR, you have the right to access, correct, or delete your personal data at any time. You can also request a copy of all data we hold about you. To exercise these rights, please contact us at{' '}
                      <a href="mailto:privacy@huggnote.com" className="text-[#87CEEB] hover:text-[#F5E6B8] underline">
                        privacy@huggnote.com
                      </a>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[#E8DCC0] text-lg mb-3 font-semibold">Data Retention</h3>
                    <p>
                      We retain your personal information only for as long as necessary to provide our services and comply with legal obligations. You can request deletion of your data at any time.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/20">
                    <p className="text-sm text-white/60">
                      Last updated: December 2024 | For our full privacy policy, please contact{' '}
                      <a href="mailto:privacy@huggnote.com" className="text-[#87CEEB] hover:text-[#F5E6B8] underline">
                        privacy@huggnote.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="relative z-10 pb-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <button
                onClick={() => router.push('/compose/select-package')}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium px-8 md:px-12 py-4 md:py-6 text-lg md:text-2xl rounded-xl bg-gradient-to-br from-[#F5E6B8] to-[#E8D89F] hover:from-[#F8F0DC] hover:to-[#E8DCC0] text-[#1a3d5f] shadow-[0_8px_30px_rgba(135,206,235,0.5),0_0_40px_rgba(135,206,235,0.3)] hover:shadow-[0_12px_40px_rgba(135,206,235,0.7),0_0_60px_rgba(135,206,235,0.5)] transform hover:scale-105 transition-all duration-200 ${lora.className}`}
              >
                Create Your Bespoke Song
              </button>
            </div>
          </div>
        </div>


        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

        {/* Snowfall Animation CSS */}
        <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0.3;
          }
        }

        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
      </div>
    </div>
  );
}
