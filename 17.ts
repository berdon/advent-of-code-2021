import AocSolution from './aoc/AocSolution';

namespace Problem17 {
    type DataType = { x: number[]; y: number[]; }
    class Solution extends AocSolution<DataType> {
        public day: string = "17"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = false

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            const validX = this.validXRange(data.x[0], data.x[1])
            const validY = this.validYRange(validX, data.y[0], data.y[1])
            const max = Math.max(...validY.map(y => y.height))
            return { message: `Max y position is ${max}`, context: validX }
        }

        public async solvePartTwoAsync(data: DataType, validX: { x: number; steps: number; }[]): Promise<string> {
            this.simulate(new Vector(data.x[0], data.y[0]), new Vector(data.x[1], data.y[1]), new Vector(6, 0))
            const validVelocities = []
            for (var x = Math.min(...validX.map(x => x.x)); x <= 500; x++) {
                for (var y = -500; y <= 500; y++) {
                    const velocity = new Vector(x, y)
                    if (this.simulate(new Vector(data.x[0], data.y[0]), new Vector(data.x[1], data.y[1]), velocity)) validVelocities.push(velocity)
                }
            }
            return `Number of possible velocities is ${validVelocities.length}`
        }

        private simulate(targetMin: Vector, targetMax: Vector, velocity: Vector): boolean {
            var position = new Vector(0, 0)
            while (position.y > targetMin.y) {
                const result = this.step(position, velocity)
                position = result.position
                velocity = result.velocity
                if (position.x >= targetMin.x && position.x <= targetMax.x
                    && position.y >= targetMin.y && position.y <= targetMax.y)
                    return true
            }
            return (position.x >= targetMin.x && position.x <= targetMax.x
                && position.y >= targetMin.y && position.y <= targetMax.y)
        }
    
        private validYRange(validX: { x: number, steps: number }[], yMin: number, yMax: number) {
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
    
        private validXRange(xMin: number, xMax: number) {
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
    
        private step(position: Vector, velocity: Vector): { velocity: Vector, position: Vector, dv: Vector, dp: Vector } {
            const nextPosition = new Vector(position.x + velocity.x, position.y + velocity.y)
            const nextVelocity = new Vector(Math.max(0, velocity.x - 1), velocity.y - 1)
            return {
                position: nextPosition,
                velocity: nextVelocity,
                dv: new Vector(nextVelocity.x - velocity.x, nextVelocity.y - velocity.y),
                dp: new Vector(nextPosition.x - position.x, nextPosition.y - position.y),
            }
        }

        protected parseData(lines: string[]): DataType {
            const data = lines[0].slice(14).split(", ").map(x => x.split("=")[1].split("..").map(val => parseInt(val)));
            return {
                x: [Math.min(...data[0]), Math.max(...data[0])],
                y: [Math.min(...data[1]), Math.max(...data[1])]
            }
        }

        protected SAMPLE_DATA: string = `target area: x=20..30, y=-10..-5`;
    }
    
    class Vector {
        public x: number
        public y: number

        constructor(x: number, y: number) {
            this.x = x
            this.y = y
        }
    }

    (async () => await new Solution().executeAsync())();
}