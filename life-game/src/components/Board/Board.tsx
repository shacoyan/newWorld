// FILE: src/components/Board/Board.tsx
import { GameState, Player } from '../../types';
import Square from './Square';
import PlayerToken from '../Player/PlayerToken';

function Board(props: { gameState: GameState; players: Player[] }) {
  const { gameState, players } = props;
  const { board } = gameState;

  const reorderedSquares: typeof board = [];
  const cols = 5;
  const rows = 6;

  for (let row = 0; row < rows; row++) {
    const start = row * cols;
    const end = start + cols;
    const rowSquares = board.slice(start, end);
    if (row % 2 === 1) {
      rowSquares.reverse();
    }
    reorderedSquares.push(...rowSquares);
  }

  return (
    <div className="relative grid grid-cols-5 gap-1">
      {reorderedSquares.map((square) => {
        const isCurrentPosition =
          gameState.currentPlayerIndex !== null &&
          players[gameState.currentPlayerIndex]?.position === square.id;

        const playersOnSquare = players.filter(
          (player) => player.position === square.id
        );

        return (
          <div key={square.id} className="relative">
            <Square square={square} isActive={isCurrentPosition} />
            {playersOnSquare.length > 0 && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex -space-x-2">
                {playersOnSquare.map((player) => (
                  <PlayerToken
                    key={player.id}
                    player={player}
                    isCurrentTurn={
                      players.indexOf(player) === gameState.currentPlayerIndex
                    }
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Board;
