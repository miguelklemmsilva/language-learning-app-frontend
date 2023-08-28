import React, {useEffect, useState} from 'react';
import './CollapsibleForm.scss';
import {Checkbox, FormControlLabel, FormGroup, styled} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

const CollapsibleForm = ({language, onRemove, onOptionsChange, setActive, isActive, initialSettings, handleSave}) => {
    const StyledFormControlLabel = styled(FormControlLabel)({
        '& .MuiTypography-body1': {
            fontFamily: 'inherit',  // set the desired font here
        },
    });

    const selectedCountry = language.countries[language.settings.index];
    const selectedExercises = language.settings.exercises;

    const hasChangesMade = () => {
        return JSON.stringify(language.settings) !== JSON.stringify(initialSettings);
    };

    const handleExerciseChange = (event) => {
        const updatedLanguage = {
            ...language, settings: {
                ...language.settings, exercises: {
                    ...language.settings.exercises, [event.target.value]: event.target.checked
                }
            }
        };

        onOptionsChange(updatedLanguage);
    }

    const handleCountryChange = (event) => {
        const updatedLanguage = {
            ...language, settings: {
                ...language.settings, index: parseInt(event.target.value)
            }
        };

        onOptionsChange(updatedLanguage);
    }

    return (<div className="language-form">
        <div className="header-container form">
            <div className="radio-wrapper">
                <input type="radio"
                       name="active"
                       value={language.name}
                       checked={isActive}
                       onChange={setActive}
                       className="radio-input"
                />
            </div>
            <div className="flag-container">
                <img className={`flag-img header ${isActive ? 'active' : ''}`} src={selectedCountry.flag} alt=""/>
            </div>
            <div className="info-container">
                <div className="main-info">{language.name}</div>
                <div className="sub-info">{selectedCountry.name}</div>
            </div>
            <div className="remove-btn-wrapper">
                <button className="button remove-button" onClick={(e) => {
                    onRemove();
                }}><DeleteIcon/></button>
            </div>
        </div>
        <div className="body-container">
            <div className="country-select">
                <div className="info-container">
                    <div className="main-info">Country</div>
                    <div className="sub-info">Select the language's region. Effects dialect and accents.</div>
                </div>
                <div className="countries-container">
                    {language.countries.map((country, index) => (<div key={index} className="country">
                        <input type="radio"
                               id={`country-${country.name}`}
                               name={language.name}
                               value={index}
                               key={index}
                               checked={selectedCountry.name === country.name}
                               onChange={handleCountryChange}
                        />
                        <label htmlFor={`country-${country.name}`}
                               className={`radio-label ${selectedCountry.name === country.name ? 'active' : ''}`}>
                            <img className="flag-img big" src={country.flag} alt=""/>
                        </label>
                    </div>))}
                </div>
            </div>
            <div className="exercises-container">
                <div className="info-container">
                    <div className="main-info">Active exercises</div>
                    <div className="sub-info">Select which exercises you would like to practice.</div>
                </div>
                <FormGroup>
                    <StyledFormControlLabel
                        control={<Checkbox checked={selectedExercises.translation} onChange={handleExerciseChange}
                                           value="translation"/>} label="Translation" className="checkbox"/>
                    <StyledFormControlLabel
                        control={<Checkbox checked={selectedExercises.listening} onChange={handleExerciseChange}
                                           value="listening"/>} label="Listening" className="checkbox"/>
                    <StyledFormControlLabel
                        control={<Checkbox checked={selectedExercises.speaking} onChange={handleExerciseChange}
                                           value="speaking" className="checkbox"/>} label="Speaking"/>
                </FormGroup>
            </div>
            <button className={`button save-btn ${hasChangesMade() ? "" : "disabled"}`} onClick={handleSave}
                    disabled={!hasChangesMade()}>Save
            </button>
        </div>
    </div>);
};

export default CollapsibleForm;
