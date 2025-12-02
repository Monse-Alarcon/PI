import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { getMaestros, getAlumnos } from '../utils/database';
import CustomHeader from '../components/CustomHeader';

export default function CalificacionesScreen({ navigation }) {
  const [modo, setModo] = useState('tutores'); // 'tutores' | 'alumnos'
  const [tutores, setTutores] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = navigation?.currentUserId;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [listaTutores, listaAlumnos] = await Promise.all([
        getMaestros(),
        getAlumnos(),
      ]);
      setTutores(listaTutores);
      setAlumnos(listaAlumnos);
    } catch (error) {
      console.error('Error al cargar datos para calificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionPersona = (persona, esTutor) => {
    navigation.navigate('Calificar', {
      usuarioId: currentUserId,
      personaId: persona.id,
      esTutor,
      tutorName: persona.name,
      materia: null,
      previousScreen: 'calificaciones',
    });
  };

  const listaActual = modo === 'tutores' ? tutores : alumnos;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Cargando personas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader navigation={navigation} title="Calificar" menuType="tutor" showBackButton={true} />

      {/* Botones de modo */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            modo === 'tutores' && styles.modeButtonActive,
          ]}
          onPress={() => setModo('tutores')}
        >
          <Text
            style={[
              styles.modeButtonText,
              modo === 'tutores' && styles.modeButtonTextActive,
            ]}
          >
            Tutores
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            modo === 'alumnos' && styles.modeButtonActive,
          ]}
          onPress={() => setModo('alumnos')}
        >
          <Text
            style={[
              styles.modeButtonText,
              modo === 'alumnos' && styles.modeButtonTextActive,
            ]}
          >
            Alumnos
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {listaActual.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {modo === 'tutores'
                ? 'No hay tutores registrados'
                : 'No hay alumnos registrados'}
            </Text>
          </View>
        ) : (
          listaActual.map((persona) => (
            <TouchableOpacity
              key={persona.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => handleSeleccionPersona(persona, modo === 'tutores')}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{persona.name}</Text>
                {persona.matricula && modo === 'alumnos' && (
                  <Text style={styles.cardMatricula}>{persona.matricula}</Text>
                )}
              </View>
              <View style={styles.cardBody}>
                {persona.email && (
                  <Text style={styles.cardText}>📧 {persona.email}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
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
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    marginHorizontal: 16,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E0C8B8',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#8B4513',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
  },
  modeButtonTextActive: {
    color: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#8B3A3A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#C9A878',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cardMatricula: {
    fontSize: 12,
    color: '#E0C8B8',
  },
  cardBody: {
    marginTop: 4,
  },
  cardText: {
    fontSize: 13,
    color: '#F5E6D3',
    marginTop: 2,
  },
});
