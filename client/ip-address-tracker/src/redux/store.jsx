import {configureStore} from '@reduxjs/toolkit'
import positionReducer from './CounterSlice'

export default configureStore({
    reducer:{
     position: positionReducer
    }
})