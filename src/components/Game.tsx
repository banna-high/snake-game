import React, { useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { DEFAULT_GAME_CONFIG, COLORS, SPECIAL_ITEM_CONFIGS } from '../config/gameConfig';
import { Position, SpecialItem } from '../types/game';
import styled, { keyframes, css } from 'styled-components';
import AudioManager from '../utils/audioManager';

// 光效动画
const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px ${COLORS.primary}, 0 0 10px ${COLORS.primary}, 0 0 15px ${COLORS.primary}; }
  50% { box-shadow: 0 0 10px ${COLORS.primary}, 0 0 20px ${COLORS.primary}, 0 0 25px ${COLORS.primary}; }
  100% { box-shadow: 0 0 5px ${COLORS.primary}, 0 0 10px ${COLORS.primary}, 0 0 15px ${COLORS.primary}; }
`;

// 数字雨动画
const matrixRain = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
`;

// 全息效果动画
const hologramEffect = keyframes`
  0% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.02); }
  100% { opacity: 0.5; transform: scale(1); }
`;

// 故障效果动画
const glitchEffect = keyframes`
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
`;

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: ${COLORS.background};
  min-height: 100vh;
  color: ${COLORS.primary};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      ${COLORS.background} 0%,
      rgba(176, 38, 255, 0.1) 50%,
      ${COLORS.background} 100%
    );
    pointer-events: none;
  }
`;

const GameBoard = styled.div<{ $size: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$size}, ${DEFAULT_GAME_CONFIG.cellSize}px);
  grid-template-rows: repeat(${props => props.$size}, ${DEFAULT_GAME_CONFIG.cellSize}px);
  gap: 1px;
  background-color: rgba(176, 38, 255, 0.1);
  border: 2px solid ${COLORS.primary};
  padding: 10px;
  border-radius: 5px;
  animation: ${glowAnimation} 2s ease-in-out infinite;
  position: relative;
  box-shadow: 0 0 20px ${COLORS.primary};

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, ${COLORS.primary}, ${COLORS.secondary});
    border-radius: 7px;
    z-index: -1;
    opacity: 0.5;
    filter: blur(10px);
  }
`;

const Cell = styled.div<{ $isSnake?: boolean; $isFood?: boolean; $isHead?: boolean }>`
  width: ${DEFAULT_GAME_CONFIG.cellSize}px;
  height: ${DEFAULT_GAME_CONFIG.cellSize}px;
  border-radius: 3px;
  background-color: ${props => {
    if (props.$isHead) return COLORS.highlight;
    if (props.$isSnake) return COLORS.primary;
    if (props.$isFood) return COLORS.secondary;
    return 'transparent';
  }};
  border: 1px solid rgba(176, 38, 255, 0.1);
  transition: all 0.2s ease;
  position: relative;

  ${props => props.$isSnake && css`
    box-shadow: 0 0 5px ${COLORS.primary};
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, ${COLORS.primary}, transparent);
      opacity: 0.5;
      border-radius: 3px;
    }
  `}

  ${props => props.$isFood && css`
    box-shadow: 0 0 10px ${COLORS.secondary};
    animation: ${hologramEffect} 1.5s ease-in-out infinite;
    &::before {
      content: '';
      position: absolute;
      top: -5px;
      left: -5px;
      right: -5px;
      bottom: -5px;
      background: radial-gradient(circle, ${COLORS.secondary}, transparent);
      opacity: 0.3;
      animation: ${glowAnimation} 1.5s ease-in-out infinite;
    }
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px solid ${COLORS.secondary};
      border-radius: 3px;
      animation: ${glitchEffect} 2s linear infinite;
    }
  `}

  ${props => props.$isHead && css`
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: ${COLORS.highlight};
      opacity: 0.5;
      filter: blur(4px);
      border-radius: 5px;
    }
  `}
`;

const SpecialItemCell = styled(Cell)<{ $itemType: string }>`
  background-color: ${props => SPECIAL_ITEM_CONFIGS[props.$itemType].color};
  opacity: 0.8;
  animation: ${hologramEffect} 1s ease-in-out infinite;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      ${props => SPECIAL_ITEM_CONFIGS[props.$itemType].color}, 
      transparent
    );
    opacity: 0.5;
    animation: ${matrixRain} 2s linear infinite;
  }
`;

const HologramSnakeCell = styled(Cell)`
  background-color: ${COLORS.accent};
  opacity: 0.5;
  box-shadow: 0 0 15px ${COLORS.accent};
  animation: ${hologramEffect} 2s ease-in-out infinite;
`;

const ScoreBoard = styled.div`
  font-size: 24px;
  margin: 20px 0;
  padding: 10px 20px;
  background-color: rgba(176, 38, 255, 0.1);
  border-radius: 5px;
  border: 1px solid ${COLORS.primary};
  display: flex;
  gap: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    right: -50%;
    bottom: -50%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(176, 38, 255, 0.2),
      transparent
    );
    transform: rotate(45deg);
    animation: ${glowAnimation} 3s linear infinite;
  }
`;

