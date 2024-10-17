import { createSlice } from "@reduxjs/toolkit";
export const PositionSlice = createSlice({
  name: "position",
  initialState: {
    startPoint: '',
    endPoint:'',
    distance:0,
    routepath:[],
    time:0,
    userlat:null,
    userlon:null
  },
  
  reducers: {
    setStartPoint : (state,action)=>{
      state.startPoint = action.payload
    },
    setEndPoint : (state,action)=> {
    state.endPoint = action.payload
    },
    setDistance: (state,action)=>{
      state.distance = action.payload
    },
    setRoutepath: (state,action)=>{
      state.routepath = action.payload
    },
     setTime: (state,action) =>{
      state.time = action.payload
     },
    
     setUserlat: (state,action)=>{
       state.userlat = action.payload
     },
     setUserlon:(state,action)=>{
     state.userlon = action.payload
     }
  },
});

export const {setStartPoint,setEndPoint,setDistance,setRoutepath,setTime,setUserlat,setUserlon} = PositionSlice.actions;
export default PositionSlice.reducer;
