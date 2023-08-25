import React, {useEffect, useState} from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import './CollapsibleForm.scss';
import CheckIcon from '@mui/icons-material/Check';
import {FormControl, FormHelperText, InputLabel, MenuItem, Radio, Select} from "@mui/material";

const CollapsibleForm = ({language, onRemove, onOptionsChange, setActive, isActive, initialSettings, handleSave}) => {
    const [showModal, setShowModal] = useState(false);
    const [age, setAge] = React.useState('');

    const handleChange = (event) => {
        setAge(event.target.value);
    };


    const selectedCountry = language.countries[language.settings.index];
    const selectedExercises = language.settings.exercises;

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

    return (<div className="language-form">
        <div className="header-container">
            <div className="txt">{language.name}</div>
        </div>
        <div className="body-container">
            Country
            <div className="country-select">
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
                            <img className="flag-img big" src={country.flag} alt=""/>
                        </label>
                        {country.name}
                    </div>))}
            </div>
        </div>
    </div>);
};

export default CollapsibleForm;
