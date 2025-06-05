declare global {
    namespace Express {
        export interface Request {
            authenticated?: boolen;
        }
    }
}

export { }