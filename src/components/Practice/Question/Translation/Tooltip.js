import React, {useState} from 'react';
import './Tooltip.css';

const Tooltip = ({children, text, errorType}) => {
    const [show, setShow] = useState(false);

    return (
            <div
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                className={`word ${errorType}`}
            >
                {show && <div className="tooltip">{text}</div>}
                {children}
            </div>
    );
};

export default Tooltip;
