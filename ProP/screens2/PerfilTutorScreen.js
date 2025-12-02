import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getUserById, getMateriasByMaestro, getCalificacionPromedioPorTutorMateria } from '../utils/database';
import CustomHeader from '../components/CustomHeader';

export default function PerfilTutorScreen({ navigation, route }) {
  const [tutor, setTutor] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const tutorId = route?.params?.tutorId;
  const currentUserId = route?.params?.usuarioId || navigation?.currentUserId;

  useEffect(() => {
    cargarDatosTutor();
  }, [route?.params?.refresh]);

  const cargarDatosTutor = async () => {
    try {
      setLoading(true);
      
      // Cargar información del tutor
      const tutorData = await getUserById(tutorId);
      if (tutorData) {
        setTutor(tutorData);
        
        // Cargar materias del tutor con sus calificaciones
        const materiasIds = await getMateriasByMaestro(tutorId);
        const materiasConCalificacion = await Promise.all(
          materiasIds.map(async (materia) => {
            const calificacion = await getCalificacionPromedioPorTutorMateria(tutorId, materia);
            return {
              materia,
              calificacion: calificacion || 0
            };
          })
        );
        
        setMaterias(materiasConCalificacion);
      }
    } catch (error) {
      console.error('Error al cargar datos del tutor:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del tutor');
    } finally {
      setLoading(false);
    }
  };

  const handleAgendarSesion = () => {
    navigation.navigate('AgendarSesion', {
      usuarioId: currentUserId,
      tutorPreseleccionado: tutor,
      materiasDisponibles: materias.map(m => m.materia),
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!tutor) {
    return (
      <View style={styles.container}>
        <CustomHeader navigation={navigation} title="Perfil del Tutor" menuType="tutor" showBackButton={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se encontró el tutor</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader navigation={navigation} title="Perfil del Tutor" menuType="tutor" showBackButton={true} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información del Tutor */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>👨‍🏫</Text>
            </View>
            <Text style={styles.tutorName}>{tutor.name}</Text>
            <Text style={styles.tutorType}>{tutor.userType || 'Tutor'}</Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📧 Correo:</Text>
              <Text style={styles.infoValue}>{tutor.email}</Text>
            </View>
            
            {tutor.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📱 Teléfono:</Text>
                <Text style={styles.infoValue}>{tutor.phone}</Text>
              </View>
            )}

            {tutor.edificio && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🏢 Edificio:</Text>
                <Text style={styles.infoValue}>{tutor.edificio}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Materias que imparte */}
        <View style={styles.materiasSection}>
          <Text style={styles.sectionTitle}>Materias que imparte</Text>
          
          {materias.length > 0 ? (
            materias.map((materiaData, index) => (
              <View key={index} style={styles.materiaCard}>
                <View style={styles.materiaInfo}>
                  <Text style={styles.materiaIcon}>📚</Text>
                  <Text style={styles.materiaName}>{materiaData.materia}</Text>
                </View>
                <View style={styles.calificacionContainer}>
                  <Text style={styles.starIcon}>⭐</Text>
                  <Text style={styles.calificacionText}>
                    {materiaData.calificacion > 0 
                      ? `${materiaData.calificacion.toFixed(1)}/5` 
                      : 'Sin calificar'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noMateriasText}>No hay materias registradas</Text>
          )}
        </View>

        {/* Botón Calificar */}
        <TouchableOpacity
          style={styles.calificarButton}
          onPress={() => {
            if (materias.length > 0) {
              navigation.navigate('Calificar', {
                usuarioId: currentUserId,
                personaId: tutorId,
                materia: materias[0].materia,
                esTutor: true,
                previousScreen: 'PerfilTutor',
              });
            } else {
              Alert.alert('Error', 'El tutor no tiene materias asignadas');
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.calificarButtonText}>Calificar tutor</Text>
        </TouchableOpacity>

        {/* Botón Agendar Sesión */}
        <TouchableOpacity
          style={styles.agendarButton}
          onPress={handleAgendarSesion}
          activeOpacity={0.8}
        >
          <Text style={styles.agendarButtonText}>Agendar sesión</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5E6D3',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8B4513',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#8B3A3A',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D5C7',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D4AF9F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 50,
  },
  tutorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 8,
  },
  tutorType: {
    fontSize: 16,
    color: '#8B3A3A',
    fontWeight: '600',
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '600',
    minWidth: 120,
  },
  infoValue: {
    fontSize: 16,
    color: '#5D4E37',
    flex: 1,
  },
  materiasSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 16,
  },
  materiaCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  materiaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  materiaIcon: {
    fontSize: 24,
  },
  materiaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    flex: 1,
  },
  calificacionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starIcon: {
    fontSize: 20,
  },
  calificacionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B3A3A',
  },
  noMateriasText: {
    fontSize: 16,
    color: '#A0826D',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 12,
  },
  calificarButton: {
    backgroundColor: '#C9A878',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  calificarButtonText: {
    color: '#8B4513',
    fontSize: 18,
    fontWeight: 'bold',
  },
  agendarButton: {
    backgroundColor: '#8B4513',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  agendarButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
