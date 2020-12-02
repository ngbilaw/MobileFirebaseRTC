import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function AppButton({ title, onPress, style, disabled = false }) {
  return (
    <View style={style}>
      <TouchableOpacity
        style={disabled ? [styles.button, styles.mutedButton] : styles.button}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    </View>
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
  },
  mutedButton: {
    backgroundColor: 'lightgray',
  },

});

export default AppButton;
