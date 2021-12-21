import AocSolution from './aoc/AocSolution';

namespace Problem09 {
    type DataType = number[][]
    class Solution extends AocSolution<DataType> {
        public day: string = "09"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = false

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            var coloredData = data.map(row => row.map(c => ({ v: c, c: "black" })))

            // Color locally minimum nodes in each row red
            for (var y = 0; y < coloredData.length; y++) {
                for (var x = 0; x < coloredData[y].length; x++) {
                    if (x == 0) {
                        if (coloredData[y][x].v < coloredData[y][x + 1].v) coloredData[y][x].c = "red"
                    }
                    else if (x == coloredData[y].length - 1) {
                        if (coloredData[y][x].v < coloredData[y][x - 1].v) coloredData[y][x].c = "red"
                    }
                    else {
                        if (coloredData[y][x].v < coloredData[y][x - 1].v && coloredData[y][x].v < coloredData[y][x + 1].v) coloredData[y][x].c = "red"
                    }
                }
            }
            const minIndices = []

            // Add locally minimum red nodes to our array of minimum nodes
            for (var x = 0; x < coloredData[0].length; x++) {
                for (var y = 0; y < coloredData.length; y++) {
                    if (coloredData[y][x].c != "red") continue;
                    if (y == 0) {
                        if (coloredData[y][x].v < coloredData[y + 1][x].v) minIndices.push({ xy: [y, x], height: coloredData[y][x].v })
                    }
                    else if (y == coloredData.length - 1) {
                        if (coloredData[y][x].v < coloredData[y - 1][x].v) minIndices.push({ xy: [y, x], height: coloredData[y][x].v })
                    }
                    else {
                        if (coloredData[y][x].v < coloredData[y - 1][x].v && coloredData[y][x].v < coloredData[y + 1][x].v) minIndices.push({ xy: [y, x], height: coloredData[y][x].v })
                    }
                }
            }
            var sumOfRisk = minIndices.map(i => data[i.xy[0]][i.xy[1]]).reduce((p, c) => p + (c + 1), 0)
            return { message: `Sum of risk of all low levels is ${sumOfRisk}`, context: { minIndices: minIndices } }
        }

        public async solvePartTwoAsync(data: DataType, { minIndices }: { minIndices: { xy: number[]; height: number; }[]}): Promise<string> {
            const visitedPoints: Set<string> = new Set()
            var lowPoints = minIndices.sort((a, b) => a.height - b.height)
            var basins: number[][][] = []

            // Breadth first searching from each low point
            lowPoints.forEach(point => {
                const key = `[${point.xy[0]}, ${point.xy[1]}]`

                // Skip over a point if we've visited it meaning it was encompassed by another basin
                if (visitedPoints.has(key)) return

                const basin: number[][] = []
                basins.push(basin)
                const queue = [ point.xy ]
                while (queue.length > 0) {
                    const visiting = queue.shift()!
                    const x = visiting[1]
                    const y = visiting[0]
                    const visitingKey = `[${y}, ${x}]`
                    const height = data[y][x]

                    // Ensure we haven't visited while waiting to dequeue
                    if (visitedPoints.has(visitingKey)) continue;

                    // Enqueue any applicable adjacent points
                    if (x > 0 && data[y][x - 1] < 9) queue.push([y, x - 1])
                    if (y > 0 && data[y - 1][x] < 9) queue.push([y - 1, x])
                    if (x < (data[0].length - 1) && data[y][x + 1] < 9) queue.push([y, x + 1])
                    if (y < (data.length - 1) && data[y + 1][x] < 9) queue.push([y + 1, x])

                    // Mark the node visited and track it in the basin
                    basin.push(visiting)
                    visitedPoints.add(visitingKey)
                }
            })

            var productOfTopThree = basins.map(basin => basin.length)
                                        .sort((a, b) => b - a)
                                        .filter((v, i, a) => i < 3)
                                        .reduce((p, c) => p * c, 1)
            return `Product of the top three largest basin sizes is ${productOfTopThree}`
        }

        protected parseData(lines: string[]): DataType {
            const data = lines.map(line => line.split("").map(c => parseInt(c)));
            return data
        }

        protected SAMPLE_DATA: string = 
`
2199943210
3987894921
9856789892
8767896789
9899965678
`;
    }

    (async () => await new Solution().executeAsync())();
}