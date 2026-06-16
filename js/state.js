// js/state.js

import { DEFAULT_TEAMS, DEFAULT_MATCHES, STORAGE_KEY, SYNC_STORAGE_KEY } from './constants.js';

export let state = {
  teams: {},
  matches: [],
  undoStack: [],
  syncId: null,
  isSpectator: false,
  isSyncing: false
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
 * Initialize state from localStorage or defaults, and check query string for syncId
 */
export function initState() {
  // Check URL query parameters for spectator syncId
  const urlParams = new URLSearchParams(window.location.search);
  const syncParam = urlParams.get('syncId');

  if (syncParam) {
    state.syncId = syncParam.trim();
    state.isSpectator = true;
    state.teams = {};
    state.matches = [];
    state.undoStack = [];
  } else {
    // Organizer mode (loads local storage)
    const savedState = localStorage.getItem(STORAGE_KEY);
    const savedSyncId = localStorage.getItem(SYNC_STORAGE_KEY);
    
    if (savedSyncId) {
      state.syncId = savedSyncId;
    }

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        state.teams = parsed.teams || {};
        state.matches = parsed.matches || [];
        state.undoStack = parsed.undoStack || [];
      } catch (e) {
        console.error("Failed to parse saved state, loading defaults", e);
        loadDefaults();
      }
    } else {
      loadDefaults();
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
 * Push local state to keyvalue.xyz
 */
export async function pushToRemoteSync() {
  if (!state.syncId || state.isSpectator) return;
  state.isSyncing = true;
  notifyStateListeners();

  try {
    const res = await fetch(`https://keyvalue.xyz/v1/${state.syncId}`, {
      method: 'POST',
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
 * Fetch latest state from keyvalue.xyz (Spectator or Pull)
 */
export async function pullFromRemoteSync() {
  if (!state.syncId) return;
  
  try {
    const res = await fetch(`https://keyvalue.xyz/v1/${state.syncId}`);
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

/**
 * Enable remote syncing for organizers
 */
export async function enableRemoteSync() {
  // Generate random 16 character key
  const randomHex = () => Math.random().toString(16).substring(2, 10);
  const syncId = `gnr-pickleball-${randomHex()}-${randomHex()}`;
  
  state.syncId = syncId;
  localStorage.setItem(SYNC_STORAGE_KEY, syncId);
  
  // Upload current state
  await pushToRemoteSync();
  notifyStateListeners();
  return syncId;
}

/**
 * Disable remote syncing for organizers
 */
export function disableRemoteSync() {
  state.syncId = null;
  localStorage.removeItem(SYNC_STORAGE_KEY);
  notifyStateListeners();
}

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
