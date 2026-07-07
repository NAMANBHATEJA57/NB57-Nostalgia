# Redesign NB57's Nostalgia Archive

Redesign the website into a premium, minimal digital archive for vintage collectibles from the 90s and 2000s, drawing inspiration from Apple, Notion, and minimal museum websites, while strictly avoiding a generic e-commerce feel. 

## User Review Required

> [!IMPORTANT]
> Please review this implementation plan. Once you approve, I will begin executing the changes step by step. If you have any specific preferences for the "floating collage" images in the hero section or specific items you'd like to highlight in "Featured Collectibles", let me know!

## Proposed Changes

---

### Navbar, Layout, and Footer
#### [MODIFY] `src/components/layout/Navbar.tsx`
- Make navbar sticky with a subtle backdrop blur on scroll.
- Add links: Logo, Collections, Categories, About.
- Add Search icon to trigger a floating search (`Ctrl+K`).
- Add hidden Admin link (visible only when logged in).

#### [NEW] `src/components/layout/Footer.tsx`
- Create a structured premium footer replacing the plain one.
- Sections: Archive (Collections, Categories), About, Contact (Instagram, WhatsApp).

#### [NEW] `src/components/ui/FloatingSearch.tsx`
- Implement a `Ctrl+K` command palette using `shadcn/ui` `Command` dialog.
- Allow searching across collections, items, characters, brands, conditions, and years.

---

### Homepage Rebuild
#### [MODIFY] `src/app/page.tsx`
- **Hero Section**: Premium archive hero with subtle floating collage background (5% opacity), slow floating motion via Framer Motion. Primary button: "Browse Collection", Secondary: "View Categories".
- **Archive Statistics**: Replace plain text with premium cards (Items Archived, Categories, Sealed, Sold).
- **Featured Categories**: Replace current grid with large rounded images, soft dark gradient, category name, item count, and subtle description. Hover effects: 1.05x zoom, gradient darkens, arrow appears.
- **Recently Added**: Implement horizontal scrolling cards showing thumbnail, title, condition, fair value, and status.
- **Featured Collectibles**: Large editorial cards highlighting rare items (e.g., Factory Sealed Bakugan, Pokemon Flip Card) with image, condition, estimated value, and collection.
- **Browse by Era & Collection Timeline**: Add horizontal timeline (1998 Pokemon Craze -> 2008 Bakugan).

---

### Collection & Archive Experience
#### [MODIFY] `src/app/collection/CollectionClient.tsx`
- Refactor the item cards to match the new strict guidelines: Image, Collection, Item Name, Condition Badge, Fair Value, and Availability.
- Update hover interactions: 4px lift, image zoom (1.05x), subtle border glow.
- Implement robust Loading States (Skeletons) and a premium Empty State ("No collectibles match your search. Try another collection.").

#### [MODIFY] `src/app/collection/[slug]/page.tsx` (Item Details)
- **Gallery**: Build a large interactive gallery (Front, Back, Packaging, Close-ups) with Cloudinary transformations, lazy loading, blur placeholders, and Lightbox/Zoom functionality.
- **Details Grid**: Shift layout to prioritize Information (History, Manufacturer, Material, Dimensions, Tags).
- **Fair Value Component**: Replace standard pricing with a "Fair Value" widget showing range (e.g., ₹700–900), market context (Community sales, Historical Listings), and Market Confidence (High/Medium/Low).
- **Related Collectibles**: Add a horizontal scroll of related items at the bottom of the page.

---

## Verification Plan

### Automated Checks
- Run `npm run build` to ensure no hydration or compilation errors are introduced by new Client/Server component boundaries.

### Manual Verification
- Test `Ctrl+K` search functionality across all pages.
- Verify micro-interactions (hovers, floating collage) are subtle and performant (no over-animation).
- Ensure mobile responsiveness, especially horizontal scrolling sections and sticky navigation.
