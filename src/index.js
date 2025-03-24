import ReactDOM from 'react-dom/client';
import { App } from "./components/App/App.jsx";
import './index.css';
import { Alert, Spin  } from "antd";
import { Offline, Online } from "react-detect-offline";
// import "bootswatch/dist/cosmo/bootstrap.min.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <>
    <Online><App /></Online>
    <div className='offline'>
    <Offline>  <Spin size="large" /> <Alert type="error" message={`Oops! Check your internet connection :(`} /></Offline>
    </div>
    </>
);
