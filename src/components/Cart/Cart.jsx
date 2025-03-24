
import { Card, Tag } from "antd";
import { format } from "date-fns";
import { enGB } from 'date-fns/locale/en-GB';
import './Cart.css';

export const Cart = ({ title, info, img, date, genreArr }) => {
  let result = '';
  if (date !== "") {
    result = format(new Date(date), 'MMMM d, yyyy', { locale: enGB });
  }
  else {
    result = null;
  }

  if (info.length > 90) {
    info = info.substring(0, 90);
    const indexWhitespace = info.lastIndexOf(' ');
    info = info.substring(0, indexWhitespace) + ' ...';
  }

  return (
    <div>
      <Card className="card-wrapper" >
        <div className="card">
          <div className="card__image">
            <img
              className="card-image__image"
              src={img ? `https://image.tmdb.org/t/p/w500${img}` : '/img/freepik__adjust__72322.jpeg'}
              alt="Movie"
            />
          </div>
          <div className="card__information">
            <h1> {title}</h1>
            <h3>{result}</h3>
            <div className="card__genre"><Tag > {genreArr} </Tag ></div>
            <div className="card__info">{info}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}