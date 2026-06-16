// app.js

// 1. DEFAULT CONFIGURATIONS
const DEFAULT_TEAMS = {
  // Group A
  "team-a1": { name: "Team Name", players: "Kishan Patel, Harshdipsinh Zala", contact: "8140844597", group: "A" },
  "team-a2": { name: "Season Champ", players: "Jignesh, Malav Shah", contact: "9898290741", group: "A" },
  "team-a3": { name: "Double Trouble", players: "Gagan, Jeet", contact: "8320460732", group: "A" },
  
  // Group B
  "team-b1": { name: "Net Ninjas", players: "Gaurav Agrawal, Prakhar Sharma", contact: "9509739797", group: "B" },
  "team-b2": { name: "Smashers4", players: "Dhairya Modi, Palash Khanna", contact: "9998221188", group: "B" },
  "team-b3": { name: "Mission Impickleball", players: "Harsh Sakhwala, Parth Sorathiya", contact: "8849801477", group: "B" },
  
  // Group C
  "team-c1": { name: "Smashers", players: "Rahul Tak, Ankit Patel", contact: "7665619259", group: "C" },
  "team-c2": { name: "Dink Dynasty", players: "Krish Vyas, Parthraj Makwana", contact: "8200256563", group: "C" },
  "team-c3": { name: "Team-Harmony", players: "Harsh Agrawal, Nitin Upadhyay", contact: "7987761142", group: "C" },
  
  // Group D
  "team-d1": { name: "Kingfisher Pickers", players: "Akash Nandaniya, Rishabh Chauhan", contact: "8530515668", group: "D" },
  "team-d2": { name: "DSR Mavericks", players: "Ravi Trivedi, Ayush Carpenter", contact: "9723642855", group: "D" },
  "team-d3": { name: "Straw Hats", players: "Pranjal Singh, Nayan Dhote", contact: "9528340569", group: "D" },
  
  // Group E
  "team-e1": { name: "OGs", players: "Gaurav Chandak, Rohil Mistry", contact: "9033511380", group: "E" },
  "team-e2": { name: "Mid-Court Crisis", players: "Pankil Doshi, Yash Raj Singh Chouhan", contact: "7742557889", group: "E" },
  "team-e3": { name: "Aata Maaji Satakli", players: "Akshat Modi, Vashu Khanpara", contact: "6266974651", group: "E" },
  
  // Group F
  "team-f1": { name: "Smashers-2", players: "Fenil Kanani, Ojas Brahmbhatt", contact: "9586103003", group: "F" },
  "team-f2": { name: "Smash and Dash", players: "Pratham Kansara, Brijesh Patel", contact: "9586313256", group: "F" },
  "team-f3": { name: "Guruji Ke Anmol Ratna", players: "Savan Panchal, Dhruv Nakrani", contact: "9106592900", group: "F" },
};

