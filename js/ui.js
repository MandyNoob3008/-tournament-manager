// js/ui.js

import { state, saveState, pushToRemoteSync, enableRemoteSync, disableRemoteSync, loadDefaults } from './state.js';
import { recalculateAll, isMatchPlayable, resolvePlaceholder } from './calculations.js';

// Timer Registry: maps matchId -> { remainingSeconds, isRunning, intervalId }
const matchTimers = {};

// Confetti flag
let confettiTriggered = false;

// Search Query Cache
let scheduleSearchQuery = "";
let standingsSearchQuery = "";

// External Actions Hooks (to be filled by main.js)
export const actions = {
  onSaveScore: null,     // (matchId, scoreA, scoreB) => {}
  onResetMatch: null,    // (matchId) => {}
  onSaveTeamDetails: null // (teamKey, name, players, contact) => {}
};

/**
 * Main switch tab function
 */
export function switchTab(tabId) {
  // Toggle Views
  const panels = document.querySelectorAll(".view-panel");
  panels.forEach(p => p.classList.remove("active"));
  
  const target = document.getElementById(`view-${tabId}`);
  if (target) target.classList.add("active");

  // Toggle Tab Bar Highlight
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.classList.remove("active");
    // Get lowercase tab identifier
    const label = btn.innerText.trim().toLowerCase();
    if (label === tabId || (label === "dashboard" && tabId === "dashboard") || (label === "schedule" && tabId === "schedule") || (label === "standings" && tabId === "standings") || (label === "courts" && tabId === "courts") || (label === "admin" && tabId === "admin")) {
      // Find matching tab button by data attribute or simple text match
      if (btn.getAttribute('data-tab') === tabId || btn.textContent.includes(tabId.charAt(0).toUpperCase() + tabId.slice(1))) {
        btn.classList.add("active");
      }
    }
  });

  // Re-run specific renders
  renderTabContent(tabId);
}

function renderTabContent(tabId) {
  const calculations = recalculateAll(state);
  const { standingsCached, winnersCached } = calculations;

  if (tabId === "dashboard") {
    renderDashboard(standingsCached, winnersCached);
  } else if (tabId === "schedule") {
    renderSchedule();
  } else if (tabId === "standings") {
    renderStandings(standingsCached, winnersCached);
  } else if (tabId === "courts") {
    renderCourts();
  } else if (tabId === "admin") {
    renderAdmin();
  }
}

/**
 * Master UI Render function
 */
export function renderUI() {
  const activeTabEl = document.querySelector(".tab-btn.active");
  let currentTab = "dashboard";
  if (activeTabEl) {
    const tabAttr = activeTabEl.getAttribute("data-tab");
    if (tabAttr) currentTab = tabAttr;
  }
  
  // Set up spectator mode warning bar
  setupSpectatorBanner();

  // Progress Stat
  const totalMatches = state.matches.length;
  const completedMatches = state.matches.filter(m => m.status === "Completed").length;
  const progressPercent = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
  
  const progVal = document.getElementById("tournament-progress-val");
  if (progVal) progVal.innerText = `${progressPercent}%`;
  const progDesc = document.getElementById("tournament-progress-desc");
  if (progDesc) progDesc.innerText = `${completedMatches} of ${totalMatches} matches completed`;

  // Dynamic content based on current tab
  renderTabContent(currentTab);
}

/**
 * Set up Spectator Read-Only visual state
 */
function setupSpectatorBanner() {
  let spectatorBar = document.getElementById("spectator-banner");
  
  if (state.isSpectator) {
    if (!spectatorBar) {
      spectatorBar = document.createElement("div");
      spectatorBar.id = "spectator-banner";
      spectatorBar.className = "spectator-banner";
      spectatorBar.innerHTML = `
        <div class="spectator-banner-content">
          <span class="live-blink">●</span> SPECTATOR MODE — Standings update automatically in real-time
        </div>
      `;
      document.body.prepend(spectatorBar);
      document.body.classList.add("has-spectator-banner");
    }
  } else {
    if (spectatorBar) {
      spectatorBar.remove();
      document.body.classList.remove("has-spectator-banner");
    }
  }
}

/**
 * Renders Dashboard panel contents (including the visual Bracket and Leaders)
 */
function renderDashboard(standingsCached, winnersCached) {
  // Leaders Widget
  const groups = ["A", "B", "C", "D", "E", "F"];
  groups.forEach(g => {
    const element = document.getElementById(`leader-${g.toLowerCase()}`);
    if (element) {
      const winnerId = winnersCached.groups[g];
      if (winnerId) {
        element.innerHTML = `<span style="color: var(--accent-success); font-weight:700;">✓</span> ${state.teams[winnerId].name}`;
      } else {
        const currentLeaderId = standingsCached.groups[g][0]?.teamId;
        if (currentLeaderId && standingsCached.groups[g][0]?.played > 0) {
          element.innerHTML = `<span style="color: var(--accent-warning);">${state.teams[currentLeaderId].name}</span> <small style="display:block; font-size:0.6rem; color:var(--text-muted);">In Progress</small>`;
        } else {
          element.innerHTML = `<span style="color: var(--text-muted);">TBD</span>`;
        }
      }
    }
  });

  // Render Super 6 Lists on Dashboard
  renderDashboardSuperGroupList("X", "super-x-teams-list", standingsCached, winnersCached);
  renderDashboardSuperGroupList("Y", "super-y-teams-list", standingsCached, winnersCached);

  // Finalists Displays
  const finalistXDisp = document.getElementById("finalist-x-display");
  const finalistYDisp = document.getElementById("finalist-y-display");
  const finalistXId = winnersCached.superGroups["X"];
  const finalistYId = winnersCached.superGroups["Y"];

  if (finalistXDisp) {
    if (finalistXId) {
      finalistXDisp.innerHTML = `<div style="font-size:0.75rem; color:var(--text-muted); font-weight:400;">Super X Winner</div>${state.teams[finalistXId].name}`;
    } else {
      const leaderId = standingsCached.superGroups["X"][0]?.teamId;
      if (leaderId && standingsCached.superGroups["X"][0]?.played > 0) {
        finalistXDisp.innerHTML = `<div style="font-size:0.75rem; color:var(--text-muted); font-weight:400;">Super X (Leading)</div><span style="color:var(--accent-warning);">${state.teams[leaderId].name}</span>`;
      } else {
        finalistXDisp.innerHTML = `<span style="color:var(--text-muted); font-weight:400;">Super X Winner (TBD)</span>`;
      }
    }
  }
  if (finalistYDisp) {
    if (finalistYId) {
      finalistYDisp.innerHTML = `<div style="font-size:0.75rem; color:var(--text-muted); font-weight:400;">Super Y Winner</div>${state.teams[finalistYId].name}`;
    } else {
      const leaderId = standingsCached.superGroups["Y"][0]?.teamId;
      if (leaderId && standingsCached.superGroups["Y"][0]?.played > 0) {
        finalistYDisp.innerHTML = `<div style="font-size:0.75rem; color:var(--text-muted); font-weight:400;">Super Y (Leading)</div><span style="color:var(--accent-warning);">${state.teams[leaderId].name}</span>`;
      } else {
        finalistYDisp.innerHTML = `<span style="color:var(--text-muted); font-weight:400;">Super Y Winner (TBD)</span>`;
      }
    }
  }

  // Render Visual Bracket flow
  renderVisualBracket(winnersCached);

  // Champion Banner & Confetti celebration
  const champBanner = document.getElementById("champion-banner");
  const champName = document.getElementById("champion-name");
  const champPlayers = document.getElementById("champion-players");
  
  if (winnersCached.champion) {
    if (champBanner) champBanner.style.display = "block";
    if (champName) champName.innerText = state.teams[winnersCached.champion].name;
    if (champPlayers) champPlayers.innerText = `Players: ${state.teams[winnersCached.champion].players}`;
    
    // Confetti burst
    if (!confettiTriggered && window.confetti) {
      triggerConfetti();
      confettiTriggered = true;
    }
  } else {
    if (champBanner) champBanner.style.display = "none";
    confettiTriggered = false; // Reset flag when score is cleared
  }

  // Dashboard ongoing matches
  const ongoingContainer = document.getElementById("ongoing-matches-list");
  if (ongoingContainer) {
    const activeMatches = state.matches.filter(m => m.status === "In Progress" || (m.status === "Not Started" && isMatchPlayable(m, state.matches, state.teams))).slice(0, 3);
    if (activeMatches.length === 0) {
      ongoingContainer.innerHTML = `<div class="empty-state">No current or upcoming matches playable right now. Check schedule for details.</div>`;
    } else {
      ongoingContainer.innerHTML = activeMatches.map(m => renderMatchCardHTML(m)).join("");
      attachCardListeners(activeMatches);
    }
  }
}

