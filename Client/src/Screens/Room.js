import React, { useCallback, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import peer from '../Service/peer';
import { useSocket } from '../context/Socketprovider';
import './Room.css';

export default function Room() {
  const socket = useSocket();
  const [socketId, setSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileStatus, setfileStatus] = useState(false);


  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit('user:call', { to: socketId, offer });
    setMyStream(stream);
  }, [socketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit('call:accepted', { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    setfileStatus(true);
    if (myStream) {
      myStream.getTracks().forEach((track) => {
        const sender = peer.peer.getSenders().find((s) => s.track === track);
        if (sender) {
          sender.replaceTrack(track);
        } else {
          peer.peer.addTrack(track, myStream);
        }
      });
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(({ ans }) => {
    peer.setLocalDescription(ans);
    console.log('Call Accepted!');
    sendStreams();
  }, [sendStreams]);

  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit('peer:negotiation:needed', { offer, to: socketId });
  }, [socketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener('negotiationneeded', handleNegotiationNeeded);
    return () => {
      peer.peer.removeEventListener('negotiationneeded', handleNegotiationNeeded);
    };
  }, [handleNegotiationNeeded]);

  const handleNegotiationIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      console.log('peer-negotiation-done');
      socket.emit('peer:negotiation:done', { to: from, ans });
    },
    [socket]
  );

  const handleNegotiationFinal = useCallback(
    async ({ ans }) => {
      console.log('peer-negotiation-final');
      await peer.setLocalDescription(ans);
    },
    []
  );

  useEffect(() => {
    peer.peer.addEventListener('track', async (ev) => {
      const remoteStream = ev.streams;
      console.log('GOT TRACKS!!');
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on('user:joined', handleUserJoined);
    socket.on('incoming:call', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('peer:negotiation:needed', handleNegotiationIncoming);
    socket.on('peer:negotiation:final', handleNegotiationFinal);

    return () => {
      socket.off('user:joined', handleUserJoined);
      socket.off('incoming:call', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('peer:negotiation:needed', handleNegotiationIncoming);
      socket.off('peer:negotiation:final', handleNegotiationFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegotiationIncoming,
    handleNegotiationFinal,
  ]);


  return (
    <div>
     
        <h1 className='roompagetext'>Room Page</h1>
      
      <h4>{socketId ? <div className='roompagetext' style={{backgroundColor:"green", opacity:"60%"}} >'Connected'</div> : <div className='roompagetext' style={{backgroundColor:"red", opacity:"60%"}}>' No one in room '</div>}</h4>
      <div className='buttons'>
      {myStream && <button onClick={sendStreams} className='roompagetext' style={{width:"48%"}} ><h4>Send Stream</h4></button>}
      {socketId && <button className='roompagetext' style={{width:"48%"}}  onClick={handleCallUser}><h4>Call</h4></button>}
      </div>
      
      <div className="room-container">
      <div className="stream-container">
      {myStream && (
        <>
          <h1 className='videotext'>My Stream</h1>
          <div className='playercss'>
          <ReactPlayer playing muted width={'400px'} height={'300px'} url={myStream} />
          </div>
        </>
      )}
      </div>
      <div className="stream-container">
      {remoteStream && (
        <>
          <h1 className='videotext'>Remote Stream</h1>
          <div className='playercss'>
          <ReactPlayer playing muted width={'400px'} height={'300px'} url={remoteStream} />
          </div>
        </>
      )}
      </div>
      </div>
    </div>
  );
}
