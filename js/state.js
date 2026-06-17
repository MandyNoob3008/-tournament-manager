// js/state.js

import { DEFAULT_TEAMS, DEFAULT_MATCHES, STORAGE_KEY, SYNC_STORAGE_KEY } from './constants.js';

export let state = {
  teams: {},
  matches: [],
  undoStack: [],
  syncId: null,
  isSpectator: false,
  isSyncing: false,
  isAdmin: false
};

// Listeners to trigger UI updates
const stateListeners = [];

export function addStateListener(listener) {
  stateListeners.push(listener);
}

function notifyStateListeners() {
  stateListeners.forEach(listener => listener(state));
}

/**
 * Route synchronization URL depending on environment to prevent CORS issues on production
 */
const DEFAULT_SYNC_ID = "gnr-pickleball-2026";

export function getSyncUrl(syncId) {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "") {
    // Localhost calls the production Vercel deployment's proxy endpoint
    return `https://tournament-manager-black.vercel.app/api/sync${syncId ? `?id=${syncId}` : ''}`;
  }
  // Production calls the relative proxy endpoint
  return `/api/sync${syncId ? `?id=${syncId}` : ''}`;
}

/**
 * Initialize state from localStorage or defaults, and check query string for syncId
 */
export function initState() {
  // Check session storage for admin login
  const savedAdmin = sessionStorage.getItem("isAdmin");
  state.isAdmin = savedAdmin === "true";
  state.isSpectator = !state.isAdmin; // Everyone is spectator (view-only) except logged in Admin

  // Check URL query parameters for spectator syncId, fallback to master sync ID
  const urlParams = new URLSearchParams(window.location.search);
  const syncParam = urlParams.get('syncId');
  state.syncId = (syncParam || DEFAULT_SYNC_ID).trim();

  // Load defaults first so UI is populated before fetch
  state.teams = JSON.parse(JSON.stringify(DEFAULT_TEAMS));
  state.matches = JSON.parse(JSON.stringify(DEFAULT_MATCHES));
  state.undoStack = [];

  // Organizer mode (loads local storage offline fallback)
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      state.teams = parsed.teams || state.teams;
      state.matches = parsed.matches || state.matches;
      state.undoStack = parsed.undoStack || [];
    } catch (e) {
      console.error("Failed to parse saved state, loading defaults", e);
    }
  }
}

export function loadDefaults() {
  state.teams = JSON.parse(JSON.stringify(DEFAULT_TEAMS));
  state.matches = JSON.parse(JSON.stringify(DEFAULT_MATCHES));
  state.undoStack = [];
  saveState();
}

/**
 * Save state to localStorage and push to remote sync if enabled
 */
export async function saveState() {
  if (state.isSpectator) return; // Spectators cannot write to state

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    teams: state.teams,
    matches: state.matches,
    undoStack: state.undoStack
  }));

  if (state.syncId) {
    pushToRemoteSync();
  }
}

/**
 * Push local state to remote sync bin (via proxy if on vercel)
 */
export async function pushToRemoteSync() {
  if (!state.syncId || state.isSpectator) return;
  state.isSyncing = true;
  notifyStateListeners();

  try {
    const res = await fetch(getSyncUrl(state.syncId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        teams: state.teams,
        matches: state.matches
      })
    });
    if (!res.ok) throw new Error("Sync server responded with error");
  } catch (err) {
    console.error("Failed to push remote state sync:", err);
  } finally {
    state.isSyncing = false;
    notifyStateListeners();
  }
}

/**
 * Fetch latest state from remote sync bin (Spectator or Pull)
 */
export async function pullFromRemoteSync() {
  if (!state.syncId) return;
  
  try {
    const res = await fetch(getSyncUrl(state.syncId));
    if (res.ok) {
      const data = await res.json();
      if (data && data.teams && data.matches) {
        // Compare values to prevent redundant redraws
        const matchString = JSON.stringify(data.matches);
        const teamString = JSON.stringify(data.teams);
        
        if (JSON.stringify(state.matches) !== matchString || JSON.stringify(state.teams) !== teamString) {
          state.teams = data.teams;
          state.matches = data.matches;
          notifyStateListeners();
        }
      }
    } else if (res.status === 404 && state.isAdmin) {
      // Initialize remote DB with defaults on first load if we are Admin
      await pushToRemoteSync();
    }
  } catch (err) {
    console.error("Failed to pull remote state sync:", err);
  }
}

/**
 * Setup Spectator Polling Loop (every 10 seconds)
 */
let pollingInterval = null;
export function startSpectatorPolling() {
  if (!state.isSpectator || !state.syncId) return;
  
  // Pull immediately
  pullFromRemoteSync();
  
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => {
    pullFromRemoteSync();
  }, 10000);
}

export function stopSpectatorPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

/**
 * Stubs maintained for import compatibility in ui.js
 */
export async function enableRemoteSync() {
  return state.syncId;
}

export function disableRemoteSync() {}

/**
 * Undo Stack Utilities
 */
export function pushToUndoStack(matchId) {
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

export function popFromUndoStack() {
  if (state.undoStack.length === 0) return null;
  return state.undoStack.pop();
}