const EnergyBar = styled.div<{ $energy: number }>`
  width: 200px;
  height: 20px;
  background-color: rgba(176, 38, 255, 0.1);
  border: 1px solid ${COLORS.primary};
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(176, 38, 255, 0.2),
      transparent
    );
    animation: ${glowAnimation} 2s linear infinite;
  }

  &::after {
    content: '';
    display: block;
    width: ${props => props.$energy}%;
    height: 100%;
    background: linear-gradient(
      90deg,
      ${COLORS.highlight},
      ${COLORS.primary}
    );
    transition: width 0.3s ease;
    box-shadow: 0 0 10px ${COLORS.highlight};
  }
`;

const EffectIndicator = styled.div<{ $color: string }>`
  padding: 5px 10px;
  margin: 5px;
  border-radius: 5px;
  background-color: ${props => props.$color};
  color: ${COLORS.background};
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    right: -50%;
    bottom: -50%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transform: rotate(45deg);
    animation: ${glowAnimation} 2s linear infinite;
  }
`;

const EffectsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
`;

const GameOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(10, 10, 10, 0.9);
  padding: 20px;
  border-radius: 10px;
  border: 2px solid ${COLORS.primary};
  text-align: center;
  animation: ${glowAnimation} 2s ease-in-out infinite;
  backdrop-filter: blur(5px);

  h2 {
    color: ${COLORS.primary};
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 15px;
  }

  p {
    color: ${COLORS.secondary};
    margin: 10px 0;
  }
`;

const StartButton = styled.button`
  padding: 10px 20px;
  font-size: 18px;
  background-color: ${COLORS.primary};
  color: ${COLORS.background};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${COLORS.highlight};
  }
`;

const Game: React.FC = () => {
  const { gameState } = useGame();
  const {
    snake,
    food,
    score,
    isGameOver,
    isPaused,
    energy,
    specialItems,
    activeEffects,
    hologramClone,
    isBoostActive,
  } = gameState;

  // 初始化音频
  useEffect(() => {
    const audioManager = AudioManager.getInstance();
    
    // 添加点击事件监听器来初始化音频
    const handleClick = () => {
      audioManager.playBGM();
      // 移除事件监听器
      document.removeEventListener('click', handleClick);
    };
    
    document.addEventListener('click', handleClick);
    
    // 清理函数
    return () => {
      document.removeEventListener('click', handleClick);
      audioManager.cleanup();
    };
  }, []);

  const renderCell = (position: Position) => {
    // 检查是否是蛇身
    const isSnake = snake.some(
      segment => segment.x === position.x && segment.y === position.y
    );
    const isHead = snake[0].x === position.x && snake[0].y === position.y;
    const isFood = food.x === position.x && food.y === position.y;

    // 检查是否是分身蛇
    const isHologramSnake = hologramClone?.snake.some(
      segment => segment.x === position.x && segment.y === position.y
    );

    // 检查是否是特殊道具
    const specialItem = specialItems.find(
      item => item.position.x === position.x && item.position.y === position.y
    );

    if (specialItem) {
      return (
        <SpecialItemCell
          key={`${position.x}-${position.y}`}
          $itemType={specialItem.type}
          $isSnake={false}
          $isFood={false}
          $isHead={false}
        />
      );
    }

    if (isHologramSnake) {
      return (
        <HologramSnakeCell
          key={`${position.x}-${position.y}`}
          $isSnake={true}
          $isFood={false}
          $isHead={false}
        />
      );
    }

    return (
      <Cell
        key={`${position.x}-${position.y}`}
        $isSnake={isSnake}
        $isFood={isFood}
        $isHead={isHead}
      />
    );
  };

  const renderBoard = () => {
    const cells = [];
    for (let y = 0; y < DEFAULT_GAME_CONFIG.gridSize; y++) {
      for (let x = 0; x < DEFAULT_GAME_CONFIG.gridSize; x++) {
        cells.push(renderCell({ x, y }));
      }
    }
    return cells;
  };

  const renderActiveEffects = () => {
    return activeEffects.map((effect, index) => (
      <EffectIndicator
        key={`${effect.type}-${index}`}
        $color={SPECIAL_ITEM_CONFIGS[effect.type].color}
      >
        {SPECIAL_ITEM_CONFIGS[effect.type].effect}
        ({Math.ceil(effect.remainingTime / 1000)}s)
      </EffectIndicator>
    ));
  };

  return (
    <GameContainer>
      <ScoreBoard>
        <div>分数: {score}</div>
        <div>速度: {isBoostActive ? '加速中' : '正常'}</div>
      </ScoreBoard>
      <EnergyBar $energy={energy} />
      {activeEffects.length > 0 && (
        <EffectsContainer>
          {renderActiveEffects()}
        </EffectsContainer>
      )}
      <GameBoard $size={DEFAULT_GAME_CONFIG.gridSize}>
        {renderBoard()}
        {(isGameOver || isPaused) && (
          <GameOverlay>
            <h2>{isGameOver ? '游戏结束' : '游戏暂停'}</h2>
            <p>分数: {score}</p>
            {isGameOver && <p>按 R 键重新开始</p>}
            {isPaused && <p>按 ESC 继续游戏</p>}
            {isPaused && !isGameOver && (
              <div>
                <p>控制说明：</p>
                <p>WASD - 移动</p>
                <p>空格 - 加速</p>
                <p>ESC - 暂停</p>
                <p>R - 重新开始</p>
              </div>
            )}
          </GameOverlay>
        )}
      </GameBoard>
    </GameContainer>
  );
};

export default Game; 