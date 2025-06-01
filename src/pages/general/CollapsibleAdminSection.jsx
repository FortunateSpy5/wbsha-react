import React, { useState } from "react";

export const CollapsibleAdminSection = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={`collapsible-admin-section${open ? " open" : ""}`}>
            <div
                className="collapsible-admin-header"
                onClick={() => setOpen((prev) => !prev)}
                style={{ cursor: "pointer", userSelect: "none" }}
            >
                <span className="collapsible-admin-title">{title}</span>
                <span className="collapsible-admin-toggle">
                    {open ? "−" : "+"}
                </span>
            </div>
            {open && <div className="collapsible-admin-content">{children}</div>}
        </div>
    );
};