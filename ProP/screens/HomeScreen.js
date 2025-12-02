import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import { getMaestros, getMateriasByMaestro, getCalificacionPromedioPorTutorMateria } from '../utils/database';

export default function HomeScreen({ navigation, currentUserId: currentUserIdProp }) {
  const currentUserId = currentUserIdProp || navigation?.currentUserId;
  const [topScores, setTopScores] = useState([]);

  useEffect(() => {
    cargarTopTutores();
  }, []);

  const cargarTopTutores = async () => {
    try {
      const maestros = await getMaestros();
      
      const tutoresConCalificaciones = await Promise.all(
        maestros.map(async (maestro) => {
          const materias = await getMateriasByMaestro(maestro.id);
          
          const materiasConCalificacion = await Promise.all(
            materias.map(async (materia) => {
              const calificacion = await getCalificacionPromedioPorTutorMateria(maestro.id, materia);
              return {
                materia,
                calificacion: calificacion || 0
              };
            })
          );

          // Filtrar materias con calificación y obtener la mejor
          const conCalificacion = materiasConCalificacion.filter(m => m.calificacion > 0);
          if (conCalificacion.length > 0) {
            const mejorMateria = conCalificacion.sort((a, b) => b.calificacion - a.calificacion)[0];
            return {
              id: maestro.id.toString(),
              name: maestro.name,
              subject: mejorMateria.materia,
              score: mejorMateria.calificacion,
              maxScore: 5
            };
          }
          return null;
        })
      );

      // Filtrar nulos, ordenar por calificación y tomar top 3
      const topTres = tutoresConCalificaciones
        .filter(t => t !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      
      setTopScores(topTres);
    } catch (error) {
      console.error('Error al cargar top tutores:', error);
    }
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      Alert.alert('Búsqueda', `Buscando: ${searchText}`);
    }
  };

  const handleScheduleSession = () => {
    navigation.navigate('AgendarSesion', { usuarioId: currentUserId });
  };

  const handleMyAgenda = () => {
    navigation.navigate('MiAgenda', { usuarioId: currentUserId });
  };

  const handleTutors = () => {
    navigation.navigate('Tutores', { usuarioId: currentUserId });
  };

  const handleTutorPress = (tutor) => {
    navigation.navigate('PerfilTutor', {
      tutorId: tutor.id,
      usuarioId: currentUserId,
    });
  };

  const renderScoreCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.scoreCard} 
      activeOpacity={0.7}
      onPress={() => handleTutorPress(item)}
    >
      <View style={styles.scoreContent}>
        <Text style={styles.scoreName}>{item.name}</Text>
        <Text style={styles.scoreSubject}>Materia: {item.subject}</Text>
      </View>
      <View style={styles.scoreRight}>
        <Text style={styles.scoreValue}>
          {item.score}/{item.maxScore}
        </Text>
        <Text style={styles.scoreArrow}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <CustomHeader navigation={navigation} title="¡HOLA CARDENAL!" />
      {/* Main Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Scores Section */}
        <View style={styles.scoresSection}>
          <Text style={styles.scoresTitle}>Mejores puntuajes</Text>
          <FlatList
            data={topScores}
            renderItem={renderScoreCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleScheduleSession}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>📅</Text>
            <Text style={styles.buttonText}>Agendar sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMyAgenda}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>📆</Text>
            <Text style={styles.buttonText}>Mi agenda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTutors}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>👨‍🏫</Text>
            <Text style={styles.buttonText}>Tutores</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E6D3',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0C8B8',
  },
  clearButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0C8B8',
  },
  clearText: {
    fontSize: 20,
    color: '#999',
  },
  scoresSection: {
    marginBottom: 24,
  },
  scoresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 12,
    backgroundColor: '#C9A878',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  scoreCard: {
    backgroundColor: '#8B3A3A',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#C9A878',
  },
  scoreContent: {
    flex: 1,
  },
  scoreName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scoreSubject: {
    fontSize: 12,
    color: '#E0C8B8',
    marginTop: 2,
  },
  scoreRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C9A878',
  },
  scoreArrow: {
    fontSize: 18,
    color: '#C9A878',
  },
  buttonsSection: {
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: '#8B4513',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

