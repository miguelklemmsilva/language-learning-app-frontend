const SpeakingSubmit = ({result, setNextQuestion}) => {
    return (
        <div className={`submit-wrapper-container`}>
            <div className={`submit-wrapper`} style={{margin: "0"}}>
                <button className={`submit-btn ${result ? '' : 'skip'}`}
                        style={{width: "100%"}}
                onClick={setNextQuestion}>
                    {result ? "Next" : "Skip"}
                </button>
            </div>
        </div>
    )
}

export default SpeakingSubmit