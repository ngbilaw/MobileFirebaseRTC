/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals
} from 'react-native-webrtc';
import firebase from './src/config/firebase';
import AppButton from './src/components/AppButton';

const configuration = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default function App() {
  
  const [ peerConnection, setPeerConnection ] = useState(new RTCPeerConnection(configuration));
  const [ localStream, setLocalStream ] = useState(new MediaStream());
  const [ remoteStream, setRemoteStream ] = useState(new MediaStream());
  const [ roomId, setRoomId ] = useState(null);

  // useEffect(() => {
  //   setPeerConnection(new RTCPeerConnection(configuration));
  // }, []);

  const openUserMedia = async () => {
    console.log('Button Pressed');
    const stream = await mediaDevices.getUserMedia(
      {video: true, audio: true});
    setLocalStream(stream);

    console.log(stream);

    console.log(localStream.toURL());
  };

  const createRoom = async () => {
    await openUserMedia();

    const db = firebase.firestore();
    const roomRef = await db.collection('rooms').doc();

    console.log('Create PeerConnection with configuration: ', configuration);
    pc = peerConnection;

    pc.addStream(localStream);

    // Code for collecting ICE candidates below
    const callerCandidatesCollection = roomRef.collection('callerCandidates');

    pc.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got candidate: ', event.candidate);
      callerCandidatesCollection.add(event.candidate.toJSON());
    });
    // Code for collecting ICE candidates above
    
    // Code for creating a room below
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await pc.setLocalDescription(offer);
    console.log('Created offer:', offer);

    const roomWithOffer = {
      'offer': {
        type: offer.type,
        sdp: offer.sdp,
      },
    };
    await roomRef.set(roomWithOffer);
    setRoomId(roomRef.id);
    console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);
    // Code for creating a room above

    pc.addEventListener('track', event => {
      // console.log('Got single remote track:' , event.track);
      console.log('Got remote track:', event.streams[0]);
      event.streams[0].getTracks().forEach(track => {
        console.log('Add a track to the remoteStream:', track);
        remoteStream.addTrack(track);
      });
    });

    pc.addEventListener('addstream', event => {
      console.log("Got remote stream!!!")
      console.log('Got remote stream:', event.stream);
      event.stream.getTracks().forEach(track => {
        console.log('Add a track to the remoteStream:', track);
        remoteStream.addTrack(track);
      })
      console.log(remoteStream.toURL());
    });
  
    // Listening for remote session description below
    roomRef.onSnapshot(async snapshot => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data && data.answer) {
        console.log('Got remote description: ', data.answer);
        const rtcSessionDescription = new RTCSessionDescription(data.answer);
        await pc.setRemoteDescription(rtcSessionDescription);
      }
    });
    // Listening for remote session description above
  
    // Listen for remote ICE candidates below
    roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
    // Listen for remote ICE candidates above

    await setPeerConnection(pc);
    registerPeerConnectionListeners();
  };

  const joinRoom = async () => {
    console.log('Join room');

    openUserMedia();

  };

  const hangUp = async () => {
    console.log('Hang up');

    const tracks = localStream.getTracks();
    tracks.forEach(track => {
      track.stop();
    });

    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
  
    if (peerConnection) {
      peerConnection.close();
    }

    // Delete room on hangup
    if (roomId) {
      const db = firebase.firestore();
      const roomRef = db.collection('rooms').doc(roomId);
      const calleeCandidates = await roomRef.collection('calleeCandidates').get();
      calleeCandidates.forEach(async candidate => {
        await candidate.ref.delete();
      });
      const callerCandidates = await roomRef.collection('callerCandidates').get();
      callerCandidates.forEach(async candidate => {
        await candidate.ref.delete();
      });
      await roomRef.delete();
    }

    setRoomId(null);
    setLocalStream(new MediaStream());
    setRemoteStream(new MediaStream());
  };

  const registerPeerConnectionListeners = () => {
    peerConnection.addEventListener('icegatheringstatechange', () => {
      console.log(
          `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });
  
    peerConnection.addEventListener('connectionstatechange', () => {
      console.log(`Connection state change: ${peerConnection.connectionState}`);
    });
  
    peerConnection.addEventListener('signalingstatechange', () => {
      console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });
  
    peerConnection.addEventListener('iceconnectionstatechange ', () => {
      console.log(
          `ICE connection state change: ${peerConnection.iceConnectionState}`);
    });
  }
  
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        {/* <AppButton color='white' title="Open Camera and Mic" onPress={openUserMedia} /> */}
        { roomId && <Text>{roomId}</Text>}
        <AppButton color='white' title="Create Room" onPress={createRoom} />
        <AppButton color='white' title="Join Room" onPress={joinRoom} />
        <AppButton color='white' title="Hang up" onPress={hangUp} />
        <View style={styles.videoContainer}>
          <RTCView streamURL={localStream ? localStream.toURL(): ''} objectFit='container' mirror={true} style={styles.video}/>
          <RTCView streamURL={remoteStream ? remoteStream.toURL(): ''} objectFit='container' mirror={true} style={styles.video}/>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  video: {
    width: '50%',
    backgroundColor: 'black'
  },
  videoContainer: {
    flexDirection: 'row',
    height: 300,
  }
});
