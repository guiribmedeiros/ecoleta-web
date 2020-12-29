import axios from 'axios';
import config from '../config/api';

const api = axios.create({
    baseURL:
        `${config.api_protocol}://${config.api_host}${config.api_port && `:${config.api_port}`}`,
});

export default api;
