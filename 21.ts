import AocSolution from './aoc/AocSolution';

namespace Problem21 {
    type DataType = number[]
    class Solution extends AocSolution<DataType> {
        public day: string = "21"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = false

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            let scores = [ 0, 0, 0]
            let roll = 0
            let roller = -1
            let positions = [...data]
            while (Math.max(...scores) < 1000) {
                roll++
                roller = (roller + 1) % 2
                const scoreSum = (9 * (roll - 1) + 6)
                const scoreChange = (positions[roller] + scoreSum) % 10
                scores[roller] += (scoreChange == 0 ? 10 : scoreChange)
                const lastPosition = positions[roller]
                positions[roller] = (scoreChange == 0 ? 10 : scoreChange)
                if (this.SHOW_WORK)
                    console.log(`Player ${roller + 1} rolls ${roll*3}+${roll*3+1}+${roll*3+2} [${scoreSum}@${lastPosition}] and moves to space ${positions[roller]} for a total score of ${scores[roller]}`)
            }
            return { message: `Roller ${roller} won on roll ${roll} with a score of ${scores[roller]}\n`
                            + `        The loser lost at score ${scores[(roller + 1) % 2]} for a value of ${scores[(roller + 1) % 2] * roll * 3}` }
        }

        public async solvePartTwoAsync(data: DataType): Promise<string> {
            var mapping = new Map<string, number>()
            mapping.set(new GameState(data, [0, 0]).key, 1)
            var roller = -1
            var universeVictories = [0,0]
            while(mapping.size > 0) {
                roller = (roller + 1) % 2
                const entries = [...mapping.entries()]
                const oldMapping = mapping
                mapping = new Map<string, number>()
                for (var entry of entries) {
                    const gameState = GameState.from(entry[0])
                    const oldKey = gameState.key
                    const inboundUniverses = oldMapping.get(oldKey)!
                    for (var nextState of gameState.roll(roller)) {
                        const key = nextState.key
                        if (Math.max(...nextState.scores) >= 21) {
                            universeVictories[roller] += (mapping.get(key) ?? 0) + inboundUniverses
                        }
                        else {
                            mapping.set(key, (mapping.get(key) ?? 0) + inboundUniverses)
                        }
                    }
                }
            }
            return `Player ${universeVictories.findIndex(x => x == Math.max(...universeVictories))} won the most times across ${Math.max(...universeVictories)} universes`
        }

        protected parseData(lines: string[]): DataType {
            const data = lines.map(line => parseInt(line.split(": ")[1]))
            return data
        }

        protected SAMPLE_DATA: string = 
`
Player 1 starting position: 4
Player 2 starting position: 8
`;
    }

    class GameState {
        public positions: number[]
        public scores: number[]

        constructor(positions: number[], scores: number[]) {
            this.positions = positions
            this.scores = scores
        }

        public static from(key: String) {
            const tokens = key.split(":")
            return new GameState(tokens[0].split(",").map(x => parseInt(x)), tokens[1].split(",").map(x => parseInt(x)))
        }

        public get key(): string {
            return `${this.positions.join(",")}:${this.scores.join(",")}`
        }

        public *roll(roller: number): IterableIterator<GameState> {
            for (var roll of this._roll()) {
                const positions = [...this.positions]
                const scores = [...this.scores]
                const scoreChange = (positions[roller] + roll) % 10
                scores[roller] += (scoreChange == 0 ? 10 : scoreChange)
                positions[roller] = (scoreChange == 0 ? 10 : scoreChange)
                yield new GameState(positions, scores)
            }
        }

        private *_roll(): IterableIterator<number> {
            for (var i = 1; i <= 3; i++) for (var j = 1; j <= 3; j++) for (var k = 1; k <= 3; k++)
                yield i + j + k
        }
    }

    (async () => await new Solution().executeAsync())();
}