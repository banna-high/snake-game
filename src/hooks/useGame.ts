import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Direction, Position, SpecialItem, SpecialItemType } from '../types/game';
import { DEFAULT_GAME_CONFIG, SPECIAL_ITEM_CONFIGS } from '../config/gameConfig';
import {
  createInitialSnake,
  generateFood,
  getNextPosition,
  isOppositeDirection,
  isPositionInSnake,
  calculateScore,
  generateSpecialItem,
  updateSpecialItems,
  updateActiveEffects,
  getAICloneNextDirection,
} from '../utils/gameUtils';
import AudioManager from '../utils/audioManager';

const INITIAL_STATE: GameState = {
  snake: createInitialSnake(),
  food: generateFood(createInitialSnake(), [], DEFAULT_GAME_CONFIG.gridSize),
  direction: 'RIGHT',
  score: 0,
  isGameOver: false,
  isPaused: true,
  energy: DEFAULT_GAME_CONFIG.initialEnergy,
  speed: DEFAULT_GAME_CONFIG.initialSpeed,
  specialItems: [],
  activeEffects: [],
  isBoostActive: false,
  hologramClone: undefined,
};

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const gameLoopRef = useRef<number>();
  const lastRenderTimeRef = useRef<number>(0);
  const lastSpecialItemSpawnRef = useRef<number>(0);
  const audioManager = useRef(AudioManager.getInstance());

  const resetGame = useCallback(() => {
    setGameState({
      ...INITIAL_STATE,
      food: generateFood(createInitialSnake(), [], DEFAULT_GAME_CONFIG.gridSize),
    });
    audioManager.current.stopBGM();
    audioManager.current.playBGM();
  }, []);

  const handleSpecialItemCollection = useCallback((item: SpecialItem) => {
    audioManager.current.playSound('powerUp');
    setGameState(prevState => {
      const newActiveEffects = [...prevState.activeEffects];
      
      newActiveEffects.push({
        type: item.type,
        remainingTime: item.duration,
        startTime: Date.now(),
      });

      let updates: Partial<GameState> = {
        specialItems: prevState.specialItems.filter(i => i !== item),
        activeEffects: newActiveEffects,
      };

      switch (item.type) {
        case 'HOLOGRAM_CLONE':
          updates.hologramClone = {
            snake: [
              { x: prevState.snake[0].x + 2, y: prevState.snake[0].y },
              { x: prevState.snake[0].x + 1, y: prevState.snake[0].y },
            ],
            direction: prevState.direction,
          };
          break;
        case 'TIME_WARPER':
          updates.speed = DEFAULT_GAME_CONFIG.initialSpeed * 1.5;
          break;
      }

      return { ...prevState, ...updates };
    });
  }, []);

  const moveSnake = useCallback(() => {
    setGameState(prevState => {
      if (prevState.isGameOver || prevState.isPaused) return prevState;

      const hasNeuralAmplifier = prevState.activeEffects.some(
        effect => effect.type === 'NEURAL_AMPLIFIER' && effect.remainingTime > 0
      );

      const newHead = getNextPosition(
        prevState.snake[0],
        prevState.direction,
        DEFAULT_GAME_CONFIG.gridSize,
        hasNeuralAmplifier
      );

      // 检查是否吃到食物
      const hasEatenFood = newHead.x === prevState.food.x && newHead.y === prevState.food.y;
      
      // 检查是否吃到特殊道具
      const collidedItem = prevState.specialItems.find(
        item => item.position.x === newHead.x && item.position.y === newHead.y
      );

      // 新的蛇身
      const newSnake = [newHead, ...prevState.snake.slice(0, hasEatenFood ? undefined : -1)];

      // 更新分身蛇
      let newHologramClone = prevState.hologramClone;
      if (newHologramClone) {
        const cloneDirection = getAICloneNextDirection(
          newHologramClone.snake[0],
          prevState.food,
          newHologramClone.direction,
          DEFAULT_GAME_CONFIG.gridSize
        );
        const newCloneHead = getNextPosition(
          newHologramClone.snake[0],
          cloneDirection,
          DEFAULT_GAME_CONFIG.gridSize,
          false
        );
        newHologramClone = {
          snake: [newCloneHead, ...newHologramClone.snake.slice(0, -1)],
          direction: cloneDirection,
        };
      }

      // 检查是否撞到自己（除非有穿墙效果）
      if (isPositionInSnake(newHead, prevState.snake.slice(1))) {
        audioManager.current.playSound('gameOver');
        audioManager.current.stopBGM();
        return { ...prevState, isGameOver: true };
      }

      // 播放移动音效
      audioManager.current.playSound('move');

      // 更新状态
      const updates: Partial<GameState> = {
        snake: newSnake,
        hologramClone: newHologramClone,
      };

      // 如果吃到食物
      if (hasEatenFood) {
        audioManager.current.playSound('eat');
        updates.food = generateFood(newSnake, prevState.specialItems, DEFAULT_GAME_CONFIG.gridSize);
        updates.score = calculateScore(prevState.score + 1, prevState.activeEffects);
        updates.energy = Math.min(
          prevState.energy + DEFAULT_GAME_CONFIG.foodEnergyBonus,
          DEFAULT_GAME_CONFIG.initialEnergy
        );
      }

      // 如果吃到特殊道具
      if (collidedItem) {
        handleSpecialItemCollection(collidedItem);
      }

      return { ...prevState, ...updates };
    });
  }, [handleSpecialItemCollection]);

  // 处理键盘输入
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    
    if (key === 'r') {
      resetGame();
      return;
    }

    setGameState(prevState => {
      if (prevState.isGameOver) return prevState;

      let newDirection = prevState.direction;
      const hasNeuralAmplifier = prevState.activeEffects.some(
        effect => effect.type === 'NEURAL_AMPLIFIER' && effect.remainingTime > 0
      );
      
      switch (key) {
        case 'w':
        case 'arrowup':
          if (!isOppositeDirection(prevState.direction, 'UP') || hasNeuralAmplifier) {
            newDirection = 'UP';
          }
          break;
        case 's':
        case 'arrowdown':
          if (!isOppositeDirection(prevState.direction, 'DOWN') || hasNeuralAmplifier) {
            newDirection = 'DOWN';
          }
          break;
        case 'a':
        case 'arrowleft':
          if (!isOppositeDirection(prevState.direction, 'LEFT') || hasNeuralAmplifier) {
            newDirection = 'LEFT';
          }
          break;
        case 'd':
        case 'arrowright':
          if (!isOppositeDirection(prevState.direction, 'RIGHT') || hasNeuralAmplifier) {
            newDirection = 'RIGHT';
          }
          break;
        case ' ':
          if (prevState.energy > 0) {
            audioManager.current.playSound('boost');
            return { ...prevState, isBoostActive: true };
          }
          return prevState;
        case 'escape':
          if (!prevState.isPaused) {
            audioManager.current.stopBGM();
          } else {
            audioManager.current.playBGM();
          }
          return { ...prevState, isPaused: !prevState.isPaused };
        case 'm':
          audioManager.current.toggleMute();
          return prevState;
      }

      return { ...prevState, direction: newDirection };
    });
  }, [resetGame]);

  // 处理键盘释放
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.key === ' ') {
      setGameState(prev => ({ ...prev, isBoostActive: false }));
    }
  }, []);

  // 更新能量
  const updateEnergy = useCallback(() => {
    setGameState(prevState => {
      if (prevState.isGameOver || prevState.isPaused) return prevState;

      let newEnergy = prevState.energy;
      
      if (prevState.isBoostActive && newEnergy > 0) {
        newEnergy = Math.max(0, newEnergy - (DEFAULT_GAME_CONFIG.energyDrainRate / 60));
      } else if (!prevState.isBoostActive && newEnergy < DEFAULT_GAME_CONFIG.initialEnergy) {
        newEnergy = Math.min(
          DEFAULT_GAME_CONFIG.initialEnergy,
          newEnergy + (DEFAULT_GAME_CONFIG.energyRegenRate / 60)
        );
      }

      return { ...prevState, energy: newEnergy };
    });
  }, []);

  // 游戏主循环
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (!lastRenderTimeRef.current) {
        lastRenderTimeRef.current = timestamp;
        lastSpecialItemSpawnRef.current = timestamp;
      }

      const elapsed = timestamp - lastRenderTimeRef.current;
      const currentSpeed = gameState.isBoostActive && gameState.energy > 0 ? 
        DEFAULT_GAME_CONFIG.initialSpeed / DEFAULT_GAME_CONFIG.speedBoostMultiplier :
        gameState.speed;

      // 更新特殊道具和效果
      if (timestamp - lastSpecialItemSpawnRef.current >= DEFAULT_GAME_CONFIG.specialItemSpawnInterval) {
        setGameState(prevState => {
          const newItem = generateSpecialItem(
            prevState.snake,
            prevState.food,
            prevState.specialItems,
            DEFAULT_GAME_CONFIG.gridSize
          );
          
          if (newItem) {
            return {
              ...prevState,
              specialItems: [...prevState.specialItems, newItem],
            };
          }
          return prevState;
        });
        lastSpecialItemSpawnRef.current = timestamp;
      }

      // 更新特殊道具和效果的剩余时间
      setGameState(prevState => ({
        ...prevState,
        specialItems: updateSpecialItems(prevState.specialItems, elapsed),
        activeEffects: updateActiveEffects(prevState.activeEffects, elapsed),
      }));

      if (elapsed > currentSpeed) {
        moveSnake();
        updateEnergy();
        lastRenderTimeRef.current = timestamp;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    if (!gameState.isGameOver && !gameState.isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isGameOver, gameState.isPaused, moveSnake, updateEnergy, gameState.isBoostActive, gameState.speed, gameState.energy]);

  // 设置键盘事件监听
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyPress, handleKeyUp]);

  // 初始化音频
  useEffect(() => {
    audioManager.current.playBGM();
    return () => {
      audioManager.current.stopBGM();
    };
  }, []);

  return {
    gameState,
  };
}; 