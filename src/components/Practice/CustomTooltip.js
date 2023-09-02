import {ClickAwayListener, styled, tooltipClasses} from "@mui/material";
import {useState} from "react";
import Tooltip from "@mui/material/Tooltip";

const TooltipStyled = styled(({className, ...props}) => (
    <Tooltip {...props} classes={{popper: className}}/>))(({theme}) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        fontSize: "0.85rem",
    },
}));

const CustomTooltip = (props) => {
    const [open, setOpen] = useState(false);

    const handleTooltipClose = () => {
        setOpen(false);
    };

    const handleTooltipOpen = () => {
        setOpen(true);
    };

    return (<ClickAwayListener onClickAway={handleTooltipClose}>
        <div style={{display: "inline-block"}}>
            <TooltipStyled onClose={handleTooltipClose} open={open} {...props}>
                <div className="button" style={{display: "inline-block"}} onMouseEnter={handleTooltipOpen} onClick={handleTooltipOpen}
                     onMouseDown={(e) => e.preventDefault()}>{props.children}</div>
            </TooltipStyled>
        </div>
    </ClickAwayListener>)
}

export default CustomTooltip;