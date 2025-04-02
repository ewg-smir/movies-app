import { useState } from "react";
import PropTypes from 'prop-types';
import { Tag, Rate } from "antd";
import { format } from "date-fns";
import { enGB } from 'date-fns/locale/en-GB';
import './Cart.css';
import { useContext } from "react";
import { AppContext } from "../App/App";

export const Cart = ({ title, info, img, date, genreArr, rate, ratedStars, onChangeStars, id }) => {
  const { genres } = useContext(AppContext);
  const [showFullText, setShowFullText] = useState(false);


  let result = '';
  if (date !== "") {
    result = format(new Date(date), 'MMMM d, yyyy', { locale: enGB });
  }
  else {
    result = null;
  }

  const getTruncatedText = (text) => {
    if (showFullText || text.length <= 100) return text;
    const truncated = text.substring(0, 100);
    const indexWhitespace = truncated.lastIndexOf(' ');
    return truncated.substring(0, indexWhitespace) + ' ...';
  }

  const getBorderColor = (rate) => {
    if (rate >= 8) return "border-green";
    if (rate >= 6) return "border-yellow";
    if (rate >= 4) return "border-orange";
    return "border-red";
  }

  const genresResultArr = genreArr.map((item) => genres.find(({ id }) => id === item).name);

  return (
    <div  >
      <div className="card">
        <img
          className="card__image"
          src={img ? `https://image.tmdb.org/t/p/w500${img}` : '/img/freepik__adjust__72322.jpeg'}
          alt="Movie"
        />
        <div className="card__information">
          <div className="movieRate">
            <h1> {title}</h1>
            <div className={`rateValueBox ${getBorderColor(rate)}`}>{rate}</div>
          </div>
          <h3>{result}</h3>
          <div className="card__genre">
            {genresResultArr.map((item, index) => { return <Tag key={index} > {item} </Tag > })}
          </div>
          <div className="card__info">
            {getTruncatedText(info)}
            {info.length > 100 && !showFullText && (
              <button
                onClick={() => setShowFullText(true)}
                className="show-more-btn"
              >
                open
              </button>
            )}
          </div>
          <Rate className="rate" allowHalf value={ratedStars} defaultValue={0} count={10} onChange={(value) => onChangeStars(id, value)} />
        </div>
      </div>
    </div>
  )
}

Cart.propTypes = {
  title: PropTypes.string.isRequired,
  info: PropTypes.string.isRequired,
  img: PropTypes.string,
  date: PropTypes.string,
  genreArr: PropTypes.arrayOf(PropTypes.number).isRequired,
  rate: PropTypes.number.isRequired,
  ratedStars: PropTypes.number.isRequired,
  onChangeStars: PropTypes.func.isRequired,
  id: PropTypes.number.isRequired,
};

Cart.defaultProps = {
  img: '',
  date: '',
};