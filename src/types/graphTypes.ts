export interface GraphObj {
    [key: string]: {
        x: number;
        y: number;
        neighbors: string[];
        color?: string | null;
    };
}