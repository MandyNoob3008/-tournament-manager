// js/constants.js

export const DEFAULT_TEAMS = {
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

export const DEFAULT_MATCHES = [
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

export const STORAGE_KEY = "live_tournament_state";
export const SYNC_STORAGE_KEY = "live_tournament_sync_id";
export const ADMIN_PASSCODE = "gnr2026";

