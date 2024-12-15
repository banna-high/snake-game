import React from 'react';
import Game from './components/Game';
import styled, { createGlobalStyle } from 'styled-components';
import { COLORS } from './config/gameConfig';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Orbitron', sans-serif;
    background-color: ${COLORS.background};
    color: ${COLORS.primary};
    overflow: hidden;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  @keyframes textGlow {
    0% { text-shadow: 0 0 5px ${COLORS.primary}; }
    50% { text-shadow: 0 0 20px ${COLORS.primary}; }
    100% { text-shadow: 0 0 5px ${COLORS.primary}; }
  }

  h1, h2, h3 {
    animation: textGlow 2s ease-in-out infinite;
  }
`;

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${COLORS.background};
`;

function App() {
  return (
    <AppContainer>
      <GlobalStyle />
      <Game />
    </AppContainer>
  );
}

export default App;
