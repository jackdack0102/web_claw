import React from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, ShoppingBag } from 'lucide-react'
import './style.css'

const products = [
  { id: '01', name: 'Lemon Drop', type: 'CROCHET KEYCHAIN', price: '120.000₫', image: 'photo-1590736969955-71cc94901144', tone: 'lemon' },
  { id: '02', name: 'Sunday Socks', type: 'HAND-KNIT SOCKS', price: '180.000₫', image: 'photo-1582966772680-860e372bb558', tone: 'sock' },
  { id: '03', name: 'Little Daisy', type: 'CROCHET FLOWER', price: '95.000₫', image: 'photo-1490750967868-88aa4486c946', tone: 'daisy' },
  { id: '04', name: 'Soft Thing No. 02', type: 'MINI CROCHET BAG', price: '290.000₫', image: 'photo-1590874103328-eac38a683ce7', tone: 'bag' },
  { id: '05', name: 'Cherry on Top', type: 'CROCHET KEYCHAIN', price: '120.000₫', image: 'photo-1576566588028-4147f3842f27', tone: 'cherry' },
  { id: '06', name: 'Cloud Nine', type: 'HAND-KNIT SOCKS', price: '180.000₫', image: 'photo-1618354691373-d851c5c3a990', tone: 'cloud' },
]

function App() {
  const [active, setActive] = React.useState(0)
  const [bagOpen, setBagOpen] = React.useState(false)
  const move = (n: number) => setActive((active + n + products.length) % products.length)
  return <main>
    <header className="topbar">
      <a className="wordmark" href="#top">HANDMADE<br/>CLAW SHOP<span className="asterisk">✳</span></a>
      <nav><a href="#machine">THE MACHINE</a><a href="#objects">OBJECTS <span>06</span></a><a href="#about">OUR THING</a></nav>
      <button className="bag" onClick={() => setBagOpen(!bagOpen)}><ShoppingBag size={15} strokeWidth={1.6}/> BAG <b>00</b></button>
    </header>
    <section id="top" className="hero">
      <div className="hero-kicker"><span>SMALL THINGS, MADE SLOWLY</span><span>SAIGON, VIETNAM · EST. 2024</span></div>
      <h1>MADE BY<br/><span>HAND.</span><i>✳</i></h1>
      <div className="hero-bottom"><p>Little handmade things<br/>for your everyday life.</p><a href="#machine" className="round-link">MEET THE CLAW <ArrowDown size={15}/></a></div>
      <div className="hero-stamp">ONE OF<br/>A KIND<br/><span>♥</span></div>
    </section>
    <section id="machine" className="machine-section">
      <div className="section-heading"><span>01 / PLAY A LITTLE</span><span>THE CLAW MACHINE®</span><span>SCROLL TO EXPLORE ↓</span></div>
      <div className="machine">
        <div className="machine-top"><span>INSERT COIN<br/>[ YOUR CURIOSITY ]</span><span className="machine-logo">CLAW<br/>ARCADE</span><span>EST. MMXXIV<br/>SAIGON, VN</span></div>
        <div className="rail"><span></span><span></span></div>
        <div className="claw-stage">
          <div className="wire"></div><div className="claw"><div className="claw-head"></div><div className="claw-arm left"></div><div className="claw-arm right"></div></div>
          <div className="prize-pile">{products.slice(0, 4).map((p, i) => <div key={p.id} className={`prize prize-${i}`}><img src={`https://images.unsplash.com/${p.image}?auto=format&fit=crop&w=300&q=80`} /></div>)}</div>
          <div className="machine-glass-label">HANDMADE<br/>GOOD STUFF</div>
        </div>
        <div className="machine-base"><div className="control-copy"><span>READY PLAYER ONE?</span><small>USE THE ARROWS TO MOVE THE CLAW</small></div><div className="controls"><button onClick={() => move(-1)} aria-label="Move left"><ArrowLeft/></button><button className="grab" onClick={() => setBagOpen(true)}>GRAB ITEM <ArrowDown size={14}/></button><button onClick={() => move(1)} aria-label="Move right"><ArrowRight/></button></div><div className="coin">✳</div></div>
      </div>
      <p className="machine-caption">A little game, a lot of love. Pick a prize and make it yours.<span>01 — 06</span></p>
    </section>
    <section id="objects" className="objects-section">
      <div className="section-heading"><span>02 / THE GOOD STUFF</span><span>OBJECTS WITH FEELING</span><span>HANDMADE IN SMALL BATCHES</span></div>
      <div className="objects-intro"><h2>SOFT<br/>GOODS<span>✳</span></h2><div><p>Made one stitch at a time.<br/>Kept for a little (or a long) while.</p><span className="filter">ALL OBJECTS <span>06</span>　 ↘</span></div></div>
      <div className="product-grid">{products.map((p, i) => <article className="product" key={p.id} onMouseEnter={() => setActive(i)}>
        <button className={`product-image ${p.tone}`} onClick={() => setBagOpen(true)} aria-label={`Add ${p.name}`}><img src={`https://images.unsplash.com/${p.image}?auto=format&fit=crop&w=900&q=85`} loading="lazy"/><span className="quick-add">QUICK ADD <ArrowUpRight size={14}/></span><span className="product-number">NO. {p.id}</span></button>
        <div className="product-info"><div><span>{p.type}</span><h3>{p.name}</h3></div><b>{p.price}</b></div>
      </article>)}</div>
    </section>
    <footer id="about"><div className="footer-top"><span>SMALL THINGS, BIG FEELINGS.</span><span>HANDMADE WITH LOVE IN SAIGON ↗</span></div><div className="footer-word">HAVE A<br/>SOFT DAY<span>✳</span></div><div className="footer-bottom"><span>© HANDMADE CLAW SHOP 2024</span><span>INSTAGRAM　↗</span><span>MADE SLOW. WORN OFTEN.</span></div></footer>
    {bagOpen && <div className="toast" onClick={() => setBagOpen(false)}><span>✳</span><div><b>GOOD CHOICE.</b><small>Your little something is waiting.</small></div><button>×</button></div>}
  </main>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
