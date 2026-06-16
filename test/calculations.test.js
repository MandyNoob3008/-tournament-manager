// test/calculations.test.js
import { describe, it, expect } from 'vitest';
import { calculateStandings, isGroupCompleted, isMatchPlayable } from '../js/calculations.js';

describe('Calculations Engine', () => {
  const mockTeams = {
    // Group A
    't1': { name: 'Team Alpha A', group: 'A' },
    't2': { name: 'Team Beta A', group: 'A' },
    't3': { name: 'Team Gamma A', group: 'A' },
    // Group C
    'c1': { name: 'Team Alpha C', group: 'C' },
    'c2': { name: 'Team Beta C', group: 'C' },
    'c3': { name: 'Team Gamma C', group: 'C' }
  };

  it('calculates points and basic standings correctly', () => {
    const matches = [
      { id: 'm1', stage: 'Group Stage', group: 'A', teamAId: 't1', teamBId: 't2', scoreA: 11, scoreB: 5, status: 'Completed' },
      { id: 'm2', stage: 'Group Stage', group: 'A', teamAId: 't2', teamBId: 't3', scoreA: 11, scoreB: 8, status: 'Completed' },
      { id: 'm3', stage: 'Group Stage', group: 'A', teamAId: 't1', teamBId: 't3', scoreA: 11, scoreB: 2, status: 'Completed' }
    ];

    const teamIds = ['t1', 't2', 't3'];
    const standings = calculateStandings(matches, teamIds, mockTeams);

    expect(standings).toHaveLength(3);
    
    // Team Alpha A: 2 wins = 6 pts
    expect(standings[0].teamId).toBe('t1');
    expect(standings[0].pts).toBe(6);
    expect(standings[0].played).toBe(2);
    expect(standings[0].pd).toBe((11 - 5) + (11 - 2)); // 15

    // Team Beta A: 1 win, 1 loss = 3 pts
    expect(standings[1].teamId).toBe('t2');
    expect(standings[1].pts).toBe(3);
    
    // Team Gamma A: 2 losses = 0 pts
    expect(standings[2].teamId).toBe('t3');
    expect(standings[2].pts).toBe(0);
  });

  it('resolves 2-way ties using head-to-head records', () => {
    const matches = [
      { id: 'm1', stage: 'Group Stage', group: 'A', teamAId: 't1', teamBId: 't2', scoreA: 11, scoreB: 5, status: 'Completed' },
      { id: 'm2', stage: 'Group Stage', group: 'A', teamAId: 't2', teamBId: 't3', scoreA: 11, scoreB: 2, status: 'Completed' }
    ];

    const teamIds = ['t1', 't2', 't3'];
    const standings = calculateStandings(matches, teamIds, mockTeams);

    // Alpha (t1) should rank #1 because it won the H2H against Beta (t2), despite Beta having higher PD (+9 vs +6).
    expect(standings[0].teamId).toBe('t1');
    expect(standings[1].teamId).toBe('t2');
  });

  it('correctly reports group stage completion', () => {
    const incompleteMatches = [
      { id: 'g-1', stage: 'Group Stage', group: 'A', status: 'Completed' },
      { id: 'g-7', stage: 'Group Stage', group: 'A', status: 'Not Started' }
    ];
    expect(isGroupCompleted('A', incompleteMatches)).toBe(false);

    const completeMatches = [
      { id: 'g-1', stage: 'Group Stage', group: 'A', status: 'Completed' },
      { id: 'g-7', stage: 'Group Stage', group: 'A', status: 'Completed' },
      { id: 'g-13', stage: 'Group Stage', group: 'A', status: 'Completed' }
    ];
    expect(isGroupCompleted('A', completeMatches)).toBe(true);
  });

  it('determines match playability correctly based on stage resolution', () => {
    const groupMatch = { stage: 'Group Stage', teamAId: 't1', teamBId: 't2' };
    expect(isMatchPlayable(groupMatch, [], mockTeams)).toBe(true);

    const unplayableSuperMatch = {
      stage: 'Super 6',
      teamAPlaceholder: 'Winner A',
      teamBPlaceholder: 'Winner C'
    };
    // No matches played, winner not resolved
    expect(isMatchPlayable(unplayableSuperMatch, [], mockTeams)).toBe(false);

    const matchesWithAandCComplete = [
      // Group A complete (t1 winner)
      { id: 'a1', stage: 'Group Stage', group: 'A', teamAId: 't1', teamBId: 't2', scoreA: 11, scoreB: 0, status: 'Completed' },
      { id: 'a2', stage: 'Group Stage', group: 'A', teamAId: 't2', teamBId: 't3', scoreA: 11, scoreB: 0, status: 'Completed' },
      { id: 'a3', stage: 'Group Stage', group: 'A', teamAId: 't1', teamBId: 't3', scoreA: 11, scoreB: 0, status: 'Completed' },
      // Group C complete (c1 winner)
      { id: 'c1', stage: 'Group Stage', group: 'C', teamAId: 'c1', teamBId: 'c2', scoreA: 11, scoreB: 0, status: 'Completed' },
      { id: 'c2', stage: 'Group Stage', group: 'C', teamAId: 'c2', teamBId: 'c3', scoreA: 11, scoreB: 0, status: 'Completed' },
      { id: 'c3', stage: 'Group Stage', group: 'C', teamAId: 'c1', teamBId: 'c3', scoreA: 11, scoreB: 0, status: 'Completed' }
    ];
    // Since Group A and Group C are completed, Winner A and Winner C are resolved!
    // Therefore, the Super 6 match should be playable.
    expect(isMatchPlayable(unplayableSuperMatch, matchesWithAandCComplete, mockTeams)).toBe(true);
  });
});
