import AocSolution from './aoc/AocSolution';

namespace Problem24 {
    type DataType = Instruction[]
    class Solution extends AocSolution<DataType> {
        public day: string = "24"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = true

        // public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
        //     var serial = 99999999999999
        //     var result: ExecutionState|null = null
        //     for (var serial = 99999999999999; serial > 0; serial--) {
        //         result = this.isModelNumberValid(serial.toString(), data)
        //         if (result.z == 0) break
        //     }
        //     return { message: `${this.executionStateAsString(result!)}` }
        // }

        private addState: ((state: ExecutionState) => boolean)[] = [
            (state) => state.z < 8031810176,
            (state) => state.z < 8031810176,
            (state) => state.z < 8031810176,
            (state) => state.z < 8031810176,    // 8
            (state) => state.z < 308915776,     // 7
            (state) => state.z < 308915776,     // 6
            (state) => state.z < 11881376,
            (state) => state.z < 11881376,
            (state) => state.z < 11881376,      // 5
            (state) => state.z < 456976,        // 4
            (state) => state.z < 17576,         // 3
            (state) => state.z < 676,           // 2
            (state) => state.z < 26,
            (state) => state.z == 0,
        ]

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            const digitIncides = data.map((c, i) => [i, c] as [number, Instruction]).filter(c => c[1].operation == Operation.inp)
            const digitInstructionSets = digitIncides.map((index, di, a) => di < a.length - 1 ?  data.slice(index[0], a[di + 1][0]) : data.slice(index[0]))

            var states = new Map<string, { state: ExecutionState, input: string }>()
            states.set(executionStateKey({ w: 0, x: 0, y: 0, z: 0 } as ExecutionState), { state: { w: 0, x: 0, y: 0, z: 0 } as ExecutionState, input: "" })

            // const digitsToProcess = 9
            var digitIndex = 0
            for (const set of digitInstructionSets) {
                const nextStates = new Map<string, { state: ExecutionState, input: string }>()
                console.log(states.size)
                for (const state of states.values()) {
                    const previousInput = state.input
                    for (var i = 9; i > 0; i--) {
                        const result = set.reduce((state, inst) => {
                            const operation = Operation[inst.operation]
                            // process.stdout.write(`${inst.toString()}\t[${state.output}:${this.executionStateAsString(state.executionState)}] => `)
                            const nextState = inst.execute(state.output, state.executionState)
                            // console.log(`[${state.output}:${this.executionStateAsString(nextState.executionState)}]`)
                            return nextState
                        }, { output: `${i}`, executionState: state.state})
                        const key = executionStateKey(result.executionState)
                        if (this.addState[digitIndex](result.executionState) && !nextStates.has(key)) {
                            nextStates.set(key, { state: result.executionState, input: previousInput + i.toString() })
                        }
                    }
                }
                states = nextStates
                digitIndex++
                // if (digitIndex == digitsToProcess) break
            }

            return { message: `` }
        }

        public checkLastDigits(lastDigits: string, instructions: DataType, state: ExecutionState): ExecutionState {
            const result = instructions.reduce((state, inst) => {
                const nextState = inst.execute(state.output, state.executionState)
                return nextState
            }, { output: `${lastDigits}`, executionState: state })
            return result.executionState
        }

        public isModelNumberValid(modelNumber: string, data: DataType): ExecutionState {
            const result = data.reduce((state, inst) => {
                const operation = Operation[inst.operation]
                // process.stdout.write(`${inst.toString()}\t[${state.output}:${this.executionStateAsString(state.executionState)}] => `)
                const nextState = inst.execute(state.output, state.executionState)
                // if (inst.operation == Operation.inp)
                // console.log(`${modelNumber} => ${this.executionStateAsString(state.executionState)}`)
                // console.log(`[${state.output}:${this.executionStateAsString(nextState.executionState)}]`)
                return nextState
            }, { output: `${modelNumber}`, executionState: { w: 0, x: 0, y: 0, z: 0 } as ExecutionState})
            // console.log(`${modelNumber} => ${this.executionStateAsString(result.executionState)}`)
            return result.executionState
        }

        public async solvePartTwoAsync(data: DataType): Promise<string> {
            return ``
        }