/**
 * Render visual SVG/CSS Bracket mapping group-stage to super6 to final
 */
function renderVisualBracket(winners) {
  let container = document.getElementById("bracket-container");
  if (!container) {
    // Inject bracket structure container if it doesn't exist on index.html
    const dashboardView = document.getElementById("view-dashboard");
    if (!dashboardView) return;
    
    container = document.createElement("div");
    container.id = "bracket-container";
    container.className = "card glass-panel dashboard-full-width";
    container.style.marginTop = "16px";
    
    // Insert after champion-banner / stats row
    const insertRef = document.querySelector(".dashboard-grid");
    if (insertRef) {
      insertRef.parentNode.insertBefore(container, insertRef);
    }
  }

  const getTeamName = (id, fallback) => state.teams[id]?.name || fallback;
  
  // Resolve finalists
  const finalistXId = winners.superGroups["X"];
  const finalistYId = winners.superGroups["Y"];
  const champId = winners.champion;

  container.innerHTML = `
    <div class="card-title">🏆 Tournament Bracket Flow</div>
    <div class="bracket-flow-wrapper">
      <!-- Stage 1: Groups winners -->
      <div class="bracket-col">
        <div class="bracket-col-header">Group Stage Winners</div>
        <div class="bracket-node-pair">
          <div class="bracket-node ${winners.groups["A"] ? "active" : ""}">
            <span class="node-label">Winner A</span>
            <span class="node-value">${getTeamName(winners.groups["A"], "TBD")}</span>
          </div>
          <div class="bracket-node ${winners.groups["C"] ? "active" : ""}">
            <span class="node-label">Winner C</span>
            <span class="node-value">${getTeamName(winners.groups["C"], "TBD")}</span>
          </div>
          <div class="bracket-node ${winners.groups["E"] ? "active" : ""}">
            <span class="node-label">Winner E</span>
            <span class="node-value">${getTeamName(winners.groups["E"], "TBD")}</span>
          </div>
        </div>
        <div class="bracket-line-vertical"></div>
        <div class="bracket-node-pair" style="margin-top:20px;">
          <div class="bracket-node ${winners.groups["B"] ? "active" : ""}">
            <span class="node-label">Winner B</span>
            <span class="node-value">${getTeamName(winners.groups["B"], "TBD")}</span>
          </div>
          <div class="bracket-node ${winners.groups["D"] ? "active" : ""}">
            <span class="node-label">Winner D</span>
            <span class="node-value">${getTeamName(winners.groups["D"], "TBD")}</span>
          </div>
          <div class="bracket-node ${winners.groups["F"] ? "active" : ""}">
            <span class="node-label">Winner F</span>
            <span class="node-value">${getTeamName(winners.groups["F"], "TBD")}</span>
          </div>
        </div>
      </div>

      <!-- Connecting vectors -->
      <div class="bracket-connector-col">
        <svg class="bracket-svg">
          <path d="M 0 65 L 45 65 L 45 105 L 80 105" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-dasharray="4" class="${winners.groups["A"] && winners.groups["C"] && winners.groups["E"] ? "solid-line" : ""}"/>
          <path d="M 0 235 L 45 235 L 45 275 L 80 275" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-dasharray="4" class="${winners.groups["B"] && winners.groups["D"] && winners.groups["F"] ? "solid-line" : ""}"/>
        </svg>
      </div>

      <!-- Stage 2: Super 6 groups -->
      <div class="bracket-col">
        <div class="bracket-col-header">Super 6 Leaders</div>
        <div class="bracket-node ${finalistXId ? "active gold-glow" : ""}" style="margin-top: 50px; height: 70px;">
          <span class="node-label" style="color:var(--accent-gold);">Super Group X Winner</span>
          <span class="node-value" style="font-weight:700;">${getTeamName(finalistXId, "TBD")}</span>
        </div>
        
        <div class="bracket-node ${finalistYId ? "active gold-glow" : ""}" style="margin-top: 100px; height: 70px;">
          <span class="node-label" style="color:var(--accent-gold);">Super Group Y Winner</span>
          <span class="node-value" style="font-weight:700;">${getTeamName(finalistYId, "TBD")}</span>
        </div>
      </div>

      <!-- Connecting vectors -->
      <div class="bracket-connector-col">
        <svg class="bracket-svg">
          <path d="M 0 85 L 35 85 L 35 155 L 70 155" fill="none" stroke="var(--accent-gold)" stroke-width="2" stroke-dasharray="4" class="${finalistXId ? "solid-line" : ""}"/>
          <path d="M 0 255 L 35 255 L 35 185 L 70 185" fill="none" stroke="var(--accent-gold)" stroke-width="2" stroke-dasharray="4" class="${finalistYId ? "solid-line" : ""}"/>
        </svg>
      </div>

      <!-- Stage 3: Finals -->
      <div class="bracket-col">
        <div class="bracket-col-header">Finals</div>
        <div class="bracket-node champion-box ${champId ? "active champion-glow" : ""}" style="margin-top: 110px; height: 90px; justify-content: center;">
          <span class="node-label" style="font-size:0.75rem; letter-spacing:0.1em; color:var(--accent-gold);">👑 CHAMPION 👑</span>
          <span class="node-value" style="font-size:1.1rem; font-weight:800; background:linear-gradient(135deg, #ffd700, #ff9500); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">${getTeamName(champId, "TBD")}</span>
        </div>
      </div>
    </div>
  `;
}

