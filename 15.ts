import AocSolution from './aoc/AocSolution';
import PriorityQueue from 'ts-priority-queue'
import Console from './console'

namespace Problem15 {
    type DataType = number[][]
    class Solution extends AocSolution<DataType> {
        public day: string = "15"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = false

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            var result = this.visit(data, [0,0], [data[0].length - 1, data.length-1])
            if (this.SHOW_WORK) this.display(data, result.path)
            return { message: `Total risk is ${result.risk}` }
        }

        public async solvePartTwoAsync(data: DataType): Promise<string> {
            // Build the bigger map (because it's not really _that_ big)
            const largerGraph = new Array(data.length * 5).fill(0)
            for(var y = 0; y < data.length * 5; y++) largerGraph[y] = new Array(data[0].length * 5)
            for (var oy = 0; oy < 5; oy++) for (var ox = 0; ox < 5; ox++) {
                for (var y = 0; y < data.length; y++) for (var x = 0; x < data[0].length; x++) {
                    const actualY = (oy * data.length) + y
                    const actualX = (ox * data[0].length) + x
                    var risk = ((oy + ox) + data[y][x])
                    risk = risk > 9 ? risk - 9 : risk
                    largerGraph[actualY][actualX] = risk
                }
            }
            var result = this.visit(largerGraph, [0,0], [largerGraph[0].length - 1, largerGraph.length-1])
            if (this.SHOW_WORK) this.display(largerGraph, result.path)
            return `Total risk is ${result.risk}`
        }

        private display(graph: number[][], path: { key: string, risk: number }[]) {
            const pathKeys = new Set<string>(path.map(pair => pair.key))
            for(var y = 0; y < graph.length; y++) {
                for (var x = 0; x < graph[0].length; x++) {
                    const key = `${x},${y}`
                    if (pathKeys.has(key))
                        process.stdout.write(`${Console.FgWhite}${graph[y][x]}${Console.Reset}`);
                    else
                        process.stdout.write(`${Console.Dim}${graph[y][x]}${Console.Reset}`);
                }
                console.log("")
            }
        }
    
        private visit(graph: number[][], start: number[], end: number[]): { distances: Map<string, number>, previous: Map<string, string|null>, path: {key: string, risk: number}[], risk: number } {
            const height = graph.length
            const width = graph[0].length
            var toVisit = new PriorityQueue({ comparator: function(a: string, b: string) { return distances.get(a)! - distances.get(b)! } })
            const visited = new Set<string>()
            const distances = new Map<string, number>()
            const previous = new Map<string, string|null>()
            const startKey = `${start[0]},${start[1]}`
            const endKey = `${end[0]},${end[1]}`
            graph[start[1]][start[0]] = 0
    
            for (var x = 0; x < width; x++) for (var y = 0; y < height; y++) {
                const key = `${x},${y}`
                // toVisit.queue(key)
                distances.set(key, Number.MAX_VALUE)
                previous.set(key, null)
            }
    
            distances.set(startKey, 0)
            toVisit.queue(startKey)
    
            while (toVisit.length > 0) {
                var currentKey: string
                while (currentKey = toVisit.dequeue()) if (!visited.has(currentKey)) break
    
                if (currentKey === endKey) break
                const [currentX, currentY] = currentKey.split(",").map(x => parseInt(x))
                visited.add(currentKey)
    
                for (y = -1; y <= 1; y++) for (x = -1; x <= 1; x++) {
                    if (x == y || -x == y) continue
                    if (currentX + x < 0 || currentY + y < 0) continue
                    if (currentX + x >= graph[0].length || currentY + y >= graph.length) continue
                    const neighborKey = `${currentX + x},${currentY + y}`
                    if (visited.has(neighborKey)) continue
                    toVisit.queue(neighborKey)
                    const [neighborX, neighborY] = [currentX + x, currentY + y]
                    const altDistance = distances.get(currentKey)! + graph[neighborY][neighborX]
                    if (altDistance < (distances.get(neighborKey) ?? 0)) {
                        distances.set(neighborKey, altDistance)
                        previous.set(neighborKey, currentKey)
                    }
                }
            }
    
            const path: { key: string, risk: number }[] = []
            var walker: string|undefined|null = endKey
            while (!!walker) {
                const [walkerX, walkerY] = walker.split(",").map(x => parseInt(x))
                path.unshift({ key: walker, risk: graph[walkerY][walkerX] })
                walker = previous.get(walker)
            }
    
            return { distances: distances, previous: previous, path: path, risk: path.reduce((acc, pair) => acc + pair.risk, 0) }
        }

        protected parseData(lines: string[]): DataType {
            const data = lines.map(line => line.split("").map(x => parseInt(x)));
            return data
        }

        protected SAMPLE_DATA: string = 
`
1163751742
1381373672
2136511328
3694931569
7463417111
1319128137
1359912421
3125421639
1293138521
2311944581
`;
    }

    (async () => await new Solution().executeAsync())();
}