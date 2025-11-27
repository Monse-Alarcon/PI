import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import CuentaNuevaScreen from './screens/CuentaNuevaScreen';
import { useState } from 'react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'login', 'signup'

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onBack={() => setCurrentScreen('home')}
        onCreateAccount={() => setCurrentScreen('signup')}
      />
    );
  }

  if (currentScreen === 'signup') {
    return (
      <CuentaNuevaScreen
        onBack={() => setCurrentScreen('login')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a Aula Cardinal</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setCurrentScreen('login')}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Ir a Login</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E6D3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#8B4513',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