function renderDashboardSuperGroupList(groupName, containerId, standingsCached, winnersCached) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const parentGroups = groupName === "X" ? ["A", "C", "E"] : ["B", "D", "F"];
  let html = "";
  
  parentGroups.forEach(g => {
    const winnerId = winnersCached.groups[g];
    if (winnerId) {
      html += `
        <li style="display:flex; justify-content:space-between; align-items:center; background:rgba(52, 199, 89, 0.05); padding:6px 10px; border-radius:6px; border:1px solid rgba(52, 199, 89, 0.15);">
          <span>Group ${g} Winner: <strong>${state.teams[winnerId].name}</strong></span>
          <span class="badge badge-green">Qualified</span>
        </li>
      `;
    } else {
      const leaderId = standingsCached.groups[g][0]?.teamId;
      if (leaderId && standingsCached.groups[g][0]?.played > 0) {
        html += `
          <li style="display:flex; justify-content:space-between; align-items:center; background:rgba(255, 149, 0, 0.05); padding:6px 10px; border-radius:6px; border:1px solid rgba(255, 149, 0, 0.15);">
            <span>Group ${g} Leader: <strong>${state.teams[leaderId].name}</strong></span>
            <span class="badge badge-orange">In Progress</span>
          </li>
        `;
      } else {
        html += `
          <li style="display:flex; justify-content:space-between; align-items:center; background:rgba(255, 255, 255, 0.02); padding:6px 10px; border-radius:6px; border:1px solid var(--glass-border);">
            <span style="color:var(--text-muted);">Group ${g} Winner</span>
            <span class="badge badge-gray">TBD</span>
          </li>
        `;
      }
    }
  });
  
  container.innerHTML = html;
}

/**
 * Render Schedule view (includes search filter)
 */
