import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { getMaestros, getMateriasByMaestro, getCalificacionPromedioPorTutorMateria, getSesionesByUsuario } from '../utils/database';
import CustomHeader from '../components/CustomHeader';

const { width } = Dimensions.get('window');

export default function TutoresScreen({ navigation, route }) {
  const [tutores, setTutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = route?.params?.usuarioId || navigation?.currentUserId;

  useEffect(() => {
    cargarTutores();
  }, []);

  const cargarTutores = async () => {
    try {
      setLoading(true);
      const maestros = await getMaestros();
      
      // Filtrar solo los tutores que tienen sesiones con el usuario actual
      const tutoresConSesiones = [];
      
      for (const maestro of maestros) {
        const materias = await getMateriasByMaestro(maestro.id);
        
        // Verificar si hay sesiones con este tutor para el usuario actual
        const tieneSesiones = await verificarSesionesConTutor(currentUserId, maestro.id);
        
        if (tieneSesiones) {
          const materiasConCalificacion = await Promise.all(
            materias.map(async (materia) => {
              const calificacion = await getCalificacionPromedioPorTutorMateria(maestro.id, materia);
              return { materia, calificacion };
            })
          );

          const calificaciones = materiasConCalificacion.map(m => m.calificacion).filter(c => c > 0);
          const promedioGeneral = calificaciones.length > 0
            ? (calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length).toFixed(1)
            : '0';

          tutoresConSesiones.push({
            ...maestro,
            materias: materiasConCalificacion,
            calificacionPromedio: parseFloat(promedioGeneral),
          });
        }
      }

      // Ordenar por calificación promedio (mayor a menor)
      tutoresConSesiones.sort((a, b) => b.calificacionPromedio - a.calificacionPromedio);
      
      setTutores(tutoresConSesiones);
    } catch (error) {
      console.error('Error al cargar tutores:', error);
      Alert.alert('Error', 'No se pudieron cargar los tutores');
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar si hay sesiones entre el usuario y el tutor
  const verificarSesionesConTutor = async (usuarioId, tutorId) => {
    try {
      const sesiones = await getSesionesByUsuario(usuarioId);
      return sesiones.some(sesion => sesion.tutorId === tutorId);
    } catch (error) {
      console.error('Error al verificar sesiones:', error);
      return false;
    }
  };

  const handleTutorPress = (tutor) => {
    // Navegar a agendar sesión con el tutor preseleccionado
    navigation.navigate('AgendarSesion', {
      usuarioId: currentUserId,
      tutorPreseleccionado: tutor,
    });
  };

  const handleCalificarTutor = (tutor, materia) => {
    // Navegar a pantalla de calificación
    navigation.navigate('Calificar', {
      usuarioId: currentUserId,
      personaId: tutor.id,
      esTutor: true,
      materia: materia,
      tutorName: tutor.name,
      previousScreen: 'tutores',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Cargando tutores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader navigation={navigation} title="TUTORES" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {tutores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay tutores disponibles</Text>
          </View>
        ) : (
          tutores.map((tutor) => {
            // Mostrar cada tutor con todas sus materias
            return tutor.materias.map((materiaData, index) => (
              <View
                key={`${tutor.id}-${materiaData.materia}-${index}`}
                style={styles.tutorCard}
              >
                <TouchableOpacity
                  style={styles.tutorCardContent}
                  onPress={() => handleTutorPress(tutor)}
                  activeOpacity={0.7}
                >
                  <View style={styles.tutorContent}>
                    <Text style={styles.tutorName}>{tutor.name}</Text>
                    <Text style={styles.tutorSubject}>Materia: {materiaData.materia}</Text>
                  </View>
                  <View style={styles.tutorRating}>
                    <Text style={styles.starIcon}>⭐</Text>
                    <Text style={styles.ratingText}>
                      {materiaData.calificacion > 0 ? `${materiaData.calificacion}/5` : 'Sin calificar'}
                    </Text>
                    <Text style={styles.arrowIcon}>→</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.calificarButton}
                  onPress={() => handleCalificarTutor(tutor, materiaData.materia)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calificarButtonText}>Calificar</Text>
                </TouchableOpacity>
              </View>
            ));
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C9A878',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C9A878',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8B4513',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
  },
  tutorCard: {
    backgroundColor: '#8B3A3A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#C9A878',
  },
  tutorCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tutorContent: {
    flex: 1,
  },
  tutorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  tutorSubject: {
    fontSize: 14,
    color: '#FFF',
  },
  tutorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starIcon: {
    fontSize: 18,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C9A878',
  },
  arrowIcon: {
    fontSize: 20,
    color: '#C9A878',
    marginLeft: 4,
  },
  calificarButton: {
    backgroundColor: '#C9A878',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  calificarButtonText: {
    color: '#8B4513',
    fontSize: 14,
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

