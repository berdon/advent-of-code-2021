import AOC_AUTHN_COOKIES from './authtoken.json';
import * as got from "got"

namespace Problem06 {
    const DAY = 6;
    const DEBUG = false
    const URI_INPUT = `https://adventofcode.com/2021/day/${DAY}/input`
    const URI_SUBMIT = `https://adventofcode.com/2021/day/${DAY}/answer`
    const SAMPLE_DATA = `3,4,3,1,2`;
    async function main() {
        // Part 1
        var { startTime, data: school } = await getInputDataAsync()
        var elapsed = (performance.now() - startTime).toFixed(2)

        for (var i = 0; i < 80; i++) {
            school.tick()
        }

        console.log(`Part 1: There are ${school.count()} fish (${elapsed} ms)`)

        var startTime = performance.now()
        for (var i = 80; i < 256; i++) {
            school.tick()
        }

        console.log(`Part 2: There are ${school.count()} fish (${elapsed} ms)`)
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

    async function getInputDataAsync(): Promise<{ startTime: number, data: School}> {
        var lines: string[]
        if (DEBUG) {
            lines = SAMPLE_DATA.split('\n').filter(line => line != "").map(line => line.trim())
        }
        else {
            const response = await got.default(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
            lines = response.body.split('\n').filter(line => line != "").map(line => line.trim())
        }

        var startTime = performance.now()

        var fishPool: Fish[] = Array(7).fill(0).map(_ => new Fish())
        lines[0].split(",").map(x => parseInt(x)).forEach(timer => {
            fishPool[timer].count++
        })
        const data = new School(fishPool)

        return { startTime: startTime, data: data }
    }

    class Fish {
        count: number = 0
    }

    class School {
        private fish: Fish[]
        private holdingPen: number[] = [0, 0]
        private breedDay = 0
        private day = 0
        count = () => this.fish.reduce((p, c) => p + c.count, 0) + this.holdingPen[0] + this.holdingPen[1]

        constructor(fish: Fish[]) {
            this.fish = fish
        }

        tick() {
            this.day += 1
            var spawnedFish = this.fish[this.breedDay].count
            this.breedDay = (this.breedDay + 1) % 7
            this.fish[(this.breedDay + 6) % 7].count += this.holdingPen.shift()!
            this.holdingPen.push(spawnedFish)
        }

        private nextDay(val: number): number {
            if (val - (this.day % 7) < 0) return val + 7 - (this.day % 7)
            return val - this.day
        }

        public toString = () : string => {
            const fish = this.fish.map((x, i, _) => Array(x.count).fill(this.nextDay(i))).concat(Array(this.holdingPen[0]).fill(7)).concat(Array(this.holdingPen[1]).fill(8)).flat().reduce((p, c) => p + `${c},`, "")
            return `After\t${this.day} days: ${fish}`;
        }
    }

    (async () => await main())();
}