export function renderSchedule() {
  const container = document.getElementById("schedule-slots-container");
  if (!container) return;

  // Add search input above the timeline if not present
  setupSearchInput("view-schedule", (query) => {
    scheduleSearchQuery = query.toLowerCase();
    renderSchedule();
  }, scheduleSearchQuery, "Search matches by team or players...");

  const activeStageFilter = document.querySelector(".filter-btn.active[data-stage]")?.getAttribute("data-stage") || "all";
  
  // Filter matches based on stage button
  let filteredMatches = state.matches;
  if (activeStageFilter === "groups") {
    filteredMatches = state.matches.filter(m => m.stage === "Group Stage");
  } else if (activeStageFilter === "super6") {
    filteredMatches = state.matches.filter(m => m.stage === "Super 6");
  } else if (activeStageFilter === "finals") {
    filteredMatches = state.matches.filter(m => m.stage === "Finals");
  }

  // Filter based on search query
  if (scheduleSearchQuery) {
    filteredMatches = filteredMatches.filter(m => {
      const tAName = getMatchTeamName(m, 'A').toLowerCase();
      const tAPlayers = getMatchTeamPlayers(m, 'A').toLowerCase();
      const tBName = getMatchTeamName(m, 'B').toLowerCase();
      const tBPlayers = getMatchTeamPlayers(m, 'B').toLowerCase();
      
      return tAName.includes(scheduleSearchQuery) || 
             tAPlayers.includes(scheduleSearchQuery) || 
             tBName.includes(scheduleSearchQuery) || 
             tBPlayers.includes(scheduleSearchQuery) ||
             m.timeSlot.includes(scheduleSearchQuery) ||
             m.stage.toLowerCase().includes(scheduleSearchQuery);
    });
  }

  if (filteredMatches.length === 0) {
    container.innerHTML = `<div class="empty-state">No matches found.</div>`;
    return;
  }

  // Group by Time Slot
  const slots = {};
  filteredMatches.forEach(m => {
    if (!slots[m.timeSlot]) slots[m.timeSlot] = [];
    slots[m.timeSlot].push(m);
  });

  let html = "";
  for (const slotTime in slots) {
    const slotMatches = slots[slotTime];
    html += `
      <div class="slot-container">
        <div class="slot-header">⏰ Time Slot: ${slotTime}</div>
        <div class="matches-grid">
          ${slotMatches.map(m => renderMatchCardHTML(m)).join("")}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
  attachCardListeners(filteredMatches);
}

/**
 * Render Standings view (includes highlights filter and search)
 */
export function renderStandings(standingsCached, winnersCached) {
  const container = document.getElementById("standings-content");
  if (!container) return;

  setupSearchInput("view-standings", (query) => {
    standingsSearchQuery = query.toLowerCase();
    renderStandings(standingsCached, winnersCached);
  }, standingsSearchQuery, "Search standings by team or player name...");

  const activeGroupFilter = document.querySelector(".filter-btn.active[data-standings-group]")?.getAttribute("data-standings-group") || "all";
  
  let html = "";

  // 1. Group Standings (A-F)
  if (activeGroupFilter === "all" || activeGroupFilter === "stages") {
    const groups = ["A", "B", "C", "D", "E", "F"];
    html += `<h2 style="font-size: 1.1rem; border-left: 4px solid var(--accent-primary); padding-left: 8px; margin-top: 10px; margin-bottom: 12px; color: var(--text-secondary);">Groups A - F Standings</h2>`;
    html += `<div class="standings-grid-layout">`;
    
    groups.forEach(g => {
      let standings = standingsCached.groups[g];
      
      // Perform search filtering on standings rows if needed
      if (standingsSearchQuery) {
        standings = standings.filter(entry => {
          const t = state.teams[entry.teamId];
          return t.name.toLowerCase().includes(standingsSearchQuery) || 
                 t.players.toLowerCase().includes(standingsSearchQuery);
        });
      }

      html += renderStandingsTableHTML(`Group ${g}`, standings, 1, false); // Highlight top 1 team
    });
    
    html += `</div>`;
  }

  // 2. Super Group Standings (X & Y)
  if (activeGroupFilter === "all" || activeGroupFilter === "super6") {
    const sgNames = ["X", "Y"];
    html += `<h2 style="font-size: 1.1rem; border-left: 4px solid var(--accent-gold); padding-left: 8px; margin-top: 24px; margin-bottom: 12px; color: var(--text-secondary);">Super 6 Standings</h2>`;
    html += `<div class="standings-grid-layout">`;
    
    sgNames.forEach(sg => {
      let standings = standingsCached.superGroups[sg];
      
      if (standingsSearchQuery) {
        standings = standings.filter(entry => {
          const t = state.teams[entry.teamId];
          return t.name.toLowerCase().includes(standingsSearchQuery) || 
                 t.players.toLowerCase().includes(standingsSearchQuery);
        });
      }

      html += renderStandingsTableHTML(`Super Group ${sg}`, standings, 1, true); // Highlight top 1 team (finalist)
    });
    
    html += `</div>`;
  }

  container.innerHTML = html;
}

/**
 * Render Court Dashboard View (Courts 1, 2, and 3 cards with ongoing & upcoming matches)
 */
export function renderCourts() {
  const container = document.getElementById("view-courts");
  if (!container) return;

  const courtsList = [1, 2, 3];
  
  let html = `
    <div style="margin-bottom: 16px;">
      <h2 style="font-size: 1.25rem; font-weight:700; margin-bottom:4px;">🏟️ Live Courts Dashboard</h2>
      <p style="font-size: 0.8rem; color: var(--text-muted);">Real-time overview of current active matches and next matchups lined up on each court.</p>
    </div>
    <div class="courts-grid-container">
  `;

  courtsList.forEach(courtNum => {
    // Get matches on this court
    const courtMatches = state.matches.filter(m => m.court === courtNum);
    
    // Current Active (In Progress or playable first)
    let activeMatch = courtMatches.find(m => m.status === "In Progress");
    if (!activeMatch) {
      activeMatch = courtMatches.find(m => m.status === "Not Started" && isMatchPlayable(m, state.matches, state.teams));
    }
    
    // Completed Matches
    const completedList = courtMatches.filter(m => m.status === "Completed");
    const lastCompleted = completedList[completedList.length - 1];

    // Upcoming queue (playable matches that are not started)
    const upcomingQueue = courtMatches.filter(m => m.status === "Not Started" && m.id !== activeMatch?.id);
    
    let activeCardHTML = "";
    if (activeMatch) {
      activeCardHTML = renderCourtDashboardMatchHTML(activeMatch, "court-active-badge");
    } else {
      activeCardHTML = `
        <div class="court-empty-status">
          <span style="font-size:1.5rem; display:block; margin-bottom:8px;">☕</span>
          No active match. Court is free.
        </div>
      `;
    }

    let nextMatchHTML = "";
    const firstPlayableNext = upcomingQueue.find(m => isMatchPlayable(m, state.matches, state.teams));
    if (firstPlayableNext) {
      nextMatchHTML = `
        <div class="court-queue-item playable">
          <span class="queue-time">${firstPlayableNext.timeSlot}</span>
          <span class="queue-names"><strong>${getMatchTeamName(firstPlayableNext, 'A')}</strong> vs <strong>${getMatchTeamName(firstPlayableNext, 'B')}</strong></span>
          <span class="badge badge-gray" style="font-size:0.6rem; padding: 2px 6px;">On Deck</span>
        </div>
      `;
    } else if (upcomingQueue.length > 0) {
      const nextLocked = upcomingQueue[0];
      nextMatchHTML = `
        <div class="court-queue-item locked">
          <span class="queue-time">${nextLocked.timeSlot}</span>
          <span class="queue-names">${getMatchTeamName(nextLocked, 'A')} vs ${getMatchTeamName(nextLocked, 'B')}</span>
          <span class="badge badge-gray" style="font-size:0.6rem; padding: 2px 6px; opacity:0.5;">🔒 Locked</span>
        </div>
      `;
    } else {
      nextMatchHTML = `<div style="font-size: 0.75rem; color: var(--text-muted); font-style:italic; padding: 6px 0;">No further matches scheduled on this court.</div>`;
    }

    let lastCompletedHTML = "";
    if (lastCompleted) {
      const winnerA = parseInt(lastCompleted.scoreA) > parseInt(lastCompleted.scoreB) ? "winner" : "";
      const winnerB = parseInt(lastCompleted.scoreB) > parseInt(lastCompleted.scoreA) ? "winner" : "";
      lastCompletedHTML = `
        <div style="font-size: 0.75rem; color: var(--text-secondary); background:rgba(255,255,255,0.02); padding: 8px; border-radius: 6px; border:1px solid var(--glass-border); display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Last match</span>
          <span>
            <span class="${winnerA}">${getMatchTeamName(lastCompleted, 'A')} (${lastCompleted.scoreA})</span> - 
            <span class="${winnerB}">(${lastCompleted.scoreB}) ${getMatchTeamName(lastCompleted, 'B')}</span>
          </span>
        </div>
      `;
    } else {
      lastCompletedHTML = `<div style="font-size: 0.7rem; color: var(--text-muted); font-style:italic;">No matches completed yet.</div>`;
    }

    html += `
      <div class="court-dashboard-card glass-panel">
        <div class="court-dashboard-header">
          <span class="court-card-title">Court ${courtNum}</span>
          <span class="badge ${activeMatch?.status === 'In Progress' ? 'badge-orange' : 'badge-gray'}">${activeMatch?.status === 'In Progress' ? 'LIVE' : 'IDLE'}</span>
        </div>
        
        <div style="margin-bottom:16px;">
          <div style="font-size: 0.7rem; color: var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:8px; letter-spacing:0.05em;">Current / Next Up</div>
          ${activeCardHTML}
        </div>

        <div style="margin-bottom:16px; border-top:1px solid var(--glass-border); padding-top:12px;">
          <div style="font-size: 0.7rem; color: var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:8px; letter-spacing:0.05em;">Coming Up Next</div>
          ${nextMatchHTML}
        </div>

        <div style="border-top:1px solid var(--glass-border); padding-top:12px; margin-top:auto;">
          ${lastCompletedHTML}
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
  
  // Attach timer & save action event listeners to dashboard cards
  const allActiveCourts = state.matches.filter(m => m.status === "In Progress" || (m.status === "Not Started" && isMatchPlayable(m, state.matches, state.teams)));
  attachCardListeners(allActiveCourts);
}

/**
 * Generate court dashboard match HTML
 */
function renderCourtDashboardMatchHTML(match, badgeClass) {
  const isPlayable = isMatchPlayable(match, state.matches, state.teams);
  
  let teamAName = getMatchTeamName(match, 'A');
  let teamBName = getMatchTeamName(match, 'B');
  let scoreAVal = match.scoreA !== null ? match.scoreA : "";
  let scoreBVal = match.scoreB !== null ? match.scoreB : "";

  // Check editing
  const isEditing = match._isEditing === true || match.status === "Not Started" || match.status === "In Progress";
  const showInputs = isEditing && isPlayable && !state.isSpectator;

  // Set up timer HTML
  const timerHtml = renderStopwatchHTML(match.id, match.status);

  return `
    <div class="court-active-match" id="match-card-${match.id}">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-size:0.8rem; font-weight:700; color:var(--text-secondary);">${match.timeSlot} (${match.stage})</span>
        ${timerHtml}
      </div>
      
      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.9rem; font-weight:500;">${teamAName}</span>
          ${showInputs ? 
            `<input type="number" class="match-score-input" style="height:32px; width:45px;" id="score-a-${match.id}" value="${scoreAVal}" min="0">` : 
            `<span style="font-size:1.1rem; font-weight:700;">${match.scoreA !== null ? match.scoreA : '-'}</span>`
          }
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.9rem; font-weight:500;">${teamBName}</span>
          ${showInputs ? 
            `<input type="number" class="match-score-input" style="height:32px; width:45px;" id="score-b-${match.id}" value="${scoreBVal}" min="0">` : 
            `<span style="font-size:1.1rem; font-weight:700;">${match.scoreB !== null ? match.scoreB : '-'}</span>`
          }
        </div>
      </div>
      
      ${showInputs ? `
        <div style="display:flex; justify-content:flex-end; gap:6px;">
          <button class="btn btn-primary btn-save" style="font-size:0.7rem; padding: 4px 10px;" data-match-id="${match.id}">💾 Save Score</button>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render Admin tab elements (includes custom remote sync configurations & file export/import)
 */
export function renderAdmin() {
  const adminPanel = document.getElementById("view-admin");
  if (!adminPanel) return;

  if (!state.isAdmin) {
    adminPanel.innerHTML = `
      <div class="card glass-panel" style="max-width: 400px; margin: 40px auto; padding: 24px;">
        <div class="card-title" style="justify-content:center; gap:8px; font-size:1.2rem; margin-bottom:16px;">
          <span>🔒 Admin Access Required</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); text-align:center; margin-bottom:20px; line-height:1.5;">
          This section is restricted to tournament organizers. Please enter the admin passcode to unlock editing and sync options.
        </div>
        <div class="form-group">
          <label>Passcode PIN</label>
          <input type="password" class="form-input" id="admin-pin-input" placeholder="••••" style="text-align:center; font-size:1.5rem; letter-spacing:0.3em; height:48px;" maxlength="10">
        </div>
        <button class="btn btn-primary" id="btn-login-admin" style="width:100%; height:42px; justify-content:center; font-size:0.85rem; margin-top:8px;">
          🔓 Unlock Admin Panel
        </button>
      </div>
    `;

    const pinInput = document.getElementById("admin-pin-input");
    if (pinInput) {
      pinInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          window.app.loginAdmin(pinInput.value);
        }
      });
    }

    const loginBtn = document.getElementById("btn-login-admin");
    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        const pinVal = document.getElementById("admin-pin-input")?.value || "";
        window.app.loginAdmin(pinVal);
      });
    }
    return;
  }

  adminPanel.innerHTML = `
    <!-- Reset Options Card -->
    <div class="card glass-panel">
      <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
        <span>Tournament Reset Controls</span>
        <button class="btn btn-danger" onclick="app.logoutAdmin()" style="font-size: 0.65rem; padding: 4px 8px;">🔒 Lock Admin</button>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <button class="btn btn-danger" onclick="app.promptReset('all')">Reset Entire Tournament</button>
          <button class="btn btn-danger" onclick="app.promptReset('scores')">Reset All Scores</button>
        </div>
        <div style="border-top: 1px solid var(--glass-border); padding-top: 12px; margin-top: 6px;">
          <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px; color: var(--text-secondary);">Reset Specific Stage / Group:</label>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <button class="btn" onclick="app.promptReset('group-a')">Group A</button>
            <button class="btn" onclick="app.promptReset('group-b')">Group B</button>
            <button class="btn" onclick="app.promptReset('group-c')">Group C</button>
            <button class="btn" onclick="app.promptReset('group-d')">Group D</button>
            <button class="btn" onclick="app.promptReset('group-e')">Group E</button>
            <button class="btn" onclick="app.promptReset('group-f')">Group F</button>
            <button class="btn" onclick="app.promptReset('super-x')">Super X</button>
            <button class="btn" onclick="app.promptReset('super-y')">Super Y</button>
            <button class="btn" onclick="app.promptReset('finals')">Finals</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Teams Editor Accordion -->
    <div class="card glass-panel">
      <div class="card-title">Edit Team Details & Members</div>
      <div id="admin-teams-accordion" style="margin-top: 10px;">
        <!-- Rendered below -->
      </div>
    </div>

    <div id="admin-extra-panels"></div>
  `;

  const accordionContainer = document.getElementById("admin-teams-accordion");
  if (!accordionContainer) return;

  const teamKeys = Object.keys(state.teams);
  let html = "";
  teamKeys.forEach(key => {
    const t = state.teams[key];
    const isOpen = t._isOpen === true ? "open" : "";
    html += `
      <div class="accordion-item ${isOpen}" id="accordion-${key}">
        <div class="accordion-header" onclick="app.toggleAccordion('${key}')">
          <span>Group ${t.group}: <strong>${t.name}</strong></span>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight:normal; margin-right: 8px;">${t.players}</span>
        </div>
        <div class="accordion-content">
          <div class="form-group">
            <label>Team Name</label>
            <input type="text" class="form-input" id="edit-name-${key}" value="${t.name}">
          </div>
          <div class="form-group">
            <label>Players (Comma separated)</label>
            <input type="text" class="form-input" id="edit-players-${key}" value="${t.players}">
          </div>
          <div class="form-group">
            <label>Organizer Phone Number</label>
            <input type="tel" class="form-input" id="edit-contact-${key}" value="${t.contact}">
          </div>
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:10px;">
            <button class="btn btn-primary" onclick="app.saveTeamDetails('${key}')">Save Team Details</button>
          </div>
        </div>
      </div>
    `;
  });
  accordionContainer.innerHTML = html;

  setupAdminSyncAndBackupPanels();
}

