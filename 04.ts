import AocSolution from './aoc/AocSolution';

namespace Problem04 {
    type DataType = { InputData: number[], Boards: Board[] }
    class Solution extends AocSolution<DataType> {
        public day: string = "04"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = false

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            // Iterate through all input and find a winning board
            var winningBoard: Board|undefined
            data.InputData.find(input => {
                winningBoard = data.Boards.find(board => board.acceptInput(input))
                return !!winningBoard
            })
            return { message: `Score of winning board is ${winningBoard?.score}` }
        }

        public async solvePartTwoAsync(data: DataType): Promise<string> {
            var winningBoard: Board|undefined
            data.InputData.find(input => {
                winningBoard = data.Boards
                    .filter(board => board.score == 0)
                    .find((board, _, values) => board.acceptInput(input) && values.length == 1)
                return !!winningBoard
            })
            return `Score of last winning board is ${winningBoard?.score}`
        }

        protected parseData(lines: string[]): DataType {
            var randomInputLine = lines.shift()!
            var randomInput = randomInputLine.trim().split(',').map(x => parseInt(x.trim()))

            // Random input data
            const boards = Array()
            var currentBoard: Board|null = null
            lines
                .map(line => line.trim().split(/[ ]+/).map(x => parseInt(x.trim())))
                .forEach((current, index, values) => {
                    currentBoard = currentBoard ?? new Board(index, current.length)
                    if (currentBoard.addRow(current)) {
                        boards.push(currentBoard)
                        currentBoard = new Board(index, current.length)
                    }
                })

            return { InputData: randomInput, Boards: boards }
        }

        protected SAMPLE_DATA: string = 
`
7,4,9,5,11,17,23,2,0,14,21,24,10,16,13,6,15,25,12,22,18,20,8,19,3,26,1

22 13 17 11  0
 8  2 23  4 24
21  9 14 16  7
 6 10  3 18  5
 1 12 20 15 19

 3 15  0  2 22
 9 18 13 17  5
19  8  7 25 23
20 11 10 24  4
14 21 16 12  6

14 21 17 24  4
10 16 15  9 19
18  8 23 26 20
22 11 13  6  5
 2  0 12  3  7
`;
    }

    class Board {
        // The board index
        index: number

        // Board data
        data: number[][]

        // Score of the board
        score: number = 0

        // The x,y size of the board (we support variable board sizing!)
        private size: number

        // Used for building each board from input
        private currentRow: number = 0

        // Keep track of a set of each possible winning combination
        // sacrificing memory for speed in win determination
        private winSets: Set<number>[]

        constructor(index: number, size: number) {
            this.index = index
            this.size = size
            this.data = Array(size)
            this.winSets = Array()
        }

        /**
         * Add a row of data to the board
         * @param row The row of data to add
         * @returns True if the board setup is finished (ie. all rows have been
         *          initialized)
         */
        addRow(row: number[]): boolean {
            this.data[this.currentRow++] = row
            const complete = this.currentRow == this.size

            // Add each row as a winset
            this.winSets.push(new Set(row))

            if (complete) {
                // If we're complete we walk through and add each column as a
                // possible winset
                for (var x = 0; x < this.size; x++) {
                    const winSet = new Set<number>()
                    for (var y = 0; y < this.size; y++) {
                        winSet.add(this.data[y][x])
                    }
                    this.winSets.push(winSet)
                }
                return true
            }

            return false
        }

        acceptInput(input: number): boolean {
            // Iterate through all winsets
            var victorSet: Set<number>|null = null
            for (var i = 0; i < this.winSets.length; i++) {
                var winSet = this.winSets[i]
                // Keep marking numbers even if we've found a winner
                if (winSet.delete(input) && winSet.size == 0 && victorSet == null) victorSet = winSet
            }

            const hasWon = victorSet != null

            if (hasWon) {
                // If we've won determine the score
                var sumOfUnmarked = this.winSets.slice(0, this.winSets.length/2).map(set => Array.from(set.values())).flat().reduce((p, c) => p + c, 0)
                this.score = sumOfUnmarked * input
            }

            return hasWon
        }
    }

    (async () => await new Solution().executeAsync())();
}