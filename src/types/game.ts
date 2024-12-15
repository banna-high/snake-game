export type Position = {
  x: number;
  y: number;
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameState = {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  energy: number;
  speed: number;
  specialItems: SpecialItem[];
  activeEffects: ActiveEffect[];
  isBoostActive: boolean;
  hologramClone?: {
    snake: Position[];
    direction: Direction;
  };
};

export type SpecialItem = {
  type: SpecialItemType;
  position: Position;
  duration: number;
  remainingTime: number;
};

export type ActiveEffect = {
  type: SpecialItemType;
  remainingTime: number;
  startTime: number;
};

export type SpecialItemType = 
  | 'HACKER_MODULE'
  | 'HOLOGRAM_CLONE'
  | 'TIME_WARPER'
  | 'NEURAL_AMPLIFIER'
  | 'QUANTUM_TUNNEL'
  | 'DATA_FRAGMENT'
  | 'SYSTEM_GLITCH';

export type GameConfig = {
  gridSize: number;
  cellSize: number;
  initialSpeed: number;
  speedBoostMultiplier: number;
  initialEnergy: number;
  energyDrainRate: number;
  energyRegenRate: number;
  foodEnergyBonus: number;
  specialItemSpawnInterval: number;
  maxSpecialItems: number;
  specialItemDuration: number;
}; 