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
| `taxon.html` | Taxon (product list) page for Alternative Clothing: same header, footer and cart drawer as the homepage |
| `style-inspo.html` | Style Gallery page: the live style-inspo gallery rebuilt in the new style, with a Shop The Look panel |
| `new-in.html` | New In page: new arrivals as a timeline of drops, with category and brand filters and "New Since Your Visit" |
| `new-order-leaflet.html` | The A7 trifold piercing leaflet, outside and inside, scaled to fill the window. It's the leaflet's HTML export as supplied, with a fit-to-window script and the `noindex` tag added. Linked from Key Pages as "New Order Leaflet" |
| `inner-circle-till-display.html` | The Inner Circle till display graphic (`images/display/inner-circle-till-display.jpg`, 1920 x 1080) shown as large as it fits on a white page, with a plain "Back to Homepage" text link above it. `noindex`. Linked from Key Pages as "Inner Circle Till Display", under Inner Circle Landing Page |
| `product.html` | Product page for a piercing product: gallery, sizes, Add to Cart with an "Added to Cart" panel, pop-ups, accordions, reviews, range block |
| `css/styles.css` | All styles. Brand colours from the XD document library are variables at the top |
| `css/cart.css` | Cart page styles, built on the tokens and components in `styles.css` |
| `css/taxon.css` | Taxon page styles, built on the tokens and components in `styles.css` |
| `css/gallery.css` | Style Gallery styles, built on the tokens and components in `styles.css` |
| `css/product.css` | Product page styles. The page also loads `taxon.css` for the Customer Reviews, Related Posts, Instagram and SEO blocks |
| `css/new-in.css` | New In styles. The page also loads `taxon.css` for the product tiles, badges, pills, tool buttons and dropdown menu |
| `js/main.js` | Mega menu, mobile menu, Online / In-store tabs, In-Store side panel, search bar, scrollers, cart drawer, newsletter check, footer accordion |
| `js/cart.js` | Cart page: quantities, remove/undo, free delivery meter, discount code, totals, mobile checkout bar |
| `js/taxon.js` | Taxon page: filters drawer, filter chips, Sort By and View menus, Load More, SEO Read More |
| `js/gallery.js` | Style Gallery: Shop The Look panel, Load More |
| `js/product.js` | Product page: gallery and full-screen image viewer, colour swatches, size checks and stock badge, quantity, Klarna message, Add to Cart, "Added to Cart" panel, pop-ups, sticky bar and size sheet, delivery countdown and Shipping Options |
| `js/new-in.js` | New In: category, brand and "since your visit" filters, Show All, the drop list, last-visit memory |
| `booking/` | Online Piercing Booking prototype: five steps and a confirmation page (see [Online Piercing Booking](#online-piercing-booking-booking)) |
| `booking/assets/booking.css` | Booking styles, built on the tokens, buttons and footer in `css/styles.css` |
| `booking/assets/booking.js` | Booking logic for all six booking pages: studios, slots, age checks, validation, slot hold, summary, calendar file |
| `images/` | Web-sized copies of the artwork. The `Assets` folder is untouched |

## How it behaves

- **1180px and wider:** desktop header with hover mega menus. Keyboard users can Tab to the small arrow after a category, press Enter to open it, and press Esc to close it.
- **Below 1180px:** burger menu with accordions.
- **Below 900px:** product rows stack.
- **Below 768px:** the Summer blocks stack and the footer becomes an accordion.
- **Below 600px:** banners switch to the square `_480` crops.
- **Product rows:** they scroll sideways, with arrows on desktop and swiping on touch screens.
- **Menus, footer and product cards:** they use the live site's URLs. Product names and prices were taken from the live site on 17 Sept 2026.

## Online / In-store menu

The menu has two versions: **Online** (the shop categories) and **In-store** (the piercing studios). On phones and tablets they're tabs in the burger menu; on desktop the in-store menu opens in a side panel. Every page has it: homepage, cart, product, taxon, style gallery, New In, and the loyalty pages (Inner Circle and the three name concepts), which use the same markup with the styles and script in `loyalty/assets/site-navigation.css` and `.js`.

- **Phones and tablets (below 1180px):** the burger menu follows iPhone 14 Pro Max – 7 and 8 in the XD.
  - The menu opens with Login at the top, then two tabs, Online and In-store. The chosen tab is black with a small pointer under it.
  - In-store lists Piercing Info, Store Locator, Aftercare Info, Medi-Daith Info and Piercing Gallery as plain links. Under them are the Book Online banner (`images/menu/menu-piercing-booking-wide.jpg`, the XD's `20260909_menu_large_piercing_booking_mobile.jpg`), the Join Inner Circle banner (`images/menu/menu-loyalty-gift-bag-wide.jpg`, the gift bag hero photo from the Inner Circle page with the original "1 point per £1" panel and "Join the Inner Circle" bar laid over it, same 340 x 180 size, links to the Inner Circle page) and the Piercing Studio Reviews block.
  - The menu footer now starts with "Stay In The Loop, Sign Up": an email field, a yellow arrow button and an opt-in tick box.
- **Desktop (1180px and wider):** follows the "Blue Banana Homepage Changes" Word document (13 Nov 2026).
  - An In-Store Services button sits at the left of the menu bar. It's dark, like the site's other buttons, with the shop icon from the XD assets.
  - It opens an In-Store panel from the left, built to the screenshot in the document. The panel has the same links, Book Online and Join Inner Circle banners and Piercing Studio Reviews block as the mobile In-store tab, then the mobile menu's "Stay In The Loop, Sign Up" form on an ink strip at the bottom (it uses the same newsletter check and hand-off as the other sign-up forms). The heading, links, Book Online label and reviews title are in capitals. Close it with the cross, the dark backdrop or Esc.
  - At 1920 the categories stay centred, as in the XD. Between 1180 and 1399px the button and the category text are a little smaller so everything fits.
- **Remembering the choice (phones and tablets):** the tab choice lasts for the visit (`sessionStorage`, key `bb-menu-mode`), so the next page opens on the same menu. A small script in each page's `<head>` applies it before the page appears, so the menu doesn't flash. A new visit starts on Online.
- **Without JavaScript:** only the Online menu shows. Get Pierced has the same links.

Changes from the XD:
- "Aftercare info" reads "Aftercare Info", to match the other links.
- In the menu, Login and Sign In / Register both go to the login page. The XD shows both.
- The menu sign-up asks people to tick the opt-in box before it sends them on.

## Loyalty link

The yellow Loyalty button has gone from the header (as asked in the Word document). Loyalty Scheme is now a link at the bottom of the footer's Online Order Help column, on every page with the homepage footer. The yellow Loyalty Scheme button in the mobile menu is still there. Both open the Inner Circle sign-up page (`loyalty/inner-circle.html`); the three name concepts are still at `loyalty/`.

## Key Pages menu (preview only)

"Key Pages" is the last item in the top menu on every page with the shop header (homepage, cart, taxon, product, style gallery, New In, and the four loyalty pages). It's a dropdown like the others, with one list of the key page types: Homepage, New In, Category Page (Clothing), Product Page, Cart Page, Style Gallery, Inner Circle Landing Page and Piercing Booking. (The earlier loyalty name concepts are left out; they're still at `loyalty/`.)

On phones it's an accordion in the burger menu. `loyalty/index.html` has no shop menu, so it has a small Key Pages dropdown in its header instead. Between 1180px and 1300px wide the category text drops to 11px so the extra item fits.

It's there so the pages are easy to show in meetings. **Remove it before any of these pages go live** (search for `KEY PAGES` / `mega-key-pages` and the `keys` block in `loyalty/index.html`).

## Secret dark mode (easter egg, not a feature)

**Developers: this is just us messing around. Please don't build it into the live site, don't add a theme switch, and don't spend time on it.** The site is light for everyone, whatever their computer or phone is set to, and there's no dark mode button.

For fun, typing **up, up, down, down, left, right** on the arrow keys on any of the six shop pages (homepage, cart, taxon, product, style gallery and New In) flips the page to dark; the same again flips it back. It's remembered in the browser (`localStorage`, key `bb-theme`) until someone types the code again. It doesn't fire while typing in a form field. The loyalty pages don't have it.

Where it lives, all marked **EASTER EGG** in comments, so it's easy to delete before go-live:
- the `bb-theme` script in each page's `<head>`
- the easter egg block near the top of `js/main.js`
- the `:root[data-theme="dark"]` block near the top of `css/styles.css`, and the `[data-theme="dark"]` rules at the end of `cart.css`, `taxon.css`, `gallery.css` and `product.css`

The colour variables it relies on (`--bb-paper` for backgrounds, `--bb-ink` for text, `--bb-band` for the footer and other dark blocks) are harmless on their own and can stay.

## Before this goes live

1. **Cart drawer:** it runs on demo data (`DEMO_CART` / `DEMO_UPSELL` in `js/main.js`) and needs connecting to the basket API. "Checkout" points at `/en_GB/checkout/`, the Sylius default, so confirm that URL.
2. **Newsletter forms:** the homepage block, the Inner Circle page's "Unlock Member Exclusive Offers" block, the desktop In-Store panel's sign-up and the menu's "Stay In The Loop" sign-up all check the email address, then send people to `/en_GB/form/mailing-list-signup`. The menu form also needs its opt-in box ticked; it's sent as `marketing_consent`. Both need connecting to the real mailing-list service.
3. **Piercing Studio Reviews:** the figures (4.96 average, 71,282 reviews, 18 studios) are copied from the XD. They appear in the mobile In-store menu and the desktop In-Store panel, so they need to come from the studios' review source. The block doesn't link anywhere yet. Point it at a reviews page if there is one.
4. **Get Pierced links:** six of them have no page on the live site yet. They're marked `data-todo-url` in Get Pierced and point at the closest existing page for now:
   - Inserting & Changing Jewellery
   - Jewellery Size Guides
   - Piercing Care Solution
   - Re-Piercing FAQs
   - UK Piercing Laws
   - Existing Migraine Research
5. **Favicon:** it loads from the live CDN.
6. **Search engines:** the preview has a `noindex` tag in `index.html` so it stays out of Google. Remove it when this goes into the live site.
7. **Online Piercing Booking:** see [the booking hand-offs](#before-the-booking-goes-live).
8. **Secret dark mode:** delete it. It's an easter egg we added for fun, not a feature (see [Secret dark mode](#secret-dark-mode-easter-egg-not-a-feature)).

## Online Piercing Booking (`booking/`)

A prototype of the updated "Online Piercing Booking" app (the one at piercing.bluebanana.com today). It follows the "Blue Banana Mobile Booking Redesign" canvas for the steps, layout and behaviour, and the shop's colours, type and square corners. So customers feel they haven't left the website, the booking pages use the shop's own header (copied from `cart.html`, with its mega menus, burger menu, In-Store panel and search, run by `js/main.js`), with the piercing menu from the current app (Visits, My Data, Book Online, and so on) underneath, and the shop footer. The page is white, with boxed blocks on the light grey `#f6f6f6`, like the cart page.

If the shop header changes, copy the new one into the booking pages too, with paths starting `../`.

Every "Book Online" link now opens it: the Get Pierced mega menu promo, the In-store menu and In-Store panel banners on every page, the Inner Circle "Book A Piercing" button, and the Inner Circle store finder's "Book Now" links (which preselect that studio with `?store=<code>`). The product page's "Book a Consultation" link opens it with Consultation picked (`?visit=consult`). It's also in the Key Pages menu.

| Page | Step | What it does |
| --- | --- | --- |
| `booking/index.html` | 1. Piercing | New Piercing Or Changeover / Consultation cards, body area and part, New Piercing / Jewellery Change, a numbered selection with age chips for each piercing, the full age table (rows you've picked are highlighted), and the ID tick box |
| `booking/studio.html` | 2. Studio & Time | Studio card with a searchable list of the 18 studios and "Find your nearest studio" (asks for location), a week of days with free-slot counts, morning and afternoon slot grids. Today is walk-in only |
| `booking/details.html` | 3. Your Details | About You, postcode finder, address, Stay In The Loop (nothing ticked by default). Checks each field, and checks the date of birth against the piercings on the appointment date: it asks for a parent or guardian where needed and stops piercings that can't be done at that age (tongue is 18+ at the Welsh studios) |
| `booking/health.html` | 4. Health Check | The 17 questions from the current form as Yes / No pairs with a progress bar; a "Yes" shows a note. All 17 must be answered |
| `booking/summary.html` | 5. Review & Pay | Appointment ticket, piercings, details and health with Change / Edit links, Before You Pay points, the full terms, and the deposit card with Confirm & Pay |
| `booking/confirmed.html` | Done | Visit ID, Add To Calendar (downloads an .ics file), Get Directions, What Happens Next |

How it behaves:
- **Phones:** one column, with the Continue button at the end of each step (it doesn't stick to the screen). It says what's missing ("Tick the age restrictions box to continue") and, if pressed anyway, shows the errors and moves to the first one.
- **1000px and wider:** a "Your Booking" summary sits on the right and fills in as you go. On step 5 that column is the deposit and pay card.
- **Progress:** the dark band shows the step, the title and five bars; from 760px the bars have labels, and finished steps are links back.
- **Slot hold:** your time is held for 10 minutes from step 2 (as now). Steps 3 to 5 show the countdown; at 2 minutes left screen readers hear a warning, and when it runs out a notice offers Hold It Again or Choose Another Time.
- **Memory:** the booking is kept in `sessionStorage` (key `bb-booking`) so moving between steps keeps everything, and closing the tab clears it.
- **Meeting demo:** Your Details fills itself in with demo details the first time it opens in a browser tab, so the steps can be shown quickly. Anything typed over them stays.
- **Skipping ahead:** opening a later step directly shows "You've Skipped A Step" with a link back and a **Fill In A Demo Booking** button, so any step can be shown on its own in a meeting.
- **Without JavaScript:** a notice says booking needs JavaScript and points to walk-ins and the studio contacts.

### Before the booking goes live

1. **Slots:** times are made up per studio and day (10:00 to 17:30, Sundays 11:00 to 16:00, with walk-in-only blocks). Connect the booking app's real availability and slot hold (`daySlots` in `booking.js`).
2. **Studios:** the 18 studios and their map positions come from the Inner Circle store finder. Connect them to the studio list the booking app uses.
3. **Address lookup:** Find fills the postcode only. Connect the UK address lookup the current app uses.
4. **Payment:** Confirm & Pay goes straight to the confirmation page. No payment is taken. Connect the payment provider, then show the confirmation after payment.
5. **Sign-in and Visits:** the prototype doesn't sign anyone in. Visits and My Data point at the current app (`data-todo-url`). Prefill Your Details for signed-in customers.
6. **Terms:** the first 15 paragraphs match the current form; the rest needs carrying over.
7. **Deposit:** £5.00 a booking (£4.17 + £0.83 VAT), as on the current form. Confirm it's one deposit per booking, not per piercing.
8. **Remove the meeting demo:** the "Fill In A Demo Booking" button and the Your Details prefill (`DEMO_DETAILS`, `fillDemo` and the prefill in `step3()` in `booking.js`, all marked MEETING DEMO), and the `noindex` tag on each booking page.

## Cart page (`cart.html`)

There's no cart artboard in the XD files, so the page is built from the homepage build's components and patterns in the product page XD: the grey promo bars, dark 50px buttons, the quantity stepper, the PayPal / Apple Pay pair, the next-day delivery countdown and the Trustpilot block. The drawer's "Go to Cart" button now opens it.

Changes from the live cart page:
- A basket notice at the top of the page for things like Christmas delivery dates or courier problems.
- A free delivery meter that shows how much more to spend. It replaces the static orange banner.
- Under the meter, "Want to see offers you've missed?" opens a list of teasers: offers the cart hasn't unlocked yet.
- Quantity changes update the totals straight away, so there's no "Update Cart" button.
- Removing an item, or clearing the cart, can be undone from a toast.
- The order summary shows sale savings and the applied discount. On phones and tablets it sits between the free delivery meter and the cart items, so the total and checkout come first. On desktop it sits to the right of the items and stays in view while you scroll.
- The discount code and gift card fields fold away under the summary.
- Apple Pay and PayPal are stacked above "Checkout Securely", at the same width.
- The PayPal delivery-country help from the live page is a short disclosure under the PayPal button.
- Recommendations have "Add to Cart" buttons.
- Phones get a sticky Total + Checkout bar whenever the summary's checkout button is off screen. It shows the sale savings next to the total. Its Checkout button slides up a full-width Express Checkout panel from the bottom of the screen, with Apple Pay, PayPal and Checkout Securely.
- The empty cart keeps the live page's Homepage / Contact Us help.

### Before the cart page goes live

1. **Basket data:** it runs on demo data (`DEMO_CART` in `js/cart.js`, the same items as the drawer). Quantity, remove, clear and add need connecting to the basket API.
2. **Discount codes and gift cards:** `DEMO_CODES` only knows `DRMARTENS10` (from the product page XD), and every gift card is rejected. Connect both to the platform's coupon and gift card endpoints.
3. **Delivery rules:** the free delivery threshold (£50, footwear excluded, from the live cart page) and the 2pm weekday next-day cut-off are settings at the top of `js/cart.js`. Confirm them. The countdown doesn't know about bank holidays. The homepage promo bar says £70, so one of the two needs changing.
4. **Express checkout:** the PayPal and Apple Pay buttons, in both the order summary and the Express Checkout pop-up, are styled links to checkout. Swap them for the SDK buttons, and only show Apple Pay where `ApplePaySession` exists.
5. **Trustpilot:** the rating block is static (5,706 reviews, from the live page). Swap it for the Trustpilot widget.
6. **Basket notice:** the Christmas delivery dates are example text in `cart.html`. Set the notice from the CMS, and leave it out when there's nothing to say.
7. **Teasers:** the three offers are made-up examples in `cart.html`. Fill the list from the Teasers functionality, update the count, and leave the dropdown out when the cart hasn't missed any offers.

## Taxon page (`taxon.html`)

A build of `20260508_bb_taxon_page_template.xd`: the Web 1920, iPad Pro and iPhone 14 Pro Max artboards, filled with the Alternative Clothing taxon from the live site. On every page, the header's Clothing link, "Shop All Clothing" and the two clothing "View All" links open it.

From top to bottom:
- Breadcrumbs, the taxon title and its short description.
- The sub-taxon buttons. They sit inside the page column, lined up with the product grid. (The XD runs them off the right of the screen; they were brought in so there is room to scroll on wide screens.) They scroll sideways at every width: swipe, trackpad, or drag with the mouse. They don't scroll on their own.
- A product count, then Sort By, View 24 and Filters. Phones hide View, as in the iPhone artboards.
- Applied filters as chips with a Reset chip (Web 1920 – 5).
- The product grid: three 400px tiles at 1920, three on tablets, two on phones. Each tile can show a Selling Fast!, Promo Code or Back Print badge.
- The promotion tile (a red-tinted photo with "Sale up to 90% off") keeps the 5th place in the grid, whatever the sort or filters. That puts it in row 2 on desktop and row 3 on phones, as in the XD. Its image is the same height as the product images, and two lines of promo text sit under it in the product name and price styles ("Sale: Up to 90% Off Sitewide" / "Shop the Sale"). On phones it spans both columns, so it's full width but no taller than a product image.
- "Viewing 24 of 386 Products", a progress line and Load More. Load More adds the next chunk of products at the size chosen in the View menu (24, 48 or 120). The progress line under the text is filled to the share of the taxon's products shown on the page.
- Customer Reviews, Related Posts, Styled By Us Worn By You, and the SEO Text Block.
  - Related Posts and Styled By Us scroll with the XD's arrow buttons: 55px black squares with a thin white chevron, 20px outside the first and last card and vertically centred on the cards. Both arrows always show, and the one with nowhere to go is dimmed. Each carousel repeats its four items once, so there's something to scroll through.
  - The SEO text is left aligned, in a box the height of the image (284px; 320px on phones) that scrolls. Its scrollbar follows the XD: a 10px `#e5e5e5` track and a `#c3c3c3` thumb with rounded ends, 30px from the text.

The Filters button opens a 400px drawer from the right (Web 1920 – 2/3/4). It has one accordion per live filter group (Brand, Product Type, Clothing Size, Colour, Main Style, Band, Range, Bottoms Size, Dress Size), with the live options and counts. Ticked values show as chips at the top of the drawer. Filters apply when you press See Results or close the drawer. The page URL keeps the live site's parameters (`brand[brand][]=50`, `order_by_sort=price-asc`, `limit=48`), so a filtered or sorted view can be shared or reloaded.

Changes from the XD:
- The breadcrumb reads Home › Alternative Clothing. The XD had placeholder text ("Alternative Clothing › Coats & Jackets").
- The description and SEO copy are the live taxon's own text instead of lorem ipsum and the store/piercing text. It's trimmed a little, and the live "We're been" typo is fixed.
- The product count is the live one (386). The XD showed both 379 and 418.
- Sort By and View open menus with the live options. The chosen sort shows on the button.
- The Filters button shows how many filters are applied.
- See Results stays pinned to the bottom of the drawer, so it's in reach when a long group like Band is open. Groups that already have ticked values open automatically.
- Filter counts are a darker grey than the XD's `#b9b9b9`, so they're easier to read.
- Load More has a thin progress line under "Viewing X of Y".
- If filters rule out every product, the page says so and offers Reset Filters.
- The XD's alternative portrait tiles (Web 1920 – 7) are one class away: add `taxon-grid--portrait` to the grid.

### Before the taxon page goes live

1. **Products and paging:** the first 24 tiles are the XD's products, written into `taxon.html`. Load More, sorting and filtering are a demo that runs in the browser over those 24 plus the 35 in `DEMO_MORE` in `js/taxon.js`. After those, Load More repeats the 35 (marked `data-demo-repeat`) so it can run to all 386 and fill the progress line; filtered results leave the repeats out. Connect them to the taxon's product listing (the live page pages with `?page=2`). The filters drawer is already a GET form that uses the live field names and values. `data-match` and the `data-brand`, `data-type`, etc. attributes on the tiles exist only for the demo.
2. **Product links:** five of the XD products weren't found on the live site, so they link to their brand page and are marked `data-todo-url`: Hell Bunny X Care Bear Cheer Bear Pleated Mini Skirt, Hell Bunny X Care Bear Love-A-Lot, Jawbreaker Oversized Cat Knit Top, Jawbreaker Ruched Lace Mini Skirt and Jawbreaker Embroidered Collar Mini Dress.
3. **Badges:** Selling Fast!, Promo Code: £10 OFF and Back Print are set by hand in `taxon.html`. Drive them from product data: a stock or sales-velocity flag, an active promotion, and a back-print attribute.
4. **Filter counts:** the counts and options are from the live page on 10 Nov 2026. They need to come from the search index, and update as filters are applied.
5. **Promotion tile:** make it a CMS slot (image, overlay text, the two lines under it, link). The XD uses Gobold, which isn't available as a web font here, so the tile uses Anton from Google Fonts. Swap in a licensed Gobold web font if you have one.
6. **Trustpilot:** the review cards and "6,168 reviews" are static. The first four are copied from the XD. The last four (Sophie, Dan, Amy and Rhys) are made-up placeholders, added so the carousel scrolls; they aren't real customers. Swap the whole list for the Trustpilot carousel widget. The cart page says 5,706 reviews, so check which figure is current.
7. **Related Posts:** fill this from the blog. The second four posts repeat the first four. Two of the XD's posts have no live URL ("Gothic Gift Guide" and "Black Friday is Here Early!"). They point at the blog index and are marked `data-todo-url`.
8. **Instagram:** the photos are static copies from the XD; the second four repeat the first four. Connect the block to the Instagram feed.
9. **Search engines:** the page has the same `noindex` tag as the other pages, plus a canonical link to the live taxon URL.

## Style Gallery page (`style-inspo.html`)

A rebuild of [bluebanana.com/en_GB/gallery/style-inspo](https://www.bluebanana.com/en_GB/gallery/style-inspo) using the homepage components. There's no XD for this page. The looks, brands and "Products Used" lists were copied from the live page on 10 Nov 2026. On every page, the header's Style Gallery link, "Explore The Style Gallery" and the Browse By Aesthetic "View All" link open it.

From top to bottom:
- Breadcrumbs, the title and a short intro.
- Browse The Styles: the eight style sub-galleries (Witchy, Gothic, Vintage, Alt Festival, Band Merch, Pop Culture, Dr Martens, New Rock) as square tiles. All eight fit on desktop; phones swipe them.
- Featured Looks: the homepage feature block. The square banner is the Band Merch Festival look and the other 12 featured looks sit in the two-row scroller.
- Latest Additions: the 20 latest looks, 12 at a time with Load More.
- Style Inspo Videos: a product row of the 12 newest videos, with a Watch On TikTok button.
- Brand Profiles: the live banner, then a button for each brand in the gallery.
- A short SEO text block.
- Get Featured: the newsletter block over a wall of gallery photos, with Work With Us, Follow On Instagram and the social links.

Every look opens **Shop The Look**: a panel with the photo, the brand, the products used (each links to its product page) and More From [Brand]. Arrows, or the arrow keys, move through the looks in the same section. The address changes to `#look-<id>`, so a look can be shared. On phones the panel is full screen. Without JavaScript, the looks link to the full-size photo, as on the live page.

Changes from the live page:
- Each look opens Shop The Look, with its brand and products, instead of linking to the full-size photo.
- In the live page's HTML, the 50 Style Inspo Videos cards have placeholder thumbnails and `#` links. Here the 12 newest are dark title cards (date, title, views and likes) that link to TikTok.
- The intro and SEO copy are new and shorter. The Want To Be Part Of The Team? text is now the Get Featured block.
- The brand banner is joined by buttons for the 13 brands used in the gallery.

### Before the style gallery goes live

1. **Gallery data:** the 33 looks are written into `style-inspo.html`, and their details are the JSON in `#looks-data`. Feed both from the gallery CMS. Load More runs in the browser; page it from the server instead.
2. **Untagged looks:** four looks have no products (Third Identity Rosalie Jumper, both Bleeding Heart dresses and the Hell Bunny Love-A-Lot Skirt). Their panel says so and points at the brand instead. Tag the products in the CMS.
3. **Brands without a profile:** H&R London and Twilight have no brand profile on the live site, so their panels show the name without a link.
4. **Videos:** the cards link to the TikTok profile and are marked `data-todo-url`. Connect the row to the TikTok or Instagram feed, with real thumbnails and video links. The dates have no year because the live page doesn't give one.
5. **Images:** `images/gallery` has web-sized copies (480 / 840, plus 1000 for the banner) of the live CDN photos. The style tiles are only 250px on the live site, so ask for larger originals.
6. **Prices:** the live gallery shows no prices, so neither does this. Add price and stock from the product API to the Products Used list if you want them.
7. **Search engines:** the page has the same `noindex` tag as the other pages, plus a canonical link to the live gallery URL.

Product photos: eight of the shots in `images/products` had a thin light-grey frame baked in from the live site (both sizes of each): the Banned Morena dress and Heartbreaker top, the Ragged Priest jeans and jorts, the Pierce The Veil and System Of A Down BYOB tees, and two hinged segment rings. The frame has been trimmed off the image files (cropped 2px, 3px on the 840 copies, and scaled back to size), so the homepage cards lose it too. Photos fetched from the live CDN may still have it.

## New In page (`new-in.html`)

A New In page built to be checked often, rather than another product list. There's no XD for this page. The products, prices, offers and Selling Fast order were copied from [bluebanana.com/en_GB/section/new-alternative-fashion](https://www.bluebanana.com/en_GB/section/new-alternative-fashion) on 10 Nov 2026: 132 products, newest first. On every page, the header's New In link opens it, and so do the homepage New In "View All Products" button and the cart page's "Shop New In" button.

From top to bottom:
- **Hero:** the New In title, three counts (new pieces, pieces in the latest drop, brands) and the latest drop's four photos, which link to that drop.
- **Since your visit:** the hero remembers when you last visited (in this browser) and says how many pieces have landed since, with a Show Me What's New button. Drops that landed since then get a yellow "New Since Your Visit" tag and a yellow marker in the drop list.
- **Category pills:** All, Clothing, Footwear, Accessories, Band Merch, Piercing Jewellery and Hair Dye, with counts. They stick under the header and filter every drop at once. "New Since Your Visit" joins them when something has landed.
- **Brand menu:** filters by brand. Its counts follow the chosen category; brands with nothing in it are greyed out.
- **Drop timeline:** the products grouped into drops, newest first. Each drop has a heading (Today, Yesterday or the date), a count, the brands in it and a 2 x 2 lead tile, then Show All. The latest drop shows nine products, the others five (six on tablets). On desktop a list of drops sits beside the timeline and highlights the one you're scrolling through; on smaller screens it's a row of buttons.
- **Selling Fast:** the 12 best sellers in New In (the live Bestsellers sort), ranked 1 to 12, between the second and third drops. It hides while a filter is on. The same 12 have a "Selling Fast!" badge in the timeline.
- **Get New In First:** the newsletter block.

The product tiles are the taxon page tiles, with the live offer badges (Buy 1 Get 1 Free, 10% Off Footwear, 2 For £35, 2 For £65, Multibuy Madness).

Filters are kept in the address, so they can be linked to from menus or emails: `new-in.html?cat=footwear`, `?brand=dr-martens`, `?fresh=1`, or any mix. To see the "since your visit" view, add `?since=2026-11-05`, which treats 5 Nov as the last visit.

Without JavaScript every product shows, the pills and brand menu are hidden, and the drop list still jumps to each drop.

### Before the New In page goes live

1. **Arrival dates (demo data):** the live listing is in Newest order but doesn't publish arrival dates. The products are split into six drops in that order, with illustrative dates from 30 Oct to 10 Nov 2026. Group them by `product_created_at` and render the page from the platform.
2. **Since your visit:** the last visit is kept in the browser (`localStorage`, key `bb-new-in-visit`), so it's per device. For signed-in customers, store it on the account. Compare it with real arrival times rather than drop dates.
3. **Product data:** the 132 products are written into `new-in.html`. Feed them, the offer badges and the Selling Fast list from the platform and promotions engine.
4. **Categories:** the six groups were worked out from the live listing (image alt text and product names). Map them to the real taxons.
5. **Images:** `images/new-in` has 480 / 840 copies of the live originals. Five piercing-ball photos are only 350px on the live site, so they look soft.
6. **Name fix:** the live site lists "Banned Nightfall Velvet Skirt (Puple)". It reads "(Purple)" here; fix it on the live site too.
7. **Search engines:** the page has the same `noindex` tag as the other pages, plus a canonical link to the live New In URL.

## Product page (`product.html`)

Built from `20260810_bb_product_page_template_piercings.xd` (the newest of the three product page XDs: Web 1920 – 1 to 3, the iPad and iPhone artboards, and the Size Guide, Apple Pay, PayPal, Add To Cart Size Select and Add to Basket Side Menu pop-ups), plus the product page screenshot. The demo product is the XD's: Blue Banana Plasma Gold 1.2mm Hinged Segment Ring (Gold), £5.99, was £8.99. The cart drawer's demo ring now links here.

From top to bottom:
- **Breadcrumbs:** left aligned with `|` dividers, as in the XD. On phones they stay on one line and scroll sideways.
- **Gallery:** thumbnails on the left and the main image with arrows. Clicking the image opens it full screen (like the test site): a dark backdrop with the image in the middle, arrows at the screen edges to go through the images, and a 1 / 2 counter. Double-click or scroll to zoom (up to 4x), drag to move around, or use the + and - buttons; the arrow keys, + / - and 0 work too, and Esc or a click on the dark area closes it. On phones and tablets it's pinch or double-tap to zoom and swipe to change image. On desktop the gallery stays in view while you scroll the details. On phones and tablets it's full width, swipes, and has dots instead of thumbnails.
- **Details column:** title and brand logo, sale price, a red "Only X Left In Stock" badge (from the chosen size's stock), Gauge and Size drop-downs with Size Guide links, What Our Piercers Say, colour swatches, quantity and Add to Cart, then Apple Pay and PayPal with their More Information pop-ups.
- **Offers:** two grey offer blocks. The (i) opens the offer's terms underneath.
- **Next-day countdown:** "Order within hh:mm:ss for next-day delivery by …". (View Options) opens the Shipping Options list (Web 1920 – 2) with expected dates worked out from today.
- **Accordions:** Related Products (a scroller), Features, Description, Specifications and Product Reviews. All open to start with, as in the XD.
- **Find Your Size:** the size guide block from the "Size Guide Block Mockup" artifact. A photo with the ring diagram and the guide copy on the left, and the **What's My Gauge?** helper on the right: pick a body part, then a piercing, and it shows the recommended gauge. If this product comes in that gauge, it selects the gauge and the nearest size in the drop-downs above (they flash blue, and "Selected from size helper" appears under the Size box). If not, it says so and links to jewellery in that gauge. "I don't know my size" under the Size box jumps down to the helper. Underneath is the Nationwide Piercing Studio Reviews strip. The block has a ring version and a bar version (`data-guide="ring"` or `"bar"` on `section#find-your-size`); this ring product uses the ring version, and the bar version is the one in the mockup screenshot.
- **Below the product:** Customer Reviews, Plasma Gold range block ("Featured Range Information", from the screenshot), Related Posts, Styled By Us, Worn By You, and the SEO text. These reuse the taxon page blocks.

What happens when you add to cart:
- With no size chosen, the Size box turns red and says "Please choose your size".
- Otherwise the ring goes into the shared cart (the bag count goes up and the line shows in the cart drawer) and the **Added to Cart** panel slides in from the right. It shows the line with its own quantity and Remove, then "Have you thought about these?" with three add-ons. Continue Shopping closes it, Go to Cart opens `cart.html`.
- You can't order more than the chosen size has in stock (the 8mm has 1 left in the demo).
- **Phones and tablets:** a full-width Add to Cart bar sticks to the bottom of the screen while the main button is out of view. If no size is chosen, a full-width Choose Your Size panel slides up from the bottom of the screen (iPhone "Add To Cart Pop Up Size Select").
- **Klarna:** "Or 3 payments of …" appears once the price x quantity reaches £30 (set 6 or more to see it).

Colour swatches are links to each colour's product page. In the demo the page changes in place (title, breadcrumb, colour, image) and the address becomes `product.html?colour=silver`, so that link works too.

The pop-ups use the browser's own `<dialog>`, so they keep focus inside, close on Esc or a click on the dark background, and hand focus back when they close.

`js/main.js` now shares the cart with other scripts through `window.bbCart` (`add`, `setQty`, `remove`, `open`). A cart line can carry its own `key` (so 8mm and 10mm are separate lines) and `image`.

### Before the product page goes live

1. **Product data:** everything in the product area is written into `product.html` (name, prices, SKU, sizes, stock, swatches, specs) and `PRODUCT` in `js/product.js`. Render it from the product feed. The stock figures on the Size options (`data-stock`) are demo values.
2. **Description and range copy:** the XD has Dr Martens placeholder copy here, so the Description and the Plasma Gold range text are written for this template. Replace them with the product and range copy from the feed. The range button and brand logo link go to the closest live pages and are marked `data-todo-url`.
3. **Specifications:** the row labels follow the live piercing product pages (16 Nov 2026). The values are for this ring; check them against the feed.
4. **Add to Cart:** without JavaScript the form posts to `/en_GB/cart/add` (marked `data-todo-url`). Confirm the route and field names (`gauge`, `size`, `quantity`). With JavaScript it uses the demo cart.
5. **Added to Cart add-ons:** `UPSELL` in `js/product.js` is demo data. Fill it from the recommendations feed.
6. **Size guide:** the XD's size guide is for footwear. This one is a piercing gauge and diameter chart. Each product type needs its own (piercing, footwear, apparel).
7. **Delivery:** the methods and prices are from the live product page (16 Nov 2026). The 2pm weekday cut-off and the working days per method are settings in `js/product.js`, and bank holidays aren't handled. The platform should supply the dates. The free delivery offer says £50, like the cart page; the promo bar still says £70.
8. **Offers:** the two offer blocks are set by hand. Drive them from the promotions engine.
9. **Product Reviews:** the 4.7 / 37 rating and both reviews (Jess and Sam) are made-up placeholders. Swap the block for the Trustpilot product reviews widget for this SKU.
10. **Express checkout and Klarna:** Apple Pay and PayPal are styled links to checkout; swap them for the SDK buttons and only show Apple Pay where `ApplePaySession` exists. The Klarna line should become Klarna's on-site messaging. Check the £30 minimum with Klarna.
11. **Product Scales:** the hair dye scales block is in the page but hidden (`hidden` on `section.scales`). Show it and fill its values on hair dye products.
12. **Find Your Size helper:** the body parts, piercings and recommended sizes in `GUIDES` (`js/product.js`) are the mockup's placeholder figures. Replace them with the piercers' sizes from the system. Set `data-guide` from the product type. The ring version uses a photo: `find-your-size-ring-635.jpg` (635 x 200) on tablets and desktops, and a taller crop with larger labels, `find-your-size-ring-mobile-635.jpg` (635 x 446), on phones under 600px (both in `images/product/`). Add 2x copies (1270px wide) of both for high-density screens. The bar version still uses a drawn diagram until it has a photo of its own. "Shop 1.6mm Lip Jewellery" and similar links go to the body jewellery section for now (`SHOP_URL`, marked `data-todo-url`); point them at the right gauge and piercing listing.
13. **Studio reviews strip:** 4.96 and 71,606 reviews are from the mockup. The In-Store menu panel still says 71,282 (from the homepage XD). Feed both from the studios' review source.
14. **Full-screen images:** the viewer shows the 1000px gallery images, so they go soft at high zoom. Add `data-full` (a 2000px original) to each gallery link and the viewer uses that instead.
15. **Black Friday banner:** the XD has a campaign banner under the menu. It's left out because it's a sitewide campaign slot, not part of the product template.
16. **Search engines:** the page has the same `noindex` tag as the other pages, a canonical link to the live product URL, and Product structured data (JSON-LD) to generate from the feed.

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
