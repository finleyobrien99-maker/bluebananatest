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
| `cart.html` | Cart page: same header and footer as the homepage, cart lines, order summary, "You May Also Like" |
| `css/styles.css` | All styles. Brand colours from the XD document library are variables at the top |
| `css/cart.css` | Cart page styles, built on the tokens and components in `styles.css` |
| `js/main.js` | Mega menu, mobile menu, search bar, scrollers, cart drawer, newsletter check, footer accordion |
| `js/cart.js` | Cart page: quantities, remove/undo, free delivery meter, discount code, totals, mobile checkout bar |
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

## Cart page (`cart.html`)

There's no cart artboard in the XD files, so the page is built from the homepage build's components and patterns in the product page XD: the grey promo bars, dark 50px buttons, the quantity stepper, the PayPal / Apple Pay pair, the next-day delivery countdown and the Trustpilot block. The drawer's "Go to Cart" button now opens it.

Changes from the live cart page:
- Checkout steps (Cart › Delivery › Payment) above the title.
- A free delivery meter that shows how much more to spend. It replaces the static orange banner.
- Quantity changes update the totals straight away, so there's no "Update Cart" button.
- Removing an item, or clearing the cart, can be undone from a toast.
- The order summary shows sale savings and the applied discount. On phones and tablets it sits between the free delivery meter and the cart items, so the total and checkout come first. On desktop it sits to the right of the items and stays in view while you scroll.
- The discount code and gift card fields fold away under the summary.
- Apple Pay and PayPal are stacked above "Checkout Securely", at the same width.
- The PayPal delivery-country help from the live page is a short disclosure under the PayPal button.
- Recommendations have "Add to Cart" buttons.
- Phones get a sticky Total + Checkout bar whenever the summary's checkout button is off screen.
- The empty cart keeps the live page's Homepage / Contact Us help.

### Before the cart page goes live

1. **Basket data:** it runs on demo data (`DEMO_CART` in `js/cart.js`, the same items as the drawer). Quantity, remove, clear and add need connecting to the basket API.
2. **Discount codes and gift cards:** `DEMO_CODES` only knows `DRMARTENS10` (from the product page XD), and every gift card is rejected. Connect both to the platform's coupon and gift card endpoints.
3. **Delivery rules:** the free delivery threshold (£50, footwear excluded, from the live cart page) and the 2pm weekday next-day cut-off are settings at the top of `js/cart.js`. Confirm them. The countdown doesn't know about bank holidays. The homepage promo bar says £70, so one of the two needs changing.
4. **Express checkout:** the PayPal and Apple Pay buttons are styled links to checkout. Swap them for the SDK buttons, and only show Apple Pay where `ApplePaySession` exists.
5. **Trustpilot:** the rating block is static (5,706 reviews, from the live page). Swap it for the Trustpilot widget.

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
