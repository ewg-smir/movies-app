// import 'bootswatch/dist/cosmo/bootstrap.min.css';
import { useState, useCallback, useEffect } from "react";
import { Pagination, Input, Alert, Spin } from "antd";
import { Cart } from "../Cart/Cart.jsx";
import _debounce from "lodash/debounce";
import './App.css';

export const App = () => {

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);


  const handleSearchValueChange = (event) => {
    const searchValue = event.target.value;
    console.log({ searchValue })
    setSearchValue(searchValue);
    debounceFn({ searchValue, page });
  }

  const fetchMovies = useCallback(({ searchValue, page }) => {
    setIsLoading(true);
    setHasError(false);
    const search = searchValue ? `query=${searchValue}&` : '';
    fetch(`https://api.themoviedb.org/3/search/movie?${search}include_adult=false&api_key=662f624214017c402a0e9ec5d1612c7b&language=en-US&page=${page}`)
      .then((res) => { return res.json() })
      .then((json) => {
        setItems(json.results || []);
      })
      .catch(() => {
        setHasError(true);
        setItems([]);
      })
      .finally(() => {
        setIsLoading(false);
      })
    window.scrollTo(0, 0);
  }, [])
  const debounceFn = useCallback(_debounce(fetchMovies, 1000), [fetchMovies]);

  useEffect(() => {
    debounceFn({ searchValue, page });
  }, [searchValue, page, debounceFn]);

  const onClose = (e) => {
    console.log(e, 'I was closed.');
  };

  const cards = items.map((obj) => <Cart key={obj.id} title={obj.title} info={obj.overview} img={obj.poster_path} date={obj.release_date} genreArr={obj.genre_ids} />);
  const loading = <Spin className="loading" size="large" />;

  console.log(items.length)
  return (
    <div className="App">
      <Input value={searchValue} onChange={handleSearchValueChange} placeholder="Type to search..." />
      <div className="wrapper">
        {
          isLoading ? loading : (
            <>
              {
                !searchValue && <Alert message="Write something" type="warning" closable onClose={onClose} />
              }
              {
                hasError &&
                <Alert
                  message="Nothing was found"
                  type="error"
                  closable
                  onClose={onClose} />
              }
              {
                !hasError && searchValue && items.length === 0 &&
                <Alert
                  message="Nothing was found"
                  type="warning"
                  closable
                  onClose={onClose} />
              }
              {
                items.length > 0 &&
                <>
                  {cards}
                  < Pagination
                    total={items.length}
                    pageSize={1}
                    current={page}
                    onChange={(page) => setPage(page)} />
                </>
              }
            </>
          )}
      </div>
    </div>
  );
}
