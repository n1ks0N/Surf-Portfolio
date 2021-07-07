import React, { useEffect, useRef, useState } from 'react';
import { fb } from '../utils/firebase'
import InputText from './InputText';
import './Admin.css';

const Admin = () => {
	const [data, setData] = useState('');
	const [sender, setSender] = useState(false)

	const logRef = useRef('');
	const passRef = useRef('');

	const login = () => {
		if (
			logRef.current.value === 'Aprel16' &&
			passRef.current.value === 'qwerty16'
		) {
			localStorage.setItem('admin', 'qwerty16')
			fb.firestore().collection('database').doc('admin').get().then((doc) => {
				if (doc.exists) {
					const result = doc.data();
					setData(() => result);
				}
			})
		}
	};
	useEffect(() => {
		if (
			localStorage.getItem('admin') === 'qwerty16'
		) {
			fb.firestore().collection('database').doc('admin').get().then((doc) => {
				if (doc.exists) {
					const result = doc.data();
					setData(() => result);
				}
			})
		}
	}, [])

	const change = ({ param, name, index }) => {
		let value = param.replaceAll(`"`, `'`); // все кавычки заменяются на одиночные
		value = value.replaceAll('`', "'"); // чтобы избежать бага при конвертировании в JSON
		const section = name.split('.')[0];
		const category = name.split('.')[1];
		const type = name.split('.')[2];
		setData((prev) => {
			let arr = prev[section][category];
			// запись нового value
			arr[index] = {
				...arr[index],
				[type]: value
			};
			return {
				...prev,
				[section]: {
					...prev[section],
					[category]: arr
				}
			};
		});
	};
	const changeList = ({ param, name }) => {
		let value = param.replaceAll(`"`, `'`); // все кавычки заменяются на одиночные
		value = value.replaceAll('`', "'"); // чтобы избежать бага при конвертировании в JSON
		const section = name.split('.')[0];
		const category = name.split('.')[1];
		const arr = value.split('\n')
		setData(prev => ({
			...prev,
			[section]: {
				...prev[section],
				[category]: arr
			}
		}))
	}
	const changeTime = ({ param, name }) => {
		const section = name.split('.')[0]
		const category = name.split('.')[1]
		setData(prev => ({
			...prev,
			[section]: {
				...prev[section],
				[category]: param
			}
		}))
	}

	const del = ({ target: { id } }) => {
		const section = id.split('.')[0];
		const category = id.split('.')[1];
		const index = id.split('.')[2];
		let allow = true; // для исправления бага повторного выполнения
		setData((prev) => {
			if (allow && prev[section][category].length > 1) {
				allow = false; // исправление бага повторного выполнения
				let arr = prev[section][category];
				arr.splice(index, 1);
				return {
					...prev,
					[section]: {
						...prev[section],
						[category]: arr
					}
				};
			} else {
				return prev;
			}
		});
	};

	const add = ({ target: { id } }) => {
		const section = id.split('.')[0];
		const category = id.split('.')[1];
		let allow = true; // для исправления бага повторного выполнения
		setData((prev) => {
			if (allow) {
				allow = false; // исправление бага повторного выполнения
				let arr = prev[section][category];
				// создание нового пустого объекта и добавление в конец массива
				let push = {};
				for (let key in arr[arr.length - 1]) {
					push = {
						...push,
						[key]: ''
					};
				}
				arr.push(push);
				return {
					...prev,
					[section]: {
						...prev[section],
						[category]: arr
					}
				};
			} else {
				return prev;
			}
		});
	};

	const send = () => {
			let result = '';
			data.directions.texts.mainText.replace(
				/((?:https?:\/\/|ftps?:\/\/|\bwww\.)(?:(?![.,?!;:()]*(?:\s|$))[^\s]){2,})|(\n+|(?:(?!(?:https?:\/\/|ftp:\/\/|\bwww\.)(?:(?![.,?!;:()]*(?:\s|$))[^\s]){2,}).)+)/gim,
				(m, link, text) => {
					result +=
						link
							? `<a href=${(link[0] === 'w' ? '//' : '') + link} key=${result.length
							} target='_blank'>${link}</a>`
							: text
				}
			);
		setData(prev => ({
			...prev,
			directions: {
				...prev.directions,
				texts: {
					mainText: result
				}
			}
		}))
		setSender(true)
	};
	useEffect(() => {
		if (sender) {
			setSender(false)
			fb.firestore().collection('database').doc('admin').set({
				data
			})
		}
	}, [sender])
	return (
		<div className="">
			<div className="login">
				<h1>Админ-панель</h1>
				<input placeholder="login" ref={logRef} />
				<br />
				<input placeholder="password" ref={passRef} />
				<br />
				<button onClick={login}>Войти</button>
			</div>
			{!!data && (
				<div className="content">
					<h2 align="center">Header</h2>
					<h3 align="center">TextButtons</h3>
					{Object.values(data.header.textButtons).map((data, i) => (
						<div id={`headerTextButtons${i}`} className="section" key={i}>
							<InputText
								text="Текст"
								type="text"
								value={data.text}
								name={`header.textButtons.text`}
								change={change}
								i={i}
							/>
							<InputText
								text="Ссылка"
								type="text"
								value={data.link}
								name={`header.textButtons.link`}
								change={change}
								i={i}
							/>
							<button
								type="button"
								className="btn btn-danger btn-sm"
								onClick={(e) => del(e)}
								id={`header.textButtons.${i}`}
							>
								Удалить
							</button>
						</div>
					))}
					<center>
						<button
							type="button"
							className="btn btn-success"
							onClick={(e) => add(e)}
							id={`header.textButtons`}
						>
							Добавить
						</button>
					</center>
					<h3 align="center">LinkSlot</h3>
					{Object.values(data.header.linkslot).map((data, i) => (
						<div className="section" key={i}>
							<InputText
								text="Код"
								type="text"
								value={data.div}
								name={`header.linkslot.div`}
								change={change}
								i={i}
							/>
							<button
								type="button"
								className="btn btn-danger btn-sm"
								onClick={(e) => del(e)}
								id={`header.linkslot.${i}`}
							>
								Удалить
							</button>
						</div>
					))}
					<center>
						<button
							type="button"
							className="btn btn-success"
							onClick={(e) => add(e)}
							id={`header.linkslot`}
						>
							Добавить
						</button>
					</center>
					<h3 align="center">Banners</h3>
					{Object.values(data.header.banners).map((data, i) => (
						<div className="section" key={i}>
							<InputText
								text="Код"
								type="text"
								value={data.div}
								name={`header.banners.div`}
								change={change}
								i={i}
							/>
							<button
								type="button"
								className="btn btn-danger btn-sm"
								onClick={(e) => del(e)}
								id={`header.banners.${i}`}
							>
								Удалить
							</button>
						</div>
					))}
					<center>
						<button
							type="button"
							className="btn btn-success"
							onClick={(e) => add(e)}
							id={`header.banners`}
						>
							Добавить
						</button>
					</center>
					<h2 align="center">Footer</h2>
					<h3 align="center">Banners</h3>
					{Object.values(data.footer.banners).map((data, i) => (
						<div className="section" key={i}>
							<InputText
								text="Код"
								type="text"
								value={data.div}
								name={`footer.banners.div`}
								change={change}
								i={i}
							/>
							<button
								type="button"
								className="btn btn-danger btn-sm"
								onClick={(e) => del(e)}
								id={`footer.banners.${i}`}
							>
								Удалить
							</button>
						</div>
					))}
					<center>
						<button
							type="button"
							className="btn btn-success"
							onClick={(e) => add(e)}
							id={`footer.banners`}
						>
							Добавить
						</button>
					</center>
					<h3 align="center">Linkslot</h3>
					{Object.values(data.footer.linkslot).map((data, i) => (
						<div className="section" key={i}>
							<InputText
								text="Код"
								type="text"
								value={data.div}
								name={`footer.linkslot.div`}
								change={change}
								i={i}
							/>
							<button
								type="button"
								className="btn btn-danger btn-sm"
								onClick={(e) => del(e)}
								id={`footer.linkslot.${i}`}
							>
								Удалить
							</button>
						</div>
					))}
					<center>
						<button
							type="button"
							className="btn btn-success"
							onClick={(e) => add(e)}
							id={`footer.linkslot`}
						>
							Добавить
						</button>
					</center>
					<h3 align="center">Name</h3>
					{Object.values(data.footer.name).map((data, i) => (
						<div id={`name${i}`} className="section" key={i}>
							<InputText
								text="Текст"
								type="text"
								value={data.text}
								name={`footer.name.text`}
								change={change}
								i={i}
							/>
						</div>
					))}
					<h3 align="center">Socials</h3>
					{Object.values(data.footer.socials).map((data, i) => (
						<div id={`socials${i}`} className="section" key={i}>
							<InputText
								text="Текст"
								type="text"
								value={data.text}
								name={`footer.socials.text`}
								change={change}
								i={i}
							/>
							<InputText
								text="Ссылка"
								type="text"
								value={data.link}
								name={`footer.socials.link`}
								change={change}
								i={i}
							/>
							<button
								type="button"
								className="btn btn-danger btn-sm"
								onClick={(e) => del(e)}
								id={`footer.socials.${i}`}
							>
								Удалить
							</button>
						</div>
					))}
					<center>
						<button
							type="button"
							className="btn btn-success"
							onClick={(e) => add(e)}
							id={`footer.socials`}
						>
							Добавить
						</button>
					</center>
					<h3>Тексты и ссылки</h3>
					<InputText
						text="Текст на главной"
						type="text"
						value={data.directions.mainText}
						name='directions.mainText'
						change={changeTime}
						i={0}
						textarea={true}
					/>
					<h3>Блокировки</h3>
					<InputText
						text="Список заблокированных сайтов (ссылки)"
						type="text"
						value={data.directions.urls.join('\n')}
						name="directions.urls"
						i="0"
						textarea={true}
						change={changeList}
					/>
					<center>

					</center>
					<center>
						<button
							type="button"
							className="btn btn-primary btn-lg"
							onClick={send}
						>
							Изменить
						</button>
					</center>
				</div>
			)}
		</div>
	);
};

export default Admin;
