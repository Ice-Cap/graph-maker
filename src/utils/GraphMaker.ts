import { GraphObj } from '../types/graphTypes.ts';

interface GraphOptions {
    ctx: CanvasRenderingContext2D;
    graph: GraphObj;
    fillColor?: string;
    nodeSize?: number;
    strokeColor?: string;
    fontSize?: number;
    font?: string;
    fontColor?: string;
    showTitles?: boolean;
}

class GraphMaker {
    ctx: CanvasRenderingContext2D;
    graph: GraphObj;
    fillColor: string;
    nodeSize: number;
    strokeColor: string;
    fontSize: number;
    font: string;
    fontColor: string;
    showTitles: boolean;

    constructor({ ctx, graph, fillColor = 'black', nodeSize = 20, strokeColor = 'black', showTitles = false}: GraphOptions) {
        this.graph = graph;
        this.ctx = ctx;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.nodeSize = nodeSize;
        this.ctx.fillStyle = fillColor;
        this.fontSize = 20;
        this.font = `${this.fontSize}px Arial`;
        this.fontColor = 'white';

        this.showTitles = showTitles;

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

            let title = '';
            if (this.showTitles) {
                title = nodeObj.title ?? node;
            }
            this.createText(
                nodeObj.x + this.nodeSize + 5,
                nodeObj.y + this.nodeSize - 5,
                title
            );
        }
    }

    createText(x: number, y: number, text: string) {
        this.ctx.font = this.font;
        this.ctx.fillStyle = this.fontColor;
        this.ctx.fillText(text, x, y);
    }

    createLine(x1: number, y1: number, x2: number, y2: number) {
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    createSquare(x: number, y: number, color: string | null = null, size: number | null = null) {
        size = size ?? this.nodeSize;
        this.ctx.fillStyle = color ?? this.fillColor;
        this.ctx.fillRect(x, y, size, size);
        this.ctx.fillStyle = color ?? this.fillColor;
    }
}

export default GraphMaker;