/**
 * Setup additional sync panels in admin tab
 */
function setupAdminSyncAndBackupPanels() {
  const adminView = document.getElementById("view-admin");
  if (!adminView) return;

  let extraPanels = document.getElementById("admin-extra-panels");
  if (!extraPanels) {
    extraPanels = document.createElement("div");
    extraPanels.id = "admin-extra-panels";
    adminView.appendChild(extraPanels);
  }

  // Generate Spectator shareable URL
  const spectatorUrl = state.syncId ? `${window.location.origin}${window.location.pathname}?syncId=${state.syncId}` : '';

  extraPanels.innerHTML = `
    <!-- Remote Sync Panel -->
    <div class="card glass-panel" style="margin-top: 16px;">
      <div class="card-title">🌐 Live Remote Syncing</div>
      <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">
        Enable live syncing to stream the standings to spectators in real-time. Share the unique read-only link below so players can check group standings from their courts!
      </div>
      
      ${state.syncId ? `
        <div class="form-group">
          <label>Spectator Shareable Link</label>
          <div style="display:flex; gap:8px; margin-top:6px;">
            <input type="text" class="form-input" id="sync-shareable-url" value="${spectatorUrl}" readonly style="background:var(--bg-primary); cursor:pointer;">
            <button class="btn btn-primary" id="btn-copy-sync-url">Copy Link</button>
          </div>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:12px;">
          <span style="font-size: 0.75rem; color: var(--accent-success); display:flex; align-items:center; gap:6px;">
            <span class="sync-active-indicator"></span> Sync Session Active ${state.isSyncing ? '(Syncing...)' : ''}
          </span>
          <button class="btn btn-danger" id="btn-disable-sync" style="font-size: 0.7rem;">Stop Remote Sync</button>
        </div>
      ` : `
        <div style="display:flex; justify-content:flex-end;">
          <button class="btn btn-primary" id="btn-enable-sync" style="font-size:0.75rem;">⚡ Enable Live Remote Sync</button>
        </div>
      `}
    </div>

    <!-- Backup Import/Export Panel -->
    <div class="card glass-panel" style="margin-top: 16px;">
      <div class="card-title">💾 Backup & Recovery</div>
      <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom:12px;">
        Backup your tournament configuration and scores, or restore them from a previous backup file.
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn" id="btn-export-backup" style="font-size:0.75rem;">📤 Export Data (JSON)</button>
        <button class="btn" id="btn-trigger-import" style="font-size:0.75rem;">📥 Import Data</button>
        <input type="file" id="import-file-input" accept=".json" style="display:none;">
      </div>
    </div>
  `;

  // Attach button event listeners
  const btnEnableSync = document.getElementById("btn-enable-sync");
  if (btnEnableSync) {
    btnEnableSync.addEventListener("click", async () => {
      showToast("Activating sync session...");
      const syncId = await enableRemoteSync();
      showToast(`Sync activated! Share the link with players.`);
      renderAdmin();
    });
  }

  const btnDisableSync = document.getElementById("btn-disable-sync");
  if (btnDisableSync) {
    btnDisableSync.addEventListener("click", () => {
      showConfirmModal(
        "Disable Remote Sync?",
        "Are you sure you want to stop syncing live tournament results? The shareable link will stop updating.",
        () => {
          disableRemoteSync();
          showToast("Sync session disabled.");
          renderAdmin();
        }
      );
    });
  }

  const btnCopySync = document.getElementById("btn-copy-sync-url");
  if (btnCopySync) {
    btnCopySync.addEventListener("click", () => {
      const copyInput = document.getElementById("sync-shareable-url");
      if (copyInput) {
        copyInput.select();
        copyInput.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(copyInput.value);
        showToast("Spectator link copied to clipboard!");
      }
    });
  }

  const btnExport = document.getElementById("btn-export-backup");
  if (btnExport) {
    btnExport.addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `tournament_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Tournament JSON backup downloaded.");
    });
  }

  const btnTriggerImport = document.getElementById("btn-trigger-import");
  const importFileInput = document.getElementById("import-file-input");
  
  if (btnTriggerImport && importFileInput) {
    btnTriggerImport.addEventListener("click", () => {
      importFileInput.click();
    });

    importFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported.teams && imported.matches) {
            showConfirmModal(
              "Import Tournament State?",
              "Are you sure you want to restore state? This will completely overwrite all teams, matches, and logs. It cannot be undone.",
              () => {
                state.teams = imported.teams;
                state.matches = imported.matches;
                state.undoStack = imported.undoStack || [];
                saveState();
                recalculateAll(state);
                renderUI();
                showToast("Tournament state restored successfully!");
              }
            );
          } else {
            showToast("Invalid JSON backup structure!", true);
          }
        } catch (err) {
          showToast("Failed to parse JSON file!", true);
        }
      };
      reader.readAsText(file);
    });
  }
}

/**
 * Creates search input HTML dynamically above target containers
 */
function setupSearchInput(viewId, callback, currentVal, placeholder) {
  const viewPanel = document.getElementById(viewId);
  if (!viewPanel) return;

  let searchWrapper = viewPanel.querySelector(".search-wrapper");
  if (!searchWrapper) {
    searchWrapper = document.createElement("div");
    searchWrapper.className = "search-wrapper";
    searchWrapper.style.marginBottom = "12px";
    
    // Insert search bar at the very beginning of the tab
    viewPanel.prepend(searchWrapper);
  }

  searchWrapper.innerHTML = `
    <div style="position:relative; display:flex; width:100%;">
      <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); font-size:0.9rem;">🔍</span>
      <input type="text" class="form-input search-input" style="padding-left:36px; font-size:0.8rem;" placeholder="${placeholder}" value="${currentVal}">
      ${currentVal ? `<button class="search-clear-btn" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-muted); cursor:pointer;">×</button>` : ''}
    </div>
  `;

  const input = searchWrapper.querySelector(".search-input");
  input.addEventListener("input", (e) => {
    callback(e.target.value);
  });

  const clearBtn = searchWrapper.querySelector(".search-clear-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      callback("");
    });
  }
}

/**
 * Helper to get a team name
 */
export function getMatchTeamName(match, teamKey) {
  if (match.stage === "Group Stage") {
    const tid = teamKey === 'A' ? match.teamAId : match.teamBId;
    return state.teams[tid]?.name || "Team";
  } else {
    const ph = teamKey === 'A' ? match.teamAPlaceholder : match.teamBPlaceholder;
    const tid = resolvePlaceholder(ph, state.matches, state.teams);
    return tid ? state.teams[tid].name : ph;
  }
}

function getMatchTeamPlayers(match, teamKey) {
  if (match.stage === "Group Stage") {
    const tid = teamKey === 'A' ? match.teamAId : match.teamBId;
    return state.teams[tid]?.players || "";
  } else {
    const ph = teamKey === 'A' ? match.teamAPlaceholder : match.teamBPlaceholder;
    const tid = resolvePlaceholder(ph, state.matches, state.teams);
    return tid ? state.teams[tid].players : "";
  }
}

/**
 * Render single match card HTML (with timer dashboard hooks)
 */
function renderMatchCardHTML(match) {
  const isPlayable = isMatchPlayable(match, state.matches, state.teams);
  
  let teamAName = "TBD";
  let teamAPlayers = "";
  let teamBName = "TBD";
  let teamBPlayers = "";
  
  if (match.stage === "Group Stage") {
    teamAName = state.teams[match.teamAId]?.name || "Team A";
    teamAPlayers = state.teams[match.teamAId]?.players || "";
    teamBName = state.teams[match.teamBId]?.name || "Team B";
    teamBPlayers = state.teams[match.teamBId]?.players || "";
  } else {
    const tAId = resolvePlaceholder(match.teamAPlaceholder, state.matches, state.teams);
    const tBId = resolvePlaceholder(match.teamBPlaceholder, state.matches, state.teams);
    
    if (tAId) {
      teamAName = state.teams[tAId].name;
      teamAPlayers = state.teams[tAId].players;
    } else {
      teamAName = match.teamAPlaceholder;
    }
    
    if (tBId) {
      teamBName = state.teams[tBId].name;
      teamBPlayers = state.teams[tBId].players;
    } else {
      teamBName = match.teamBPlaceholder;
    }
  }

  // Status badges
  let statusBadge = "";
  let cardClass = "";
  if (match.status === "Not Started") {
    statusBadge = `<span class="badge badge-gray">Not Started</span>`;
  } else if (match.status === "In Progress") {
    statusBadge = `<span class="badge badge-orange">In Progress</span>`;
    cardClass = "in-progress";
  } else if (match.status === "Completed") {
    statusBadge = `<span class="badge badge-green">Completed</span>`;
    cardClass = "completed";
  }

  const isEditing = match._isEditing === true || match.status === "Not Started" || match.status === "In Progress";
  const showInputs = isEditing && isPlayable && state.isAdmin;

  let scoreAVal = match.scoreA !== null ? match.scoreA : "";
  let scoreBVal = match.scoreB !== null ? match.scoreB : "";

  let winnerAClass = "";
  let winnerBClass = "";
  if (match.status === "Completed") {
    if (parseInt(match.scoreA) > parseInt(match.scoreB)) {
      winnerAClass = "winner";
      winnerBClass = "loser";
    } else if (parseInt(match.scoreA) < parseInt(match.scoreB)) {
      winnerAClass = "loser";
      winnerBClass = "winner";
    }
  }

  // Render search highlight styles
  const highlightName = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, `<mark class="search-highlight">$1</mark>`);
  };

  const nameADisp = highlightName(teamAName, scheduleSearchQuery);
  const nameBDisp = highlightName(teamBName, scheduleSearchQuery);
  const playersADisp = highlightName(teamAPlayers, scheduleSearchQuery);
  const playersBDisp = highlightName(teamBPlayers, scheduleSearchQuery);

  // Stopwatch controls for active matches
  const stopwatchHtml = renderStopwatchHTML(match.id, match.status);

  return `
    <div class="match-card glass-panel ${cardClass}" id="match-card-${match.id}">
      <div class="match-top">
        <div>
          <span style="font-weight: 700; color: var(--text-primary); margin-right: 4px;">${match.timeSlot}</span>
          <span class="court-badge">Court ${match.court}</span>
          <span style="margin-left: 6px; font-weight: 500;">${match.stage} ${match.group ? `(${match.group})` : ''}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          ${stopwatchHtml}
          ${statusBadge}
        </div>
      </div>
      
      <div class="match-teams">
        <div class="team-row">
          <div class="team-name-info">
            <span class="team-display-name">${nameADisp}</span>
            <span class="team-display-players">${playersADisp}</span>
          </div>
          <div>
            ${showInputs ? 
              `<input type="number" class="match-score-input" id="score-a-${match.id}" value="${scoreAVal}" min="0">` : 
              `<span class="score-display-value ${winnerAClass}">${match.scoreA !== null ? match.scoreA : '-'}</span>`
            }
          </div>
        </div>
        
        <div class="team-row">
          <div class="team-name-info">
            <span class="team-display-name">${nameBDisp}</span>
            <span class="team-display-players">${playersBDisp}</span>
          </div>
          <div>
            ${showInputs ? 
              `<input type="number" class="match-score-input" id="score-b-${match.id}" value="${scoreBVal}" min="0">` : 
              `<span class="score-display-value ${winnerBClass}">${match.scoreB !== null ? match.scoreB : '-'}</span>`
            }
          </div>
        </div>
      </div>
      
      ${!isPlayable ? `
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 10px; font-style: italic;">
          🔒 Awaiting qualified teams to unlock.
        </div>
      ` : state.isAdmin ? `
        <div class="match-actions">
          ${showInputs ? `
            <button class="btn btn-primary btn-save" data-match-id="${match.id}">
              💾 Save
            </button>
            ${match.status === "In Progress" ? `
              <button class="btn btn-danger btn-reset" data-match-id="${match.id}">
                ↩️ Reset Match
              </button>
            ` : `
              <button class="btn btn-reset" style="background:none; border:none; color:var(--text-muted);" data-match-id="${match.id}">
                Clear
              </button>
            `}
          ` : `
            <button class="btn btn-edit" data-match-id="${match.id}">
              ✏️ Edit Score
            </button>
            <button class="btn btn-danger btn-reset" data-match-id="${match.id}">
              ↩️ Reset
            </button>
          `}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render standings table HTML block
 */
function renderStandingsTableHTML(title, standings, highlightCount, isSuperGroup = false) {
  let rowsHtml = "";
  
  if (standings.length === 0) {
    rowsHtml = `<tr><td colspan="10" class="empty-state" style="padding: 20px 0;">No active teams qualified or resolved yet.</td></tr>`;
  } else {
    standings.forEach((entry, idx) => {
      const rank = idx + 1;
      const team = state.teams[entry.teamId];
      const name = team?.name || "Team";
      const players = team?.players || "";
      
      let rowClass = "";
      if (rank <= highlightCount) {
        rowClass = isSuperGroup ? "finalist-row" : "qualifying-row";
      }

      // Highlighting search terms
      const highlightName = (text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, "gi");
        return text.replace(regex, `<mark class="search-highlight">$1</mark>`);
      };

      const nameDisp = highlightName(name, standingsSearchQuery);
      const playersDisp = highlightName(players, standingsSearchQuery);

      rowsHtml += `
        <tr class="${rowClass}">
          <td class="col-pos">${rank}</td>
          <td class="col-team">
            ${nameDisp}
            <span class="team-players-sub">${playersDisp}</span>
          </td>
          <td class="col-played">${entry.played}</td>
          <td class="col-won">${entry.won}</td>
          <td class="col-drawn">${entry.drawn}</td>
          <td class="col-lost">${entry.lost}</td>
          <td class="col-pf">${entry.pf}</td>
          <td class="col-pa">${entry.pa}</td>
          <td class="col-pd" style="font-weight:600; color:${entry.pd > 0 ? 'var(--accent-success)' : entry.pd < 0 ? '#ff453a' : 'inherit'};">${entry.pd > 0 ? '+' : ''}${entry.pd}</td>
          <td class="col-pts">${entry.pts}</td>
        </tr>
      `;
    });
  }

  return `
    <div class="card glass-panel" style="margin-bottom:0; padding:12px;">
      <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; display:flex; justify-content:space-between; align-items:center;">
        <span>${title}</span>
        ${highlightCount > 0 ? `<span style="font-size: 0.7rem; font-weight:500; opacity:0.8; color:${isSuperGroup ? 'var(--accent-gold)' : 'var(--accent-success)'};">${isSuperGroup ? '★ Top 1 to Final' : '★ Top 1 to Super 6'}</span>` : ''}
      </div>
      <div class="standings-table-wrapper">
        <table class="standings-table">
          <thead>
            <tr>
              <th class="col-pos">#</th>
              <th style="text-align:left;">Team</th>
              <th class="col-played">P</th>
              <th class="col-won">W</th>
              <th class="col-drawn">D</th>
              <th class="col-lost">L</th>
              <th class="col-pf">PF</th>
              <th class="col-pa">PA</th>
              <th class="col-pd">PD</th>
              <th class="col-pts">Pts</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Attaches click event listeners to match cards inside list
 */
function attachCardListeners(matchesList) {
  matchesList.forEach(m => {
    const card = document.getElementById(`match-card-${m.id}`);
    if (!card) return;

    // Save Button
    const saveBtn = card.querySelector(".btn-save");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const inputA = document.getElementById(`score-a-${m.id}`);
        const inputB = document.getElementById(`score-b-${m.id}`);
        
        const scoreAVal = inputA.value.trim();
        const scoreBVal = inputB.value.trim();
        
        if (scoreAVal === "" || scoreBVal === "") {
          showToast("Please enter scores for both teams!", true);
          return;
        }

        const scoreA = parseInt(scoreAVal);
        const scoreB = parseInt(scoreBVal);
        
        if (isNaN(scoreA) || isNaN(scoreB) || scoreA < 0 || scoreB < 0) {
          showToast("Please enter valid positive integers!", true);
          return;
        }

        // Limit scores to a maximum of 11 points
        if (scoreA > 11 || scoreB > 11) {
          showToast("Scores cannot exceed 11 points!", true);
          return;
        }

        // Draw prevention in final match
        if (m.stage === "Finals" && scoreA === scoreB) {
          showToast("Draw is not allowed in Finals! Set a tiebreaker winner.", true);
          return;
        }

        if (actions.onSaveScore) {
          actions.onSaveScore(m.id, scoreA, scoreB);
        }
      });
    }

    // Edit Button
    const editBtn = card.querySelector(".btn-edit");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        const matchObj = state.matches.find(x => x.id === m.id);
        if (matchObj) {
          matchObj._isEditing = true;
          renderUI();
        }
      });
    }

    // Reset Button
    const resetBtn = card.querySelector(".btn-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (m.status === "Completed") {
          showConfirmModal(
            "Reset Match Score?",
            `Are you sure you want to reset the match between ${getMatchTeamName(m, 'A')} and ${getMatchTeamName(m, 'B')}? This will clear the score and set it to Not Started.`,
            () => {
              if (actions.onResetMatch) actions.onResetMatch(m.id);
            }
          );
        } else {
          if (actions.onResetMatch) actions.onResetMatch(m.id);
        }
      });
    }

    // Input listening to automatically set In Progress status
    const inputs = card.querySelectorAll(".match-score-input");
    inputs.forEach(input => {
      input.addEventListener("input", () => {
        const matchObj = state.matches.find(x => x.id === m.id);
        if (matchObj && matchObj.status === "Not Started") {
          matchObj.status = "In Progress";
          saveState();
          // Update live status badge and card styling locally without full render
          const badgeContainer = card.querySelector(".match-top div:last-child");
          if (badgeContainer) {
            badgeContainer.innerHTML = `<span class="badge badge-orange">In Progress</span>`;
          }
          card.className = "match-card glass-panel in-progress";
        }
      });
    });

    // Stopwatch Controls
    const startPauseBtn = card.querySelector(".timer-start-pause");
    if (startPauseBtn) {
      startPauseBtn.addEventListener("click", () => {
        toggleStopwatch(m.id);
      });
    }

    const resetTimerBtn = card.querySelector(".timer-reset-control");
    if (resetTimerBtn) {
      resetTimerBtn.addEventListener("click", () => {
        resetStopwatch(m.id);
      });
    }
  });
}