const DEFAULT_MATCHES = [
  // 6:00 - 6:12
  { id: "g-1", timeSlot: "6:00 - 6:12", court: 1, stage: "Group Stage", group: "A", teamAId: "team-a1", teamBId: "team-a2", scoreA: null, scoreB: null, status: "Not Started" },
  { id: "g-2", timeSlot: "6:00 - 6:12", court: 2, stage: "Group Stage", group: "B", teamAId: "team-b1", teamBId: "team-b2", scoreA: null, scoreB: null, status: "Not Started" },
  { id: "g-3", timeSlot: "6:00 - 6:12", court: 3, stage: "Group Stage", group: "C", teamAId: "team-c1", teamBId: "team-c2", scoreA: null, scoreB: null, status: "Not Started" },

  // 6:12 - 6:24
  { id: "g-4", timeSlot: "6:12 - 6:24", court: 1, stage: "Group Stage", group: "D", teamAId: "team-d1", teamBId: "team-d2", scoreA: null, scoreB: null, status: "Not Started" },
  { id: "g-5", timeSlot: "6:12 - 6:24", court: 2, stage: "Group Stage", group: "E", teamAId: "team-e1", teamBId: "team-e2", scoreA: null, scoreB: null, status: "Not Started" },
  { id: "g-6", timeSlot: "6:12 - 6:24", court: 3, stage: "Group Stage", group: "F", teamAId: "team-f1", teamBId: "team-f2", scoreA: null, scoreB: null, status: "Not Started" },

  // 6:24 - 6:36
  { id: "g-7", timeSlot: "6:24 - 6:36", court: 1, stage: "Group Stage", group: "A", teamAId: "team-a2", teamBId: "team-a3", scoreA: null, scoreB: null, status: "Not Started" },
  { id: "g-8", timeSlot: "6:24 - 6:36", court: 2, stage: "Group Stage", group: "B", teamAId: "team-b2", teamBId: "team-b3", scoreA: null, scoreB: null, status: "Not Started" },
  { id: "g-9", timeSlot: "6:24 - 6:36", court: 3, stage: "Group Stage", group: "C", teamAId: "team-c2", teamBId: "team-c3", scoreA: null, scoreB: null, status: "Not Started" },

  // 6:36 - 6:48
  { id: "g-10", timeSlot: "6:36 - 6:48", court: 1, stage: "Group Stage", group: "D", teamAId: "team-d2", teamBId: "team-d3", scoreA: null, scoreB: null, status: "Not Started" },
  { id: "g-11", timeSlot: "6:36 - 6:48", court: 2, stage: "Group Stage", group: "E", teamAId: "team-e2", teamBId: "team-e3", scoreA: null, scoreB: null, status: "Not Started" },
  { id: "g-12", timeSlot: "6:36 - 6:48", court: 3, stage: "Group Stage", group: "F", teamAId: "team-f2", teamBId: "team-f3", scoreA: null, scoreB: null, status: "Not Started" },

  // 6:48 - 7:00
  { id: "g-13", timeSlot: "6:48 - 7:00", court: 1, stage: "Group Stage", group: "A", teamAId: "team-a1", teamBId: "team-a3", scoreA: null, scoreB: null, status: "Not Started" },
  { id: "g-14", timeSlot: "6:48 - 7:00", court: 2, stage: "Group Stage", group: "B", teamAId: "team-b1", teamBId: "team-b3", scoreA: null, scoreB: null, status: "Not Started" },
  { id: "g-15", timeSlot: "6:48 - 7:00", court: 3, stage: "Group Stage", group: "C", teamAId: "team-c1", teamBId: "team-c3", scoreA: null, scoreB: null, status: "Not Started" },

  // 7:00 - 7:12
  { id: "g-16", timeSlot: "7:00 - 7:12", court: 1, stage: "Group Stage", group: "D", teamAId: "team-d1", teamBId: "team-d3", scoreA: null, scoreB: null, status: "Not Started" },
  { id: "g-17", timeSlot: "7:00 - 7:12", court: 2, stage: "Group Stage", group: "E", teamAId: "team-e1", teamBId: "team-e3", scoreA: null, scoreB: null, status: "Not Started" },
  { id: "g-18", timeSlot: "7:00 - 7:12", court: 3, stage: "Group Stage", group: "F", teamAId: "team-f1", teamBId: "team-f3", scoreA: null, scoreB: null, status: "Not Started" },

  // Super 6 Stage
  // 7:12 - 7:24
  { id: "s-1", timeSlot: "7:12 - 7:24", court: 1, stage: "Super 6", group: "X", teamAPlaceholder: "Winner A", teamBPlaceholder: "Winner C", scoreA: null, scoreB: null, status: "Not Started" },
  { id: "s-2", timeSlot: "7:12 - 7:24", court: 2, stage: "Super 6", group: "Y", teamAPlaceholder: "Winner B", teamBPlaceholder: "Winner D", scoreA: null, scoreB: null, status: "Not Started" },
  
  // 7:24 - 7:36
  { id: "s-3", timeSlot: "7:24 - 7:36", court: 1, stage: "Super 6", group: "X", teamAPlaceholder: "Winner C", teamBPlaceholder: "Winner E", scoreA: null, scoreB: null, status: "Not Started" },
  { id: "s-4", timeSlot: "7:24 - 7:36", court: 2, stage: "Super 6", group: "Y", teamAPlaceholder: "Winner D", teamBPlaceholder: "Winner F", scoreA: null, scoreB: null, status: "Not Started" },
  
  // 7:36 - 7:48
  { id: "s-5", timeSlot: "7:36 - 7:48", court: 1, stage: "Super 6", group: "X", teamAPlaceholder: "Winner E", teamBPlaceholder: "Winner A", scoreA: null, scoreB: null, status: "Not Started" },
  { id: "s-6", timeSlot: "7:36 - 7:48", court: 2, stage: "Super 6", group: "Y", teamAPlaceholder: "Winner F", teamBPlaceholder: "Winner B", scoreA: null, scoreB: null, status: "Not Started" },

  // Finals
  // 7:48 - 8:10
  { id: "f-1", timeSlot: "7:48 - 8:10", court: 1, stage: "Finals", teamAPlaceholder: "Winner Super Group X", teamBPlaceholder: "Winner Super Group Y", scoreA: null, scoreB: null, status: "Not Started" },
];

