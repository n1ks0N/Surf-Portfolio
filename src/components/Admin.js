import React, { useEffect, useRef, useState } from 'react';
import { urlAd, keyAd } from '../utils/api.json';
import { useSelector } from 'react-redux';
import firebase from 'firebase'
import { fb } from '../utils/firebase'
import InputText from './InputText';
import Input from '../elements/Input'
import './Admin.css';

const Admin = () => {
	const [data, setData] = useState('');
	const [sender, setSender] = useState(false)

	const [user, setUser] = useState('')
	const [value, setValue] = useState(0) // начисления
	const [tasks, setTasks] = useState([]) // задания с жалобами
	const [sumRefs, setSumRefs] = useState(0)
	const [sumMoney, setSumMoney] = useState(0)
	const [outputMoney, setOutputMoney] = useState(-1)
	const [allowMoney, setAllowMoney] = useState(-1)

	const typeRef = useRef('');
	const logRef = useRef('');
	const passRef = useRef('');

	const tasksDB = fb.firestore().collection('tasks')
	const usersDB = fb.firestore().collection('users')

	const login = () => {
		if (
			logRef.current.value === 'Aprel16' &&
			passRef.current.value === 'qwerty16'
		) {
			let req = new XMLHttpRequest();
			req.onreadystatechange = () => {
				// eslint-disable-next-line
				if (req.readyState == XMLHttpRequest.DONE) {
					const result = JSON.parse(req.responseText);
					setData(() => result.record);
				}
			};
			req.open('GET', urlAd, true);
			req.setRequestHeader('X-Master-Key', keyAd);
			req.send();
			for (let i = 1; i <= 5; i++) {
				fb.firestore().collection('tasks').doc(`${i}`).get().then((doc) => {
					if (doc.exists) {
						for (let key in doc.data()) {
							if (doc.data()[key].reports > 0 && doc.data()[key].reportActive) {
								setTasks((prev) => [...prev, doc.data()[key]])
							}
						}
					}
				})
			}
			fb.firestore().collection('users').get().then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					setSumMoney(prev => prev + doc.data().allow_money)
				});
			})
		}
	};
	useEffect(() => {
		if (
			localStorage === 'admin@clicker.com'
		) {
			let req = new XMLHttpRequest();
			req.onreadystatechange = () => {
				// eslint-disable-next-line
				if (req.readyState == XMLHttpRequest.DONE) {
					const result = JSON.parse(req.responseText);
					setData(() => result.record);
				}
			};
			req.open('GET', urlAd, true);
			req.setRequestHeader('X-Master-Key', keyAd);
			req.send();
			for (let i = 1; i <= 5; i++) {
				fb.firestore().collection('tasks').doc(`${i}`).get().then((doc) => {
					if (doc.exists) {
						for (let key in doc.data()) {
							if (doc.data()[key].reports > 0 && doc.data()[key].reportActive) {
								setTasks((prev) => [...prev, doc.data()[key]])
							}
						}
					}
				})
			}
			fb.firestore().collection('users').get().then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					setSumMoney(prev => prev + doc.data().allow_money)
				});
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
		const section = name.split('.')[0];
		const category = name.split('.')[1];
		setData(prev => ({
			...prev,
			[section]: {
				...prev[section],
				[category]: param
			}
		}))
	}
	const changeUser = () => {
		fb.firestore().collection('users').doc(`${user.toLowerCase()}`).get().then((doc) => {
			if (doc.exists) {
				fb.firestore().collection('users').doc(`${user.toLowerCase()}`).set({
					[typeRef.current.value]: doc.data()[typeRef.current.value] + Number(value)
				}, { merge: true })
			}
		})
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
	const delTask = ({ id }) => {
		const taskId = id.split('/')[0];
		const taskDoc = id.split('/')[1];
		tasksDB
			.doc(`${taskDoc}`)
			.get()
			.then((doc) => {
				if (doc.exists) {
					for (let key in doc.data()) {
						if (doc.data()[key].id === taskId) {
							tasksDB.doc(`${taskDoc}`).update({
								[key]: firebase.firestore.FieldValue.delete()
							});
						}
					}
				}
			})
	}
	const clearTask = ({ id }) => {
		const taskId = id.split('/')[0];
		const taskDoc = id.split('/')[1];
		tasksDB
			.doc(`${taskDoc}`)
			.get()
			.then((doc) => {
				if (doc.exists) {
					for (let key in doc.data()) {
						if (doc.data()[key].id === taskId) {
							tasksDB.doc(`${taskDoc}`).set({
								[key]: {
									total_clicks: doc.data()[key].total_clicks,
									author: doc.data()[key].author,
									reports: doc.data()[key].reports,
									spent_clicks: doc.data()[key].spent_clicks,
									urls: doc.data()[key].urls,
									id: doc.data()[key].id,
									name: doc.data()[key].name,
									reportActive: false
								}
							}, { merge: true });
						}
					}
				}
			})
	}

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

	const successPayment = ({ id }) => {
		setData(prev => {
			let arr = prev.info.bids.slice()
			arr.splice(id.split('/')[0], 1)
			return {
				...prev,
				info: {
					...prev.info,
					bids: arr
				}
			}
		})
	}
	const cancelPayment = ({ id }) => {
		const i = id.split('/')[0]
		const mail = data.info.bids[i].mail
		usersDB.doc(`${mail}`).get().then((doc) => {
			if (doc.exists) {
				usersDB.doc(`${mail}`).set({
					allow_money: doc.data().allow_money + Number(data.info.bids[i].value),
					output_money: doc.data().output_money - data.info.bids[i].value
				}, { merge: true })
			}
		})
		setData(prev => {
			let arr = prev.info.bids.slice()
			arr.splice(i, 1)
			return {
				...prev,
				info: {
					...prev.info,
					bids: arr
				}
			}
		})
	}

	const getRefs = () => {
		fb.firestore().collection('users').doc(`${user}`).get().then((doc) => {
			// рефералы
			setSumRefs(0);
			const countElements = document.querySelectorAll('.table-refs__count');
			const sumElements = document.querySelectorAll('.table-refs__sum');
			if (doc.exists) {
				doc.data().refs.forEach(({ count, sum }, i) => {
					countElements[i].textContent = count;
					sumElements[i].textContent = sum;
					setSumRefs((prev) => prev + sum);
				});
				setOutputMoney(doc.data().output_money)
				setAllowMoney(doc.data().allow_money)
			}
		});
	}

	const send = () => {
		const infoTexts = data.info.texts.map((data) => { // замена 
			let result = '';
			data.text.replace(
				/((?:https?:\/\/|ftps?:\/\/|\bwww\.)(?:(?![.,?!;:()]*(?:\s|$))[^\s]){2,})|(\n+|(?:(?!(?:https?:\/\/|ftp:\/\/|\bwww\.)(?:(?![.,?!;:()]*(?:\s|$))[^\s]){2,}).)+)/gim,
				(m, link, text) => {
					result +=
						link
							? `<a href=${(link[0] === 'w' ? '//' : '') + link} key=${result.length
							} target='_blank'>${link}</a>`
							: text
				}
			);
			return {
				...data,
				result: result
			}
		})
		setData(prev => ({
			...prev,
			info: {
				...prev.info,
				texts: infoTexts
			}
		}))
		setSender(true)
	};
	useEffect(() => {
		if (sender) {
			setSender(false)
			let req = new XMLHttpRequest();
			req.open('PUT', urlAd, true);
			req.setRequestHeader('Content-Type', 'application/json');
			req.setRequestHeader('X-Master-Key', keyAd);
			req.send(JSON.stringify(data));
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
					{Object.values(data.info.texts).map((data, i) => <div key={i}>
						<InputText
							text={data.place.split('?')[1]}
							type="text"
							value={data.text}
							name='info.texts.text'
							change={change}
							i={i}
							textarea={true}
						/>
					</div>)}
					<h3>Блокировки</h3>
					<InputText
						text="Список заблокированных пользователей (почты)"
						type="text"
						value={data.info.mails.join('\n')}
						name="info.mails"
						i="0"
						textarea={true}
						change={changeList}
					/>
					<InputText
						text="Список заблокированных сайтов (ссылки)"
						type="text"
						value={data.info.urls.join('\n')}
						name="info.urls"
						i="0"
						textarea={true}
						change={changeList}
					/>
					<h3>Задержки</h3>
					<InputText
						text="Время выполнения задания"
						type="number"
						value={data.info.delayComplete}
						name="info.delayComplete"
						i="0"
						change={changeTime}
					/>
					<InputText
						text="Задержка на выполнение одного и того же задания"
						type="number"
						value={data.info.delayRepeat}
						name="info.delayRepeat"
						i="0"
						change={changeTime}
					/>
					<h3>Заявки на вывод</h3>
					{Object.values(data.info.bids).map((data, i) =>
						<div key={i}>
							<p>Пользователь: {data.mail}</p>
							<p>Сумма: {data.value}</p>
							<p>Кошелёк: {data.wallet}</p>
							<button type="button" className="btn btn-success" id={`${i}/success`} onClick={(e) => successPayment(e.target)}>Выплачено</button>
							<button type="button" className="btn btn-danger" id={`${i}/cancel`} onClick={(e) => cancelPayment(e.target)}>Отклонить</button>
						</div>
					)}
					<center>
						<button
							type="button"
							className="btn btn-primary btn-lg"
							onClick={send}
						>
							Изменить
						</button>
					</center>
					<h3>Управление пользователями</h3>
					<Input
						text="Логин пользователя"
						type="mail"
						value={user}
						setValue={setUser}
						name="login"
						placeholder="user@mail.ru"
						i="0"
					/>
					<div className="row" style={{ justifyContent: 'space-evenly', alignItems: 'center' }}>
						<div>
							<p>Начисления</p>
							<select className="custom-select" ref={typeRef}>
								<option value="allow_money">Деньги</option>
								<option value="clicks">Клики</option>
							</select>
							<Input
								text="Значение"
								type="number"
								value={value}
								setValue={setValue}
								name="val"
								placeholder="100"
								i="0"
							/>
							<button type="button" className="btn btn-success" onClick={changeUser}>Начислить</button>
						</div>
						<div>
							<p>Рефералы</p>
							<button type="button" className="btn btn-success" onClick={getRefs}>Получить реферальную таблицу</button>
							<table>
								<tbody>
									<tr>
										<td>Уровень</td>
										<td className="table-refs__td">1</td>
										<td className="table-refs__td">2</td>
										<td className="table-refs__td">3</td>
										<td className="table-refs__td">4</td>
										<td className="table-refs__td">5</td>
									</tr>
									<tr>
										<td>Кол-во рефералов</td>
										<td className="table-refs__td table-refs__count">0</td>
										<td className="table-refs__td table-refs__count">0</td>
										<td className="table-refs__td table-refs__count">0</td>
										<td className="table-refs__td table-refs__count">0</td>
										<td className="table-refs__td table-refs__count">0</td>
									</tr>
									<tr>
										<td>Траты рефералов</td>
										<td className="table-refs__td table-refs__sum">0</td>
										<td className="table-refs__td table-refs__sum">0</td>
										<td className="table-refs__td table-refs__sum">0</td>
										<td className="table-refs__td table-refs__sum">0</td>
										<td className="table-refs__td table-refs__sum">0</td>
									</tr>
								</tbody>
							</table>
							<p>Общие траты рефералов: {sumRefs} ₽</p>
							<p>Вывел всего: {outputMoney} ₽</p>
							<p>Баланс пользователя: {allowMoney} ₽</p>
						</div>
						{/* <div>
							<p>Удаление</p>
							<button type="button" className="btn btn-danger" onClick={delUser}>Удалить пользователя</button>
						</div> */}
					</div>
					<h5 align="center">Баланс всех пользователей: {sumMoney}</h5>
					<h3>Задания с жалобами</h3>
					<div>{tasks.map((data, i) =>
						<div key={i}>
							<p>Автор: {data.author}</p>
							<p>Ссылки:</p>
							<ul>
								{data.urls.map((url, i) =>
									<li key={i}>{url}</li>
								)}
							</ul>
							<p>Кол-во жалоб: {data.reports}</p>
							<button type="button" className="btn btn-danger" id={`${data.id}/${data.urls.length}/del`} onClick={(e) => delTask(e.target)}>Удалить задание</button>
							<button type="button" className="btn btn-warning" id={`${data.id}/${data.urls.length}/clear`} onClick={(e) => clearTask(e.target)}>Стереть задание</button>
						</div>
					)}</div>
				</div>
			)}
		</div>
	);
};

export default Admin;