/**
 * Stopwatch HTML Generator
 */
function renderStopwatchHTML(matchId, status) {
  if (status !== "In Progress") {
    // Clean up interval if match status changed away from In Progress
    if (matchTimers[matchId]?.intervalId) {
      clearInterval(matchTimers[matchId].intervalId);
      delete matchTimers[matchId];
    }
    return '';
  }

  // Initialize if not present
  if (!matchTimers[matchId]) {
    matchTimers[matchId] = {
      remainingSeconds: 12 * 60, // 12 minutes
      isRunning: false,
      intervalId: null
    };
  }

  const timer = matchTimers[matchId];
  const minutes = Math.floor(timer.remainingSeconds / 60);
  const seconds = timer.remainingSeconds % 60;
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const isFinished = timer.remainingSeconds === 0;

  return `
    <div class="match-stopwatch ${isFinished ? 'finished' : ''}" id="timer-display-${matchId}">
      <span class="timer-digits">${timeStr}</span>
      ${state.isAdmin ? `
        <button class="timer-btn timer-start-pause" title="Play/Pause">${timer.isRunning ? '⏸️' : '▶️'}</button>
        <button class="timer-btn timer-reset-control" title="Reset/Fast Forward">↩️</button>
      ` : ''}
    </div>
  `;
}