const STORAGE_KEY = "live_tournament_state";

// 2. STATE MANAGER
let state = {
  teams: {},
  matches: [],
  undoStack: []
};

// 3. INITIALIZATION
function init() {
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (savedState) {
    try {
      state = JSON.parse(savedState);
      // Ensure arrays/objects exist
      if (!state.teams || typeof state.teams !== "object") state.teams = { ...DEFAULT_TEAMS };
      if (!state.matches || !Array.isArray(state.matches)) state.matches = JSON.parse(JSON.stringify(DEFAULT_MATCHES));
      if (!state.undoStack || !Array.isArray(state.undoStack)) state.undoStack = [];
    } catch (e) {
      console.error("Failed to parse saved state, loading defaults", e);
      loadDefaults();
    }
  } else {
    loadDefaults();
  }
  recalculateAll();
  switchTab("dashboard");
  setupFilters();
  setupModalHandlers();
}

function loadDefaults() {
  state.teams = JSON.parse(JSON.stringify(DEFAULT_TEAMS));
  state.matches = JSON.parse(JSON.stringify(DEFAULT_MATCHES));
  state.undoStack = [];
  saveState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// 4. CALCULATION ENGINE
let standingsCached = {};
let winnersCached = {
  groups: {},
  superGroups: {},
  champion: null
};

// Check if a stage/group is fully complete
function isGroupCompleted(groupName) {
  const groupMatches = state.matches.filter(m => m.stage === "Group Stage" && m.group === groupName);
  return groupMatches.length > 0 && groupMatches.every(m => m.status === "Completed");
}

function isSuperGroupCompleted(groupName) {
  // Must have 3 completed matches in that super group AND all parent groups must be completed
  const sgMatches = state.matches.filter(m => m.stage === "Super 6" && m.group === groupName);
  const allMatchesCompleted = sgMatches.length === 3 && sgMatches.every(m => m.status === "Completed");
  
  const parentGroups = groupName === "X" ? ["A", "C", "E"] : ["B", "D", "F"];
  const parentsResolved = parentGroups.every(g => isGroupCompleted(g));
  
  return allMatchesCompleted && parentsResolved;
}

function resolvePlaceholder(placeholder) {
  if (placeholder === "Winner A") return getGroupWinnerId("A");
  if (placeholder === "Winner B") return getGroupWinnerId("B");
  if (placeholder === "Winner C") return getGroupWinnerId("C");
  if (placeholder === "Winner D") return getGroupWinnerId("D");
  if (placeholder === "Winner E") return getGroupWinnerId("E");
  if (placeholder === "Winner F") return getGroupWinnerId("F");
  if (placeholder === "Winner Super Group X") return getSuperGroupWinnerId("X");
  if (placeholder === "Winner Super Group Y") return getSuperGroupWinnerId("Y");
  return null;
}

function getGroupWinnerId(groupName) {
  if (!isGroupCompleted(groupName)) return null;
  const groupMatches = state.matches.filter(m => m.stage === "Group Stage" && m.group === groupName);
  const teamIds = Object.keys(state.teams).filter(tid => state.teams[tid].group === groupName);
  const standings = calculateStandings(groupMatches, teamIds);
  return standings[0]?.teamId || null;
}

function getSuperGroupWinnerId(groupName) {
  if (!isSuperGroupCompleted(groupName)) return null;
  
  const groups = groupName === "X" ? ["A", "C", "E"] : ["B", "D", "F"];
  const teamIds = groups.map(g => getGroupWinnerId(g)).filter(id => id !== null);
  
  const sgMatches = state.matches.filter(m => m.stage === "Super 6" && m.group === groupName);
  const resolvedMatches = sgMatches.map(m => {
    return {
      ...m,
      resolvedTeamAId: resolvePlaceholder(m.teamAPlaceholder),
      resolvedTeamBId: resolvePlaceholder(m.teamBPlaceholder)
    };
  });
  
  const standings = calculateStandings(resolvedMatches, teamIds);
  return standings[0]?.teamId || null;
}

function calculateStandings(matchesForStage, stageTeamIds) {
  const standings = {};
  stageTeamIds.forEach(id => {
    standings[id] = {
      teamId: id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      pf: 0,
      pa: 0,
      pd: 0,
      pts: 0
    };
  });

  matchesForStage.forEach(m => {
    if (m.status === "Completed") {
      const tA = m.resolvedTeamAId || m.teamAId;
      const tB = m.resolvedTeamBId || m.teamBId;

      if (standings[tA] && standings[tB]) {
        const sA = parseInt(m.scoreA) || 0;
        const sB = parseInt(m.scoreB) || 0;

        standings[tA].played++;
        standings[tB].played++;
        standings[tA].pf += sA;
        standings[tA].pa += sB;
        standings[tA].pd += (sA - sB);
        standings[tB].pf += sB;
        standings[tB].pa += sA;
        standings[tB].pd += (sB - sA);

        if (sA > sB) {
          standings[tA].won++;
          standings[tA].pts += 3;
          standings[tB].lost++;
        } else if (sA < sB) {
          standings[tB].won++;
          standings[tB].pts += 3;
          standings[tA].lost++;
        } else {
          standings[tA].drawn++;
          standings[tA].pts += 1;
          standings[tB].drawn++;
          standings[tB].pts += 1;
        }
      }
    }
  });

  // Convert to array and sort
  return Object.values(standings).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.pd !== a.pd) return b.pd - a.pd;
    if (b.pf !== a.pf) return b.pf - a.pf;
    // Alphabetical fallback
    const nameA = state.teams[a.teamId]?.name || "";
    const nameB = state.teams[b.teamId]?.name || "";
    return nameA.localeCompare(nameB);
  });
}

