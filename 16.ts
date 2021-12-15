import AOC_AUTHN_COOKIES from './authtoken.json';
import * as got from "got"
import Console from './console'
import PriorityQueue from 'ts-priority-queue'

namespace Problem16 {
    const DAY = 16;
    const DEBUG = false
    const URI_INPUT = `https://adventofcode.com/2021/day/${DAY}/input`
    const SAMPLE_DATA = 
`
880086C3E88112
`;
    async function main() {
        // Part 1
        var { startTime, data } = await getInputDataAsync()
        const packet = readPacket(data)
        const versionSum = totalVersion(packet)
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 1: Total version sum is ${versionSum} (${elapsed} ms)`)

        // Part 2
        var startTime = performance.now()
        const value = packet.getValue()
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 2: Operation value is ${value} (${elapsed} ms)`)
    }

    function display(graph: number[][], path: { key: string, risk: number }[]) {
        const pathKeys = new Set<string>(path.map(pair => pair.key))
        for(var y = 0; y < graph.length; y++) {
            for (var x = 0; x < graph[0].length; x++) {
                const key = `${x},${y}`
                if (pathKeys.has(key))
                    process.stdout.write(`${Console.FgWhite}${graph[y][x]}${Console.Reset}`);
                else
                    process.stdout.write(`${Console.Dim}${graph[y][x]}${Console.Reset}`);
            }
            console.log("")
        }
    }

    function totalVersion(packet: Packet, version = 0): number {
        if (packet instanceof LiteralPacket) {
            return version + (packet as LiteralPacket).version
        }
        else {
            return (packet as OperatorPacket).version + (packet as OperatorPacket).packets.reduce((acc, c) => totalVersion(c, acc), version)
        }
    }

    abstract class Packet {
        public readonly version: number
        public readonly type: number

        public constructor(version: number, type: number) {
            this.version = version
            this.type = type
        }

        abstract getValue(): number
    }

    class LiteralPacket extends Packet {
        public readonly value: number

        public constructor(version: number, data: number[]) {
            super(version, 4)
            var bitCount = 6
            var value = ""
            while (data.length > 0) {
                const nextBlock = readBits(data, 5)
                bitCount += 5
                value = value + nextBlock.slice(1)
                if (nextBlock[0] == "0") break
            }
            this.value = parseInt(value, 2)
        }

        public getValue = () => this.value
    }

    class OperatorPacket extends Packet {
        public readonly packets: Packet[]

        public constructor(version: number, type: number, data: number[]) {
            super(version, type)
            const packets: Packet[] = []
            const lengthTypeId = readNumber(data, 1)
            if (lengthTypeId == 0) {
                const packetLength = readNumber(data, 15)
                const startingLength = data.length
                while (startingLength - data.length != packetLength)
                    packets.push(readPacket(data))
            }
            else if (lengthTypeId == 1) {
                const count = readNumber(data, 11)
                for (var i = 0; i < count; i++)
                    packets.push(readPacket(data))
            }
            this.packets = packets
        }

        public getValue(): number {
            switch (this.type) {
                case 0: return this.packets.reduce((acc, c) => acc + c.getValue(), 0)
                case 1: return this.packets.reduce((acc, c) => acc * c.getValue(), 1)
                case 2: return this.packets.reduce((acc, c) => c.getValue() < acc ? c.getValue() : acc, Number.MAX_VALUE)
                case 3: return this.packets.reduce((acc, c) => c.getValue() > acc ? c.getValue() : acc, Number.MIN_VALUE)
                case 5: return this.packets[0].getValue() > this.packets[1].getValue() ? 1 : 0
                case 6: return this.packets[0].getValue() < this.packets[1].getValue() ? 1 : 0
                case 7: return this.packets[0].getValue() == this.packets[1].getValue() ? 1 : 0
            }

            throw "Invalid operator type"
        }
    }

    function readPacket(data: number[]): Packet {
        const version = readNumber(data, 3)
        const type = readNumber(data, 3)
        switch (type) {
            case 4: return new LiteralPacket(version, data)
            default: return new OperatorPacket(version, type, data)
        }

        throw "Invalid packet type"
    }

    function readBits(data: number[], count: number): string {
        if (count == 0) return ""
        return data.splice(0, count).reduce((acc, c) => acc + c, "")
    }

    function readNumber(data: number[], count: number): number {
        if (count == 0) return 0
        return parseInt(data.splice(0, count).reduce((acc, c) => acc + c, ""), 2)
    }

    async function getInputDataAsync(): Promise<{ startTime: number, data: number[]}> {
        var lines: string[]
        if (DEBUG) {
            lines = SAMPLE_DATA.split('\n').filter(line => line != "").map(line => line.trim())
        }
        else {
            const response = await got.default(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
            lines = response.body.split('\n').filter(line => line != "").map(line => line.trim())
        }

        var startTime = performance.now()

        const data = lines[0]
            .split("")
        const hex = data.map(x => parseInt(x, 16))
        const bitBlocks = hex.map(x => (x >>> 0).toString(2).padStart(4, '0').split("").map(y => parseInt(y)))
            .flat()

        return { startTime: startTime, data: bitBlocks.flat() }
    }

    (async () => await main())();
}