# Handmade Claw Shop

A minimalist, responsive storefront concept for handmade crochet items, keychains, and socks. Built with React, TypeScript, Vite, Framer Motion, and Lucide icons.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The claw lowers, closes, carries a plush to the prize exit, and adds it to the bag. The checkout form and payment flow are still to come.

## Arcade controls

- Drag or tap in the machine to aim, or use the arrow buttons, ←/→, or A/D.
- Press **GRAB ITEM**, Space, or Enter to run the claw.
- Click a product in the shop grid to aim at that plush.

## Add products and stock

- Add or edit product records in `src/main.tsx`, in the `products` array. Set its name, category, VND price, image path, and `units` count.
- Put transparent product PNGs in `public/products/` and set the matching `/products/filename.png` path.
- The `stock` generator expands each product into that many individual prizes and lays them out in the machine. Each sample currently has `units: 5`.
- The three claw poses are `public/products/claw-open.png`, `claw-grip.png`, and `claw-closed.png`.
- The machine creates a deterministic scattered pile with varied rotations/scales/depth so positions stay stable between reloads. Adjust the `x`, `bottom`, `tilt`, and `size` calculations in the `stock` generator to tune the pile.
- Claw collision samples each transparent PNG's visible alpha bounds at runtime. Keep product images as transparent PNGs so aiming and contact line up with the visible plush rather than the image canvas.
