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

import { insertUser, getUserByEmail } from '../utils/database';

export default function CuentaNuevaScreen({ onBack }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [userType, setUserType] = useState('Tutorado'); // 'Tutorado' o 'Tutor'

  const handleCreateAccount = () => {
    if (!nombre || !email || !telefono || !contraseña) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo válido');
      return;
    }

    if (telefono.length < 10) {
      Alert.alert('Error', 'Por favor ingresa un número de teléfono válido');
      return;
    }

    if (contraseña.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Verificar si ya existe
    getUserByEmail(email)
      .then(existing => {
        if (existing) {
          Alert.alert('Error', 'Ya existe un usuario con ese correo');
          return;
        }

        insertUser({
          name: nombre,
          email,
          phone: telefono,
          password: contraseña,
          userType,
        })
          .then(() => {
            Alert.alert('Éxito', `Cuenta creada para ${nombre} como ${userType}`);
            if (onBack) onBack();
          })
          .catch(err => {
            console.log('insert err', err);
            Alert.alert('Error', 'No se pudo crear la cuenta');
          });
      })
      .catch(err => {
        console.log('check user err', err);
        Alert.alert('Error', 'Ocurrió un error');
      });
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

        <Text style={styles.title}>Crear cuenta nueva</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="#999"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Número de teléfono"
            placeholderTextColor="#999"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            value={contraseña}
            onChangeText={setContraseña}
            secureTextEntry={true}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === 'Tutorado' && styles.userTypeButtonActive,
            ]}
            onPress={() => setUserType('Tutorado')}
          >
            <Text
              style={[
                styles.userTypeText,
                userType === 'Tutorado' && styles.userTypeTextActive,
              ]}
            >
              Tutorado
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === 'Tutor' && styles.userTypeButtonActive,
            ]}
            onPress={() => setUserType('Tutor')}
          >
            <Text
              style={[
                styles.userTypeText,
                userType === 'Tutor' && styles.userTypeTextActive,
              ]}
            >
              Tutor
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateAccount}
          activeOpacity={0.7}
        >
          <Text style={styles.createButtonText}>Crear cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
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
    marginBottom: 30,
    marginTop: 10,
  },
  logo: {
    width: 140,
    height: 140,
    
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 16,
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
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 25,
  },
  userTypeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: '#A0826D',
    borderWidth: 2,
    borderColor: '#A0826D',
  },
  userTypeButtonActive: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  userTypeTextActive: {
    color: '#FFF',
  },
  createButton: {
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
  createButtonText: {
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
