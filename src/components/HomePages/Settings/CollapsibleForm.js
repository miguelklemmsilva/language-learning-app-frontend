import React, {useState} from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import './CollapsibleForm.css';
import CheckIcon from '@mui/icons-material/Check';

const CollapsibleForm = ({language, onRemove, onOptionsChange, setActive, isActive, initialSettings, handleSave}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const selectedCountry = language.countries[language.settings.index];
    const selectedExercises = language.settings.exercises;

    const toggleExpanded = () => setIsExpanded(!isExpanded);

    const hasChangesMade = () => {
        return JSON.stringify(language.settings) !== JSON.stringify(initialSettings);
    };

    const handleExerciseChange = (event) => {
        const updatedLanguage = {
            ...language,
            settings: {
                ...language.settings,
                exercises: {
                    ...language.settings.exercises,
                    [event.target.value]: event.target.checked
                }
            }
        };

        onOptionsChange(updatedLanguage);
    }

    const handleCountryChange = (event) => {
        const updatedLanguage = {
            ...language,
            settings: {
                ...language.settings,
                index: parseInt(event.target.value)
            }
        };

        onOptionsChange(updatedLanguage);
    }

    return (<div className={`collapsible-form ${isActive ? "active-form" : ""}`}>
        <div className="header" onClick={() => {
            toggleExpanded();
        }}>
            <div className="flag-and-name">
                <img src={selectedCountry.flag} alt="" className="flag-img"/>
                {language.name}
                <label className="container">
                    <input type="checkbox"
                           name={"active"}
                           value={"active"}
                           checked={isActive}
                           onChange={setActive}
                    />
                    <span className={`checkmark form ${isActive ? "active-form" : ""}`}/>
                </label>
            </div>
            <div className="remove-btn-wrapper">
                <button className="remove-btn" onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                }}><DeleteIcon/></button>
            </div>
        </div>
        {isExpanded && (<div className="content">
            <div>Select a country:</div>
            <div className="countries-container">
                {language.countries.map((country, index) => (
                    <div key={index} className="country">
                        <input type="radio"
                               id={`country-${country.name}`}
                               name={language.name}
                               value={index}
                               key={index}
                               checked={selectedCountry.name === country.name}
                               onChange={handleCountryChange}
                        />
                        <label htmlFor={`country-${country.name}`} className="radio-label">
                            <img className="flag-btn-img" src={country.flag} alt=""/>
                        </label>
                    </div>))}
            </div>
            <div className="exercise-container">
                <div>Select exercises:</div>
                <div className="exercise-options">
                    <label className="container">
                        <input type="checkbox"
                               id={`field-translation-${selectedCountry.name}`}
                               name={"exercise"}
                               value={"translation"}
                               checked={selectedExercises.translation}
                               onChange={handleExerciseChange}
                        />
                        <span className="checkmark">
                            {selectedExercises.translation && <CheckIcon sx={{color: "#F5F5F5"}}/>}
                        </span>
                        Translation
                    </label>
                </div>
                <div className="exercise-options">
                    <label className="container">
                        <input type="checkbox" id={`field-listening-${selectedCountry.name}`} name={"exercise"}
                               value={"listening"}
                               checked={selectedExercises.listening} onChange={handleExerciseChange}
                        />
                        <span className="checkmark">
                            {selectedExercises.listening && <CheckIcon sx={{color: "#F5F5F5"}}/>}
                        </span>
                        Listening
                    </label>
                </div>
                <div className="exercise-options">
                    <label className="container">
                        <input type="checkbox"
                               id={`field-speaking-${selectedCountry.name}`}
                               name={"exercise"}
                               value={"speaking"}
                               checked={selectedExercises.speaking}
                               onChange={handleExerciseChange}
                        />
                        <span className="checkmark">
                            {selectedExercises.speaking && <CheckIcon sx={{color: "#F5F5F5"}}/>}
                        </span>
                        Speaking
                    </label>
                </div>
            </div>
            <button className={`save-btn ${hasChangesMade() ? "" : "disabled"}`} onClick={handleSave}
                    disabled={!hasChangesMade()}>Save
            </button>
        </div>)}
        {showModal && (<div className="modal">
            <div className="modal-content">
                <div>Are you sure you want to remove {language.name}?</div>
                <div className={"modal-buttons-container"}>
                    <button className="remove-btn undo" onClick={() => setShowModal(false)}>No</button>
                    <button className="remove-btn confirm" onClick={() => {
                        setShowModal(false);
                        onRemove();
                    }}>Yes, delete it
                    </button>
                </div>
            </div>
        </div>)}
    </div>);
};

export default CollapsibleForm;
