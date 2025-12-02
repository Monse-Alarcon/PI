import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { getUserById, insertCalificacion } from '../utils/database';
import CustomHeader from '../components/CustomHeader';

const { width } = Dimensions.get('window');

export default function CalificarScreen({ navigation, route }) {
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [persona, setPersona] = useState(null);
  const [tipoPersona, setTipoPersona] = useState(null); // 'tutor' o 'alumno'
  const currentUserId = route?.params?.usuarioId || navigation?.currentUserId;
  const personaId = route?.params?.personaId;
  const esTutor = route?.params?.esTutor;
  const materia = route?.params?.materia;
  const tutorName = route?.params?.tutorName;
  const previousScreen = route?.params?.previousScreen;

  useEffect(() => {
    cargarPersona();
  }, []);

  const cargarPersona = async () => {
    try {
      if (personaId) {
        const p = await getUserById(personaId);
        if (p) {
          setPersona(p);
          setTipoPersona(esTutor ? 'tutor' : 'alumno');
        }
      }
    } catch (error) {
      console.error('Error al cargar persona:', error);
      Alert.alert('Error', 'No se pudo cargar la información de la persona');
    }
  };

  const handleStarPress = (rating) => {
    setCalificacion(rating);
  };

  const handleEnviar = async () => {
    if (calificacion === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    if (!personaId || !currentUserId) {
      Alert.alert('Error', 'Faltan datos necesarios');
      return;
    }

    try {
      await insertCalificacion({
        tutorId: esTutor ? personaId : null,
        alumnoId: !esTutor ? personaId : null,
        materia: materia || null,
        calificacion: calificacion,
        comentario: comentario.trim() || null,
        usuarioId: currentUserId,
      });

      Alert.alert(
        'Éxito',
        'Calificación enviada correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              // Si venimos de CalificacionesScreen, volver ahí
              // Si venimos de PerfilTutor, volver ahí
              if (previousScreen === 'calificaciones') {
                navigation.navigate('Calificaciones');
              } else if (previousScreen === 'perfiltutor') {
                navigation.navigate('PerfilTutor', {
                  usuarioId: currentUserId,
                  tutorId: personaId,
                  refresh: Date.now()
                });
              } else {
                // Por defecto, volver atrás
                navigation.goBack();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error al enviar calificación:', error);
      Alert.alert('Error', 'No se pudo enviar la calificación');
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          style={styles.starButton}
        >
          <Text style={[styles.star, calificacion >= i && styles.starFilled]}>
            {calificacion >= i ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <CustomHeader navigation={navigation} title="Calificar tutor" menuType="tutor" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instruction Text */}
        <Text style={styles.instructionText}>
          Selecciona las estrellitas que consideras que califican a este {tipoPersona === 'tutor' ? 'profesor' : 'alumno'}
        </Text>

        {/* Tutor Name and Subject */}
        <View style={styles.nameContainer}>
          <Text style={styles.personName}>{tutorName || persona?.name || 'Tutor'}</Text>
          {materia && (
            <Text style={styles.materiaText}>Materia: {materia}</Text>
          )}
        </View>

        {/* Stars Rating */}
        <View style={styles.starsContainer}>
          {renderStars()}
        </View>

        {/* Comment Section */}
        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>Comentario:</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Escribe tu opinión aquí..."
            placeholderTextColor="#A0826D"
            value={comentario}
            onChangeText={setComentario}
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleEnviar}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Enviar reseña</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E6D3',
  },
  header: {
    backgroundColor: '#8B4513',
    paddingTop: 18,
    paddingBottom: 22,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    left: 12,
    top: 8,
    zIndex: 40,
  },
  backArrowButton: {
    position: 'absolute',
    right: 12,
    top: 18,
    zIndex: 40,
    padding: 8,
  },
  backArrowText: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    paddingHorizontal: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  instructionText: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 20,
    textAlign: 'center',
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  personName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  materiaText: {
    fontSize: 16,
    color: '#8B3A3A',
    marginTop: 8,
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 32,
    gap: 12,
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 40,
    color: '#D4AF9F',
  },
  starFilled: {
    color: '#FFD700',
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#8B3A3A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#8B4513',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 32,
    alignSelf: 'flex-end',
    minWidth: 150,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: width * 0.7,
    height: '100%',
    backgroundColor: '#8B4513',
    zIndex: 100,
    paddingTop: 20,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#A0826D',
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D4AF9F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileText: {
    fontSize: 28,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  menuBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  settingsIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#A0826D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    fontSize: 24,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 99,
  },
});

