import { useEffect, useRef, useState } from 'react';
import GraphMaker from '../utils/GraphMaker.ts';
import { cloneObject } from '../utils/utils';
import { GraphObj } from '../types/graphTypes.ts';

const graph: GraphObj = {
    'A': {
        x: 110,
        y: 25,
        neighbors: ['B', 'C']
    },
    'B': {
        x: 190,
        y: 90,
        neighbors: ['A']
    },
    'C': {
        x: 30,
        y: 90,
        neighbors: ['A']
    }
};

let alphabetIteration = 0;

interface GraphState {
    nodeGrabbed: string | null;
    graph: GraphObj;
    start: string;
}

type ClickMode = 'add' | 'connect' | 'move' | 'edit';

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
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
    const [windowSize, setWindowSize] = useState<[number, number]>([window.innerWidth, window.innerHeight]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isMobile = windowSize[0] < 768;

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

    /**
     * Rebuild canvas on each render.
     */
    useEffect(() => {
        if (!canvasRef || !canvasRef.current) {
            return;
        }

        const canvas: HTMLCanvasElement = canvasRef.current;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        if (selectedNodes.length > 0) {
            /**
             * Set selected nodes to yellow
             */
            for (let node of selectedNodes) {
                state.graph[node].color = '#356bc2';
            }
        } else {
            /**
             * Reset node colors
             */
            for (let node in state.graph) {
                state.graph[node].color = null;
            }
        }

        /**
         * Clear the canvas for each render.
         */
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        /**
         * Create graph on canvas on each render
         * to show updated state.
         */
        const settings = {
            ctx: ctx,
            graph: state.graph,
            fillColor: '#FFF',
            nodeSize: 25,
            strokeColor: '#356bc2'
        }
        new GraphMaker(settings);
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
        const node = checkInNodeBounds(x, y);
        if (node && typeof node === 'string') {
            setState((prev) => {
                return { ...prev, nodeGrabbed: node };
            });
        }
    }

    /**
     * This will handle dragging a node on the canvas.
     * Dragging a node will update it's x and y coordinates.
     *
     */
    function handleDrag(e: React.MouseEvent<HTMLCanvasElement>) {
        if (!state.nodeGrabbed || !canvasRef.current || clickMode !== 'move') {
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
     * This will handle a click on the canvas,
     * based on the click mode.
     */
    function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
        switch (clickMode) {
            case 'add':
                addNode(e);
                break;
            case 'connect':
                connectNodes(e);
                break;
            case 'edit':
                editNode(e);
                break;
            default:
                break;
        }
    }

    /**
     * This will edit a node's title.
     */
    function editNode(e: React.MouseEvent<HTMLCanvasElement>) {
        if (!canvasRef.current) {
            return;
        }

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const node = checkInNodeBounds(x, y);
        if (node && typeof node === 'string') {
            const title = 'test';
            setState((prev) => {
                const temp = cloneObject(prev);
                temp.graph[node].title = title;
                return temp;
            });
        }
    }

    /**
     * This will check if the given x and y coordinates are
     * with a node.
     */
    function checkInNodeBounds(x: number, y: number): boolean|string {
        let nodeClicked: string|boolean = false;
        for (let node in state.graph) {
            const nodeObj = state.graph[node];

            nodeClicked = (x >= nodeObj.x && x <= nodeObj.x + 25 && y >= nodeObj.y && y <= nodeObj.y + 25);
            if (nodeClicked === true) {
                nodeClicked = node;
                break;
            }
        }

        return nodeClicked;
    }

    /**
     * This handles connected two selected nodes.
     */
    function connectNodes(e: React.MouseEvent<HTMLCanvasElement>) {
        if (!canvasRef.current) {
            return;
        }

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        /**
         * Check which node was clicked, and set the selected node.
         */
        const node = checkInNodeBounds(x, y);
        if (node && typeof node === 'string') {
            setSelectedNodes((prev) => {
                return [...prev, node];
            });
        }

        /**
         * This will handle connecting two nodes.
         * Once the two nodes are connnected, the selected nodes will be reset.
         */
        setSelectedNodes((prev) => {
            if (prev.length === 2) {
                const [node1, node2] = prev;

                setState((prev) => {
                    const temp = cloneObject(prev);
                    temp.graph[node1]?.neighbors.push(node2);
                    temp.graph[node2]?.neighbors.push(node1);
                    return temp;
                });

                return [];
            }

            return prev;
        });
    }

    /**
     * This will add a new node to the graph state.
     */
    function addNode(e: React.MouseEvent<HTMLCanvasElement>) {
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
    const moveButtonClasses = clickMode === 'move' ? 'selected' : '';
    const editButtonClasses = clickMode === 'edit' ? 'selected' : '';

    const canvasWidth = !isMobile ? (windowSize[0] - 100) : windowSize[0] - 30;
    const canvasHeight = !isMobile ? (windowSize[1] - 200) : windowSize[1];
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
                <button
                    className={moveButtonClasses}
                    onClick={() => setClickMode('move')}
                >
                    Move nodes
                </button>
                <button
                    className={editButtonClasses}
                    onClick={() => setClickMode('edit')}
                >
                    Edit nodes
                </button>
            </div>
            <div className='flex align-center justify-center'>
                <canvas
                    onClick={handleClick}
                    onMouseDown={handleGrab}
                    onMouseUp={() => setState((prev) => ({ ...prev, nodeGrabbed: null }))}
                    onMouseMove={handleDrag}
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                />
            </div>
        </div>
    );
}

export default Graph;