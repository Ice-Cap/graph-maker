import { useEffect, useRef, useState } from 'react';
import GraphMaker from '../utils/GraphMaker.ts';
import { cloneObject } from '../utils/utils';
import { GraphObj, GraphState } from '../types/graphTypes.ts';

/**
 * This will render a graph with nodes and edges.
 */
function Graph() {
    const [state, setState] = useState<GraphState>({
        nodeGrabbed: null,
        graph: graph,
        start: 'H'
    });
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef || !canvasRef.current) {
            return;
        }

        const canvas: HTMLCanvasElement = canvasRef.current;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        /**
         * Clear the canvas for each render.
         */
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        /**
         * Create graph on canvas on each render
         * to show updated state.
         */
        new GraphMaker(ctx, state.graph, '#FFF');
    });

    /**
     * This will handle grabbing a node on the canvas.
     */
    function handleGrab(e: React.MouseEvent<HTMLCanvasElement>) {
        if (!canvasRef.current) {
            return;
        }
        const rect = canvasRef.current.getBoundingClientRect();

        /**
         * get x and y coordinates of click relative to canvas
         */
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        /**
         * Check if click is within a node
         */
        for (let node in state.graph) {
            const nodeObj = state.graph[node];

            const inNodeBounds = (x >= nodeObj.x && x <= nodeObj.x + 25 && y >= nodeObj.y && y <= nodeObj.y + 25);
            if (inNodeBounds) {
                setState((prev) => {
                    return { ...prev, nodeGrabbed: node };
                });
                break;
            }
        }
    }

    /**
     * This will handle dragging a node on the canvas.
     * Dragging a node will update it's x and y coordinates.
     *
     */
    function handleDrag(e: React.MouseEvent<HTMLCanvasElement>) {
        if (!state.nodeGrabbed || !canvasRef.current) {
            return;
        }

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setState((prev) => {
            const temp = cloneObject(prev);
            if (!prev.nodeGrabbed) {
                return temp;
            }
            temp.graph[prev.nodeGrabbed].x = x;
            temp.graph[prev.nodeGrabbed].y = y;
            return temp;
        });
    }

    return (
        <div className='algo search'>
            <div className='flex align-center justify-center'>
                <canvas
                    onMouseDown={handleGrab}
                    onMouseUp={() => setState((prev) => ({ ...prev, nodeGrabbed: null }))}
                    onMouseMove={handleDrag}
                    ref={canvasRef}
                    width="500"
                    height="500"
                />
            </div>
        </div>
    );
}

export default Graph;

const graph: GraphObj = {
    'A': {
        x: 80,
        y: 0,
        neighbors: ['B', 'C']
    },
    'B': {
        x: 160,
        y: 50,
        neighbors: ['A']
    },
    'C': {
        x: 0,
        y: 50,
        neighbors: ['A']
    }
};