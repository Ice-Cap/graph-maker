import { GraphObj } from '../types/graphTypes.ts';

class GraphMaker {
    ctx: CanvasRenderingContext2D;
    graph: GraphObj;
    defaultColor: string;
    nodeSize: number;

    constructor(ctx: CanvasRenderingContext2D, graph: GraphObj, fillColor = 'black', nodeSize = 20) {
        this.graph = graph;
        this.ctx = ctx;
        this.defaultColor = fillColor;
        this.nodeSize = nodeSize;
        this.ctx.fillStyle = fillColor;
        this.createGraph();
    }

    createGraph() {
        for (let node in this.graph) {
            const nodeObj = this.graph[node];

            for (let neighbor of nodeObj.neighbors) {
                const neighborObj = this.graph[neighbor];
                const centerOffset = this.nodeSize / 2;
                this.createLine(
                    nodeObj.x + centerOffset,
                    nodeObj.y + centerOffset,
                    neighborObj.x + centerOffset,
                    neighborObj.y + centerOffset
                );
            }
        }

        for (let node in this.graph) {
            const nodeObj = this.graph[node];

            if (nodeObj.color) {
                this.createSquare(nodeObj.x, nodeObj.y, nodeObj.color);
            } else {
                this.createSquare(nodeObj.x, nodeObj.y);
            }
        }

    }

    createLine(x1: number, y1: number, x2: number, y2: number) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    createSquare(x: number, y: number, color: string | null = null, size: number | null = null) {
        size = size ?? this.nodeSize;
        this.ctx.fillStyle = color ?? this.defaultColor;
        this.ctx.fillRect(x, y, size, size);
        this.ctx.fillStyle = this.defaultColor;
    }
}

export default GraphMaker;