/**
 * Toggle Stopwatch State (Run / Pause)
 */
function toggleStopwatch(matchId) {
  const timer = matchTimers[matchId];
  if (!timer) return;

  if (timer.isRunning) {
    // Pause
    clearInterval(timer.intervalId);
    timer.isRunning = false;
    timer.intervalId = null;
  } else {
    // Start
    timer.isRunning = true;
    timer.intervalId = setInterval(() => {
      if (timer.remainingSeconds > 0) {
        timer.remainingSeconds--;
        updateStopwatchDigits(matchId);
      } else {
        // Timer completed!
        clearInterval(timer.intervalId);
        timer.isRunning = false;
        timer.intervalId = null;
        
        playBuzzer();
        updateStopwatchDigits(matchId);
        showToast(`Buzzer! Match timer has run out.`, false);
      }
    }, 1000);
  }

  // Redraw the control button without full layout refresh
  const timerDiv = document.getElementById(`timer-display-${matchId}`);
  if (timerDiv) {
    const playBtn = timerDiv.querySelector(".timer-start-pause");
    if (playBtn) playBtn.innerHTML = timer.isRunning ? '⏸️' : '▶️';
  }
}

/**
 * Reset Stopwatch
 */
function resetStopwatch(matchId) {
  const timer = matchTimers[matchId];
  if (!timer) return;

  // If already at 12 minutes, allow fast-forwarding to 5 seconds for testing purposes
  if (timer.remainingSeconds === 12 * 60) {
    timer.remainingSeconds = 5; // Fast forward to 5s for quick verification
  } else {
    timer.remainingSeconds = 12 * 60;
  }

  if (timer.isRunning) {
    clearInterval(timer.intervalId);
    timer.isRunning = false;
    timer.intervalId = null;
  }
  
  updateStopwatchDigits(matchId);
  
  const timerDiv = document.getElementById(`timer-display-${matchId}`);
  if (timerDiv) {
    const playBtn = timerDiv.querySelector(".timer-start-pause");
    if (playBtn) playBtn.innerHTML = '▶️';
    timerDiv.classList.remove("finished");
  }
}

