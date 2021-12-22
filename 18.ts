import AocSolution from './aoc/AocSolution';

namespace Problem18 {
    type DataType = Node<number>[]
    const regex = /[0-9]+/
    class Solution extends AocSolution<DataType> {
        public day: string = "18"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = false

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            const reduced = data.reduce<Node<number>|null>((acc, c) => {
                if (acc == null) return this.sumNodes(acc!, c.clone())

                if (this.SHOW_WORK) {
                    process.stdout.write("  ")
                    this.displayNode(acc!)
                    process.stdout.write("+ ")
                    this.displayNode(c)
                }

                const sum = this.sumNodes(acc!, c.clone())!

                if (this.SHOW_WORK) {
                    process.stdout.write("= ")
                    this.displayNode(sum)
                    console.log("")
                }

                return sum
            }, null)!

            if (this.SHOW_WORK) this.displayNode(reduced!)

            return { message: `Magnitude is ${this.magnitude(reduced)}` }
        }

        public async solvePartTwoAsync(data: DataType): Promise<string> {
            var max = Number.MIN_VALUE
            var [nodeA, nodeB]: [Node<number>|null, Node<number>|null] = [null, null]
            var startTime = performance.now()

            // :try-not-to-cry:
            for(var i = 0; i < data.length; i++) {
                for(var j = 0; j < data.length; j++) {
                    if (i == j) continue;
                    const calculatedMagnitude = this.magnitude(this.sumNodes(data[i].clone(), data[j].clone()))
                    if (calculatedMagnitude > max) {
                        nodeA = data[i]
                        nodeB = data[j]
                        max = calculatedMagnitude
                    }
                }
            }

            if (this.SHOW_WORK) {
                this.displayNode(nodeA!)
                this.displayNode(nodeB!)
            }

            return `For magnitude of ${max}`
        }

        private magnitude(node: Node<number>): number {
            if (node.value != null) return node.value
            return (3 * this.magnitude(node.left!)) + (2 * this.magnitude(node.right!))
        }
    
        private sumNodes(a: Node<number>|null, b: Node<number>|null): Node<number> {
            if (a == null || b == null) return (a ?? b)!
            const sumNode = new Node(null, a, b)
            if (this.SHOW_WORK) {
                process.stdout.write("after addition: ")
                this.displayNode(sumNode)
            }
            return this.reduceNode(sumNode)
        }
    
        private reduceNode(node: Node<number>): Node<number> {
            while(true) {
                if (this.explodeFirstNode(node)) {
                    if (this.SHOW_WORK) {
                        process.stdout.write("after explode:  ")
                        this.displayNode(node)
                    }
                    continue
                }
                if (this.splitFirstNode(node)) {
                    if (this.SHOW_WORK) {
                        process.stdout.write("after split:    ")
                        this.displayNode(node)
                    }
                    continue
                }
                break
            }
    
            return node
        }
    
        private setFirstRightCousin(node: Node<number>, setter: (node: Node<number>) => number) {
            var previous = node
            var walker = previous.root!
            while (walker != null && walker.right!.id == previous.id) {
                previous = walker
                walker = walker.root!
            }
            if (walker == null) return
            walker = walker.right!
            while (walker.value == null) walker = walker.left!
            walker.value = setter(walker)
        }
    
        private setFirstLeftCousin(node: Node<number>, setter: (node: Node<number>) => number) {
            var previous = node
            var walker = previous.root!
            while (walker != null && walker.left!.id == previous.id) {
                previous = walker
                walker = walker.root!
            }
            if (walker == null) return
            walker = walker.left!
            while (walker.value == null) walker = walker.right!
            walker.value = setter(walker)
        }
    
        private explodeFirstNode(walker: Node<number>, depth = 0): boolean {
            if (walker.left != null && walker.left.value == null && this.explodeFirstNode(walker.left, depth + 1)) return true
            if (depth >= 4 && walker.left?.value != null && walker.right?.value != null) {
                this.setFirstLeftCousin(walker, (node) => node.value! += walker.left?.value!)
                this.setFirstRightCousin(walker, (node) => node.value! += walker.right?.value!)
                walker.value = 0
                walker.left = null
                walker.right = null
                return true
            }
            if (walker.right != null && walker.right.value == null && this.explodeFirstNode(walker.right, depth + 1)) return true
            return false
        }
    
        private splitFirstNode(walker: Node<number>, depth = 0): boolean {
            if (walker.left != null && this.splitFirstNode(walker.left, depth + 1)) return true
            if (walker.value != null && walker.value >= 10) {
                walker.left = new Node(walker, null, null, Math.floor(walker.value / 2))
                walker.right = new Node(walker, null, null, Math.ceil(walker.value / 2))
                walker.value = null
                return true
            }
            if (walker.right != null && this.splitFirstNode(walker.right, depth + 1)) return true
            return false
        }
    
        private displayNode(node: Node<number>, newline = true) {
            process.stdout.write("[")
            if (node.left?.value != null)
                process.stdout.write(`${node.left!.value}`)
            else
                this.displayNode(node.left!, false)
            process.stdout.write(",")
            if (node.right?.value != null)
                process.stdout.write(`${node.right!.value}`)
            else
                this.displayNode(node.right!, false)
            process.stdout.write(`]${newline ? "\n" : ""}`)
        }

        private parsePair(line: string, root: Node<number>|null = null): { node: Node<number>, line: string } {
            const { node: left, line: rightLine } = this.parseNumber(line.slice(1), null)
            const { node: right, line: nextLine } = this.parseNumber(rightLine.slice(1), null)
            return { node: new Node(root, left, right), line: nextLine.slice(1) }
        }

        private parseNumber(line: string, root: Node<number>|null): { node: Node<number>, line: string } {
            if (line[0] == "[") return this.parsePair(line, root)
            
            const value = regex.exec(line)!.at(0)!
            return { node: new Node(root, null, null, parseInt(value)), line: line.slice(value.length) }
        }

        protected parseData(lines: string[]): DataType {
            const data = lines.map(line => this.parsePair(line))
            return data.map(d => d.node)
        }

        protected SAMPLE_DATA: string = 
`
[[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]
[[[5,[2,8]],4],[5,[[9,9],0]]]
[6,[[[6,2],[5,6]],[[7,6],[4,7]]]]
[[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]
[[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]
[[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]
[[[[5,4],[7,7]],8],[[8,3],8]]
[[9,3],[[9,9],[6,[4,9]]]]
[[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]
[[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]
`;
    }

    class Node<T> {
        public id: number
        public root: Node<T>|null
        public left: Node<T>|null
        public right: Node<T>|null
        public value: T|null

        public constructor(root: Node<T>|null = null, left: Node<T>|null = null, right: Node<T>|null = null, value: T|null = null) {
            this.id = Node._id++
            this.root = root
            this.left = left
            if (left != null) left.root = this
            this.right = right
            if (right != null) right.root = this
            this.value = value
        }

        static _id: number = 0

        public clone(): Node<T> {
            return new Node(this.root, this.left?.clone(), this.right?.clone(), this.value)
        }
    }

    (async () => await new Solution().executeAsync())();
}