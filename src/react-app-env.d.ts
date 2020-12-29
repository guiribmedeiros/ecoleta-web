/// <reference types="react-scripts" />

declare namespace NodeJS {
    interface ProcessEnv {
        REACT_APP_API_PROTOCOL: stirng,
        REACT_APP_API_HOST: stirng,
        REACT_APP_API_PORT: number,
    }
}
