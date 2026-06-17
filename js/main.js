// js/main.js

import { 
  state, 
  initState, 
  saveState, 
  pushToUndoStack, 
  popFromUndoStack, 
  addStateListener, 
  startSpectatorPolling,
  stopSpectatorPolling,
  pullFromRemoteSync,
  loadDefaults
} from './state.js';
import { 
  renderUI, 
  switchTab, 
  actions, 
  setupModalHandlers, 
  showToast, 
  showUndoToast, 
  showConfirmModal 
} from './ui.js';
import { recalculateAll } from './calculations.js';
import { ADMIN_PASSCODE } from './constants.js';

// 1. STATE BINDINGS
addStateListener(() => {
  renderUI();
});

// 2. UI ACTIONS IMPLEMENTATION
actions.onSaveScore = (matchId, scoreA, scoreB) => {
  // Push copy to undo stack
  pushToUndoStack(matchId);

  const match = state.matches.find(m => m.id === matchId);
  if (match) {
    match.scoreA = scoreA;
    match.scoreB = scoreB;
    match.status = "Completed";
    match._isEditing = false;
    
    saveState();
    recalculateAll(state);
    renderUI();

    showUndoToast("Match score saved successfully!", () => {
      undo();
    });
  }
};

actions.onResetMatch = (matchId) => {
  pushToUndoStack(matchId);

  const match = state.matches.find(m => m.id === matchId);
  if (match) {
    match.scoreA = null;
    match.scoreB = null;
    match.status = "Not Started";
    match._isEditing = false;

    saveState();
    recalculateAll(state);
    renderUI();
    showToast("Match scores reset.");
  }
};

// Toggle accordion item in admin panel
function toggleAccordion(key) {
  const t = state.teams[key];
  if (t) {
    t._isOpen = !t._isOpen;
    renderUI();
  }
}

// Save team details from accordion inputs
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

  state.teams[key].name = newName;
  state.teams[key].players = newPlayers;
  state.teams[key].contact = newContact;
  state.teams[key]._isOpen = false; // close accordion

  saveState();
  recalculateAll(state);
  renderUI();
  showToast("Team details updated successfully!");
}

// Reset specific stages / groups
function promptReset(type) {
  let title = "";
  let message = "";
  let action = null;

  if (type === "all") {
    title = "Reset Entire Tournament?";
    message = "WARNING: This will wipe ALL scores, matches, team details, and settings back to default. This action CANNOT be undone.";
    action = () => {
      loadDefaults();
      recalculateAll(state);
      renderUI();
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
      recalculateAll(state);
      renderUI();
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
      recalculateAll(state);
      renderUI();
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
      recalculateAll(state);
      renderUI();
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
      recalculateAll(state);
      renderUI();
      showToast(`Final match reset.`);
    };
  }

  if (action) {
    showConfirmModal(title, message, action);
  }
}

// Undo Action
function undo() {
  const previousState = popFromUndoStack();
  if (!previousState) {
    showToast("Nothing to undo!", true);
    return;
  }

  const match = state.matches.find(m => m.id === previousState.matchId);
  if (match) {
    match.scoreA = previousState.scoreA;
    match.scoreB = previousState.scoreB;
    match.status = previousState.status;
    match._isEditing = previousState._isEditing || false;

    saveState();
    recalculateAll(state);
    renderUI();
    showToast("Last action undone!");
  }
}

// Admin Panel Login / Logout Operations
function loginAdmin(pin) {
  if (pin === ADMIN_PASSCODE) {
    state.isAdmin = true;
    state.isSpectator = false;
    sessionStorage.setItem("isAdmin", "true");
    stopSpectatorPolling(); // Stop spectator polling loop when logged in as admin to avoid overwriting edits
    renderUI();
    showToast("🔓 Admin panel unlocked successfully!");
  } else {
    showToast("❌ Incorrect admin passcode PIN!", true);
  }
}

function logoutAdmin() {
  state.isAdmin = false;
  state.isSpectator = true;
  sessionStorage.removeItem("isAdmin");
  startSpectatorPolling(); // Start polling scores for updates again
  renderUI();
  showToast("🔒 Admin panel locked.");
}

// 3. TAB FILTERS setup
function setupFilters() {
  // Stage Filter in Schedule View
  const viewSchedule = document.getElementById("view-schedule");
  if (viewSchedule) {
    const filterBtns = viewSchedule.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        filterBtns.forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        renderUI();
      });
    });
  }

  // Group Filter in Standings View
  const viewStandings = document.getElementById("view-standings");
  if (viewStandings) {
    const standingsBtns = viewStandings.querySelectorAll(".filter-btn");
    standingsBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        standingsBtns.forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        renderUI();
      });
    });
  }
}

// 4. EXPORT TO WINDOW FOR DOM HANDLERS
window.app = {
  switchTab,
  toggleAccordion,
  saveTeamDetails,
  promptReset,
  undo,
  loginAdmin,
  logoutAdmin
};

// 5. INITIALIZATION RUN
function init() {
  initState();
  recalculateAll(state);
  setupFilters();
  setupModalHandlers();
  
  if (state.isSpectator) {
    startSpectatorPolling();
  } else {
    // If admin is logged in on init, pull from remote sync once to fetch the latest state
    pullFromRemoteSync();
  }
  
  renderUI();
}

window.addEventListener("DOMContentLoaded", init);
