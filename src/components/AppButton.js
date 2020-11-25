import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

function AppButton({color, title, onPress}) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4ecdc4',
    borderRadius: 5,
    padding: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: "bold",
    textTransform: 'uppercase',
    textAlign: 'center',
  }
});

export default AppButton;
