import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Route, Switch, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fb } from '../utils/firebase';

const Play = () => {
  const [sites, setSites] = useState([])
  const [url, setUrl] = useState('') // добавляющийся пользователем
  const [currentSite, setCurrentSite] = useState('') // показывающийся пользователю
  const [count, setCount] = useState(0)

  const [sumTime, setSumTime] = useState(1); // считает время, проводимое на ссылках из заданий
  const [date, setDate] = useState(false)
  const params = window.location.search.split('?')[1].split('&').map(data => data.split('=')[1])
  useEffect(() => {
    setUrl(params[2])
    fb.firestore().collection('database').doc('sites').get().then((doc) => {
      if (doc.exists) {
        const sitesData = doc.data()[params[0]][params[1]]
        setSites(sitesData)
        setCurrentSite(sitesData[0])
        setSumTime(0)
        setDate(Date.now() + Number(`${params[0]*1 + 1}000`))
        setCount(1)
      }
    })
  }, [])
  useEffect(() => {
		if (date && (date - Date.now()) / 1000 >= 1) {
			document.title = `${Math.floor((date - Date.now()) / 1000)} сек осталось | Серфинг`;
			let timerId = setTimeout(() => {
				setSumTime((prev) => prev - 1);
			}, 10);
			if ((date - Date.now()) / 1000 <= 1) setSumTime(0)
			return () => clearInterval(timerId);
		}
	}, [sumTime, Date.now()]);
  useEffect(() => {
		if (sumTime <= 0 && (date - Date.now()) / 1000 <= 1) {
			if (count === Number(params[1]) || sites.length === count) {
        fb.firestore().collection('database').doc('sites').get().then((doc) => {
          if (doc.exists) {
            const sitesCategory = doc.data()[params[0]]
            const sitesData = sitesCategory[params[1]]
            sitesData.unshift({
              url: params[2].includes('http') ? params[2] : `//${params[2]}`
            })
            sitesData.pop()
            fb.firestore().collection('database').doc('sites').set({
              [params[0]]: {
                [params[1]]: sitesData
              }
            }, { merge: true })
          }
        })
        document.title = 'Ваш сайт успешно добавлен | Серфинг'
      } else {
        setCurrentSite(sites[count])
        setCount(prev => ++prev);
        setSumTime(0)
        setDate(Date.now() + Number(`${params[0]*1 + 1}000`))
      }
    }
	}, [sumTime]);
	return (
    !!currentSite && (
    <>
			<h1>Таймер:</h1>
      <h5>Порядковый номер: {}</h5>
      <a target="_blank" href={currentSite.url}><button type="button" className="btn btn-secondary">Перейти на сайт</button></a>
      <iframe width="100%" height="1000px" sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation" src={currentSite.url}>Ваш браузер не поддерживает фреймы</iframe>
    </>
    )
	);
};

export default Play;
