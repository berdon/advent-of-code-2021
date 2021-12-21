import AocSolution from './aoc/AocSolution';
import './collections'

namespace Problem07 {
    type DataType = number[]
    class Solution extends AocSolution<DataType> {
        public day: string = "07"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = false

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            var position = this.optimalPosition(data, (targetPoint, p, c, i) => p + Math.abs(targetPoint - c))
            return { message: `Best horizontal position at ${position.point} taking ${position.cost}` }
        }

        public async solvePartTwoAsync(data: DataType): Promise<string> {
            var position = this.optimalPosition(data, (targetPoint, p, c, i) => p + Array(Math.abs(targetPoint - c)).fill(0).reduce((p, c, i, v) => p + i + 1, 0))
            return `Best horizontal position at ${position.point} taking ${position.cost}`
        }

        protected parseData(lines: string[]): DataType {
            const data = lines[0].split(",").map(x => parseInt(x));
            return data
        }

        private optimalPosition(data: number[], costingReducer: (targetPoint: number, previous: number, curent: number, index: number) => number): { point: number, cost: number } {
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

        protected SAMPLE_DATA: string = `16,1,2,0,4,2,7,1,2,14`
    }

    (async () => await new Solution().executeAsync())();
}