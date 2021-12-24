import AocSolution from './aoc/AocSolution';
import PriorityQueue from 'ts-priority-queue'

namespace Problem20 {
    type DataType = string[][]
    class Solution extends AocSolution<DataType> {
        public day: string = "20"
        protected DEBUG: boolean = true
        protected SHOW_WORK: boolean = true

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            const gameState = new GameState(data)
            const energy = this.organize(gameState)
            return { message: `Energy cost to organize is ${energy}` }
        }

        public async solvePartTwoAsync(data: DataType): Promise<string> {
            data.splice(3, 0, "  #D#C#B#A#".split(""))
            data.splice(4, 0, "  #D#B#A#C#".split(""))
            const gameState = new GameState(data)
            const energy = this.organize(gameState)
            return `Energy cost to organize is ${energy}`
        }

        private organize(gameState: GameState) {
            const queue = new PriorityQueue<GameState>({ comparator: (a, b) => a.energy - b.energy })
            queue.queue(gameState)
            const visited = new Set<string>()
            while(queue.length > 0) {
                const current = queue.dequeue()
                const key = current.board.reduce((acc, c) => acc + c.join(), "")
                if (visited.has(key)) continue
                if (current.isOrganized()) return current.energy
                visited.add(key);
                [...current.neighboringStates()].forEach(neighbor => queue.queue(neighbor))
            }

            throw "Derp"
        }

        protected override cleanLine(line: string): string {
            return line
        }

        protected parseData(lines: string[]): DataType {
            const data = lines.map(line => line.split(""))
            return data
        }

