// import 'bootswatch/dist/cosmo/bootstrap.min.css';
import React from "react";
import { useState, useCallback, useEffect } from "react";
import { Pagination, Input, Alert, Spin, Tabs } from "antd";
import { Cart } from "../Cart/Cart.jsx";
import _debounce from "lodash/debounce";
import './App.css';

export const AppContext = React.createContext('');

export const App = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [genres, setGenres] = useState('');
  const [guestSessionId, setGuestSessionId] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearchValueChange = (event) => {
    const searchValue = event.target.value;
    setSearchValue(searchValue);
    debounceFn({ searchValue, page });
  }

  useEffect(() => {
    const options = { method: 'GET', headers: { accept: 'application/json' } };
    fetch('https://api.themoviedb.org/3/genre/movie/list?api_key=662f624214017c402a0e9ec5d1612c7b&language=en', options)
      .then((res) => { return res.json() })
      .then((json) => {
        setGenres(json.genres || []);
      })
      .catch(() => {
        setGenres([]);
      })
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedSession = window.localStorage.getItem("guestSessionId");
    if (savedSession) {
      setGuestSessionId(savedSession);
      return;
    }
    const createGuestSession = async () => {
      if (guestSessionId) return;

      try {
        const response = await fetch('https://api.themoviedb.org/3/authentication/guest_session/new?api_key=662f624214017c402a0e9ec5d1612c7b');
        if (!response.ok) throw new Error("Ошибка создания гостевой сессии");
        const data = await response.json();
        setGuestSessionId(data.guest_session_id);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("guestSessionId", data.guest_session_id);
          window.console.log("Гостевая сессия создана:", data.guest_session_id);
        }
      } catch (error) {
        window.console.error("Ошибка создания сессии:", error);
        window.alert("Ошибка создания гостевой сессии! Проверьте API-ключ и интернет-соединение.");
      }
    };
    createGuestSession();
  }, [guestSessionId]);

  const fetchMovies = useCallback(async ({ searchValue, page }) => {
    setIsLoading(true);
    setHasError(false);
    try {
      const search = searchValue ? `query=${searchValue}&` : '';
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?${search}include_adult=false&api_key=662f624214017c402a0e9ec5d1612c7b&language=en-US&page=${page}`
      );
      const json = await response.json();
      setItems(json.results || []);
      setTotalResults(json.total_results || 0);
    } catch (error) {
      setHasError(true);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
    window.scrollTo(0, 0);
  }, []); 

  const debounceFn = useCallback(
    _debounce((params) => fetchMovies(params), 1000),
    [fetchMovies]
  );

  useEffect(() => {
    debounceFn({ searchValue, page });
  }, [searchValue, page, debounceFn]);

  const onChangeStars = (id, value) => {
    setItems((prev) =>
      prev.map((item) => item.id === id ? { ...item, ratedStars: value } : item)
    )
  }

  const cards = items.map((obj) => (
    <Cart
      className='justify-items: center;'
      id={obj.id}
      onChangeStars={onChangeStars}
      ratedStars={obj.ratedStars || 0}
      key={obj.id}
      rate={obj.vote_average.toFixed(1)}
      title={obj.title}
      info={obj.overview}
      img={obj.poster_path}
      date={obj.release_date}
      genreArr={obj.genre_ids}
    />
  ));

  const loading = <Spin className="loading" size="large" />;
  const ratedMovies = items.filter(item => item.ratedStars > 0);
  const filterCards = ratedMovies.map((obj) => (
    <Cart
      onChangeStars={onChangeStars}
      ratedStars={obj.ratedStars || 0}
      id={obj.id}
      key={obj.id}
      rate={obj.vote_average.toFixed(1)}
      title={obj.title}
      info={obj.overview}
      img={obj.poster_path}
      date={obj.release_date}
      genreArr={obj.genre_ids}
    />
  ));

  const tabItems = [
    {
      key: '1',
      label: 'Search',
      children: (
        <>
          <Input
            value={searchValue}
            onChange={handleSearchValueChange}
            placeholder="Type to search..."
          />
          <div className="wrapper">
            {isLoading ? loading : (
              <>
                {!searchValue && <Alert message="Write something" type="warning" closable />}
                {hasError && <Alert message="Nothing was found" type="error" closable />}
                {!hasError && searchValue && items.length === 0 && (
                  <Alert message="Nothing was found" type="warning" closable />
                )}
                {items.length > 0 && cards}
              </>
            )}
          </div>
          <div className="pagination-container">
            {cards.length !== 0 && (
              <Pagination
                total={totalResults}
                pageSize={20}
                current={page}
                onChange={(page) => setPage(page)}
                showSizeChanger={false}
              />
            )}
          </div>
        </>
      ),
    },
    {
      key: '2',
      label: 'Rated',
      children: (
        <>
          <div className="wrapper">
            {isLoading ? loading : (
              <>
                {filterCards.length === 0 && (
                  <Alert message="Nothing was found" type="warning" closable />
                )}
                {items.length > 0 && filterCards}
              </>
            )}
          </div>
          <div className="pagination-container">
            {filterCards.length !== 0 && (
              <Pagination
                total={totalResults}
                pageSize={20}
                current={page}
                onChange={(page) => setPage(page)}
                showSizeChanger={false}
              />
            )}
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="App">
      <AppContext.Provider value={{ genres }}>
        <Tabs
          defaultActiveKey="1"
          centered
          items={tabItems}
        />
      </AppContext.Provider>
    </div>
  );
}