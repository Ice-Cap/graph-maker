import { forwardRef } from 'react';

interface EditNodeModalProps {
    x: number;
    y: number;
    title: string;
    show: boolean;
    editNode: Function;
    close: Function;
    ref: any;
}

const EditNodeModal = forwardRef((props: EditNodeModalProps, ref: any) => {
    const styles = {
        display: props.show ? 'block' : 'none',
        left: props.x,
        top: props.y
    }

    return <div style={styles} className="modal" ref={ref}>
        <h3>Edit node</h3>
        <div className="modal-content">
            <span className="close" onClick={() => props.close()}>&times;</span>
            <input type="text" value={props.title} onChange={(e) => props.editNode(e.target.value)} />
        </div>
    </div>;
});

export default EditNodeModal;