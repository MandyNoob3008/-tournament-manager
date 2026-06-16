// js/calculations.js

/**
 * Check if a group stage group is fully completed
 */
export function isGroupCompleted(groupName, matches) {
  const groupMatches = matches.filter(m => m.stage === "Group Stage" && m.group === groupName);
  return groupMatches.length > 0 && groupMatches.every(m => m.status === "Completed");
}

/**
 * Check if a Super Group is fully completed (requires all parent groups to be completed too)
 */
export function isSuperGroupCompleted(groupName, matches) {
  const sgMatches = matches.filter(m => m.stage === "Super 6" && m.group === groupName);
  const allMatchesCompleted = sgMatches.length === 3 && sgMatches.every(m => m.status === "Completed");
  
  const parentGroups = groupName === "X" ? ["A", "C", "E"] : ["B", "D", "F"];
  const parentsResolved = parentGroups.every(g => isGroupCompleted(g, matches));
  
  return allMatchesCompleted && parentsResolved;
}

/**
 * Resolve placeholder text (like "Winner A") to actual team ID
 */
export function resolvePlaceholder(placeholder, matches, teams) {
  if (placeholder === "Winner A") return getGroupWinnerId("A", matches, teams);
  if (placeholder === "Winner B") return getGroupWinnerId("B", matches, teams);
  if (placeholder === "Winner C") return getGroupWinnerId("C", matches, teams);
  if (placeholder === "Winner D") return getGroupWinnerId("D", matches, teams);
  if (placeholder === "Winner E") return getGroupWinnerId("E", matches, teams);
  if (placeholder === "Winner F") return getGroupWinnerId("F", matches, teams);
  if (placeholder === "Winner Super Group X") return getSuperGroupWinnerId("X", matches, teams);
  if (placeholder === "Winner Super Group Y") return getSuperGroupWinnerId("Y", matches, teams);
  return null;
}

/**
 * Check if a match is ready to be played (i.e. participating teams are resolved)
 */
export function isMatchPlayable(match, matches, teams) {
  if (match.stage === "Group Stage") return true;
  
  // Super 6 match
  if (match.stage === "Super 6") {
    const tA = resolvePlaceholder(match.teamAPlaceholder, matches, teams);
    const tB = resolvePlaceholder(match.teamBPlaceholder, matches, teams);
    return tA !== null && tB !== null;
  }
  
  // Finals match
  if (match.stage === "Finals") {
    const tA = resolvePlaceholder(match.teamAPlaceholder, matches, teams);
    const tB = resolvePlaceholder(match.teamBPlaceholder, matches, teams);
    return tA !== null && tB !== null;
  }
  
  return false;
}

/**
 * Get the winner team ID of a group
 */
export function getGroupWinnerId(groupName, matches, teams) {
  if (!isGroupCompleted(groupName, matches)) return null;
  const groupMatches = matches.filter(m => m.stage === "Group Stage" && m.group === groupName);
  const teamIds = Object.keys(teams).filter(tid => teams[tid].group === groupName);
  const standings = calculateStandings(groupMatches, teamIds, teams);
  return standings[0]?.teamId || null;
}

/**
 * Get the winner team ID of a Super Group
 */
export function getSuperGroupWinnerId(groupName, matches, teams) {
  if (!isSuperGroupCompleted(groupName, matches)) return null;
  
  const groups = groupName === "X" ? ["A", "C", "E"] : ["B", "D", "F"];
  const teamIds = groups.map(g => getGroupWinnerId(g, matches, teams)).filter(id => id !== null);
  
  const sgMatches = matches.filter(m => m.stage === "Super 6" && m.group === groupName);
  const resolvedMatches = sgMatches.map(m => {
    return {
      ...m,
      resolvedTeamAId: resolvePlaceholder(m.teamAPlaceholder, matches, teams),
      resolvedTeamBId: resolvePlaceholder(m.teamBPlaceholder, matches, teams)
    };
  });
  
  const standings = calculateStandings(resolvedMatches, teamIds, teams);
  return standings[0]?.teamId || null;
}

/**
 * Core Standings Calculation Engine
 * Includes Head-to-Head (H2H) tiebreakers for 2-way ties.
 */
