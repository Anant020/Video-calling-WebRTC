import React,{useState, useCallback, useEffect} from 'react';
import './Lobby.css';
import { useSocket } from '../context/Socketprovider';
import {useNavigate} from 'react-router-dom';
import {NotificationManager} from 'react-notifications';

export default function Lobby() {
  const handleRefresh = () => {
    window.location.reload();
  }
  const [ email,setemail] = useState('');
  const [room,setroom]= useState('');
  const socket = useSocket();
  const Navigate = useNavigate();
  
  const handlejoinroom = useCallback((data)=>{
    const {email, room} = data
    Navigate(`/room/${room}`)
    //Here we have used a react usenavigate feature.
  },[Navigate])
  
  const handleformsubmission = useCallback (
    (e)=>{
    e.preventDefault();
    if(email.length===0 || room.length===0){
      NotificationManager.warning('Warning message', 'Close after 3000ms', 3000);
      return;
    }
    socket.emit("room:join", {email,room});
   
  },[email,room,socket]
  );

  
  useEffect(()=>{
    socket.on("room:join", handlejoinroom);
    return ()=>{
      socket.off('room:join', handlejoinroom)// deregister a listner
    }
  },[socket,handlejoinroom]);

  
  
  return (

<div>
      
  <div className="login-page">
    <div className="form">
    <form className="login-form" onSubmit={handleformsubmission}>
      <h3><b>Connect Hub</b></h3>
      <label className='label'><b>Email</b></label>
        <input type="email" placeholder="Ex - xyz@gmail.com" id='email' value={email} onChange={e =>setemail(e.target.value)}/>
      <label className='label'><b>Room number</b></label>
        <input type="text" placeholder="Ex - 1, 38, 2400" id='room' value={room} onChange={e =>setroom(e.target.value)}/>
        <button  type='submit' ><p>Enter Room</p></button>
        <p className="message">Having Trouble? <a href="#" onClick={handleRefresh}>Click Refresh</a></p>
    </form>
  </div>
</div>

    </div>
  )
}
