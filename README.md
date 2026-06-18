# Internal GNR PickleBall Tournament 2026

A live, mobile-first Tournament Score Management and Standings application built using **HTML5, Javascript (ES6+), and Vanilla CSS**. This application is designed specifically for phone screens so organizers can run the entire tournament from a court without using Excel sheets.

Live URL: **[https://tournament-manager-black.vercel.app](https://tournament-manager-black.vercel.app)**

---

## 🏆 Tournament Format & Rules

### Phase 1: Group Stage (18 Teams)
The 18 teams are split into **6 groups of 3 teams each**. Within each group, a round-robin of 3 matches is played.
* **Groups**:
  * **Group A**: Team Name, Season Champ, Double Trouble
  * **Group B**: Net Ninjas, Smashers4, Mission Impickleball
  * **Group C**: Smashers, Dink Dynasty, Team-Harmony
  * **Group D**: Kingfisher Pickers, DSR Mavericks, Straw Hats
  * **Group E**: OGs, Mid-Court Crisis, Aata Maaji Satakli
  * **Group F**: Smashers-2, Smash and Dash, Guruji Ke Anmol Ratna
* **Timeline (6:00 PM - 7:12 PM)**: 18 matches played across Court 1, Court 2, and Court 3.
* **Standings Sorting Criteria**:
  1. Points (Win = 3, Draw = 1, Loss = 0)
  2. Point Difference (PD = Points For - Points Against)
  3. Points For (PF)
  4. Alphabetical fallback
* **Qualification**: The winner (Rank 1) of each group qualifies for the Super 6 stage.

---

### Phase 2: Super 6 Stage (Super Group X & Y)
The 6 group winners are divided into two Super Groups:
* **Super Group X**: Winners of Group A, Group C, and Group E.
* **Super Group Y**: Winners of Group B, Group D, and Group F.
* **Timeline (7:12 PM - 7:48 PM)**: 3 matches per Super Group. 
* **Dynamic Resolution**: Teams in the Super 6 matches update dynamically as group standings adjust. Input is locked until parent groups are completed and winners are finalized.
* **Qualification**: The top team (Rank 1) of Super Group X and Super Group Y qualify for the Final.

---

### Phase 3: Final (1 Match)
* **Matchup**: Winner Super Group X vs Winner Super Group Y.
* **Timeline (7:48 PM - 8:10 PM)**: The final match determines the tournament **Champion**.

---

## ⚡ Core Application Features

1. **Live Scoring**: Save scores, set status to `In Progress` or `Completed` to update standings immediately.
2. **Edit & Undo Stack**: Click **Undo** on the success toast or admin panel to revert the last action, instantly recalculating all standings and qualifiers.
3. **Data Persistence**: All scores and settings are persistently synchronized to `localStorage`. Brower refreshes will keep all scores.
4. **Admin Controls**:
   - Customize Team Names, Players, and Contact details.
   - Reset individual match scores.
   - Reset specific Groups or Super Groups.
   - Reset the entire tournament.
   - Confirmations are requested before destructive actions.

---

## 🛠️ Local Development Setup

To run this project locally:

1. Clone this repository.
2. Serve the static directory. For example, using Python:
   ```bash
   python -m http.server 8080
   ```
   Or using Node's `http-server`:
   ```bash
   npx http-server -p 8080
   ```
3. Open `http://localhost:8080` in your web browser.

---

## 🚀 Deployment

The site is configured for zero-dependency hosting on **Vercel**. To deploy changes:
1. Make sure you have Vercel CLI installed:
   ```bash
   npm install -g vercel
   ```
2. Deploy directly:
   ```bash
   vercel --prod
   ```
