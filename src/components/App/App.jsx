// import 'bootswatch/dist/cosmo/bootstrap.min.css';
import React from "react";
import { useState, useCallback, useEffect } from "react";
import { Pagination, Input, Alert, Spin, Tabs } from "antd";
import { Cart } from "../Cart/Cart.jsx";
import _debounce from "lodash/debounce";
import './App.css';

export const AppContext = React.createContext('');

export const App = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [ratedMovies, setRatedMovies] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [ratedPage, setRatedPage] = useState(1);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [genres, setGenres] = useState('');
  const [guestSessionId, setGuestSessionId] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [activeTab, setActiveTab] = useState('1');

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
      const search = searchValue ? `query=${searchValue}&` : "";
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?${search}include_adult=false&api_key=662f624214017c402a0e9ec5d1612c7b&language=en-US&page=${page}`
      );
      const json = await response.json();
      const updated = json.results?.map((item) => {
        const rated = ratedMovies.find((r) => r.id === item.id);
        return rated ? { ...item, ratedStars: rated.ratedStars } : item;
      }) || [];
      setSearchResults(updated);
      setTotalResults(json.total_results || 0);
    } catch (error) {
      setHasError(true);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
    window.scrollTo(0, 0);
  }, [ratedMovies]);
  
  const debounceFn = useCallback(
    _debounce((params) => fetchMovies(params), 1000),
    [fetchMovies]
  );

  useEffect(() => {
    if (activeTab === '1') {
      debounceFn({ searchValue, page: searchPage });
    }
  }, [searchValue, searchPage, debounceFn, activeTab]);

  const onChangeStars = (id, value) => {
    setSearchResults((prev) =>
      prev.map((item) => item.id === id ? { ...item, ratedStars: value } : item)
    );

    setRatedMovies((prev) => {
      const exists = prev.find((item) => item.id === id);
      if (exists) {
        return prev.map((item) =>
          item.id === id ? { ...item, ratedStars: value } : item
        );
      }
      const ratedItem = searchResults.find((item) => item.id === id);
      return ratedItem ? [...prev, { ...ratedItem, ratedStars: value }] : prev;
    });
  };

  const searchCards = searchResults.map((obj) => (
    <Cart
      key={obj.id}
      id={obj.id}
      title={obj.title}
      info={obj.overview}
      img={obj.poster_path}
      date={obj.release_date}
      rate={obj.vote_average.toFixed(1)}
      genreArr={obj.genre_ids}
      ratedStars={obj.ratedStars || 0}
      onChangeStars={onChangeStars}
    />
  ));

  const ratedCards = ratedMovies.map((obj) => (
    <Cart
      key={obj.id}
      id={obj.id}
      title={obj.title}
      info={obj.overview}
      img={obj.poster_path}
      date={obj.release_date}
      rate={obj.vote_average.toFixed(1)}
      genreArr={obj.genre_ids}
      ratedStars={obj.ratedStars || 0}
      onChangeStars={onChangeStars}
    />
  ));
  const loading = <Spin className="loading" size="large" />;


  const tabItems = [
    {
      key: "1",
      label: "Search",
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
                {!hasError && searchValue && searchResults.length === 0 && (
                  <Alert message="Nothing was found" type="warning" closable />
                )}
                {searchCards}
              </>
            )}
          </div>
          <div className="pagination-container">
            {searchResults.length > 0 && (
              <Pagination
                total={totalResults}
                pageSize={20}
                current={searchPage}
                onChange={(page) => setSearchPage(page)}
                showSizeChanger={false}
              />
            )}
          </div>
        </>
      ),
    },
    {
      key: "2",
      label: "Rated",
      children: (
        <>
          <div className="wrapper">
            {ratedCards.length === 0 ? (
              <Alert message="Nothing was found" type="warning" closable />
            ) : (
              ratedCards.slice((ratedPage - 1) * 20, ratedPage * 20)
            )}
          </div>
          <div className="pagination-container">
            {ratedCards.length > 0 && (
              <Pagination
                total={ratedCards.length}
                pageSize={20}
                current={ratedPage}
                onChange={(page) => setRatedPage(page)}
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
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={tabItems}
        />
      </AppContext.Provider>
    </div>
  );
}