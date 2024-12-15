import { Position, Direction, SpecialItem, SpecialItemType, GameState } from '../types/game';
import { DEFAULT_GAME_CONFIG, SPECIAL_ITEM_CONFIGS } from '../config/gameConfig';

export const createInitialSnake = (): Position[] => {
  const middle = Math.floor(DEFAULT_GAME_CONFIG.gridSize / 2);
  return [
    { x: middle, y: middle },
    { x: middle - 1, y: middle },
    { x: middle - 2, y: middle },
  ];
};

export const generateFood = (snake: Position[], specialItems: SpecialItem[], gridSize: number): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (
    isPositionInSnake(food, snake) ||
    specialItems.some(item => item.position.x === food.x && item.position.y === food.y)
  );
  return food;
};

export const generateSpecialItem = (
  snake: Position[],
  food: Position,
  existingItems: SpecialItem[],
  gridSize: number
): SpecialItem | null => {
  if (existingItems.length >= DEFAULT_GAME_CONFIG.maxSpecialItems) {
    return null;
  }

  // 随机选择一个特殊道具类型
  const itemTypes = Object.keys(SPECIAL_ITEM_CONFIGS) as SpecialItemType[];
  const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];

  // 根据概率决定是否生成
  if (Math.random() > SPECIAL_ITEM_CONFIGS[randomType].probability) {
    return null;
  }

  // 生成位置
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (
    isPositionInSnake(position, snake) ||
    (position.x === food.x && position.y === food.y) ||
    existingItems.some(item => item.position.x === position.x && item.position.y === position.y)
  );

  return {
    type: randomType,
    position,
    duration: SPECIAL_ITEM_CONFIGS[randomType].duration,
    remainingTime: SPECIAL_ITEM_CONFIGS[randomType].duration,
  };
};

export const isPositionInSnake = (position: Position, snake: Position[]): boolean => {
  return snake.some(segment => segment.x === position.x && segment.y === position.y);
};

export const getNextPosition = (
  head: Position,
  direction: Direction,
  gridSize: number,
  hasNeuralAmplifier: boolean
): Position => {
  const newPosition = { ...head };

  switch (direction) {
    case 'UP':
      newPosition.y = (newPosition.y - 1 + gridSize) % gridSize;
      break;
    case 'DOWN':
      newPosition.y = (newPosition.y + 1) % gridSize;
      break;
    case 'LEFT':
      newPosition.x = (newPosition.x - 1 + gridSize) % gridSize;
      break;
    case 'RIGHT':
      newPosition.x = (newPosition.x + 1) % gridSize;
      break;
  }

  return newPosition;
};

export const isOppositeDirection = (current: Direction, next: Direction): boolean => {
  return (
    (current === 'UP' && next === 'DOWN') ||
    (current === 'DOWN' && next === 'UP') ||
    (current === 'LEFT' && next === 'RIGHT') ||
    (current === 'RIGHT' && next === 'LEFT')
  );
};

export const calculateScore = (baseScore: number, activeEffects: GameState['activeEffects']): number => {
  let multiplier = 1;
  
  // 检查是否有数据碎片加成
  const hasDataFragment = activeEffects.some(effect => 
    effect.type === 'DATA_FRAGMENT' && effect.remainingTime > 0
  );
  
  if (hasDataFragment) {
    multiplier *= 2;
  }
  
  return Math.floor(baseScore * multiplier);
};

export const updateSpecialItems = (
  specialItems: SpecialItem[],
  deltaTime: number
): SpecialItem[] => {
  return specialItems
    .map(item => ({
      ...item,
      remainingTime: item.remainingTime - deltaTime,
    }))
    .filter(item => item.remainingTime > 0);
};

export const updateActiveEffects = (
  activeEffects: GameState['activeEffects'],
  deltaTime: number
): GameState['activeEffects'] => {
  return activeEffects
    .map(effect => ({
      ...effect,
      remainingTime: effect.remainingTime - deltaTime,
    }))
    .filter(effect => effect.remainingTime > 0);
};

export const getAICloneNextDirection = (
  cloneHead: Position,
  food: Position,
  currentDirection: Direction,
  gridSize: number
): Direction => {
  const dx = (food.x - cloneHead.x + gridSize) % gridSize;
  const dy = (food.y - cloneHead.y + gridSize) % gridSize;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'RIGHT' : 'LEFT';
  } else {
    return dy > 0 ? 'DOWN' : 'UP';
  }
}; 