        protected SAMPLE_DATA: string = 
`
#############
#...........#
###B#C#A#D###
  #B#C#D#A#
  #########
`;
    }

    type Amphipod = 'A'|'B'|'C'|'D'
    const EMPTY = "."
    type BoardValue = Amphipod|"."
    
    class GameState {
        public board: string[][]
        public energy: number

        public get hallwayLength(): number { return this.board[0].length - 2 }
        public get roomLength(): number { return this.board.length - 3 }

        constructor(board: string[][], energy = 0) {
            this.board = board
            this.energy = energy
        }

        public cost(amphipod: Amphipod): number { return [1, 10, 100, 1000][this.roomForAmphipod(amphipod)] }
        public costForMovement(amphipod: Amphipod, movement: number): number { return this.cost(amphipod) * movement }
        public getHallwayPosition(position: number): BoardValue { return this.board[1][1 + position] as BoardValue }
        public setHallwayPosition(position: number, value: BoardValue) { this.board[1][1 + position] = value }
        public getHallwayPositionOfRoom(roomNumber: number): number { return 3 + 2 * roomNumber - 1 }
        public getRoomPosition(roomNumber: number, position: number): BoardValue { return this.board[2 + position][3 + 2 * roomNumber] as BoardValue }
        public setRoomPosition(roomNumber: number, position: number, value: BoardValue) { this.board[2 + position][3 + 2 * roomNumber] = value }
        public hallway(): BoardValue[] { return this.board[1].slice(1, -1) as BoardValue[] }
        public amphipodForRoom(roomNumber: number): Amphipod { return ['A', 'B', 'C', 'D'][roomNumber] as Amphipod }
        public roomForAmphipod(amphipod: Amphipod): number { return (amphipod as string).charCodeAt(0) - 'A'.charCodeAt(0) }
        public room(roomNumber: number): BoardValue[] {
            return new Array(this.roomLength).fill('.').map((_, i) => this.getRoomPosition(roomNumber, i))
        }
        public isRoomOrganized(roomNumber: number): boolean {
            return this.room(roomNumber).filter(c => c != '.' && c != this.amphipodForRoom(roomNumber)).length == 0
        }
        public peekAmphipod(roomNumber: number): { amphipod: Amphipod, position: number }|null {
            const roomOccupants = this.room(roomNumber)
            for (var i = 0; i < this.roomLength; i++) {
                if (roomOccupants[i] != EMPTY) {
                    return { amphipod: roomOccupants[i] as Amphipod, position: i }
                }
            }
            return null
        }
        public popAmphipod(roomNumber: number): { amphipod: Amphipod|null, movement: number, cost: number}|null {
            const peek = this.peekAmphipod(roomNumber)
            if (peek == null) return null
            const { amphipod, position } = peek
            this.setRoomPosition(roomNumber, position, EMPTY)
            return { amphipod: amphipod, movement: position + 1, cost: this.costForMovement(amphipod, position + 1) }
        }
        public pushAmphipod(roomNumber: number, amphipod: Amphipod): { amphipod: Amphipod, movement: number, cost: number}|null {
            const roomOccupants = this.room(roomNumber)
            var availablePosition = -1
            while (roomOccupants[availablePosition + 1] == "." && availablePosition + 1 < this.roomLength) availablePosition++
            if (availablePosition == this.roomLength) throw "Cannot push ampiphod into full room"
            this.setRoomPosition(roomNumber, availablePosition, amphipod)
            return { amphipod: amphipod, movement: availablePosition + 1, cost: this.costForMovement(amphipod, availablePosition + 1) }
        }
        public *neighboringStates(): IterableIterator<GameState> {
            var neighborCount = 0
            for (var hallwayPosition = 0; hallwayPosition < this.hallwayLength; hallwayPosition++) {
                const hallwayValue = this.getHallwayPosition(hallwayPosition)
                if (hallwayValue == EMPTY) continue

                const roomIndex = this.roomForAmphipod(hallwayValue)
                const roomReady = this.isRoomOrganized(roomIndex)
                if (!roomReady) continue

                const targetHallwayPosition = this.getHallwayPositionOfRoom(roomIndex)
                const pathStart = targetHallwayPosition > hallwayPosition ? hallwayPosition + 1 : hallwayPosition - 1
                const pathRange = [pathStart, targetHallwayPosition].sort()
                const hallwayDistance = 1 + (pathRange[1] - pathRange[0])
                const pathEmpty = this.hallway().slice(pathRange[0], pathRange[1]).filter(c => c != EMPTY).length == 0

                if (!pathEmpty) continue;
                const gameState = new GameState(this.cloneBoard(), this.energy)
                gameState.setHallwayPosition(hallwayPosition, EMPTY)
                const { amphipod, movement, cost: pushCost } = gameState.pushAmphipod(roomIndex, hallwayValue)!
                gameState.energy += gameState.costForMovement(amphipod, Math.abs(hallwayDistance)) + pushCost

                neighborCount++
                yield gameState
            }

            // Don't remove amphipods from rooms if there are rooms to fill
            if (neighborCount > 0) return

            for (var roomNumber = 0; roomNumber < 4; roomNumber++) {
                if (this.isRoomOrganized(roomNumber)) continue

                const { amphipod: target, position } = this.peekAmphipod(roomNumber)!
                const roomPosition = this.getHallwayPositionOfRoom(roomNumber)
                for (const direction of [-1, 1]) {
                    var distance = direction
                    while (roomPosition + distance >= 0 && roomPosition + distance < this.hallwayLength && this.getHallwayPosition(roomPosition + distance) == ".") {
                        if ((roomPosition + distance) % 2 == 0 && (roomPosition + distance) != 0 && (roomPosition + distance) != 10) {
                            distance += direction
                            continue;
                        }

                        const gameState = new GameState(this.cloneBoard(), this.energy)
                        gameState.setHallwayPosition(roomPosition + distance, target)
                        const { amphipod, movement, cost: popCost } = gameState.popAmphipod(roomNumber)!
                        gameState.energy += gameState.costForMovement(target, Math.abs(distance)) + popCost

                        neighborCount++
                        yield gameState

                        distance += direction
                    }
                }
            }
        }
        public cloneBoard(): string[][] {
            return [...this.board.map(row => [...row])]
        }
        public isOrganized(): boolean {
            if (this.hallway().filter(c => c != ".").length > 0) return false
            for (var roomNumber = 0; roomNumber < 4; roomNumber++) {
                if (!this.isRoomOrganized(roomNumber)) return false
            }
            return true
        }
        public display() {
            this.board.forEach(line => console.log(line.join("")))
            console.log("")
        }
    }

    (async () => await new Solution().executeAsync())();
}