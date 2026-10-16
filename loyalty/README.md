# Loyalty scheme landing pages

Three landing pages for the same scheme, one per naming option, so the office can compare the
names with real styling rather than in the abstract. Plus a neutral chooser page.

Reached from the **Loyalty** button in the site header (and "Loyalty Scheme" in the slide-in
menu below 1180px), or directly at `/loyalty/`.

| File | Concept | Type | Palette |
| --- | --- | --- | --- |
| `index.html` | Chooser / comparison | Karla + Montserrat | Brand neutral |
| `the-coven.html` | The Coven | Playfair Display + Montserrat | Violet-black `#0d0a11`, purple `#9c5dc6` |
| `the-inner-circle.html` | The Inner Circle | Grenze Gotisch + Oswald + Montserrat | Black `#0a0a0a`, brand yellow `#f1c30e` |
| `the-collective.html` | The Collective | Poppins + Montserrat | Ink `#101014`, neon pink `#fe3cac` |

Each page is self-contained: its own inline CSS, no build step, nothing shared with the rest of
the site except `assets/`. Nothing here has rounded corners — every box, button, field and card
is square. The only curves are the circular step numbers and the round "free to join" sticker.

## How the three differ

**The Coven** — mystical and close-knit. Centred, full-bleed hero, hairline rules, numbered
"rites" in roman numerals. Copy uses *the pact*, *the circle*, *gather*, *initiation*; the
sign-up section is "Join the Coven", the perks are "More than points".

**The Inner Circle** — exclusive and loud, closest to the October display artwork. Scrolling
ticker, blackletter headline, hard-edged yellow/black/grey tiles lifted from the poster, a
rotated "free to join" sticker. Copy is blunt: "Get in — it's free", "What members get".

**The Collective** — modern and inclusive. Sticky nav, stat strip, a six-card perks grid,
dotted connectors between steps. Copy leans on belonging and breadth: "One card for everything
we do", "Everyone gets the same deal", "Everyone's in".

All three show the same card mock: Blue Banana and the scheme name, a member number and a
barcode to scan at the till, in that concept's colours.

## Scheme facts used

Taken from the 7 October display posters and the 15 October Illustrator card drafts, which are
the newest material in the loyalty scheme artwork folder:

- 2 points per £1, in all 18 stores and online
- 100 points = £2 off
- 10% off all piercings, jewellery included
- Free to join; welcome reward is 10% off the first order or a free jewellery upgrade
- No tiers, one account across till / app / web
- Beyond points (from the 26 September deck): 24–48h early access to drops, aftercare check-ins
  at day 3 / 14 / 30 / 60, referral rewards for both people, points for reviews and tagged
  photos, option to donate points instead of redeeming

## Two things to confirm before these go anywhere

1. **Points rate.** The September deck says £1 = 1 point. The October posters and card drafts
   say 2 points per £1. These pages use the newer figure, and it appears in the hero, the stat
   strip, the steps and the FAQs — change it in one place per page if the deck is right.
2. **Card or no card.** The deck says "no card needed, phone number at the till". The posters
   say "just show your card". The pages split the difference: a card you can show in store and
   an account you sign into online. Pick one and the copy tightens up.

Both are flagged on `index.html` too.

## Not wired up

The email forms are front-end only — they validate and show a confirmation message, nothing is
sent. The member number and barcode on the card mocks are decorative. Footer links point at the
live bluebanana.com pages. Hero photography is cropped from the display artwork; swap in the
original shots before anything goes live.
