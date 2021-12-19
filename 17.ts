import AOC_AUTHN_COOKIES from './authtoken.json';
import * as got from "got"

namespace Problem17 {
    const DAY = 17;
    const DEBUG = false
    const URI_INPUT = `https://adventofcode.com/2021/day/${DAY}/input`
    const SAMPLE_DATA = 
`
target area: x=20..30, y=-10..-5
`;
    async function main() {
        // Part 1
        var { startTime, data } = await getInputDataAsync()
        var position = new Vector(0, 0)
        var velocity = new Vector(data.x[1], 10)
        const validX = validXRange(data.x[0], data.x[1])
        const validY = validYRange(validX, data.y[0], data.y[1])
        const max = Math.max(...validY.map(y => y.height))
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 1: Max y position is ${max} (${elapsed} ms)`)

        // Part 2 (Brute force for now; :cry:)
        var startTime = performance.now()
        simulate(new Vector(data.x[0], data.y[0]), new Vector(data.x[1], data.y[1]), new Vector(6, 0))
        const validVelocities = []
        for (var x = Math.min(...validX.map(x => x.x)); x <= 500; x++) {
            for (var y = -500; y <= 500; y++) {
                const velocity = new Vector(x, y)
                if (simulate(new Vector(data.x[0], data.y[0]), new Vector(data.x[1], data.y[1]), velocity)) validVelocities.push(velocity)
            }
        }
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 2: Number of possible velocities is ${validVelocities.length} (${elapsed} ms)`)
    }

    function simulate(targetMin: Vector, targetMax: Vector, velocity: Vector): boolean {
        var position = new Vector(0, 0)
        while (position.y > targetMin.y) {
            const result = step(position, velocity)
            position = result.position
            velocity = result.velocity
            if (position.x >= targetMin.x && position.x <= targetMax.x
                && position.y >= targetMin.y && position.y <= targetMax.y)
                return true
        }
        return (position.x >= targetMin.x && position.x <= targetMax.x
            && position.y >= targetMin.y && position.y <= targetMax.y)
    }

    function validYRange(validX: { x: number, steps: number }[], yMin: number, yMax: number) {
        const validY: { y: number, steps: number, height: number }[] = []
        var initialY = 0
        while (true) {
            var yPos = 0
            var yVelocity = initialY
            var landedBefore = false
            var landedAfter = false
            var steps = 0
            var height = 0
            while (yPos > yMin) {
                yPos += yVelocity
                landedBefore = landedBefore || (yPos > yMin)
                landedAfter = landedAfter || (yPos < yMin)
                yVelocity--
                steps++
                height = Math.max(height, yPos)
            }
            if (yPos >= yMin && yPos <= yMax) {
                validY.unshift({y: yVelocity, steps: steps, height: height })
            }
            if (initialY > 100) break
            initialY++
        }
        return validY
    }

    function validXRange(xMin: number, xMax: number) {
        var initialX = 0
        const validX = []
        while(initialX < xMin) {
            var total = 0
            var steps = 0
            for (var x = initialX; x > 1; x--) {
                total += x
                steps++
            }
            if (total >= xMin && total <= xMax) {
                validX.unshift({ x: initialX, steps: steps })
            }
            initialX++
        }
        return validX
    }

    function step(position: Vector, velocity: Vector): { velocity: Vector, position: Vector, dv: Vector, dp: Vector } {
        const nextPosition = new Vector(position.x + velocity.x, position.y + velocity.y)
        const nextVelocity = new Vector(Math.max(0, velocity.x - 1), velocity.y - 1)
        return {
            position: nextPosition,
            velocity: nextVelocity,
            dv: new Vector(nextVelocity.x - velocity.x, nextVelocity.y - velocity.y),
            dp: new Vector(nextPosition.x - position.x, nextPosition.y - position.y),
        }
    }

    class Vector {
        public x: number
        public y: number

        constructor(x: number, y: number) {
            this.x = x
            this.y = y
        }
    }

    async function getInputDataAsync(): Promise<{ startTime: number, data: { x: number[], y: number[] }}> {
        var lines: string[]
        if (DEBUG) {
            lines = SAMPLE_DATA.split('\n').filter(line => line != "").map(line => line.trim())
        }
        else {
            const response = await got.default(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
            lines = response.body.split('\n').filter(line => line != "").map(line => line.trim())
        }

        var startTime = performance.now()

        const data = lines[0].slice(14).split(", ").map(x => x.split("=")[1].split("..").map(val => parseInt(val)));

        return { startTime: startTime, data: {
            x: [Math.min(...data[0]), Math.max(...data[0])],
            y: [Math.min(...data[1]), Math.max(...data[1])] } }
    }

    (async () => await main())();
}