export function calculateStandings(matchesForStage, stageTeamIds, teams) {
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

  const standingsList = Object.values(standings);

  // Group standings by points to easily identify tie groups
  const pointsGroups = {};
  standingsList.forEach(entry => {
    pointsGroups[entry.pts] = pointsGroups[entry.pts] || [];
    pointsGroups[entry.pts].push(entry.teamId);
  });

  // Convert to array and sort
  return standingsList.sort((a, b) => {
    // 1. Points
    if (b.pts !== a.pts) return b.pts - a.pts;

    // 2. Head-to-Head (H2H) Tiebreaker
    // Standard rule: H2H is valid for resolving exactly 2-way ties.
    // If >2 teams have the same points (e.g. 3-way tie), H2H can be circular/invalid, so skip to Point Difference.
    const tiedTeamsCount = pointsGroups[a.pts].length;
    if (tiedTeamsCount === 2) {
      // Find the direct match between team A and team B in the current matches list
      const directMatch = matchesForStage.find(m => {
        if (m.status !== "Completed") return false;
        const mTA = m.resolvedTeamAId || m.teamAId;
        const mTB = m.resolvedTeamBId || m.teamBId;
        return (mTA === a.teamId && mTB === b.teamId) || (mTA === b.teamId && mTB === a.teamId);
      });

      if (directMatch) {
        const mTA = directMatch.resolvedTeamAId || directMatch.teamAId;
        const scoreA = parseInt(directMatch.scoreA) || 0;
        const scoreB = parseInt(directMatch.scoreB) || 0;

        let winnerId = null;
        if (scoreA > scoreB) {
          winnerId = mTA;
        } else if (scoreB > scoreA) {
          winnerId = (mTA === directMatch.resolvedTeamAId || mTA === directMatch.teamAId) ? 
                     (directMatch.resolvedTeamBId || directMatch.teamBId) : mTA;
        }

        if (winnerId) {
          if (winnerId === a.teamId) return -1; // a ranks higher
          if (winnerId === b.teamId) return 1;  // b ranks higher
        }
      }
    }

    // 3. Point Difference (PD)
    if (b.pd !== a.pd) return b.pd - a.pd;

    // 4. Points For (PF)
    if (b.pf !== a.pf) return b.pf - a.pf;

    // 5. Alphabetical fallback
    const nameA = teams[a.teamId]?.name || "";
    const nameB = teams[b.teamId]?.name || "";
    return nameA.localeCompare(nameB);
  });
}

/**
 * Recalculate standings, winners, and champions for all stages
 */
export function recalculateAll(state) {
  const standingsCached = { groups: {}, superGroups: {} };
  const winnersCached = { groups: {}, superGroups: {}, champion: null };

  // 1. Group Standings
  const groups = ["A", "B", "C", "D", "E", "F"];
  groups.forEach(g => {
    const groupMatches = state.matches.filter(m => m.stage === "Group Stage" && m.group === g);
    const teamIds = Object.keys(state.teams).filter(tid => state.teams[tid].group === g);
    standingsCached.groups[g] = calculateStandings(groupMatches, teamIds, state.teams);
    winnersCached.groups[g] = getGroupWinnerId(g, state.matches, state.teams);
  });

  // 2. Super 6 Standings
  const sgNames = ["X", "Y"];
  sgNames.forEach(sg => {
    const groupsInSg = sg === "X" ? ["A", "C", "E"] : ["B", "D", "F"];
    const teamIds = groupsInSg.map(g => winnersCached.groups[g]).filter(id => id !== null);
    
    const sgMatches = state.matches.filter(m => m.stage === "Super 6" && m.group === sg);
    const resolvedMatches = sgMatches.map(m => {
      return {
        ...m,
        resolvedTeamAId: resolvePlaceholder(m.teamAPlaceholder, state.matches, state.teams),
        resolvedTeamBId: resolvePlaceholder(m.teamBPlaceholder, state.matches, state.teams)
      };
    });
    
    standingsCached.superGroups[sg] = calculateStandings(resolvedMatches, teamIds, state.teams);
    winnersCached.superGroups[sg] = getSuperGroupWinnerId(sg, state.matches, state.teams);
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
        // Tied finals? In knockout finals, we should not have draws, but fallback is finalistX.
        winnersCached.champion = sA >= sB ? finalistX : finalistY; 
      }
    } else {
      winnersCached.champion = null;
    }
  }

  return { standingsCached, winnersCached };
}
