import {
  ComponentProps,
  Dispatch,
  EventHandler,
  FunctionComponent,
  MouseEventHandler,
  SetStateAction,
  useEffect,
  useState,
} from "react";

enum CellState {
  Bomb,
  Empty,
  Opened,
}

interface Cell {
  id: string;
  label: string;
  isFlagged: boolean;
  state: CellState;
}

const App: FunctionComponent<ComponentProps<"main">> = () => {
  const [isTest, setIsTest] = useState(false);
  const [size, setSize] = useState(132);
  const [bombsCount, setBombsCount] = useState(size / 4);
  const [map, setMap] = useMap(size, bombsCount);

  const onClick =
    (id: string): MouseEventHandler =>
    (e) => {
      e.preventDefault();

      const clone: Cell[][] = structuredClone(map);
      const len = 12;

      const isLeftClick = e.button === 0;
      const isRightClick = e.button === 2;

      if (isLeftClick) {
        for (let row = 0; row < len; row++) {
          for (let col = 0; col < len; col++) {
            if (clone[row][col].id === id) {
              openRecursively(row, col, row, col, clone);
              setMap(clone);
              return;
            }
          }
        }
      }

      if (isRightClick) {
        for (let row = 0; row < len; row++) {
          for (let col = 0; col < len; col++) {
            if (clone[row][col].id === id) {
              clone[row][col].isFlagged = !clone[row][col].isFlagged;
              setMap(clone);
              return;
            }
          }
        }
      }
    };

  return (
    <main className="container mx-auto h-screen grid place-items-center">
      <div className="grid grid-cols-12 gap-4">
        {map.flatMap((row) =>
          row.map((cell) => (
            <div
              key={cell.id}
              onMouseUp={onClick(cell.id)}
              onContextMenu={e => e.preventDefault()}
              className={
                "w-7 h-7 text-center rounded " +
                {
                  [CellState.Bomb]: isTest ? "bg-red-400" : "bg-green-400",
                  [CellState.Empty]: "bg-green-400",
                  [CellState.Opened]: "bg-white border border-black",
                }[cell.state]
              }
            >
              {cell.isFlagged
                ? "🚩"
                : cell.state === CellState.Opened
                ? cell.label
                : ""}
            </div>
          ))
        )}
      </div>
    </main>
  );
};

function useMap(
  size: number,
  bombsCount: number
): [Cell[][], Dispatch<SetStateAction<Cell[][]>>] {
  const [map, setMap] = useState<Cell[][]>([[]]);

  useEffect(() => {
    const len = 12;
    let map: Cell[][] = Array.from({ length: len });

    let id = 1;
    for (let row = 0; row < len; row++) {
      map[row] = Array.from({ length: len });
      for (let col = 0; col < len; col++) {
        map[row][col] = {
          id: `${id++}`,
          label: "",
          isFlagged: false,
          state: CellState.Empty,
        };
      }
    }

    let i = 0;
    while (i < bombsCount) {
      const row = randomBetween(0, len - 1);
      const col = randomBetween(0, len - 1);
      const curr = map[row][col];

      if (curr.state !== CellState.Bomb) {
        map[row][col] = { ...curr, state: CellState.Bomb };
        i++;
      }
    }

    for (let row = 0; row < len; row++) {
      for (let col = 0; col < len; col++) {
        const factors = [
          [-1, -1],
          [-1, 0],
          [0, -1],
          [1, 1],
          [1, 0],
          [0, 1],
          [-1, 1],
          [1, -1],
        ];

        let count = 0;
        factors.forEach(([fRow, fCol]) => {
          const _row = row + fRow;
          const _col = col + fCol;

          if (_row < 0 || _row >= 12 || _col < 0 || _col >= 12) {
            return;
          }

          const cell = map[_row][_col];
          if (cell.state === CellState.Bomb) {
            count++;
          }
        });

        map[row][col] = {
          ...map[row][col],
          label: count > 0 ? `${count}` : "",
        };
      }
    }

    setMap(map);
  }, [size, bombsCount, setMap]);

  return [map, setMap];
}

function randomBetween(start: number, end: number) {
  return Math.floor(Math.random() * (end - start + 1) + start);
}

function openRecursively(
  row: number,
  col: number,
  startRow: number,
  startCol: number,
  map: Cell[][]
) {
  if (row >= 12 || row < 0 || col >= 12 || col < 0) {
    return;
  }

  const maxDelta = 3;
  const deltaRow = Math.abs(row - startRow);
  const deltaCol = Math.abs(col - startCol);
  if ([deltaRow, deltaCol].some((delta) => delta > maxDelta)) {
    return;
  }

  const cell = map[row][col];

  if ([CellState.Bomb, CellState.Opened].includes(cell.state)) {
    return;
  }

  cell.state = CellState.Opened;

  openRecursively(row - 1, col, startRow, startCol, map);
  openRecursively(row + 1, col, startRow, startCol, map);
  openRecursively(row, col - 1, startRow, startCol, map);
  openRecursively(row, col + 1, startRow, startCol, map);
}

export default App;
