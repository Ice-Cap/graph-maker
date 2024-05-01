export interface GraphObj {
    [key: string]: {
        x: number;
        y: number;
        title?: string;
        neighbors: string[];
        color?: string | null;
    };
}