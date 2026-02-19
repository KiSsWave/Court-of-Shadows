import type { Role, Faction, DecreeType, GamePhase } from '@/constants/game';

export type { Role, Faction, DecreeType, GamePhase };

// ---- Entités du domaine ----

export interface Player {
  id: string;
  name: string;
  isAlive: boolean;
  isHost: boolean;
  isConnected?: boolean;
}

export interface KnownPlayer {
  id: string;
  role: Role;
  faction?: Faction;
}

export interface GameSettings {
  conspiratorsKnowUsurper: boolean;
  usurperKnowsAllies: boolean;
  limitedConspiratorsKnowledge: boolean;
  previousKingCannotBeChancellor: boolean;
}

export interface GameState {
  phase: GamePhase;
  plotsCount: number;
  editsCount: number;
  deadlockCount: number;
  deckSize: number;
  discardSize: number;
  currentKingId: string | null;
  currentChancellorId: string | null;
  nominatedChancellorId: string | null;
  previousKingId: string | null;
  previousChancellorId: string | null;
  playerOrder: string[];
  playerCount: number;
  vetoUnlocked: boolean;
  isAlive: boolean;
  disconnectedPlayers: string[];
  knownPlayers: KnownPlayer[];
  settings: GameSettings;
  lastVotes?: Record<string, string> | null;
  pauseReason?: string;
}

export interface AuthUser {
  username: string;
  token: string;
}

export interface PublicGame {
  roomId: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  createdAt: number;
}

export interface PlayerGame {
  roomId: string;
  hostName: string;
  playerCount: number;
  phase: GamePhase;
  lastActivity: number;
  isPaused: boolean;
  isAlive: boolean;
}

export interface ChatMessage {
  playerName: string;
  content: string;
  /** @deprecated use content */
  message?: string;
  timestamp: number;
  isSystem?: boolean;
  systemType?: 'conspirator' | 'loyalist' | 'system';
  type?: string;
}

export interface VoteDetail {
  playerId: string;
  vote: 'yes' | 'no';
}

export interface RoleAssignment {
  role: Role;
  faction: Faction;
  allies: Array<{ id: string; name: string; role: Role }>;
}

export interface GameOverData {
  winner: Faction;
  reason: string;
  allRoles: Array<{
    name: string;
    role: Role;
    faction: Faction;
    isAlive: boolean;
  }>;
}

// ---- État global de l'application ----

export interface AppState {
  // Auth
  user: AuthUser | null;
  isAuthenticated: boolean;

  // Room
  playerId: string | null;
  roomId: string | null;
  isHost: boolean;

  // Rôle du joueur courant
  playerRole: Role | null;
  playerFaction: Faction | null;
  knownPlayers: KnownPlayer[];

  // Jeu
  gameState: GameState | null;
  allPlayers: Player[];

  // Listes du lobby
  publicGames: PublicGame[];
  myGames: PlayerGame[];

  // Chat
  chatMessages: ChatMessage[];

  // Suivi des votes
  currentVoteDetails: VoteDetail[] | null;
  votedPlayerIds: string[];

  // Session législative
  isSelectingDecrees: boolean;
  kingDecrees: string[] | null;
  chancellorDecrees: string[] | null;
  canVeto: boolean;
  vetoRejected: boolean;

  // Pouvoir exécutif
  isUsingPower: boolean;
  currentPower: string | null;
  investigatedPlayerIds: string[];

  // Résultats pouvoirs
  isShowingPowerResult: boolean;
  peekCards: string[] | null;
  investigationResult: { targetName: string; faction: string } | null;

  // Veto
  isWaitingForVetoResponse: boolean;
  pendingVetoResponse: boolean;

  // Partage de cartes (chat)
  shareCardsRole: 'king' | 'chancellor' | null;
  lastReceivedCards: { role: 'king' | 'chancellor'; cards: DecreeType[] } | null;

  // Vote
  hasVoted: boolean;

  // Effets sonores
  lastPlayedDecree: string | null;
  lastVoteResult: 'accepted' | 'rejected' | null;

  // Données de rôle pour l'affichage (ex: en-tête)
  roleAssignment: RoleAssignment | null;

  // Game over
  gameOverData: GameOverData | null;

  // Connexion WebSocket
  wsConnected: boolean;
  wsReconnecting: boolean;
  wsReconnectAttempt: number;
  latencies: number[];

  // UI
  notifications: Array<{ id: string; message: string }>;
  roleRevealActive: boolean;
}
