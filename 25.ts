import AocSolution from './aoc/AocSolution';
import './collections'
import { XY } from './collections';

namespace Problem25 {
    type DataType = { columns: number, rows: number, east: Set<number>, south: Set<number>, holes: Set<number> }
    enum Direction { West, North }
    class Solution extends AocSolution<DataType> {
        public day: string = "25"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = true

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            var workingData = { ...data, east: new Set(data.east), south: new Set(data.south), holes: new Set(data.holes) }
            this.displayCucumbers(workingData)
            var cucumbersMoved = Number.MAX_VALUE
            var steps = 0
            while (cucumbersMoved > 0) {
                cucumbersMoved = 0
                for (const direction of [Direction.West, Direction.North]) {
                    const toMove = [...workingData.holes.values()].sort((a,b) => a-b).reverse()
                    const hasMoved = new Set<number>()
                    for (const hole of toMove) {
                        const nextPosition = this.nextHolePosition(workingData, direction, hole)
                        if (direction == Direction.West && this.isEastFacingCucumber(workingData, nextPosition) && !hasMoved.has(nextPosition)) {
                            workingData.east.delete(nextPosition)
                            workingData.east.add(hole)

                            hasMoved.add(hole)
                            workingData.holes.delete(hole)
                            workingData.holes.add(nextPosition)
                            cucumbersMoved++
                        }
                        else if (direction == Direction.North && this.isSouthFacingCucumber(workingData, nextPosition) && !hasMoved.has(nextPosition)) {
                            workingData.south.delete(nextPosition)
                            workingData.south.add(hole)

                            hasMoved.add(hole)
                            workingData.holes.delete(hole)
                            workingData.holes.add(nextPosition)
                            cucumbersMoved++
                        }
                    }
                }
                steps++
            }

            console.log(`After ${steps} steps 0 cucumbers moved`)
            this.displayCucumbers(workingData)

            return { message: `` }
        }

        private displayCucumbers(data: DataType, currentPosition?: number) {
            for (var i = 0; i < data.columns * data.rows; i++) {
                if (data.east.has(i)) {
                    process.stdout.write(`>`)
                }
                else if (data.south.has(i)) {
                    process.stdout.write(`v`)
                }
                else if (i == currentPosition) {
                    process.stdout.write(`O`)
                }
                else {
                    process.stdout.write(`.`)
                }
                if (i % data.columns == (data.columns - 1)) process.stdout.write('\n')
            }
            console.log('')
        }

        private isEastFacingCucumber(data: DataType, cucumber: number): boolean {
            return data.east.has(cucumber)
        }

        private isSouthFacingCucumber(data: DataType, cucumber: number): boolean {
            return data.south.has(cucumber)
        }

        private nextHolePosition(data: DataType, direction: Direction, holePosition: number): number {
            const xy = this.xyForPosition(data, holePosition)

            if (direction == Direction.West) return this.positionForXy(data, new XY(xy.x == 0 ? data.columns - 1 : xy.x - 1, xy.y))
            return this.positionForXy(data, new XY(xy.x, xy.y == 0 ? data.rows - 1 : xy.y - 1))
        }

        private xyForPosition(data: DataType, position: number): XY {
            const row = Math.floor(position / data.columns)
            const column = position % data.columns
            return new XY(column, row)
        }

        private positionForXy(data: DataType, xy: XY): number {
            return data.columns * ((xy.y < 0 ? data.rows - 1 : xy.y) % data.rows) + ((xy.x < 0 ? data.columns - 1 : xy.x) % data.columns)
        }

        public async solvePartTwoAsync(data: DataType): Promise<string> {
            return ``
        }

        protected parseData(lines: string[]): DataType {
            const columns = lines[0].length
            const rows = lines.length
            var row = -1
            const data = lines.reduce((acc, line) => {
                row++
                return line.split('').reduce((acc, c, i) => {
                    switch (c) {
                        case '.': acc.holes.add((row * columns) + i); break
                        case '>': acc.east.add((row * columns) + i); break
                        case 'v': acc.south.add((row * columns) + i); break
                    }
                    return acc
                }, acc)
            }, { east: new Set<number>(), south: new Set<number>(), holes: new Set<number>() })
            return { ...data, columns: columns, rows: rows }
        }

        protected SAMPLE_DATA: string = 
`
v...>>.vv>
.vv>>.vv..
>>.>v>...v
>>v>>.>.v.
v>v.vv.v..
>.>>..v...
.vv..>.>v.
v.v..>>v.v
....v..v.>
`;
    }

    (async () => await new Solution().executeAsync())();
}