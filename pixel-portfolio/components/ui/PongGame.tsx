'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface PongGameProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GameState {
  ball: { x: number; y: number; dx: number; dy: number };
  leftPaddle: { y: number };
  rightPaddle: { y: number };
  score: { left: number; right: number };
  gameRunning: boolean;
  gameOver: boolean;
  winner: 'left' | 'right' | null;
  gameMode: 'single' | 'two-player';
}

export function PongGame({ isOpen, onClose }: PongGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  
  const [gameState, setGameState] = useState<GameState>({
    ball: { x: 400, y: 200, dx: 4, dy: 3 },
    leftPaddle: { y: 160 },
    rightPaddle: { y: 160 },
    score: { left: 0, right: 0 },
    gameRunning: false,
    gameOver: false,
    winner: null,
    gameMode: 'single'
  });

  const [highScore, setHighScore] = useState(0);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 80;
  const BALL_SIZE = 8;
  const PADDLE_SPEED = 6;
  const WINNING_SCORE = 5;

  // Load high score on mount
  useEffect(() => {
    const saved = localStorage.getItem('pong-high-score');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Reset game
  const resetGame = useCallback((mode: 'single' | 'two-player' = 'single') => {
    setGameState({
      ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 4, dy: 3 },
      leftPaddle: { y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2 },
      rightPaddle: { y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2 },
      score: { left: 0, right: 0 },
      gameRunning: false,
      gameOver: false,
      winner: null,
      gameMode: mode
    });
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, gameRunning: true, gameOver: false }));
  }, []);

  // Reset game when modal opens
  useEffect(() => {
    if (isOpen) {
      resetGame('single'); // Always start with single player mode
    }
  }, [isOpen, resetGame]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen]);

  // Game loop
  useEffect(() => {
    if (!isOpen || !gameState.gameRunning) return;

    const gameLoop = () => {
      setGameState(prev => {
        const newState = { ...prev };

        // Handle paddle movement
        if (keysRef.current.has('w') && newState.leftPaddle.y > 0) {
          newState.leftPaddle.y -= PADDLE_SPEED;
        }
        if (keysRef.current.has('s') && newState.leftPaddle.y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
          newState.leftPaddle.y += PADDLE_SPEED;
        }

        // Right paddle movement (bot or player 2)
        if (newState.gameMode === 'single') {
          // Bot AI for right paddle
          const paddleCenter = newState.rightPaddle.y + PADDLE_HEIGHT / 2;
          const ballCenter = newState.ball.y + BALL_SIZE / 2;
          const botSpeed = PADDLE_SPEED * 0.8; // Make bot slightly slower for fairness
          
          // Only move if ball is coming towards the bot
          if (newState.ball.dx > 0) {
            if (paddleCenter < ballCenter - 10) {
              newState.rightPaddle.y = Math.min(
                newState.rightPaddle.y + botSpeed,
                CANVAS_HEIGHT - PADDLE_HEIGHT
              );
            } else if (paddleCenter > ballCenter + 10) {
              newState.rightPaddle.y = Math.max(
                newState.rightPaddle.y - botSpeed,
                0
              );
            }
          }
        } else {
          // Two-player mode
          if (keysRef.current.has('arrowup') && newState.rightPaddle.y > 0) {
            newState.rightPaddle.y -= PADDLE_SPEED;
          }
          if (keysRef.current.has('arrowdown') && newState.rightPaddle.y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
            newState.rightPaddle.y += PADDLE_SPEED;
          }
        }

        // Move ball
        newState.ball.x += newState.ball.dx;
        newState.ball.y += newState.ball.dy;

        // Ball collision with top/bottom walls
        if (newState.ball.y <= 0 || newState.ball.y >= CANVAS_HEIGHT - BALL_SIZE) {
          newState.ball.dy = -newState.ball.dy;
        }

        // Ball collision with paddles
        // Left paddle
        if (
          newState.ball.x <= PADDLE_WIDTH &&
          newState.ball.y >= newState.leftPaddle.y &&
          newState.ball.y <= newState.leftPaddle.y + PADDLE_HEIGHT
        ) {
          newState.ball.dx = Math.abs(newState.ball.dx);
          // Add some angle based on where it hit the paddle
          const hitPos = (newState.ball.y - newState.leftPaddle.y) / PADDLE_HEIGHT;
          newState.ball.dy = (hitPos - 0.5) * 8;
        }

        // Right paddle
        if (
          newState.ball.x >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
          newState.ball.y >= newState.rightPaddle.y &&
          newState.ball.y <= newState.rightPaddle.y + PADDLE_HEIGHT
        ) {
          newState.ball.dx = -Math.abs(newState.ball.dx);
          const hitPos = (newState.ball.y - newState.rightPaddle.y) / PADDLE_HEIGHT;
          newState.ball.dy = (hitPos - 0.5) * 8;
        }

        // Scoring
        if (newState.ball.x < 0) {
          newState.score.right++;
          newState.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 4, dy: 3 };
        }
        if (newState.ball.x > CANVAS_WIDTH) {
          newState.score.left++;
          newState.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: -4, dy: 3 };
        }

        // Check for game over
        if (newState.score.left >= WINNING_SCORE) {
          newState.gameOver = true;
          newState.gameRunning = false;
          newState.winner = 'left';
          const newHighScore = Math.max(highScore, newState.score.left);
          setHighScore(newHighScore);
          localStorage.setItem('pong-high-score', newHighScore.toString());
        }
        if (newState.score.right >= WINNING_SCORE) {
          newState.gameOver = true;
          newState.gameRunning = false;
          newState.winner = 'right';
        }

        return newState;
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, gameState.gameRunning, highScore]);

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#00ff41';
    ctx.fillRect(0, gameState.leftPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, gameState.rightPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillRect(gameState.ball.x, gameState.ball.y, BALL_SIZE, BALL_SIZE);

    // Draw scores
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.score.left.toString(), CANVAS_WIDTH / 4, 60);
    ctx.fillText(gameState.score.right.toString(), (3 * CANVAS_WIDTH) / 4, 60);
  }, [gameState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-pixel-dark border-4 border-pixel-primary p-6 max-w-4xl w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-pixel text-pixel-primary text-xl">RETRO PONG</h2>
          <button
            onClick={onClose}
            className="font-pixel text-pixel-light hover:text-pixel-primary text-lg"
          >
            ✕
          </button>
        </div>

        {/* Game Canvas */}
        <div className="border-2 border-pixel-primary mb-4">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block w-full max-w-full"
          />
        </div>

        {/* Game Controls */}
        <div className="space-y-4">
          {!gameState.gameRunning && !gameState.gameOver && (
            <div className="text-center space-y-4">
              {/* Game Mode Selection */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => resetGame('single')}
                  className={`font-pixel px-4 py-2 border-2 transition-colors ${
                    gameState.gameMode === 'single'
                      ? 'bg-pixel-primary text-pixel-dark border-pixel-primary'
                      : 'bg-transparent text-pixel-light border-pixel-primary hover:bg-pixel-primary/20'
                  }`}
                >
                  VS BOT
                </button>
                <button
                  onClick={() => resetGame('two-player')}
                  className={`font-pixel px-4 py-2 border-2 transition-colors ${
                    gameState.gameMode === 'two-player'
                      ? 'bg-pixel-primary text-pixel-dark border-pixel-primary'
                      : 'bg-transparent text-pixel-light border-pixel-primary hover:bg-pixel-primary/20'
                  }`}
                >
                  2 PLAYER
                </button>
              </div>

              <button
                onClick={startGame}
                className="font-pixel bg-pixel-secondary text-pixel-dark px-6 py-2 hover:bg-pixel-accent transition-colors"
              >
                START GAME
              </button>
              
              <p className="font-pixel text-pixel-light text-xs">
                {gameState.gameMode === 'single' 
                  ? `You: W/S keys | Bot: AI controlled | First to ${WINNING_SCORE} wins!`
                  : `Player 1: W/S keys | Player 2: Arrow keys | First to ${WINNING_SCORE} wins!`
                }
              </p>
            </div>
          )}

          {gameState.gameOver && (
            <div className="text-center">
              <p className="font-pixel text-pixel-primary text-lg mb-2">
                {gameState.winner === 'left' 
                  ? (gameState.gameMode === 'single' ? 'YOU WIN!' : 'PLAYER 1 WINS!')
                  : (gameState.gameMode === 'single' ? 'BOT WINS!' : 'PLAYER 2 WINS!')
                }
              </p>
              <button
                onClick={() => resetGame(gameState.gameMode)}
                className="font-pixel bg-pixel-secondary text-pixel-dark px-6 py-2 hover:bg-pixel-accent transition-colors"
              >
                PLAY AGAIN
              </button>
            </div>
          )}

          {/* High Score */}
          <div className="text-center">
            <p className="font-pixel text-pixel-light text-xs">
              HIGH SCORE: {highScore}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}