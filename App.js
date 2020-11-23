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
  const [ remoteStrem, setRemoteStream ] = useState(new MediaStream());

  // useEffect(() => {
  //   setPeerConnection(new RTCPeerConnection(configuration));
  // }, []);

  const handleButtonPress = async () => {
    registerPeerConnectionListeners();
    console.log('Button Pressed');
    const stream = await mediaDevices.getUserMedia(
      {video: true, audio: true});
    console.log(stream);
    setLocalStream(stream);
  }

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
        <AppButton color='white' title="Open Camera and Mic" onPress={handleButtonPress} />
        {/* <AppButton color='white' title="Create Room" onPress={handleButtonPress} />
        <AppButton color='white' title="Join Room" onPress={handleButtonPress} />
        <AppButton color='white' title="Hang up" onPress={handleButtonPress} /> */}
        <RTCView streamURL={localStream.toURL()}/>
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
});
