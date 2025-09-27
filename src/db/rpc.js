import { supa } from '../supa.js';
export const rpc = (fn, params = {}) => supa.rpc(fn, params);
