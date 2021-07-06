import React, { useRef } from 'react';

const InputText = ({ text, type, value, name, placeholder, change, i, textarea }) => {
	const inputRef = useRef(value);
	const record = () => {
		change({
			param: inputRef.current.value,
			name: name,
			index: i
		});
	};
	return (
		<div>
			{text && <label htmlFor={name + i}>{text}</label>}
			<div className="input-group admin__input">
				{textarea ? <textarea
					type={type}
					className="form-control"
					id={name + i}
					placeholder={placeholder}
					ref={inputRef}
					value={value}
					onChange={record}
				/> : <input
					type={type}
					className="form-control"
					id={name + i}
					placeholder={placeholder}
					ref={inputRef}
					value={value}
					onChange={record}
				/>}
			</div>
		</div>
	);
};

export default InputText;
