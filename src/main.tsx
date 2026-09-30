import React from 'react'
import { createRoot } from 'react-dom/client'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import './style.css'

type Product = { id: string; name: string; type: string; price: number; image: string; units: number }
const products: Product[] = [
  { id: '01', name: 'Cloud Mouse', type: 'CROCHET FRIEND', price: 180000, image: '/products/cloud-mouse.png', units: 5 },
  { id: '02', name: 'Coffee Bear', type: 'CROCHET FRIEND', price: 160000, image: '/products/coffee-bear.png', units: 5 },
  { id: '03', name: 'Star Cat', type: 'CROCHET KEYCHAIN', price: 145000, image: '/products/star-cat.png', units: 5 },
  { id: '04', name: 'Peach Octopus', type: 'CROCHET FRIEND', price: 175000, image: '/products/peach-octopus.png', units: 5 },
  { id: '05', name: 'Avocado Croc', type: 'CROCHET FRIEND', price: 195000, image: '/products/avocado-croc.png', units: 5 },
]
type Prize = Product & { unitId: string; x: number; bottom: number; tilt: number; size: number; row: number }
// Reproducible scatter: every reload keeps the same pile while mixing depth, tilt and scale.
const stock: Prize[] = (() => {
  const units: Prize[] = products.flatMap(product => Array.from({ length: product.units }, (_, unit) => ({ ...product, unitId: `${product.id}-${unit + 1}`, x: 0, bottom: 0, tilt: 0, size: 1, row: 0 })))
  // Interleave the five designs so duplicate stock reads as a mixed plush pile.
  const mixed = Array.from({ length: Math.max(...products.map(p => p.units)) }, (_, row) => products.filter(p => p.units > row).map(p => units.find(u => u.id === p.id && u.unitId === `${p.id}-${row + 1}`)!)).flat()
  const rank = (prize: Prize) => { const unit = Number(prize.unitId.split('-')[1]); const seed = Math.sin(Number(prize.id) * 43.17 + unit * 17.13) * 43758.5453; return seed - Math.floor(seed) }
  const scattered = [...mixed].sort((a, b) => rank(a) - rank(b))
  return scattered.map((prize, index) => {
    const slot = (index * 7 + 11) % 25 // interleave duplicate designs across the whole pit
    const row = Math.floor(slot / 5)
    const col = slot % 5
    const seed = Math.sin((index + 1) * 127.1 + 17.3) * 43758.5453
    const rand = seed - Math.floor(seed)
    const rowSeed = Math.sin((row + 3) * 46.7 + col * 15.1) * 24634.6345
    const rowRand = rowSeed - Math.floor(rowSeed)
    return { ...prize, row, x: Math.max(12, Math.min(72, 12 + col * 14 + (rand - .5) * 8 + (row % 2 ? 2 : -1.5))), bottom: 2 + row * .45 + (rowRand - .5) * 1.2, tilt: (rand - .5) * 32, size: .72 + rowRand * .43 }
  })
})()
const money = (price: number) => `${price.toLocaleString('vi-VN')}₫`