function recalculateAll() {
  // 1. Group Standings
  const groups = ["A", "B", "C", "D", "E", "F"];
  standingsCached.groups = {};
  groups.forEach(g => {
    const groupMatches = state.matches.filter(m => m.stage === "Group Stage" && m.group === g);
    const teamIds = Object.keys(state.teams).filter(tid => state.teams[tid].group === g);
    standingsCached.groups[g] = calculateStandings(groupMatches, teamIds);
    winnersCached.groups[g] = getGroupWinnerId(g);
  });

  // 2. Super 6 Standings
  standingsCached.superGroups = {};
  const sgNames = ["X", "Y"];
  sgNames.forEach(sg => {
    const groupsInSg = sg === "X" ? ["A", "C", "E"] : ["B", "D", "F"];
    const teamIds = groupsInSg.map(g => winnersCached.groups[g]).filter(id => id !== null);
    
    const sgMatches = state.matches.filter(m => m.stage === "Super 6" && m.group === sg);
    const resolvedMatches = sgMatches.map(m => {
      return {
        ...m,
        resolvedTeamAId: resolvePlaceholder(m.teamAPlaceholder),
        resolvedTeamBId: resolvePlaceholder(m.teamBPlaceholder)
      };
    });
    
    standingsCached.superGroups[sg] = calculateStandings(resolvedMatches, teamIds);
    winnersCached.superGroups[sg] = getSuperGroupWinnerId(sg);
  });

  // 3. Final & Champion
  const finalMatch = state.matches.find(m => m.stage === "Finals");
  if (finalMatch) {
    const finalistX = winnersCached.superGroups["X"];
    const finalistY = winnersCached.superGroups["Y"];
    
    if (finalistX && finalistY && finalMatch.status === "Completed") {
      const sA = parseInt(finalMatch.scoreA) || 0;
      const sB = parseInt(finalMatch.scoreB) || 0;
      if (sA > sB) {
        winnersCached.champion = finalistX;
      } else if (sA < sB) {
        winnersCached.champion = finalistY;
      } else {
        // Tied finals? We can display whoever won or TBD. Let's make it so winner is determined
        winnersCached.champion = sA >= sB ? finalistX : finalistY; 
      }
    } else {
      winnersCached.champion = null;
    }
  }

  // Rerender UI
  renderUI();
}

