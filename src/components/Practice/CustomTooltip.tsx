import { ClickAwayListener, styled, TooltipProps, tooltipClasses } from "@mui/material";
import { useState } from "react";
import Tooltip from "@mui/material/Tooltip";

const TooltipStyled = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    fontSize: "0.85rem",
  },
});

const CustomTooltip = (props: TooltipProps) => {
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <div style={{ display: "inline-block" }}>
        <TooltipStyled open={open} {...props}>
          <div
            className="button"
            style={{ display: "inline-block" }}
            onMouseEnter={handleTooltipOpen}
            onClick={handleTooltipOpen}
            onMouseLeave={handleTooltipClose}
            onMouseDown={(e) => e.preventDefault()}
          >
            {props.children}
          </div>
        </TooltipStyled>
      </div>
    </ClickAwayListener>
  );
};

export default CustomTooltip;
