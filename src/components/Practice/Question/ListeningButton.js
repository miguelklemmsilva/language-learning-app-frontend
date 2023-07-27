import React, {useRef} from "react";

const ListeningButton = ({ sentence, textarea }) => {
    const audioRef = useRef(null);

    const base64ToArrayBuffer = () => {
        const binaryString = window.atob(sentence.voice);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; ++i)
            bytes[i] = binaryString.charCodeAt(i);
        return bytes.buffer;
    };

    const synthesiseText = () => {
        try {
            if (textarea)
                textarea.current.focus();

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }

            const audioData = new Uint8Array(base64ToArrayBuffer());

            const audioBlob = new Blob([audioData], {type: "audio/mpeg"});
            const audioURL = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioURL);
            audioRef.current = audio;
            audio.play();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <button
            className="question-btn"
            draggable={false}
            onClick={synthesiseText}
        >
            <img
                className="question-btn-img"
                src={"./VolumeButton.png"}
                alt={"speak-button"}
            />
        </button>
    );
}

export default ListeningButton;