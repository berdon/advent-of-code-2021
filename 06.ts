import AocSolution from './aoc/AocSolution';

namespace Problem06 {
    type DataType = School
    class Solution extends AocSolution<DataType> {
        public day: string = "06"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = false

        public async solvePartOneAsync(school: DataType): Promise<{ message: string, context?: any }> {
            for (var i = 0; i < 80; i++) {
                school.tick()
            }
            return { message: `There are ${school.count()} fish` }
        }

        public async solvePartTwoAsync(school: DataType): Promise<string> {
            for (var i = 80; i < 256; i++) {
                school.tick()
            }
            return `There are ${school.count()} fish`
        }

        protected parseData(lines: string[]): DataType {
            var fishPool: Fish[] = Array(7).fill(0).map(_ => new Fish())
            lines[0].split(",").map(x => parseInt(x)).forEach(timer => {
                fishPool[timer].count++
            })
            const data = new School(fishPool)
            return data
        }

        protected SAMPLE_DATA: string = `3,4,3,1,2`
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

    (async () => await new Solution().executeAsync())();
}