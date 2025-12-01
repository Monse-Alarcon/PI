import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { getUserByEmail } from '../utils/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation, onBack, onCreateAccount, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo válido');
      return;
    }
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('onLoginSuccess callback:', typeof onLoginSuccess);
    
    // Buscar usuario en la base de datos
    getUserByEmail(email)
      .then(async user => {
        console.log('User found:', user);
        if (!user) {
          Alert.alert('Error', 'Usuario no encontrado');
          return;
        }

        if (user.password !== password) {
          Alert.alert('Error', 'Contraseña incorrecta');
          return;
        }

        try {
          // Persistir sesión (id)
          await AsyncStorage.setItem('currentUserId', String(user.id));
        } catch (e) {
          console.warn('Could not persist session', e);
        }

        console.log('Login success, calling onLoginSuccess with id', user.id);
        if (onLoginSuccess) {
          onLoginSuccess(user.id);
        } else if (navigation?.navigate) {
          navigation.navigate('Home');
        }
      })
      .catch(err => {
        console.error('Login error:', err);
        Alert.alert('Error', 'Ocurrió un error al iniciar sesión');
      });
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }
    Alert.alert('Recuperar Contraseña', `Se enviará un enlace a: ${email}`);
  };

  const handleCreateAccount = () => {
    if (onCreateAccount) {
      onCreateAccount();
    } else {
      navigation?.navigate('Register');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/CardinalLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Iniciar Sesión</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Celular o correo electrónico"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={true}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleCreateAccount}
          activeOpacity={0.7}
        >
          <Text style={styles.registerButtonText}>Crear cuenta nueva</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E6D3',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 30,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    width: 145,
    height: 145,
    //borderRadius: 100,
    //borderWidth: 3,
    //borderColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#8B3A3A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B3A3A',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
  },
  eyeText: {
    fontSize: 18,
  },
  forgotPassword: {
    color: '#A0826D',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#8B4513',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#D4AF9F',
    marginVertical: 30,
  },
  registerButton: {
    backgroundColor: '#8B4513',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#A0826D',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
