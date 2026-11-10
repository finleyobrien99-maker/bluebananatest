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
| `css/styles.css` | All styles. Brand colours from the XD document library are variables at the top |
| `css/cart.css` | Cart page styles, built on the tokens and components in `styles.css` |
| `css/taxon.css` | Taxon page styles, built on the tokens and components in `styles.css` |
| `css/gallery.css` | Style Gallery styles, built on the tokens and components in `styles.css` |
| `js/main.js` | Mega menu, mobile menu, search bar, scrollers, cart drawer, newsletter check, footer accordion |
| `js/cart.js` | Cart page: quantities, remove/undo, free delivery meter, discount code, totals, mobile checkout bar |
| `js/taxon.js` | Taxon page: filters drawer, filter chips, Sort By and View menus, Load More, SEO Read More |
| `js/gallery.js` | Style Gallery: Shop The Look panel, Load More |
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
- The sub-taxon buttons. They start at the column edge and run off the right of the screen. Swipe them on phones; desktop gets scroller arrows.
- A product count, then Sort By, View 24 and Filters. Phones hide View, as in the iPhone artboards.
- Applied filters as chips with a Reset chip (Web 1920 – 5).
- The product grid: three 400px tiles at 1920, three on tablets, two on phones. Each tile can show a Selling Fast!, Promo Code or Back Print badge.
- The promotion tile (a red-tinted photo with "Sale up to 90% off") keeps the 5th place in the grid, whatever the sort or filters. That puts it in row 2 on desktop and row 3 on phones, as in the XD.
- "Viewing 24 of 386 Products", a progress line and Load More.
- Customer Reviews, Related Posts, Styled By Us Worn By You, and the SEO Text Block. The SEO block is clipped to the image height and has a Read More link.

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

1. **Products and paging:** the first 24 tiles are the XD's products, written into `taxon.html`. Load More, sorting and filtering are a demo that runs in the browser over those 24 plus the 35 in `DEMO_MORE` in `js/taxon.js`. Connect them to the taxon's product listing (the live page pages with `?page=2`). The filters drawer is already a GET form that uses the live field names and values. `data-match` and the `data-brand`, `data-type`, etc. attributes on the tiles exist only for the demo.
2. **Product links:** five of the XD products weren't found on the live site, so they link to their brand page and are marked `data-todo-url`: Hell Bunny X Care Bear Cheer Bear Pleated Mini Skirt, Hell Bunny X Care Bear Love-A-Lot, Jawbreaker Oversized Cat Knit Top, Jawbreaker Ruched Lace Mini Skirt and Jawbreaker Embroidered Collar Mini Dress.
3. **Badges:** Selling Fast!, Promo Code: £10 OFF and Back Print are set by hand in `taxon.html`. Drive them from product data: a stock or sales-velocity flag, an active promotion, and a back-print attribute.
4. **Filter counts:** the counts and options are from the live page on 10 Nov 2026. They need to come from the search index, and update as filters are applied.
5. **Promotion tile:** make it a CMS slot (image, text, link). The XD uses Gobold, which isn't available as a web font here, so the tile uses Anton from Google Fonts. Swap in a licensed Gobold web font if you have one.
6. **Trustpilot:** the review cards and "6,168 reviews" are static, copied from the XD. Swap them for the Trustpilot carousel widget. The cart page says 5,706 reviews, so check which figure is current.
7. **Related Posts:** fill this from the blog. Two of the XD's posts have no live URL ("Gothic Gift Guide" and "Black Friday is Here Early!"). They point at the blog index and are marked `data-todo-url`.
8. **Instagram:** the four photos are static copies from the XD. Connect the block to the Instagram feed.
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
