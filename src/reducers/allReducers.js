import {combineReducers} from 'redux';
import library from './libraryReducer';

const rootReducer = combineReducers({
  library
});

export default rootReducer;
