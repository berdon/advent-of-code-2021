declare global {
    export interface Array<T> {
        movingAverage(): number
        minIndex(cmp: { (a: T, b: T): number }): number
        minIndex(cmp: { (a: T, b: T): number }, inclusive: boolean): number
        reduceUntil<TAcc>(cmp: { (acc: TAcc, current: T ): TAcc|null }, acc: TAcc, callback: { (acc: TAcc, current: T ): TAcc }): TAcc
    }
}

Array.prototype.movingAverage = function() {
    return this.reduce((p, c, i, _) => (c + i * p) / (i + 1), 0)
}

Array.prototype.minIndex = function<T>(cmp: { (a: T, b: T): number }, inclusive = false) {
    var minimum = this[0]
    var index = -1
    for (var i = 1; i < this.length; i++) {
        var comparison = cmp(minimum, this[i])
        if (comparison < 0 || (inclusive && comparison == 0)) {
            minimum = this[i]
            index = i
        }
    }

    return index
}

Array.prototype.reduceUntil = function<T, TAcc>(cmp: { (acc: TAcc, current: T ): TAcc|null }, acc: TAcc, callback: { (acc: TAcc, current: T ): TAcc }): TAcc {
    for (var item of this) {
        var breakResult = cmp(acc, item)
        if (breakResult != null) return breakResult
        acc = callback(acc, item)
    }

    return acc
}

export {}