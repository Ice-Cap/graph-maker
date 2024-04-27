export interface GraphState {
    nodeGrabbed: string | null;
    graph: GraphObj;
    start: string;
}

export interface GraphObj {
    [key: string]: {
        x: number;
        y: number;
        neighbors: string[];
        color?: string | null;
    };
}