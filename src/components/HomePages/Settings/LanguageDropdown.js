import React, {useEffect, useRef, useState} from 'react';
import {FormControl, InputLabel} from "@mui/material";

const LanguageDropdown = ({onLanguageSelect, selectedOptions, languages}) => {
    const dropdownRef = useRef(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const buttonRef = useRef(null);

    // Get the names of all selected languages
    const selectedLanguageNames = selectedOptions.map(item => item.name);

    const availableOptions = languages.filter(option => !selectedLanguageNames.includes(option.name));

    languages.forEach(option => {
        option.countries.forEach(country => {
            const img = new Image();
            img.src = country.flag;
        });
    });

    const handleButtonClick = () => {
        setShowDropdown(!showDropdown);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target) && buttonRef.current !== event.target)
            setShowDropdown(false);
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOptionClick = (option) => {
        setShowDropdown(false);
        onLanguageSelect(option);
    };

    return (
        <div className="add-language">
            <button className={`button add-language-selector ${availableOptions.length === 0 ? "disabled" : ""} ${showDropdown ? "active" : ""}`}
                    ref={buttonRef}
                    onClick={handleButtonClick}><div>Add a Language</div><div>{showDropdown ? '-' : '+'}</div>
            </button>
            {showDropdown && (
                <div ref={dropdownRef} className="dropdown-menu">
                    {availableOptions.map((option, index) => (
                        <button
                            className="button dropdown-option"
                            key={index}
                            onClick={() => handleOptionClick(option)}
                        >
                            <img src={option.countries[option.settings.index].flag}
                                 alt="" className="flag-img"/>
                            <div className="button-txt">{option.name}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageDropdown;
