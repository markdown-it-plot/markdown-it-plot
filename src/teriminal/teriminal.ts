import { Painter } from "../painter/painter";

export interface Terminal {
    createPainter(options: any): Painter
}