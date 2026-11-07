import { useEffect, useRef, useState } from "react";
import { LanguageOption } from "../../../types/language";

interface LanguageDropdownProps {
  onLanguageSelect: (language: LanguageOption) => void;
  selectedOptions: LanguageOption[];
  languages: LanguageOption[];
}

const LanguageDropdown = ({
  onLanguageSelect,
  selectedOptions,
  languages,
}: LanguageDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedLanguageNames = selectedOptions.map((item) => item.name);

  const availableOptions = languages.filter(
    (option) => !selectedLanguageNames.includes(option.name)
  );

  languages.forEach((option) => {
    option.countries.forEach((country) => {
      const img = new Image();
      img.src = country.flag;
    });
  });

  const handleButtonClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target;
    if (
      dropdownRef.current &&
      target instanceof Node &&
      !dropdownRef.current.contains(target) &&
      buttonRef.current !== target
    )
      setShowDropdown(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option: LanguageOption) => {
    setShowDropdown(false);
    onLanguageSelect(option);
  };

  return (
    <div className="add-language">
      <button
        className={`button add-language-selector ${
          availableOptions.length === 0 ? "disabled" : ""
        } ${showDropdown ? "active" : ""} dropdown-button`}
        ref={buttonRef}
        disabled={availableOptions.length === 0}
        onClick={handleButtonClick}
      >
        <div>Add a Language</div>
        <div>{showDropdown ? "-" : "+"}</div>
      </button>
      {showDropdown && (
        <div ref={dropdownRef} className="dropdown-menu">
          {availableOptions.map((option, index) => (
            <button
              className="button dropdown-option"
              key={index}
              onClick={() => handleOptionClick(option)}
            >
              <img
                src={option.countries[option.settings.index]?.flag}
                alt=""
                className="flag-img"
              />
              <div className="button-txt">{option.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
