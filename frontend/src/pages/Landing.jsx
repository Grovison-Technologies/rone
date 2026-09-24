import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Lightfall from '../components/Lightfall';

const Landing = () => {
  const navigate = useNavigate();
  const [packs, setPacks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packsRes, leadersRes] = await Promise.all([
          axios.get('/api/xppacks'),
          axios.get('/api/customers/leaderboard')
        ]);
        setPacks(packsRes.data);
        setLeaderboard(leadersRes.data);
      } catch (error) {
        console.error('Error fetching landing data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-navbar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="R.ONE" style={{ height: '30px', marginRight: '1rem' }} />
          <span style={{ fontWeight: 800, fontSize: '1.5rem', color: '#fff', fontStyle: 'italic' }}>R.ONE</span>
        </div>
        <div className="nav-links">
          <a href="#about" className="nav-link">About</a>
          <a href="#games" className="nav-link">Games</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>
        <div>
          <button className="btn" onClick={() => navigate('/customer-login')} style={{ backgroundColor: 'rgba(0,168,255,0.1)', color: '#00A8FF', border: '1px solid #00A8FF' }}>
            PLAYER LOGIN
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="landing-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <Lightfall
            colors={['#FF003C', '#00A8FF', '#1A1A2E']}
            backgroundColor="#050510"
            speed={0.5}
            streakCount={4}
            streakWidth={2}
            streakLength={1.5}
            glow={1}
            density={0.6}
            twinkle={1.5}
            zoom={2.5}
            backgroundGlow={0.5}
            opacity={1}
            mouseInteraction
            mouseStrength={0.7}
            mouseRadius={1.5}
          />
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div className="landing-logo animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>R.ONE</div>
          <div className="landing-tagline animate-fade-in" style={{ animationDelay: '0.4s', opacity: 0, textShadow: '0 5px 15px rgba(0,0,0,0.8)' }}>
            PLAY <span style={{ color: '#FF003C' }}>▶</span> CONNECT <span style={{ color: '#FF003C' }}>▶</span> LEVEL UP
          </div>
          <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', animationDelay: '0.6s', opacity: 0 }}>
            <button className="glow-btn" onClick={() => navigate('/customer-login')} style={{ padding: '1.25rem 3.5rem', fontSize: '1.25rem' }}>
              PLAYER PORTAL
            </button>
            <a href="#games" className="glow-btn glow-btn-red" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', padding: '1.25rem 3.5rem', fontSize: '1.25rem' }}>
              EXPLORE GAMES
            </a>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section id="leaderboard" className="landing-section" style={{ padding: '8rem 2rem', backgroundColor: '#020202' }}>
        <h2 className="section-title">TOP <span style={{ color: '#FF003C' }}>PLAYERS</span></h2>
        <p style={{ textAlign: 'center', color: '#8B949E', fontSize: '1.25rem', marginBottom: '4rem', maxWidth: '800px', margin: '0 auto' }}>
          The legends of R.ONE. Who has burned the most XP?
        </p>

        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#0D1117', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,0,60,0.2)' }}>
          {leaderboard.length > 0 ? leaderboard.map((player, index) => (
            <div key={player.rOneId} className="leaderboard-row" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem 2rem',
              borderBottom: index < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              backgroundColor: index === 0 ? 'rgba(210,153,34,0.1)' : index === 1 ? 'rgba(192,192,192,0.1)' : index === 2 ? 'rgba(205,127,50,0.1)' : 'transparent'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="rank-text" style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: index === 0 ? '#D29922' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#8B949E',
                  width: '30px'
                }}>#{player.rank}</div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#fff' }}>{player.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#8B949E' }}>{player.rOneId}</div>
                </div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#00A8FF' }}>
                {Math.round(player.xpBurned)} <span style={{ fontSize: '1rem', color: '#8B949E', fontWeight: 'normal' }}>XP</span>
              </div>
            </div>
          )) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#8B949E' }}>No leaderboard data available yet.</div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="landing-section" style={{ backgroundColor: '#05070A' }}>
        <h2 className="section-title">THE ULTIMATE <span style={{ color: '#00A8FF' }}>EXPERIENCE</span></h2>
        <div className="about-text">
          <p style={{ marginBottom: '1.5rem' }}>Welcome to R.ONE Gaming Zone, the premier destination for immersive, high-end console gaming.</p>
          <p style={{ marginBottom: '1.5rem' }}>Equipped with the latest Next-Gen PlayStation 5 and PlayStation 4 consoles, ultra-high-definition displays, and a heart-pounding sound environment. Whether you are a solo adventurer diving into God of War or bringing your squad for intense multiplayer FIFA and Call of Duty matches, we have exactly what you need.</p>
          <p>Elevate your game. Connect with friends. Level up your life.</p>
        </div>
      </section>

      {/* XP System Section */}
      <section id="xp-system" className="landing-section" style={{ padding: '8rem 2rem', backgroundColor: '#020202' }}>
        <h2 className="section-title">THE <span style={{ color: '#00A8FF' }}>XP SYSTEM</span></h2>
        <p style={{ textAlign: 'center', color: '#8B949E', fontSize: '1.25rem', marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem' }}>
          Say goodbye to complex hourly calculations and interruptions. R.ONE uses a seamless XP wallet system.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="xp-step-card">
            <div className="xp-icon">💳</div>
            <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.5rem' }}>1. TOP UP</h3>
            <p style={{ color: '#8B949E', lineHeight: '1.6' }}>Load your account with XP at the front desk. 1 XP equals ₹1.</p>
          </div>
          <div className="xp-step-card">
            <div className="xp-icon">🎮</div>
            <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.5rem' }}>2. PLAY ANYWHERE</h3>
            <p style={{ color: '#8B949E', lineHeight: '1.6' }}>Sit down at any available PS4 or PS5 station and start your session instantly.</p>
          </div>
          <div className="xp-step-card">
            <div className="xp-icon">⏱️</div>
            <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.5rem' }}>3. AUTO-DEBIT</h3>
            <p style={{ color: '#8B949E', lineHeight: '1.6' }}>XP automatically deducts as you play. Pause your session anytime to save your balance.</p>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" style={{ padding: '8rem 0', backgroundColor: '#020202', position: 'relative', overflow: 'hidden' }}>
        {/* Floating Background Elements */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', opacity: 0.1, fontSize: '4rem', color: '#00A8FF', animation: 'float 6s ease-in-out infinite' }}>✕</div>
        <div style={{ position: 'absolute', top: '25%', right: '10%', opacity: 0.1, fontSize: '3rem', color: '#FF003C', animation: 'float 8s ease-in-out infinite reverse' }}>○</div>
        <div style={{ position: 'absolute', bottom: '20%', left: '15%', opacity: 0.1, fontSize: '5rem', color: '#D29922', animation: 'float 7s ease-in-out infinite' }}>△</div>
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', opacity: 0.1, fontSize: '3.5rem', color: '#00A8FF', animation: 'float 5s ease-in-out infinite reverse' }}>□</div>

        <h2 className="section-title">OUR GAMES</h2>

        <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '6rem', padding: '0 2rem', display: 'flex', gap: '4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 400px' }}>
            <h3 style={{ fontSize: '3rem', color: '#00A8FF', marginBottom: '1rem', fontStyle: 'italic', letterSpacing: '-1px' }}>PS5 <span style={{ color: '#fff', fontSize: '1.25rem', fontStyle: 'normal', letterSpacing: '4px', display: 'block', marginTop: '0.5rem' }}>NEXT GEN GAMING</span></h3>
            <p style={{ color: '#8B949E', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>Experience lightning-fast loading and breathtaking immersion with our premium PS5 titles. Play solo or bring your squad.</p>
            <img src="/ps5_games_art.png" alt="PS5 Experience" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0, 168, 255, 0.15)', border: '1px solid rgba(0, 168, 255, 0.3)' }} />
          </div>
          <div className="games-grid" style={{ flex: '2 1 600px', margin: 0 }}>
            <div className="game-card">
              <div className="game-img">🏀</div>
              <h4 style={{ color: '#fff' }}>NBA 2K14</h4>
            </div>
            <div className="game-card">
              <div className="game-img">⚽️</div>
              <h4 style={{ color: '#fff' }}>FIFA 19</h4>
            </div>
            <div className="game-card">
              <div className="game-img">🚗</div>
              <h4 style={{ color: '#fff' }}>GTA V</h4>
            </div>
            <div className="game-card">
              <div className="game-img">🏏</div>
              <h4 style={{ color: '#fff' }}>DON BRADMAN</h4>
            </div>
            <div className="game-card">
              <div className="game-img">🥷</div>
              <h4 style={{ color: '#fff' }}>MORTAL KOMBAT</h4>
            </div>
            <div className="game-card">
              <div className="game-img">🪓</div>
              <h4 style={{ color: '#fff' }}>GOD OF WAR</h4>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', gap: '4rem', flexWrap: 'wrap-reverse', alignItems: 'center' }}>
          <div className="games-grid" style={{ flex: '2 1 600px', margin: 0 }}>
            <div className="game-card" style={{ borderColor: 'rgba(255,0,60,0.3)' }}>
              <div className="game-img">🤼‍♂️</div>
              <h4 style={{ color: '#fff' }}>WWE 2K20</h4>
            </div>
            <div className="game-card" style={{ borderColor: 'rgba(255,0,60,0.3)' }}>
              <div className="game-img">🏹</div>
              <h4 style={{ color: '#fff' }}>HORIZON</h4>
            </div>
            <div className="game-card" style={{ borderColor: 'rgba(255,0,60,0.3)' }}>
              <div className="game-img">🕷️</div>
              <h4 style={{ color: '#fff' }}>SPIDER-MAN</h4>
            </div>
            <div className="game-card" style={{ borderColor: 'rgba(255,0,60,0.3)' }}>
              <div className="game-img">🏎️</div>
              <h4 style={{ color: '#fff' }}>NFS HEAT</h4>
            </div>
            <div className="game-card" style={{ borderColor: 'rgba(255,0,60,0.3)' }}>
              <div className="game-img">🤠</div>
              <h4 style={{ color: '#fff' }}>RDR2</h4>
            </div>
            <div className="game-card" style={{ borderColor: 'rgba(255,0,60,0.3)' }}>
              <div className="game-img">⚔️</div>
              <h4 style={{ color: '#fff' }}>GHOST OF TSUSHIMA</h4>
            </div>
          </div>
          <div style={{ flex: '1 1 400px' }}>
            <h3 style={{ fontSize: '3rem', color: '#FF003C', marginBottom: '1rem', fontStyle: 'italic', letterSpacing: '-1px' }}>PS4 <span style={{ color: '#fff', fontSize: '1.25rem', fontStyle: 'normal', letterSpacing: '4px', display: 'block', marginTop: '0.5rem' }}>GREAT GAMES</span></h3>
            <p style={{ color: '#8B949E', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>Dive into legendary classics and fan-favorites on our perfectly tuned PlayStation 4 setups. Epic adventures await.</p>
            <img src="/ps4_games_art.png" alt="PS4 Experience" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 50px rgba(255, 0, 60, 0.15)', border: '1px solid rgba(255, 0, 60, 0.3)' }} />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '6rem' }}>
          <p style={{ letterSpacing: '4px', fontSize: '1.25rem', color: '#8B949E' }}>YOUR FAVOURITE GAMES.</p>
          <p style={{ letterSpacing: '4px', fontSize: '2rem', color: '#00A8FF', fontWeight: 'bold' }}>ALL IN ONE PLACE.</p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="landing-section" style={{ backgroundColor: '#05070A', padding: '8rem 2rem' }}>
        <h2 className="section-title">PRICE LIST</h2>

        <div className="price-container">
          <div className="price-card ps5">
            <h3 style={{ color: '#00A8FF' }}>PS5</h3>
            <p style={{ textAlign: 'center', color: '#fff', marginBottom: '2rem', letterSpacing: '2px' }}>NEXT GEN GAMING<br />BIGGER THRILLS</p>

            <div className="price-row">
              <div className="price-label">1 HOUR</div>
              <div className="price-value">₹ 200</div>
            </div>
            <div className="price-row">
              <div className="price-label">30 MIN (HALF)</div>
              <div className="price-value">₹ 130</div>
            </div>
            <div className="price-row">
              <div className="price-label">FULL DAY (6 HRS)</div>
              <div className="price-value">₹ 1,000</div>
            </div>

            <h4 style={{ color: '#00A8FF', marginTop: '3rem', marginBottom: '1rem', textAlign: 'center' }}>MULTIPLAYER OPTIONS</h4>
            <div className="price-row">
              <div>
                <div className="price-label">2 PLAYERS</div>
                <div style={{ fontSize: '0.75rem', color: '#8B949E' }}>(SPLIT SCREEN / ONLINE)</div>
              </div>
              <div className="price-value">₹ 350 / HR</div>
            </div>
            <div className="price-row">
              <div className="price-label">3 PLAYERS</div>
              <div className="price-value">₹ 500 / HR</div>
            </div>
            <div className="price-row">
              <div className="price-label">4 PLAYERS</div>
              <div className="price-value">₹ 650 / HR</div>
            </div>
          </div>

          <div className="price-card ps4">
            <h3 style={{ color: '#FF003C' }}>PS4</h3>
            <p style={{ textAlign: 'center', color: '#fff', marginBottom: '2rem', letterSpacing: '2px' }}>GREAT GAMES<br />GREAT TIMES</p>

            <div className="price-row">
              <div className="price-label">1 HOUR</div>
              <div className="price-value">₹ 170</div>
            </div>
            <div className="price-row">
              <div className="price-label">30 MIN (HALF)</div>
              <div className="price-value">₹ 100</div>
            </div>
            <div className="price-row">
              <div className="price-label">FULL DAY (6 HRS)</div>
              <div className="price-value">₹ 850</div>
            </div>

            <h4 style={{ color: '#FF003C', marginTop: '3rem', marginBottom: '1rem', textAlign: 'center' }}>MULTIPLAYER OPTIONS</h4>
            <div className="price-row">
              <div>
                <div className="price-label">2 PLAYERS</div>
                <div style={{ fontSize: '0.75rem', color: '#8B949E' }}>(SPLIT SCREEN / ONLINE)</div>
              </div>
              <div className="price-value">₹ 300 / HR</div>
            </div>
            <div className="price-row">
              <div className="price-label">3 PLAYERS</div>
              <div className="price-value">₹ 450 / HR</div>
            </div>
            <div className="price-row">
              <div className="price-label">4 PLAYERS</div>
              <div className="price-value">₹ 550 / HR</div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Plans Section */}
      <section id="plans" className="landing-section" style={{ padding: '8rem 2rem', backgroundColor: '#05070A', perspective: '1200px' }}>
        <h2 className="section-title">XP <span style={{ color: '#D29922' }}>PACKAGES</span></h2>
        <p style={{ textAlign: 'center', color: '#8B949E', fontSize: '1.25rem', marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem' }}>
          Level up your R.ONE experience with our premium XP packages. Get bonus XP on every recharge.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', maxWidth: '1200px', margin: '0 auto', justifyContent: 'center' }}>

          {packs.map((pack) => (
            <div key={pack._id} className={`plan-card ${pack.isPopular ? 'premium' : ''}`}>
              {pack.isPopular && (
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', background: '#D29922', color: '#000', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.875rem', letterSpacing: '1px' }}>MOST POPULAR</div>
              )}
              <h3 className="plan-title" style={{ color: pack.isPopular ? '#D29922' : '#C0C0C0' }}>{pack.name.toUpperCase()}</h3>
              <div className="plan-price" style={{ color: '#fff' }}>₹ {pack.price}</div>
              <div style={{ marginBottom: '2rem' }}>
                <div className="plan-perk">Base XP: {pack.baseXP}</div>
                {pack.bonusXP > 0 && <div className="plan-perk" style={{ color: '#00A8FF' }}>Bonus XP: +{pack.bonusXP}</div>}
                <div className="plan-perk" style={{ fontWeight: 'bold' }}>Total XP: {pack.baseXP + pack.bonusXP}</div>
              </div>
              <button className="glow-btn" style={{ width: '100%', padding: '0.75rem', borderColor: pack.isPopular ? '#D29922' : '#C0C0C0', color: pack.isPopular ? '#D29922' : '#C0C0C0', background: pack.isPopular ? 'rgba(210,153,34,0.1)' : 'transparent' }}>BUY AT COUNTER</button>
            </div>
          ))}

        </div>
      </section>



      {/* Footer / Contact */}
      <footer id="contact" style={{ padding: '5rem 2rem 3rem', backgroundColor: '#020202', borderTop: '1px solid rgba(0, 168, 255, 0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
          <div>
            <div className="landing-logo" style={{ fontSize: '3rem', textAlign: 'left', marginBottom: '1rem' }}>R.ONE</div>
            <p style={{ color: '#8B949E', lineHeight: '1.6' }}>The ultimate destination for next-gen console gaming. Play, Connect, and Level Up.</p>
          </div>
          <div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#fff' }}>LOCATION</h4>
            <p style={{ color: '#8B949E', marginBottom: '0.5rem' }}>123 Gaming Boulevard</p>
            <p style={{ color: '#8B949E', marginBottom: '0.5rem' }}>Tech District</p>
            <p style={{ color: '#8B949E' }}>New City, NC 10001</p>
          </div>
          <div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#fff' }}>CONTACT US</h4>
            <p style={{ color: '#00A8FF', marginBottom: '0.5rem', fontWeight: 'bold' }}>📞 +91 12345 67890</p>
            <p style={{ color: '#00A8FF', marginBottom: '0.5rem' }}>✉️ hello@ronegaming.com</p>
            <p style={{ color: '#8B949E', marginTop: '1rem' }}>Open Daily: 10:00 AM - Midnight</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.875rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          &copy; {new Date().getFullYear()} R.ONE Gaming Zone. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
