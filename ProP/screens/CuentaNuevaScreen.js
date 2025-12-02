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

import { insertUser, getUserByEmail, insertMaestroMateria, getUserById } from '../utils/database';

export default function CuentaNuevaScreen({ onBack }) {
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('');
  const [matricula, setMatricula] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [edificio, setEdificio] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [userType, setUserType] = useState('Tutorado'); // 'Tutorado' o 'Tutor'
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);

  // Lista de materias disponibles
  const materiasDisponibles = [
    'Programacion',
    'Estructuras de Datos',
    'Algoritmos',
    'Cálculo Integral',
    'Álgebra Lineal',
    'Matemáticas Discretas',
    'Base de Datos',
    'Ingeniería de Software',
    'Sistemas Operativos',
    'Redes de Computadoras',
    'Arquitectura de Computadoras',
    'Programación Web',
    'Inteligencia Artificial',
    'Seguridad Informática',
  ];

  const toggleMateria = (materia) => {
    if (materiasSeleccionadas.includes(materia)) {
      setMateriasSeleccionadas(materiasSeleccionadas.filter(m => m !== materia));
    } else {
      setMateriasSeleccionadas([...materiasSeleccionadas, materia]);
    }
  };

  const handleCreateAccount = async () => {
    if (!nombre || !email || !telefono || !contraseña || !edificio || !grupo || !matricula) {
      Alert.alert('Error', 'Por favor completa todos los campos (incluyendo Grupo y Matrícula)');
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

    // Si es tutor, validar que haya seleccionado al menos una materia
    if (userType === 'Tutor' && materiasSeleccionadas.length === 0) {
      Alert.alert('Error', 'Por favor selecciona al menos una materia que impartes');
      return;
    }

    try {
      // Verificar si ya existe
      const existing = await getUserByEmail(email);
      if (existing) {
        Alert.alert('Error', 'Ya existe un usuario con ese correo');
        return;
      }

      // Crear el usuario
      const result = await insertUser({
        name: nombre,
        email,
        phone: telefono,
        grupo,
        matricula,
        password: contraseña,
        userType,
        edificio,
      });

      // Si es tutor, agregar las materias
      if (userType === 'Tutor') {
        let tutorId;
        
        // Obtener el ID del usuario recién creado
        if (result && result.insertId) {
          tutorId = result.insertId;
        } else if (result && result.id) {
          tutorId = result.id;
        } else {
          // Buscar el usuario por email para obtener su ID (más confiable)
          const nuevoUsuario = await getUserByEmail(email);
          if (nuevoUsuario) {
            tutorId = nuevoUsuario.id;
          }
        }

        // Agregar cada materia seleccionada
        if (tutorId) {
          for (const materia of materiasSeleccionadas) {
            try {
              await insertMaestroMateria({ maestroId: tutorId, materia });
            } catch (err) {
              console.log('Error al agregar materia:', materia, err);
            }
          }
          Alert.alert('Éxito', `Cuenta creada para ${nombre} como ${userType} con ${materiasSeleccionadas.length} materia(s)`);
        } else {
          Alert.alert('Éxito', `Cuenta creada para ${nombre} como ${userType}. Nota: No se pudieron agregar las materias.`);
        }
      } else {
        Alert.alert('Éxito', `Cuenta creada para ${nombre} como ${userType}`);
      }

      if (onBack) onBack();

    } catch (err) {
      console.log('Error al crear cuenta:', err);
      Alert.alert('Error', 'No se pudo crear la cuenta');
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
            placeholder="Grupo"
            placeholderTextColor="#999"
            value={grupo}
            onChangeText={setGrupo}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Matrícula"
            placeholderTextColor="#999"
            value={matricula}
            onChangeText={setMatricula}
            autoCapitalize="none"
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
            placeholder="Salón / Edificio (ej. D206)"
            placeholderTextColor="#999"
            value={edificio}
            onChangeText={setEdificio}
            autoCapitalize="characters"
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
            onPress={() => {
              setUserType('Tutorado');
              setMateriasSeleccionadas([]);
            }}
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

        {/* Selector de materias para tutores */}
        {userType === 'Tutor' && (
          <View style={styles.materiasContainer}>
            <Text style={styles.materiasTitle}>Selecciona las materias que impartes:</Text>
            <View style={styles.materiasGrid}>
              {materiasDisponibles.map((materia, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.materiaChip,
                    materiasSeleccionadas.includes(materia) && styles.materiaChipSelected,
                  ]}
                  onPress={() => toggleMateria(materia)}
                >
                  <Text
                    style={[
                      styles.materiaChipText,
                      materiasSeleccionadas.includes(materia) && styles.materiaChipTextSelected,
                    ]}
                  >
                    {materia}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {materiasSeleccionadas.length > 0 && (
              <Text style={styles.materiasCount}>
                {materiasSeleccionadas.length} materia(s) seleccionada(s)
              </Text>
            )}
          </View>
        )}

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
  materiasContainer: {
    marginBottom: 20,
    marginTop: 10,
  },
  materiasTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 12,
  },
  materiasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  materiaChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#A0826D',
    borderWidth: 2,
    borderColor: '#A0826D',
    marginBottom: 8,
  },
  materiaChipSelected: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  materiaChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFF',
  },
  materiaChipTextSelected: {
    fontWeight: 'bold',
  },
  materiasCount: {
    fontSize: 14,
    color: '#8B4513',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
