import React, { useRef } from 'react';

const Input = ({ text, type, value, setValue, name, placeholder, i, min }) => {
	const inputRef = useRef(value);
	const record = () => {
		setValue(inputRef.current.value);
	};
	return (
		<div>
			{text && <label htmlFor={name + i}>{text}</label>}
			<div className="input-group">
				<input
					type={type}
					className="form-control"
					id={name + i}
					placeholder={placeholder}
					ref={inputRef}
					value={value}
					onChange={record}
					min={min}
				/>
			</div>
		</div>
	);
};

export default Input;
