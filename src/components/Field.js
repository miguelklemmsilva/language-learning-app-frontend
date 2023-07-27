function Field({ label, type, placeholder, name, value, onChange }) {
    return (
        <div className={"field"}>
            <label htmlFor={name}>
                <strong>{label}</strong>
            </label>
            <input
                type={type}
                placeholder={placeholder}
                name={name}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}

export default Field;