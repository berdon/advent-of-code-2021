import AocSolution from './aoc/AocSolution';

namespace Problem14 {
    type DataType = { template: string; mapping: Map<string, string>; }
    type Result = {result: string, counts: Map<string, number> }
    class Solution extends AocSolution<DataType> {
        public day: string = "14"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = false

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            var { result, counts } = this.generateFor(10, data.template, data.mapping)
            var max = [...counts.entries()].reduce((acc, c) => c[1] > acc[1] ? c : acc, ["", Number.MIN_VALUE])
            var min = [...counts.entries()].reduce((acc, c) => c[1] < acc[1] ? c : acc, ["", Number.MAX_VALUE])
            var diff = max[1] - min[1]
            return { message: `Max/min difference is ${diff}` }
        }

        public async solvePartTwoAsync(data: DataType): Promise<string> {
            // Recalculate inital results for 20 steps which we'll use for memoization after
            var { result, counts } = this.generateFor(20, data.template, data.mapping)
            // Take the current output and divide it into manageable chunks to work on 20 more times
            const runningCounts = new Map<string, number>()
            const CHUNK_SIZE = 2//data.template.length
            const memoized: Map<String, Result> = new Map()

            // TODO: Iteration is bad heh, going over the actual length
            for (var i = 1; i <= (result.length + 1 - CHUNK_SIZE); i += CHUNK_SIZE - 1) {
                // if (i % 100000 == 0) console.log("100k")
                const chunk = result.slice(i - 1, (i - 1) + CHUNK_SIZE)
                if (!chunk || chunk.length == 0) continue

                var nextCounts: Result
                if (!memoized.has(chunk)) {
                    nextCounts = this.generateFor(20, chunk, data.mapping)
                    const lastCharacter = nextCounts.result[nextCounts.result.length - 1]
                    if (i + CHUNK_SIZE < result.length)
                        nextCounts.counts.set(lastCharacter, nextCounts.counts.get(lastCharacter)! - 1)
                    memoized.set(chunk, nextCounts)
                }
                else {
                    // Memoized result
                    nextCounts = memoized.get(chunk)!
                }

                for(var pair of nextCounts.counts) {
                    runningCounts.set(pair[0], (runningCounts.get(pair[0]) ?? 0) + pair[1])
                }

                const lastCharacter = nextCounts.result[nextCounts.result.length - 1]
                if (i + CHUNK_SIZE >= result.length)
                    runningCounts.set(lastCharacter, runningCounts.get(lastCharacter)! + 1)
            }

            var max = [...runningCounts.entries()].reduce((acc, c) => c[1] > acc[1] ? c : acc, ["", Number.MIN_VALUE])
            var min = [...runningCounts.entries()].reduce((acc, c) => c[1] < acc[1] ? c : acc, ["", Number.MAX_VALUE])
            var diff = max[1] - min[1]
            return `Max/min difference is ${diff}`
        }

        private generateFor(steps: number, seed: string, mapping: Map<string, string>): { result: string, counts: Map<string, number> } {
            var derp: number[] = new Array(steps).fill(0)
            var output = derp.reduce((acc, _) => {
                var array = [...this.overlappingChunk(acc)]
                var output = array.map((chunk, i, a) => {
                    const pair = chunk.join("")
                    return chunk[0] + mapping.get(pair)! + ((i == a.length - 1) ? chunk[1] : "")
                }).reduce((acc, c, i, a) => acc + c, "")
                return output.split("")
            }, seed.split(""))
            return { result: output.join(""), counts: output.reduce((acc, c) => acc.set(c, (acc.get(c) ?? 0) + 1), new Map<string, number>())}
        }

        private *overlappingChunk<T>(array: Array<T>, count = 2, overlap = 1): IterableIterator<Array<T>> {
            for (var i = 0; i < array.length - (count - 1); i += (count - overlap)) {
                yield array.slice(i, i + count)
            }
        }

        protected parseData(lines: string[]): DataType {
            const template = lines.shift()!
            const data = lines.map(line => line.split(" -> ")).reduce((acc, c) => {
                acc.set(c[0], c[1])
                return acc
            } , new Map<string, string>());
            return { template: template, mapping: data }
        }

        protected SAMPLE_DATA: string = 
`
NNCB

CH -> B
HH -> N
CB -> H
NH -> C
HB -> C
HC -> B
HN -> C
NN -> C
BH -> H
NC -> B
NB -> B
BN -> B
BB -> N
BC -> B
CC -> N
CN -> C
`;
    }

    (async () => await new Solution().executeAsync())();
}