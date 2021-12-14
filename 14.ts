import AOC_AUTHN_COOKIES from './authtoken.json';
import * as got from "got"

namespace Problem14 {
    const DAY = 14;
    const DEBUG = false
    const URI_INPUT = `https://adventofcode.com/2021/day/${DAY}/input`
    const SAMPLE_DATA = 
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
    type Result = {result: string, counts: Map<string, number> }
    async function main() {
        // Part 1
        var { startTime, data } = await getInputDataAsync()
        const { result, counts } = generateFor(20, data.template, data.mapping)
        var max = [...counts.entries()].reduce((acc, c) => c[1] > acc[1] ? c : acc, ["", Number.MIN_VALUE])
        var min = [...counts.entries()].reduce((acc, c) => c[1] < acc[1] ? c : acc, ["", Number.MAX_VALUE])
        var diff = max[1] - min[1]
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 1: Max/min difference is ${diff} (${elapsed} ms)`)

        // Part 2
        var startTime = performance.now()
        
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
                nextCounts = generateFor(20, chunk, data.mapping)
                const lastCharacter = nextCounts.result[nextCounts.result.length - 1]
                if (i + CHUNK_SIZE < result.length)
                    nextCounts.counts.set(lastCharacter, nextCounts.counts.get(lastCharacter)! - 1)
                memoized.set(chunk, nextCounts)
            }
            else {
                //console.log("Memoized")
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
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 1: Max/min difference is ${diff} (${elapsed} ms)`)
    }

    function generateFor(steps: number, seed: string, mapping: Map<string, string>): { result: string, counts: Map<string, number> } {
        var derp: number[] = new Array(steps).fill(0)
        var output = derp.reduce((acc, _) => {
            var array = [...overlappingChunk(acc)]
            var output = array.map((chunk, i, a) => {
                const pair = chunk.join("")
                return chunk[0] + mapping.get(pair)! + ((i == a.length - 1) ? chunk[1] : "")
            }).reduce((acc, c, i, a) => acc + c, "")
            return output.split("")
        }, seed.split(""))
        return { result: output.join(""), counts: output.reduce((acc, c) => acc.set(c, (acc.get(c) ?? 0) + 1), new Map<string, number>())}
    }

    async function getInputDataAsync(): Promise<{ startTime: number, data: { template: string, mapping: Map<string, string> }}> {
        var lines: string[]
        if (DEBUG) {
            lines = SAMPLE_DATA.split('\n').filter(line => line != "").map(line => line.trim())
        }
        else {
            const response = await got.default(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
            lines = response.body.split('\n').filter(line => line != "").map(line => line.trim())
        }

        var startTime = performance.now()

        const template = lines.shift()!
        const data = lines.map(line => line.split(" -> ")).reduce((acc, c) => {
            acc.set(c[0], c[1])
            return acc
        } , new Map<string, string>());

        return { startTime: startTime, data: { template: template, mapping: data } }
    }

    function *overlappingChunk<T>(array: Array<T>, count = 2, overlap = 1): IterableIterator<Array<T>> {
        for (var i = 0; i < array.length - (count - 1); i += (count - overlap)) {
            yield array.slice(i, i + count)
        }
    }

    (async () => await main())();
}