// 5. RENDER FUNCTIONS
function renderUI() {
  const activeTabEl = document.querySelector(".tab-btn.active");
  const currentTab = activeTabEl && activeTabEl.innerText ? activeTabEl.innerText.trim().toLowerCase() : "dashboard";
  
  // Progress stat
  const totalMatches = state.matches.length;
  const completedMatches = state.matches.filter(m => m.status === "Completed").length;
  const progressPercent = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
  
  const progVal = document.getElementById("tournament-progress-val");
  if (progVal) progVal.innerText = `${progressPercent}%`;
  const progDesc = document.getElementById("tournament-progress-desc");
  if (progDesc) progDesc.innerText = `${completedMatches} of ${totalMatches} matches completed`;

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
  renderDashboardSuperGroupList("X", "super-x-teams-list");
  renderDashboardSuperGroupList("Y", "super-y-teams-list");

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

  // Champion Banner
  const champBanner = document.getElementById("champion-banner");
  const champName = document.getElementById("champion-name");
  const champPlayers = document.getElementById("champion-players");
  if (winnersCached.champion) {
    if (champBanner) champBanner.style.display = "block";
    if (champName) champName.innerText = state.teams[winnersCached.champion].name;
    if (champPlayers) champPlayers.innerText = `Players: ${state.teams[winnersCached.champion].players}`;
  } else {
    if (champBanner) champBanner.style.display = "none";
  }

  // Ongoing/upcoming matches on dashboard
  const ongoingContainer = document.getElementById("ongoing-matches-list");
  if (ongoingContainer) {
    const activeMatches = state.matches.filter(m => m.status === "In Progress" || (m.status === "Not Started" && isMatchPlayable(m))).slice(0, 3);
    if (activeMatches.length === 0) {
      ongoingContainer.innerHTML = `<div class="empty-state">No current or upcoming matches playable right now. Check schedule for details.</div>`;
    } else {
      ongoingContainer.innerHTML = activeMatches.map(m => renderMatchCardHTML(m)).join("");
      attachCardListeners(activeMatches);
    }
  }

  // Render specific tab contents
  if (currentTab === "schedule") {
    renderSchedule();
  } else if (currentTab === "standings") {
    renderStandings();
  } else if (currentTab === "admin") {
    renderAdminTeamsAccordion();
  }
}

