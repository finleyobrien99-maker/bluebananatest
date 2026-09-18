# Blue Banana homepage

A working build of `20260709_bb_homepage_template.xd` (Web 1920 artboards), with the menu structure from bluebanana.com/en_GB.

## Viewing it

- Open the hosted preview (GitHub Pages), or
- download this folder and double-click `index.html`.

The design source files (XD, PSDs) aren't in this repository, only the finished website.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | Page markup: header and mega menus, banners, product rows, Summer blocks, newsletter, footer, cart drawer |
| `css/styles.css` | All styles. Brand colours from the XD document library are variables at the top |
| `js/main.js` | Mega menu, mobile menu, search bar, scrollers, cart drawer, newsletter check, footer accordion |
| `images/` | Web-sized copies of the artwork. The `Assets` folder is untouched |

## How it behaves

- **1180px and wider:** desktop header with hover mega menus. Keyboard users can Tab to the small arrow after a category, press Enter to open it, and press Esc to close it.
- **Below 1180px:** burger menu with accordions.
- **Below 900px:** product rows stack.
- **Below 768px:** the Summer blocks stack and the footer becomes an accordion.
- **Below 600px:** banners switch to the square `_480` crops.
- **Product rows:** they scroll sideways, with arrows on desktop and swiping on touch screens.
- **Menus, footer and product cards:** they use the live site's URLs. Product names and prices were taken from the live site on 17 Sept 2026.

## Before this goes live

1. **Cart drawer:** it runs on demo data (`DEMO_CART` / `DEMO_UPSELL` in `js/main.js`) and needs connecting to the basket API. "Checkout" points at `/en_GB/checkout/`, the Sylius default, so confirm that URL.
2. **Newsletter form:** it checks the email address, then sends people to `/en_GB/form/mailing-list-signup`. It needs connecting to the real mailing-list service.
3. **Get Pierced links:** six of them have no page on the live site yet. They're marked `data-todo-url` in `index.html` and point at the closest existing page for now:
   - Inserting & Changing Jewellery
   - Jewellery Size Guides
   - Piercing Care Solution
   - Re-Piercing FAQs
   - UK Piercing Laws
   - Existing Migraine Research
4. **Favicon:** it loads from the live CDN.
5. **Search engines:** the preview has a `noindex` tag in `index.html` so it stays out of Google. Remove it when this goes into the live site.

## Changes from the XD

**Fixes**
- Hair Dye promo captions now read "Shop Offer" and "Shop Clearance". The XD reused the piercing captions.
- Band Merch menu: removed the duplicated "Featured Bands" column.
- Buffalo › Shoes now filters Buffalo. The live menu link points at Bleeding Heart.

**Consistency**
- All menu headings are uppercase.
- Footer columns are evenly spaced, and "Returns Information" uses the live site's wording.
- The second Summer block shows its products in a different order, so the two blocks don't look identical.

**Additions**
- "Halloween Store" (from the live menu).
- A "Styled By Blue Banana" link.
- The piercing-booking promo in the Get Pierced menu.
- A cart subtotal and a count badge on the bag icon.
