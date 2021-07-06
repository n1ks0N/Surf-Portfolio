import React, { useState, useEffect, useMemo, useRef } from 'react';
import { urlAd, keyAd } from '../utils/api.json';
import { Route, Switch, Link, useLocation, Redirect } from 'react-router-dom';
import Admin from './Admin'
import Play from './Play'
import './App.css';
import { fb } from '../utils/firebase';

const App = () => {
	// const dispatch = useDispatch();

	const categoryRef = useRef('');

	const [data, setData] = useState(null); // jsonbin: рекламный контент, админ-панель
	const [sites, setSites] = useState(false);
	const [count, setCount] = useState(-1);
	const [category, setCategory] = useState(null);
	const [historyBanners, setHistoryBanners] = useState([])
	const [link, setLink] = useState('/play?category=0&subcategory=0&url=0')

	useEffect(() => {
		// начилие реферала
		let script = document.createElement('script');
		script.src = 'https://yastatic.net/share2/share.js';
		script.async = true;
		document.body.appendChild(script);

		fb.firestore().collection('database').doc('sites').get().then((doc) => {
			if (doc.exists) {
				setSites(doc.data());
				const firstCategory = Object.keys(doc.data())[0]
				setCategory(() => firstCategory)
				setLink(prev => `${prev.split('?')[0]}?category=${firstCategory}&subcategory=${Object.keys(doc.data()[firstCategory])[0]}&url=0`)
			}
		})

		fb.firestore().collection('database').doc('admin').get().then((doc) => {
			if (doc.exists) {

				const result = doc.data();
				setData(() => result);
				setCount(() => result.footer.linkslot.length + result.header.linkslot.length)

				for (let i = 0; i < result.header.banners.length; i++) {
					let script = document.createElement('script');
					script.src = result.header.banners[i].div.split(`'`)[3];
					script.async = true;
					document.body.appendChild(script);
				}
				for (let i = 0; i < result.header.linkslot.length; i++) {
					let script = document.createElement('script');
					script.src = result.header.linkslot[i].div.split(`'`)[13];
					script.async = true;
					document.body.appendChild(script);
				}
				for (let i = 0; i < result.footer.linkslot.length; i++) {
					let script = document.createElement('script');
					script.src = result.footer.linkslot[i].div.split(`'`)[13];
					script.async = true;
					document.body.appendChild(script);
				}
			}
		})

		// автор
		console.log(`
	   _ _                    
 _ __ (_) | _____  ___  _ __  
| '_ \\| | |/ / __|/ _ \\| '_ \\ 
| | | | |   <\\__ \\ (_) | | | |
|_| |_|_|_|\\_\\___/\\___/|_| |_|

Powered on ReactJS 
by https://github.com/n1ks0N
			`);
	}, []);

	const handleClick = (e) => {
		const id = e.currentTarget.id
		if (!historyBanners.includes(id)) {
			setHistoryBanners(prev => [...prev, id])
			setCount(prev => --prev)
		}
	}
	const handleChange = (val, type) => {
		const arr = link.split('?')[1].split('&')
		const index = arr.findIndex(data => data.split('=')[0] === type)
		arr[index] = arr[index].split('=').map((item, i) => i === 1 ? val : item).join('=')
		const newParams = arr.join('&')
		setLink(`${link.split('?')[0]}?${newParams}`)
	}
	const categoryChange = () => {
		setCategory(categoryRef.current.value)
		handleChange(categoryRef.current.value, 'category')
	}
	const redirect = () => {
		fb.firestore().collection('database').doc('admin').get().then((doc) => {
			if (doc.exists) {
				const search = doc.data().directions.info.urls.includes(link.split('=')[3])
				if (!search) {
					window.open(link, "_blank")
				}
			}
		})
	}
	return (
		<>
			<div className="bg"></div>
			<header>
				<menu>
					<Link to="/">
						<li style={{ fontSize: '26px', fontWeight: 'bold' }}>Серфинг</li>
					</Link>
				</menu>
			</header>
			<main>
				{/* рекламная секция */}
				<div className="header">
					<div className="ad__list ad__list__links">
						{!!data &&
							data.header.textButtons.map((data, i) => (
								<a
									className="ad__list__links"
									key={i}
									target="_blank"
									rel="noreferrer"
									href={`${data.link}`}
								>
									{data.text}
								</a>
							))}
					</div>
					<div className="ad__list">
						{!!data &&
							data.header.linkslot.map((data, i) => (
								<div key={i} dangerouslySetInnerHTML={{ __html: data.div }} />
							))}
					</div>
					<div className="ad__list">
						{!!data &&
							data.header.banners.map((data, i) => (
								<div key={i} id={`header/${i}`} onClick={handleClick} dangerouslySetInnerHTML={{ __html: data.div }} />
							))}
					</div>
				</div>
				<Switch>
					<Route exact path="/admin" component={Admin} />
					<Route exact path="/">
						{!!data &&
							<div className="app">
								<h1>Сервис бесплатного взаимного продвижения</h1>
								<h3>Сайтов в просмотре: { }</h3>
								<h3>Просмотров всего: { }</h3>
								<p dangerouslySetInnerHTML={{ __html: data.directions.texts.mainText }} />
								<div>
									<div className="mb-3">
										<label htmlFor="urlInput1" className="form-label">Ссылка на сайт</label>
										<input type="url" className="form-control" id="urlInput1" placeholder="https://example.com" onChange={(e) => handleChange(e.target.value, 'url')} />
									</div>
									<label className="form-label">Выбор категории (кол-во секунд)</label>
									<select className="form-select" aria-label="Выбор категории (кол-во секунд)" ref={categoryRef} onChange={categoryChange}>
										{Object.keys(sites).map((data, i) => <option key={i} value={data}>{data}</option>)}
									</select>
									<label className="form-label">Выбор подкатегории (кол-во сайтов)</label>
									<select className="form-select" aria-label="Выбор подкатегории (кол-во сайтов)" onChange={(e) => handleChange(e.target.value, 'subcategory')}>
										{window.location.pathname === '/' ? Object.keys(sites[category]).map((data, i) => <option key={i} value={data}>{data}</option>) : <></>}
									</select>
									<button type="button" className="btn btn-success btn-click" disabled={count === 0 ? false : true} onClick={redirect}>Добавить сайт</button>
									<p>Чтобы кнопка стала активна, нажмите на все баннеры, размещенные на странице</p>
								</div>
							</div>
						}
					</Route>
					<Route exact path="/play" component={Play} />
				</Switch>
				<div className="ad__list ad__list__column">
					{!!data &&
						data.footer.banners.map((data, i) => (
							<div key={i} id={`footer/${i}`} onClick={handleClick} dangerouslySetInnerHTML={{ __html: data.div }} />
						))}
				</div>
				<div className="ad__list">
					{/* рекламная секция */}
					{!!data &&
						data.footer.linkslot.map((data, i) => (
							<div key={i} dangerouslySetInnerHTML={{ __html: data.div }} />
						))}
				</div>
			</main>
			<footer>
				<div className="footer__socials">
					<h2 className="footer__title">
						{!!data && data.footer.name[0].text}
					</h2>
					<div className="footer__links">
						{!!data &&
							data.footer.socials.map((data, i) => (
								<a
									key={i}
									href={data.link}
									className="footer__link"
									target="_blank"
								>
									{data.text}
								</a>
							))}
					</div>
				</div>
				<div className="hider">
					© 2021 <br />
					Создание сайтов — Nikson
				</div>
			</footer>
			<div
				className="ya-share2 ya-share"
				data-curtain
				data-size="l"
				data-shape="round"
				data-services="vkontakte,facebook,odnoklassniki,telegram,twitter,viber,whatsapp,moimir"
			/>
		</>
	);
};

export default App;
