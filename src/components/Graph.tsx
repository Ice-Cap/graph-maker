import { useEffect, useRef, useState } from 'react';
import GraphMaker from '../utils/GraphMaker.ts';
import { cloneObject } from '../utils/utils';
import { GraphObj } from '../types/graphTypes.ts';

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

let alphabetIteration = 0;

interface GraphState {
    nodeGrabbed: string | null;
    graph: GraphObj;
    start: string;
}

type ClickMode = 'add' | 'connect';
/**
 * This will render a graph with nodes and edges.
 */
function Graph() {
    const [state, setState] = useState<GraphState>({
        nodeGrabbed: null,
        graph: graph,
        start: 'H'
    });
    const [clickMode, setClickMode] = useState<ClickMode>('add');
    const [windowSize, setWindowSize] = useState<[number, number]>([window.innerWidth, window.innerHeight]);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    /**
     * This will update the window size state on resize.
     */
    useEffect(() => {
        function handleResize() {
            setWindowSize([window.innerWidth, window.innerHeight]);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    /**
     * This will handle adding a new node.
     * Or attach two nodes.
     */
    function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
        if (!canvasRef.current) {
            return;
        }

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setState((prev) => {
            const temp = cloneObject(prev);
            const nextKey = getNextKey(temp);
            temp.graph[nextKey] = {
                x: x,
                y: y,
                neighbors: []
            };

            return temp;
        });
    }

    /**
     * This will calculate the next key for a new node.
     */
    function getNextKey(state: GraphState) {
        const keysArray = Object.keys(state.graph);
        const lastKey = keysArray[keysArray.length - 1];
        return getNextCharacter(lastKey);
    }

    /**
     * This will get the next character in the alphabet.
     * After each iteration, it will loop back to 'A' and add a number
     * such as 'A1' and contunue to 'B1', 'C1', etc. until it loops again.
     */
    function getNextCharacter(current: string) {
        const baseChar = 'A'.charCodeAt(0);
        const maxChar = 26;

        if (current.includes('Z')) {
            alphabetIteration += 1;
            return `A${alphabetIteration}`;
        } else if (current.length === 1) {
            let nextCharCode = current.charCodeAt(0) + 1;
            if (nextCharCode - baseChar < maxChar) {
                return String.fromCharCode(nextCharCode);
            }
        } else {
            let [letter, num] = current.split(/(\d+)/);
            letter = String.fromCharCode(letter.charCodeAt(0) + 1);
            return `${letter}${num}`;
        }

        return current;
    }

    const addButtonClasses = clickMode === 'add' ? 'selected' : '';
    const connectButtonClasses = clickMode === 'connect' ? 'selected' : '';
    return (
        <div>
            <div className="button-container">
                <button
                    className={addButtonClasses}
                    onClick={() => setClickMode('add')}
                >
                    Add nodes
                </button>
                <button
                    className={connectButtonClasses}
                    onClick={() => setClickMode('connect')}
                >
                    Connect nodes
                </button>
            </div>
            <div className='flex align-center justify-center'>
                <canvas
                    onClick={handleClick}
                    onMouseDown={handleGrab}
                    onMouseUp={() => setState((prev) => ({ ...prev, nodeGrabbed: null }))}
                    onMouseMove={handleDrag}
                    ref={canvasRef}
                    width={windowSize[0] - 100}
                    height={windowSize[1] - 200}
                />
            </div>
        </div>
    );
}

export default Graph;