function renderDashboardSuperGroupList(groupName, containerId) {
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

// Check if a match is ready to be played (i.e. participating teams are resolved)
function isMatchPlayable(match) {
  if (match.stage === "Group Stage") return true;
  
  // Super 6 match
  if (match.stage === "Super 6") {
    const tA = resolvePlaceholder(match.teamAPlaceholder);
    const tB = resolvePlaceholder(match.teamBPlaceholder);
    return tA !== null && tB !== null;
  }
  
  // Finals match
  if (match.stage === "Finals") {
    const tA = resolvePlaceholder(match.teamAPlaceholder);
    const tB = resolvePlaceholder(match.teamBPlaceholder);
    return tA !== null && tB !== null;
  }
  
  return false;
}

// Generate the HTML for a single match card
function renderMatchCardHTML(match) {
  const isPlayable = isMatchPlayable(match);
  
  // Resolve Team Names
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
    // Placeholders like "Winner A"
    const tAId = resolvePlaceholder(match.teamAPlaceholder);
    const tBId = resolvePlaceholder(match.teamBPlaceholder);
    
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

  // Determine Badge Status
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
  const showInputs = isEditing && isPlayable;

  let scoreAVal = match.scoreA !== null ? match.scoreA : "";
  let scoreBVal = match.scoreB !== null ? match.scoreB : "";

  // Set up values for winner styling
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

  // Check if buffer slot
  const isBuffer = match.teamAPlaceholder === "Buffer" || match.teamBPlaceholder === "Buffer";

  return `
    <div class="match-card glass-panel ${cardClass}" id="match-card-${match.id}">
      <div class="match-top">
        <div>
          <span style="font-weight: 700; color: var(--text-primary); margin-right: 4px;">${match.timeSlot}</span>
          <span class="court-badge">Court ${match.court}</span>
          <span style="margin-left: 6px; font-weight: 500;">${match.stage} ${match.group ? `(${match.group})` : ''}</span>
        </div>
        <div>${statusBadge}</div>
      </div>
      
      <div class="match-teams">
        <!-- Team A Row -->
        <div class="team-row">
          <div class="team-name-info">
            <span class="team-display-name">${teamAName}</span>
            <span class="team-display-players">${teamAPlayers}</span>
          </div>
          <div>
            ${showInputs ? 
              `<input type="number" class="match-score-input" id="score-a-${match.id}" value="${scoreAVal}" min="0">` : 
              `<span class="score-display-value ${winnerAClass}">${match.scoreA !== null ? match.scoreA : '-'}</span>`
            }
          </div>
        </div>
        
        <!-- Team B Row -->
        <div class="team-row">
          <div class="team-name-info">
            <span class="team-display-name">${teamBName}</span>
            <span class="team-display-players">${teamBPlayers}</span>
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
      ` : `
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
      `}
    </div>
  `;
}

// Attach event listeners to matches in a container
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

        saveScore(m.id, scoreA, scoreB, "Completed");
      });
    }

    // Edit Button
    const editBtn = card.querySelector(".btn-edit");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        // Find match object in state and toggle editing flag
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
        // If it's a destructive reset of a completed match, prompt or just do it? Let's prompt.
        if (m.status === "Completed") {
          showConfirmModal(
            "Reset Match Score?",
            `Are you sure you want to reset the match between ${getMatchTeamName(m, 'A')} and ${getMatchTeamName(m, 'B')}? This will clear the score and set it to Not Started.`,
            () => {
              resetMatch(m.id);
            }
          );
        } else {
          // If not started/in progress, we can just clear inputs or reset status
          resetMatch(m.id);
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
          // Update live status badge without full render to avoid keyboard unfocus
          const badgeContainer = card.querySelector(".match-top div:last-child");
          if (badgeContainer) {
            badgeContainer.innerHTML = `<span class="badge badge-orange">In Progress</span>`;
          }
          card.className = "match-card glass-panel in-progress";
        }
      });
    });
  });
}

function getMatchTeamName(match, teamKey) {
  if (match.stage === "Group Stage") {
    const tid = teamKey === 'A' ? match.teamAId : match.teamBId;
    return state.teams[tid]?.name || "Team";
  } else {
    const ph = teamKey === 'A' ? match.teamAPlaceholder : match.teamBPlaceholder;
    const tid = resolvePlaceholder(ph);
    return tid ? state.teams[tid].name : ph;
  }
}

// Render schedule view with grouping by time slot
function renderSchedule() {
  const container = document.getElementById("schedule-slots-container");
  if (!container) return;

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

  if (filteredMatches.length === 0) {
    container.innerHTML = `<div class="empty-state">No matches found for this stage.</div>`;
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

// Render standings view
function renderStandings() {
  const container = document.getElementById("standings-content");
  if (!container) return;

  const activeGroupFilter = document.querySelector(".filter-btn.active[data-standings-group]")?.getAttribute("data-standings-group") || "all";
  
  let html = "";

  // 1. Group Standings (A-F)
  if (activeGroupFilter === "all" || activeGroupFilter === "stages") {
    const groups = ["A", "B", "C", "D", "E", "F"];
    html += `<h2 style="font-size: 1.1rem; border-left: 4px solid var(--accent-primary); padding-left: 8px; margin-top: 10px; margin-bottom: 12px; color: var(--text-secondary);">Groups A - F Standings</h2>`;
    html += `<div style="display: grid; grid-template-columns: 1fr; gap: 20px; @media(min-width: 750px) { grid-template-columns: 1fr 1fr; }">`;
    
    groups.forEach(g => {
      const standings = standingsCached.groups[g];
      html += renderStandingsTableHTML(`Group ${g}`, standings, 1); // Highlight top 1 team
    });
    
    html += `</div>`;
  }

  // 2. Super Group Standings (X & Y)
  if (activeGroupFilter === "all" || activeGroupFilter === "super6") {
    const sgNames = ["X", "Y"];
    html += `<h2 style="font-size: 1.1rem; border-left: 4px solid var(--accent-gold); padding-left: 8px; margin-top: 24px; margin-bottom: 12px; color: var(--text-secondary);">Super 6 Standings</h2>`;
    html += `<div style="display: grid; grid-template-columns: 1fr; gap: 20px; @media(min-width: 750px) { grid-template-columns: 1fr 1fr; }">`;
    
    sgNames.forEach(sg => {
      const standings = standingsCached.superGroups[sg];
      html += renderStandingsTableHTML(`Super Group ${sg}`, standings, 1, true); // Highlight top 1 team (finalist)
    });
    
    html += `</div>`;
  }

  container.innerHTML = html;
}

function renderStandingsTableHTML(title, standings, highlightCount, isSuperGroup = false) {
  let rowsHtml = "";
  
  if (standings.length === 0) {
    rowsHtml = `<tr><td colspan="9" class="empty-state" style="padding: 20px 0;">No active teams qualified or resolved yet.</td></tr>`;
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

      rowsHtml += `
        <tr class="${rowClass}">
          <td class="col-pos">${rank}</td>
          <td class="col-team">
            ${name}
            <span class="team-players-sub">${players}</span>
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

// Render Teams Accordion under Admin Panel
function renderAdminTeamsAccordion() {
  const container = document.getElementById("admin-teams-accordion");
  if (!container) return;

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

  container.innerHTML = html;
}

function toggleAccordion(key) {
  const t = state.teams[key];
  if (t) {
    t._isOpen = !t._isOpen;
    renderAdminTeamsAccordion();
  }
}

function saveTeamDetails(key) {
  const nameInput = document.getElementById(`edit-name-${key}`);
  const playersInput = document.getElementById(`edit-players-${key}`);
  const contactInput = document.getElementById(`edit-contact-${key}`);

  if (!nameInput || !playersInput || !contactInput) return;

  const newName = nameInput.value.trim();
  const newPlayers = playersInput.value.trim();
  const newContact = contactInput.value.trim();

  if (newName === "") {
    showToast("Team name cannot be empty!", true);
    return;
  }

  // Update State
  state.teams[key].name = newName;
  state.teams[key].players = newPlayers;
  state.teams[key].contact = newContact;
  state.teams[key]._isOpen = false; // close accordion

  saveState();
  recalculateAll();
  showToast("Team details updated successfully!");
}


// 6. SCORE MODIFIERS & ACTIONS
function saveScore(matchId, scoreA, scoreB, status) {
  // Push copy to undo stack
  pushToUndoStack(matchId);

  // Find and update match
  const match = state.matches.find(m => m.id === matchId);
  if (match) {
    match.scoreA = scoreA;
    match.scoreB = scoreB;
    match.status = status;
    match._isEditing = false; // turn off editing mode
    
    saveState();
    recalculateAll();

    // Trigger undo toast
    showUndoToast(`Match score saved successfully!`);
  }
}

function resetMatch(matchId) {
  pushToUndoStack(matchId);

  const match = state.matches.find(m => m.id === matchId);
  if (match) {
    match.scoreA = null;
    match.scoreB = null;
    match.status = "Not Started";
    match._isEditing = false;

    saveState();
    recalculateAll();
    showToast("Match scores reset.");
  }
}

// 7. UNDO SYSTEM
function pushToUndoStack(matchId) {
  // Save a deep copy of the match state
  const match = state.matches.find(m => m.id === matchId);
  if (match) {
    state.undoStack.push({
      matchId: match.id,
      scoreA: match.scoreA,
      scoreB: match.scoreB,
      status: match.status,
      _isEditing: match._isEditing
    });
    // Limit stack size to 20
    if (state.undoStack.length > 20) {
      state.undoStack.shift();
    }
  }
}

function undo() {
  if (state.undoStack.length === 0) {
    showToast("Nothing to undo!", true);
    return;
  }

  const previousState = state.undoStack.pop();
  const match = state.matches.find(m => m.id === previousState.matchId);
  if (match) {
    match.scoreA = previousState.scoreA;
    match.scoreB = previousState.scoreB;
    match.status = previousState.status;
    match._isEditing = previousState._isEditing || false;

    saveState();
    recalculateAll();
    showToast("Last action undone!");
  }
}

// 8. ADMIN RESET CONTROLS
function promptReset(type) {
  let title = "";
  let message = "";
  let action = null;

  if (type === "all") {
    title = "Reset Entire Tournament?";
    message = "WARNING: This will wipe ALL scores, matches, team details, and settings back to default. This action CANNOT be undone.";
    action = () => {
      loadDefaults();
      recalculateAll();
      showToast("Entire tournament has been reset.");
    };
  } else if (type === "scores") {
    title = "Reset All Scores?";
    message = "Are you sure you want to wipe scores for all matches? Group stage, Super 6 and Finals will all be set back to Not Started.";
    action = () => {
      state.matches.forEach(m => {
        m.scoreA = null;
        m.scoreB = null;
        m.status = "Not Started";
        m._isEditing = false;
      });
      state.undoStack = [];
      saveState();
      recalculateAll();
      showToast("All match scores reset.");
    };
  } else if (type.startsWith("group-")) {
    const grp = type.split("-")[1].toUpperCase();
    title = `Reset Group ${grp}?`;
    message = `Are you sure you want to reset all scores for Group ${grp} stage? This will set all group matches back to Not Started.`;
    action = () => {
      state.matches.forEach(m => {
        if (m.stage === "Group Stage" && m.group === grp) {
          m.scoreA = null;
          m.scoreB = null;
          m.status = "Not Started";
          m._isEditing = false;
        }
      });
      saveState();
      recalculateAll();
      showToast(`Group ${grp} stage reset.`);
    };
  } else if (type === "super-x" || type === "super-y") {
    const grp = type === "super-x" ? "X" : "Y";
    title = `Reset Super Group ${grp}?`;
    message = `Are you sure you want to reset all scores for Super Group ${grp}?`;
    action = () => {
      state.matches.forEach(m => {
        if (m.stage === "Super 6" && m.group === grp) {
          m.scoreA = null;
          m.scoreB = null;
          m.status = "Not Started";
          m._isEditing = false;
        }
      });
      saveState();
      recalculateAll();
      showToast(`Super Group ${grp} reset.`);
    };
  } else if (type === "finals") {
    title = `Reset Finals Match?`;
    message = `Are you sure you want to reset the Final match score?`;
    action = () => {
      state.matches.forEach(m => {
        if (m.stage === "Finals") {
          m.scoreA = null;
          m.scoreB = null;
          m.status = "Not Started";
          m._isEditing = false;
        }
      });
      saveState();
      recalculateAll();
      showToast(`Final match reset.`);
    };
  }

  if (action) {
    showConfirmModal(title, message, action);
  }
}

// 9. UI HELPERS (TABS, MODALS, TOASTS)
function switchTab(tabId) {
  // Toggle Views
  const panels = document.querySelectorAll(".view-panel");
  panels.forEach(p => p.classList.remove("active"));
  
  const target = document.getElementById(`view-${tabId}`);
  if (target) target.classList.add("active");

  // Toggle Tab Bar Highlight
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.classList.remove("active");
    if (btn.innerText.trim().toLowerCase() === tabId) {
      btn.classList.add("active");
    }
  });

  // Call render function for specific tabs to refresh details
  if (tabId === "schedule") {
    renderSchedule();
  } else if (tabId === "standings") {
    renderStandings();
  } else if (tabId === "admin") {
    renderAdminTeamsAccordion();
  }
}