function App() {
  const [clawX, setClawX] = React.useState(50)
  const [clawY, setClawY] = React.useState(8)
  const [selectedUnitId, setSelectedUnitId] = React.useState('03-1')
  const [directTargetId, setDirectTargetId] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [clawPose, setClawPose] = React.useState<'open' | 'grip' | 'closed'>('open')
  const [carrying, setCarrying] = React.useState<Prize | null>(null)
  const [caughtIds, setCaughtIds] = React.useState<string[]>([])
  const [cart, setCart] = React.useState<Record<string, number>>({})
  const [bagOpen, setBagOpen] = React.useState(false)
  const [lastCaught, setLastCaught] = React.useState<Prize | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const stageRef = React.useRef<HTMLDivElement>(null)

  const cartItems = products.filter(p => cart[p.id])
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  const cartTotal = cartItems.reduce((sum, p) => sum + p.price * cart[p.id], 0)
  const remainingCount = stock.length - caughtIds.length
  const selectedPrize = stock.find(prize => prize.unitId === selectedUnitId) ?? stock.find(prize => !caughtIds.includes(prize.unitId)) ?? stock[0]

  const setAim = (x: number) => {
    setClawX(Math.max(8, Math.min(92, x)))
    setDirectTargetId(null)
  }
  const move = (direction: number) => { if (!busy) setAim(clawX + direction * 5) }
  const aimAtProduct = (product: Product) => {
    if (busy) return
    const prize = stock.find(item => item.id === product.id && !caughtIds.includes(item.unitId))
    if (!prize) return
    const bounds = imageBox(prize.unitId)
    const stage = stageRef.current?.getBoundingClientRect()
    setClawX(bounds && stage ? ((bounds.left + bounds.right) / 2 - stage.left) / stage.width * 100 : prize.x)
    setSelectedUnitId(prize.unitId)
    setDirectTargetId(prize.unitId)
    document.getElementById('machine')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  const imageBox = (unitId: string) => {
    const img = stageRef.current?.querySelector<HTMLImageElement>(`[data-unit-id=\"${unitId}\"] img`)
    if (!img) return null
    const rect = img.getBoundingClientRect()
    try {
      if (img.complete && img.naturalWidth) {
        const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx?.drawImage(img, 0, 0)
        const pixels = ctx?.getImageData(0, 0, canvas.width, canvas.height).data
        if (pixels) {
          let minX=canvas.width,minY=canvas.height,maxX=0,maxY=0
          for (let y=0;y<canvas.height;y+=2) for (let x=0;x<canvas.width;x+=2) if (pixels[(y*canvas.width+x)*4+3]>24) { minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y) }
          if (maxX>minX && maxY>minY) return { left:rect.left+minX/canvas.width*rect.width, right:rect.left+(maxX+1)/canvas.width*rect.width, top:rect.top+minY/canvas.height*rect.height, bottom:rect.top+(maxY+1)/canvas.height*rect.height }
        }
      }
    } catch { /* Same-origin product image normally permits alpha sampling. */ }
    return { left:rect.left+rect.width*.2, right:rect.right-rect.width*.2, top:rect.top+rect.height*.12, bottom:rect.bottom-rect.height*.12 }
  }
  const pointToAim = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    setAim(((event.clientX - rect.left) / rect.width) * 100)
  }
  const grab = async () => {
    if (busy) return
    const available = stock.filter(item => !caughtIds.includes(item.unitId))
    const prize = (directTargetId ? available.find(item => item.unitId === directTargetId) : null) ?? available.reduce((nearest, item) => Math.abs(item.x - clawX) < Math.abs(nearest.x - clawX) ? item : nearest, available[0] ?? selectedPrize)
    if (!prize || caughtIds.includes(prize.unitId)) return
    const bounds = imageBox(prize.unitId)
    const stage = stageRef.current?.getBoundingClientRect()
    if (!bounds || !stage) return
    const clawCenter = stage.left + stage.width * clawX / 100
    // Open jaw tips span about 140px on desktop (115px on mobile). Require the
    // visible, non-transparent toy body to overlap at least two prongs.
    const scale = stage.width < 600 ? .82 : 1
    const halfSpan = 70 * scale
    const overlaps = bounds.left < clawCenter + halfSpan && bounds.right > clawCenter - halfSpan
    const centerOffset = Math.abs((bounds.left + bounds.right) / 2 - clawCenter)
    const canGrip = overlaps && centerOffset < halfSpan * .82
    setBusy(true)
    setLastCaught(null)
    setDirectTargetId(null)
    setCarrying(null)
    setClawPose('open')
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    // Descend until the open prongs reach the actual visible top of the plush.
    const rigHeight = stage.width < 600 ? 114 : 144
    const tipOffset = rigHeight * .76
    const contactTop = bounds.top - stage.top - tipOffset
    setClawY(Math.max(20, Math.min(72, contactTop / stage.height * 100)))
    await wait(850)
    setClawPose('grip')
    await wait(260)
    if (!canGrip) {
      // A miss brushes the pile; jaws close, then return empty without changing stock.
      setClawPose('closed')
      await wait(330)
      setClawY(8)
      await wait(640)
      setBusy(false)
      return
    }
    setClawPose('closed')
    await wait(230)
    setCaughtIds(ids => [...ids, prize.unitId])
    setCarrying(prize)
    setClawY(8)
    await wait(760)
    setClawX(92)
    await wait(690)
    setClawY(65)
    await wait(620)
    setCarrying(null)
    setClawPose('open')
    setCart(current => ({ ...current, [prize.id]: (current[prize.id] ?? 0) + 1 }))
    setLastCaught(prize)
    await wait(280)
    setClawY(8)
    await wait(400)
    const nextPrize = stock.find(item => item.unitId !== prize.unitId && !caughtIds.includes(item.unitId))
    if (nextPrize) { setSelectedUnitId(nextPrize.unitId); setClawX(nextPrize.x) }
    setBusy(false)
    setBagOpen(true)
  }

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setBagOpen(false)
      if (bagOpen || busy) return
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') { event.preventDefault(); move(-1) }
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') { event.preventDefault(); move(1) }
      if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); void grab() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  return <main>
    <header className="topbar">
      <a className="wordmark" href="#top">HANDMADE<br/>CLAW SHOP<span className="asterisk">✳</span></a>
      <nav><a href="#machine">THE MACHINE</a><a href="#objects">OBJECTS <span>05</span></a><a href="#about">OUR THING</a></nav>
      <button className="bag" onClick={() => setBagOpen(true)}><ShoppingBag size={15} strokeWidth={1.6}/> BAG <b>{String(cartCount).padStart(2, '0')}</b></button>
    </header>
    <section id="top" className="hero">
      <div className="hero-kicker"><span>SMALL THINGS, MADE SLOWLY</span><span>SAIGON, VIETNAM · EST. 2024</span></div>
      <h1>MADE BY<br/><span>HAND.</span><i>✳</i></h1>
      <div className="hero-bottom"><p>Little handmade things<br/>for your everyday life.</p><a href="#machine" className="round-link">MEET THE CLAW <ArrowDown size={15}/></a></div>
      <div className="hero-stamp">ONE OF<br/>A KIND<br/><span>♥</span></div>
    </section>
    <section id="machine" className="machine-section">
      <div className="section-heading"><span>01 / PLAY A LITTLE</span><span>THE CLAW MACHINE®</span><span>← → TO AIM · SPACE TO GRAB</span></div>
      <div className="machine">
        <div className="machine-top"><span>INSERT COIN<br/>[ YOUR CURIOSITY ]</span><span className="machine-logo">CLAW<br/>ARCADE</span><span>EST. MMXXIV<br/>SAIGON, VN</span></div>
        <div className="rail"><span></span><span></span></div>
        <div ref={stageRef} className={`claw-stage ${dragging ? 'is-dragging' : ''}`} onPointerDown={event => { if (!busy) { setDragging(true); pointToAim(event) } }} onPointerMove={event => { if (dragging && !busy) pointToAim(event) }} onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)}>
          <div className="stage-glass" />
          <div className="stage-status"><span>PRIZE POOL / {remainingCount} LEFT</span><span>{busy ? 'MACHINE IN MOTION' : 'DRAG OR TAP TO AIM'}</span></div>
          {stock.map(prize => <button key={prize.unitId} data-unit-id={prize.unitId} className={`pit-prize ${selectedUnitId === prize.unitId ? 'is-selected' : ''} ${caughtIds.includes(prize.unitId) ? 'is-caught' : ''}`} style={{ left: `${prize.x}%`, bottom: `${prize.bottom}%`, zIndex: Math.max(2, 8 - prize.row), '--tilt': `${prize.tilt}deg`, '--prize-size': prize.size } as React.CSSProperties & { '--tilt': string; '--prize-size': number }} onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); if (!busy && !caughtIds.includes(prize.unitId)) { const bounds=imageBox(prize.unitId); const stage=stageRef.current?.getBoundingClientRect(); setClawX(bounds&&stage ? ((bounds.left+bounds.right)/2-stage.left)/stage.width*100 : prize.x); setSelectedUnitId(prize.unitId); setDirectTargetId(prize.unitId) } }} aria-label={`Aim claw at ${prize.name}`}>
            <img src={prize.image} alt={prize.name}/>
          </button>)}
          <div className="pile-reflection" />
          <div className="payout-wall" aria-hidden="true" />
          <div className="payout-in-stage"><span>PRIZE<br/>EXIT</span><div className="payout-mouth"><i/></div></div>
          <motion.div className="claw-cable" animate={{ left: `${clawX}%`, height: `${Math.max(clawY, 6)}%` }} transition={{ duration: busy ? .7 : .16, ease: busy ? [0.22, 1, 0.36, 1] : 'linear' }} />
          <motion.div className="claw-rig" animate={{ left: `${clawX}%`, top: `${clawY}%` }} transition={{ duration: busy ? .72 : .16, ease: busy ? [0.22, 1, 0.36, 1] : 'linear' }}>
            <AnimatePresence mode="wait" initial={false}><motion.img key={clawPose} className={`claw-sprite pose-${clawPose}`} src={`/products/claw-${clawPose}.png`} alt="" draggable={false} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .12 }}/></AnimatePresence>
            <AnimatePresence>{carrying && <motion.img className="carried-prize" src={carrying.image} alt="Prize in claw" initial={{ opacity: 0, scale: .65, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .25, y: 32 }} transition={{ duration: .28 }}/>}</AnimatePresence>
          </motion.div>
          <AnimatePresence>{lastCaught && !busy && <motion.div className="payout-flash" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Check size={13}/> {lastCaught.name.toUpperCase()} — IN THE BAG</motion.div>}</AnimatePresence>
        </div>
        <div className="machine-base">
          <div className="control-copy"><span>{busy ? 'PRIZE ON ITS WAY TO THE EXIT' : remainingCount ? 'READY WHEN YOU ARE' : 'PRIZE POOL EMPTY'}</span><small>{busy ? 'PICKUP IN PROGRESS' : 'DRAG THE CLAW OR USE ← → / A · D'}</small></div>
          <div className="controls"><button onClick={() => move(-1)} disabled={busy} aria-label="Move left"><ArrowLeft/></button><button className="grab" onClick={() => void grab()} disabled={busy || !remainingCount}>{busy ? 'GRABBING…' : remainingCount ? 'GRAB ITEM' : 'ALL CAUGHT'} {!busy && <ArrowDown size={14}/>}</button><button onClick={() => move(1)} disabled={busy} aria-label="Move right"><ArrowRight/></button></div>
          <div className="coin">✳</div>
        </div>
      </div>
      <p className="machine-caption">Choose a little friend. The claw will carry it to the prize exit, then into your bag.<span>{String(remainingCount).padStart(2, '0')} LEFT</span></p>
    </section>
    <section id="objects" className="objects-section">
      <div className="section-heading"><span>02 / THE GOOD STUFF</span><span>MEET THE PRIZE POOL</span><span>HANDMADE IN SMALL BATCHES</span></div>
      <div className="objects-intro"><h2>SOFT<br/>GOODS<span>✳</span></h2><div><p>Made one stitch at a time.<br/>Kept for a little (or a long) while.</p><span className="filter">ALL OBJECTS <span>05</span>　 ↘</span></div></div>
      <div className="product-grid">{products.map((p, i) => <article className={`product ${!stock.some(prize => prize.id === p.id && !caughtIds.includes(prize.unitId)) ? 'product-caught' : ''}`} key={p.id}>
        <button className={`product-image product-tone-${i}`} onClick={() => aimAtProduct(p)} aria-label={`Aim claw at ${p.name}`}><img src={p.image} loading="lazy" alt={p.name}/><span className="quick-add">AIM CLAW <ArrowUpRight size={14}/></span><span className="product-number">NO. {p.id}</span></button>
        <div className="product-info"><div><span>{p.type}</span><h3>{p.name}</h3></div><b>{money(p.price)}</b></div>
      </article>)}</div>
    </section>
    <footer id="about"><div className="footer-top"><span>SMALL THINGS, BIG FEELINGS.</span><span>HANDMADE WITH LOVE IN SAIGON ↗</span></div><div className="footer-word">HAVE A<br/>SOFT DAY<span>✳</span></div><div className="footer-bottom"><span>© HANDMADE CLAW SHOP 2024</span><span>INSTAGRAM　↗</span><span>MADE SLOW. WORN OFTEN.</span></div></footer>

    <AnimatePresence>{bagOpen && <><motion.button className="drawer-scrim" aria-label="Close bag" onClick={() => setBagOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}/><motion.aside className="cart-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 260 }}>
      <div className="drawer-head"><div><span>PRIZE EXIT / BAG {String(cartCount).padStart(2, '0')}</span><h2>YOUR<br/>LITTLE THINGS.</h2></div><button onClick={() => setBagOpen(false)} aria-label="Close bag"><X/></button></div>
      {lastCaught && <div className="success-note"><span>✳</span><div><b>NICE CATCH.</b><small>{lastCaught.name} made it to the prize exit.</small></div></div>}
      <div className="cart-lines">{cartItems.length ? cartItems.map(p => <div className="cart-line" key={p.id}><div className="cart-thumb"><img src={p.image} alt={p.name}/></div><div className="cart-line-main"><small>{p.type}</small><b>{p.name}</b><span>{money(p.price)}</span><div className="qty"><button aria-label="Decrease quantity" onClick={() => setCart(c => { const next = { ...c }; if (next[p.id] <= 1) delete next[p.id]; else next[p.id]--; return next })}><Minus size={12}/></button><span>{cart[p.id]}</span><button aria-label="Increase quantity" onClick={() => setCart(c => ({ ...c, [p.id]: c[p.id] + 1 }))}><Plus size={12}/></button></div></div></div>) : <div className="empty-bag"><span>✳</span><b>THE EXIT IS EMPTY.</b><small>Pick a friend and send the claw down.</small></div>}</div>
      <div className="drawer-foot"><div><span>SUBTOTAL</span><b>{money(cartTotal)}</b></div><button className="checkout-button" disabled={!cartCount} onClick={() => alert('Checkout flow comes next — your bag is saved in this session.')}>CONTINUE TO CHECKOUT <ArrowUpRight size={15}/></button><small>Payment & delivery details in the next step.</small></div>
    </motion.aside></>}</AnimatePresence>
  </main>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