        protected parseData(lines: string[]): DataType {
            const data = lines.map(line => {
                const tokens = line.split(' ')
                const operation = Operation[tokens[0] as keyof typeof Operation]
                switch (operation) {
                    case Operation.add: return new AddInstruction(tokens.slice(1))
                    case Operation.mul: return new MulInstruction(tokens.slice(1))
                    case Operation.div: return new DivInstruction(tokens.slice(1))
                    case Operation.mod: return new ModInstruction(tokens.slice(1))
                    case Operation.eql: return new EqualInstruction(tokens.slice(1))
                    case Operation.inp: return new InputInstruction(tokens.slice(1))
                }
            })
            return data
        }

        private executionStateAsString(executionState: ExecutionState) {
            return `{ w: ${executionState.w}, x: ${executionState.x}, y: ${executionState.y}, z: ${executionState.z} }`
        }

        protected SAMPLE_DATA: string = 
`
inp w
add x -5
`;
    }

    enum Operation {
        inp,
        add,
        mul,
        div,
        mod,
        eql
    }

    type Variable = 'w'|'x'|'y'|'z'
    type ExecutionState = {[Key: string]: number}
    function executionStateKey(executionState: ExecutionState): string {
        return JSON.stringify(executionState)
    }

    abstract class Instruction {
        public abstract operation: Operation
        constructor(tokens: string[]) { }
        abstract execute(input: string, executionState: ExecutionState): { output: string, executionState: ExecutionState }
        abstract toString(): string
    }

    type Operand = Variable|number

    abstract class DoubleOperandInstruction extends Instruction {
        public operandOne: Variable
        public operandTwo: { type: 'number'|'variable', value: Operand }

        constructor(tokens: string[]) {
            super(tokens)
            this.operandOne = tokens[0] as Variable
            if (/[0-9]+/.test(tokens[1]))
                this.operandTwo = { type: 'number', value: parseInt(tokens[1]) }
            else
                this.operandTwo = { type: 'variable', value: tokens[1] as Variable }
        }

        abstract operate(operandOne: number, operandTwo: number): number

        execute(input: string, executionState: ExecutionState): { output: string, executionState: ExecutionState } {
            const operandOne = executionState[this.operandOne!]
            const operandTwo = this.operandTwo!.type == 'number' ? this.operandTwo!.value as number : executionState[this.operandTwo!.value]
            const result = this.operate(operandOne, operandTwo)
            const nextExecutionState = {...executionState}
            nextExecutionState[this.operandOne!] = result
            return { output: input, executionState: nextExecutionState }
        }

        toString(): string { return `${Operation[this.operation]} ${this.operandOne} ${this.operandTwo.value}` }
    }

    class InputInstruction extends Instruction {
        public operation = Operation.inp
        public a?: Variable

        constructor(tokens: string[]) {
            super(tokens)
            this.a = tokens[0] as Variable
        }

        execute(input: string, executionState: ExecutionState): { output: string, executionState: ExecutionState } {
            const nextExecutionState = {...executionState}
            nextExecutionState[this.a!] = parseInt(input[0])
            return { output: input.slice(1), executionState: nextExecutionState }
        }

        toString(): string { return `inp ${this.a}` }
    }

    class AddInstruction extends DoubleOperandInstruction {
        public operation = Operation.add

        operate(operandOne: number, operandTwo: number): number {
            return operandOne + operandTwo
        }
    }

    class MulInstruction extends DoubleOperandInstruction {
        public operation = Operation.mul

        operate(operandOne: number, operandTwo: number): number {
            return operandOne * operandTwo
        }
    }

    class DivInstruction extends DoubleOperandInstruction {
        public operation = Operation.div

        operate(operandOne: number, operandTwo: number): number {
            return Math.floor(operandOne / operandTwo)
        }
    }

    class ModInstruction extends DoubleOperandInstruction {
        public operation = Operation.mod

        operate(operandOne: number, operandTwo: number): number {
            return operandOne % operandTwo
        }
    }

    class EqualInstruction extends DoubleOperandInstruction {
        public operation = Operation.eql

        operate(operandOne: number, operandTwo: number): number {
            return operandOne == operandTwo ? 1 : 0
        }
    }

    (async () => await new Solution().executeAsync())();
}