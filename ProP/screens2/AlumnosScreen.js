import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { getAlumnos } from '../utils/database';
import CustomHeader from '../components/CustomHeader';

export default function AlumnosScreen({ navigation }) {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAlumnos();
  }, []);

  const cargarAlumnos = async () => {
    try {
      setLoading(true);
      const data = await getAlumnos();
      setAlumnos(data);
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
      Alert.alert('Error', 'No se pudieron cargar los alumnos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Cargando alumnos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader navigation={navigation} title="Alumnos" menuType="tutor" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {alumnos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay alumnos registrados</Text>
          </View>
        ) : (
          alumnos.map(alumno => (
            <TouchableOpacity
              key={alumno.id}
              style={styles.card}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{alumno.name}</Text>
                <Text style={styles.cardMatricula}>{alumno.matricula || ''}</Text>
              </View>
              <View style={styles.cardBody}>
                {alumno.email && (
                  <Text style={styles.cardText}>📧 {alumno.email}</Text>
                )}
                {alumno.grupo && (
                  <Text style={styles.cardText}>👥 Grupo: {alumno.grupo}</Text>
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


