import AOC_AUTHN_COOKIES from './authtoken.json';
import * as got from "got"

declare global {
    interface Array<T> {
        movingAverage(): number
    }
}

Array.prototype.movingAverage = function() {
    return this.reduce((p, c, i, _) => (c + i * p) / (i + 1), 0)
}

namespace Problem07 {
    const DAY = 7;
    const DEBUG = false
    const URI_INPUT = `https://adventofcode.com/2021/day/${DAY}/input`
    const URI_SUBMIT = `https://adventofcode.com/2021/day/${DAY}/answer`
    const SAMPLE_DATA = `16,1,2,0,4,2,7,1,2,14`;
    async function main() {
        // Part 1
        var { startTime, data } = await getInputDataAsync()
        var position = optimalPosition(data, (targetPoint, p, c, i) => p + Math.abs(targetPoint - c))
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 1: Best horizontal position at ${position.point} taking ${position.cost} (${elapsed} ms)`)

        // Part 2
        var startTime = performance.now()
        var position = optimalPosition(data, (targetPoint, p, c, i) => p + Array(Math.abs(targetPoint - c)).fill(0).reduce((p, c, i, v) => p + i + 1, 0))
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 2: Best horizontal position at ${position.point} taking ${position.cost} (${elapsed} ms)`)
    }

    function optimalPosition(data: number[], costingReducer: (targetPoint: number, previous: number, curent: number, index: number) => number): { point: number, cost: number } {
        var averagePoint = Math.round(data.movingAverage())

        // Determine the starting fuel cost
        var averageFuel = data.reduce((p, c, i, _) => costingReducer(averagePoint, p, c, i), 0)

        var optimalUpPoint = averagePoint
        var optimalUpFuel = averageFuel
        var walkingPoint = averagePoint
        var walkingFuel = averageFuel

        while (true) {
            walkingPoint++
            var walkingFuel = data.reduce((p, c, i, _) => costingReducer(walkingPoint, p, c, i), 0)

            if (walkingFuel > optimalUpFuel) break;

            optimalUpFuel = walkingFuel
            optimalUpPoint = walkingPoint
        }

        var optimalDownPoint = averagePoint
        var optimalDownFuel = averageFuel
        var walkingPoint = averagePoint
        var walkingFuel = averageFuel

        while (true) {
            walkingPoint--
            var walkingFuel = data.reduce((p, c, i, _) => costingReducer(walkingPoint, p, c, i), 0)

            if (walkingFuel > optimalDownFuel) break;

            optimalDownFuel = walkingFuel
            optimalDownPoint = walkingPoint
        }

        var optimalFuel = optimalUpFuel < optimalDownFuel ? optimalUpFuel : optimalDownFuel
        var optimalPoint = optimalUpFuel < optimalDownFuel ? optimalUpPoint : optimalDownPoint

        return { point: optimalPoint, cost: optimalFuel }
    }

    async function submitAnswerAsync(value: string, part: string) {
        try {
            const response = await got.post(URI_SUBMIT, {
                json: { level: part, answer: value } as any,
                headers: { Cookie: AOC_AUTHN_COOKIES }
            })
            console.log(response.statusCode);
        } catch (error) {
            console.log(error)
        }
    }

    async function getInputDataAsync(): Promise<{ startTime: number, data: any[]}> {
        var lines: string[]
        if (DEBUG) {
            lines = SAMPLE_DATA.split('\n').filter(line => line != "").map(line => line.trim())
        }
        else {
            const response = await got.default(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
            lines = response.body.split('\n').filter(line => line != "").map(line => line.trim())
        }

        var startTime = performance.now()

        const data = lines[0].split(",").map(x => parseInt(x));

        return { startTime: startTime, data: data }
    }

    (async () => await main())();
}