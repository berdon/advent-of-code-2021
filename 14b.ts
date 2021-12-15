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
        
        var results = generate(data.template, 10, 10, data.mapping)
        var max = [...results.entries()].reduce((acc, c) => c[1] > acc[1] ? c : acc, ["", Number.MIN_VALUE])
        var min = [...results.entries()].reduce((acc, c) => c[1] < acc[1] ? c : acc, ["", Number.MAX_VALUE])
        var diff = max[1] - min[1]
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 1: Max/min difference is ${diff} (${elapsed} ms)`)

        // Part 2
        var startTime = performance.now()
        var results = generate(data.template, 20, 40, data.mapping)
        var max = [...results.entries()].reduce((acc, c) => c[1] > acc[1] ? c : acc, ["", Number.MIN_VALUE])
        var min = [...results.entries()].reduce((acc, c) => c[1] < acc[1] ? c : acc, ["", Number.MAX_VALUE])
        var diff = max[1] - min[1]
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 1: Max/min difference is ${diff} (${elapsed} ms)`)
    }

    function generate(seed: string, stepSize: number, totalSteps: number, mapping: Map<string, string>) {
        var result = generatePairs(seed, 0, stepSize, totalSteps, mapping, new Map<string, Result>())
        result.counts.set(seed[seed.length - 1], (result.counts.get(seed[seed.length - 1]) ?? 0) + 1)
        return result.counts
    }

    function generatePairs(seed: string, steps: number, stepSize: number, totalSteps: number, mapping: Map<string, string>, memoize: Map<string, Result>): { counts: Map<string, number> } {
        const chunks = [...overlappingChunk(seed.split(""))]
        const totalCounts = new Map<string, number>()
        var lastResult: string|null
        for (const chunk of chunks) {
            const basePair = chunk.join("")
            var { result, counts } = memoize.has(basePair) ? memoize.get(basePair)! : generateForBasePair(basePair, stepSize, mapping, memoize)
            lastResult = result

            if (steps + stepSize < totalSteps) {
                counts = generatePairs(result, steps + stepSize, stepSize, totalSteps, mapping, memoize).counts
            }

            counts.forEach((value, key) => totalCounts.set(key, (totalCounts.get(key) ?? 0) + value))
        }

        return { counts: totalCounts }
    }

    function generateForBasePair(basePair: string, steps: number, mapping: Map<string, string>, memoize: Map<string, Result>): { result: string, steps: number, counts: Map<string, number>, memoize: Map<string, Result> } {
        if (memoize.has(basePair)) {
            return {
                ...memoize.get(basePair)!,
                steps: steps,
                memoize: memoize
            }
        }

        const range: number[] = new Array(steps).fill(0)
        const output = range.reduce((acc, _) => {
            const array = [...overlappingChunk(acc)]
            const output = array.map((chunk, i, a) => {
                const pair = chunk.join("")
                return chunk[0] + mapping.get(pair)! + ((i == a.length - 1) ? chunk[1] : "")
            }).reduce((acc, c, i, a) => acc + c, "")
            return output.split("")
        }, basePair.split(""))

        const result = {
            result: output.join(""),
            counts: output.slice(0, -1).reduce((acc, c) => {
                return acc.set(c, (acc.get(c) ?? 0) + 1)
            }, new Map<string, number>()) }

        memoize.set(basePair, result)
        return {
            ...result,
            steps: steps,
            memoize: memoize
        }
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