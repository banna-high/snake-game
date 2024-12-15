import { GameConfig } from '../types/game';

export const DEFAULT_GAME_CONFIG: GameConfig = {
  gridSize: 20,
  cellSize: 30,
  initialSpeed: 200,
  speedBoostMultiplier: 1.5,
  initialEnergy: 100,
  energyDrainRate: 20,
  energyRegenRate: 10,
  foodEnergyBonus: 30,
  specialItemSpawnInterval: 15000,
  maxSpecialItems: 3,
  specialItemDuration: 10000,
};

export const COLORS = {
  primary: '#B026FF',
  secondary: '#00FFFF',
  accent: '#FF10F0',
  background: '#0A0A0A',
  highlight: '#39FF14',
  danger: '#FF0000',
  warning: '#FFD700',
  success: '#00FF00',
};

export const SPECIAL_ITEM_CONFIGS = {
  HACKER_MODULE: {
    duration: 10000,
    probability: 0.2,
    color: COLORS.secondary,
    effect: '显示所有道具位置',
  },
  HOLOGRAM_CLONE: {
    duration: 15000,
    probability: 0.15,
    color: COLORS.accent,
    effect: '生成AI控制的分身蛇',
  },
  TIME_WARPER: {
    duration: 8000,
    probability: 0.2,
    color: COLORS.primary,
    effect: '减缓游戏速度',
  },
  NEURAL_AMPLIFIER: {
    duration: 12000,
    probability: 0.15,
    color: COLORS.highlight,
    effect: '瞬间转向',
  },
  QUANTUM_TUNNEL: {
    duration: 5000,
    probability: 0.1,
    color: COLORS.warning,
    effect: '创建传送门',
  },
  DATA_FRAGMENT: {
    duration: 10000,
    probability: 0.2,
    color: COLORS.success,
    effect: '增加分数倍率',
  },
  SYSTEM_GLITCH: {
    duration: 5000,
    probability: 0.1,
    color: COLORS.danger,
    effect: '随机特殊效果',
  },
}; 