function updateStopwatchDigits(matchId) {
  const timer = matchTimers[matchId];
  if (!timer) return;

  const timerDiv = document.getElementById(`timer-display-${matchId}`);
  if (timerDiv) {
    const digitsEl = timerDiv.querySelector(".timer-digits");
    const minutes = Math.floor(timer.remainingSeconds / 60);
    const seconds = timer.remainingSeconds % 60;
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (digitsEl) digitsEl.innerText = timeStr;

    if (timer.remainingSeconds === 0) {
      timerDiv.classList.add("finished");
    } else {
      timerDiv.classList.remove("finished");
    }
  }
}

/**
 * Web Audio API Buzzer sound
 */
export function playBuzzer() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, audioCtx.currentTime); // low pitch sports buzzer
    osc.frequency.linearRampToValueAtTime(105, audioCtx.currentTime + 1.2);
    
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
  } catch (err) {
    console.error("Synthesizer failed to play buzzer:", err);
  }
}

/**
 * Fullscreen celebration confetti
 */
export function triggerConfetti() {
  try {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      window.confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 }
      });
      window.confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  } catch (err) {
    console.error("Confetti script failed to fire:", err);
  }
}

/**
 * Confirmation Modal handlers
 */
let currentModalConfirmAction = null;
export function showConfirmModal(title, body, confirmAction) {
  const modal = document.getElementById("confirm-modal");
  const titleText = document.getElementById("modal-title-text");
  const bodyText = document.getElementById("modal-body-text");
  
  if (modal && titleText && bodyText) {
    titleText.innerText = title;
    bodyText.innerText = body;
    currentModalConfirmAction = confirmAction;
    modal.classList.add("active");
  }
}

export function setupModalHandlers() {
  const modal = document.getElementById("confirm-modal");
  const cancelBtn = document.getElementById("modal-cancel-btn");
  const confirmBtn = document.getElementById("modal-confirm-btn");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      modal.classList.remove("active");
      currentModalConfirmAction = null;
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (currentModalConfirmAction) {
        currentModalConfirmAction();
      }
      modal.classList.remove("active");
      currentModalConfirmAction = null;
    });
  }
}

/**
 * Toast System
 */
export function showToast(message, isError = false) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  if (isError) {
    toast.style.borderLeftColor = "var(--accent-danger)";
    toast.style.background = "#2b1313";
  }

  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 3000);
}

export function showUndoToast(message, undoCallback) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  // Clear existing undo toasts
  const existing = container.querySelectorAll(".toast-undo");
  existing.forEach(t => t.remove());

  const toast = document.createElement("div");
  toast.className = "toast toast-undo";
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-btn" id="toast-undo-btn">↩️ Undo</button>
  `;

  container.appendChild(toast);

  const undoBtn = toast.querySelector("#toast-undo-btn");
  if (undoBtn) {
    undoBtn.addEventListener("click", () => {
      undoCallback();
      toast.remove();
    });
  }

  setTimeout(() => {
    toast.classList.add("fade-out");
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 6000);
}
