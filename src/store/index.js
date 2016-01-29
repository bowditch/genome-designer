import configureStore from './configureStore';
import { getLastAction as lastAction } from './saveLastActionMiddleware';

/* If we were just using redux, without the redux-react and redux-router packages, you would just dispatch events etc. directly from the store. So, we're exporting it separately so it can be used that way e.g. for playing around. However, using those packages, you should use:

 redux-react
    <Provider>
    connect()
 redux-router
    <ReduxRouter>
    reactReduxRouter
    routerStateReducer()
*/

const store = configureStore();

//in general, you will want to use redux's connect() where possible. This is for 3rd party etc.
const { dispatch, subscribe, getState } = store;

export { lastAction, dispatch, subscribe, getState };
export default store;
