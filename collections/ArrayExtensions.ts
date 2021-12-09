declare global {
    export interface Array<T> {
        movingAverage(): number
    }
}

Array.prototype.movingAverage = function() {
    return this.reduce((p, c, i, _) => (c + i * p) / (i + 1), 0)
}

export {}