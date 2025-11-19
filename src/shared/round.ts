export class Round {
    static round(value: string | number, precision: number = 2) {
        return Number(Math.round(Number(value + 'e' + precision)) + 'e-' + precision);
    }
}