function setupFilters() {
  // Stage Filter in Schedule View
  const filterBtns = document.querySelectorAll("#view-schedule .filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      filterBtns.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      renderSchedule();
    });
  });

  // Group Filter in Standings View
  const standingsBtns = document.querySelectorAll("#view-standings .filter-btn");
  standingsBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      standingsBtns.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      renderStandings();
    });
  });
}

// Confirmation Modal Hook
let currentModalConfirmAction = null;
function showConfirmModal(title, body, confirmAction) {
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

function setupModalHandlers() {
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

// Toast System
function showToast(message, isError = false) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  if (isError) {
    toast.style.borderLeftColor = "var(--accent-danger)";
    toast.style.background = "#2b1313";
  }

  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove after 3s
  setTimeout(() => {
    toast.classList.add("fade-out");
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 3000);
}

// Special Toast with Undo Action
function showUndoToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  // Clear existing undo toasts to prevent duplicates
  const existingToasts = container.querySelectorAll(".toast-undo");
  existingToasts.forEach(t => t.remove());

  const toast = document.createElement("div");
  toast.className = "toast toast-undo";
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-btn" onclick="app.undo()">↩️ Undo</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 6000); // Give undo a bit longer (6 seconds) to display
}

// Export functions to global app namespace so HTML can trigger onclicks
window.app = {
  switchTab,
  toggleAccordion,
  saveTeamDetails,
  saveScore,
  resetMatch,
  promptReset,
  undo
};

// Initialize
window.addEventListener("DOMContentLoaded", init);
