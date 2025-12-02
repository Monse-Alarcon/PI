import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { getAlumnos } from '../utils/database';
import CustomHeader from '../components/CustomHeader';

export default function AlumnosScreen({ navigation }) {
  const [alumnos, setAlumnos] = useState([]);
  const [alumnosFiltrados, setAlumnosFiltrados] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAlumnos();
  }, []);

  const cargarAlumnos = async () => {
    try {
      setLoading(true);
      const data = await getAlumnos();
      // ordenar por nombre
      data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setAlumnos(data);
      setAlumnosFiltrados(data);
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
      Alert.alert('Error', 'No se pudieron cargar los alumnos');
    } finally {
      setLoading(false);
    }
  };

  const filtrar = (texto) => {
    setSearchText(texto);
    if (texto.trim() === '') {
      setAlumnosFiltrados(alumnos);
      return;
    }
    const lower = texto.toLowerCase();
    const filtrados = alumnos.filter(a => (a.name || '').toLowerCase().includes(lower) || (a.email || '').toLowerCase().includes(lower) || (a.matricula || '').toLowerCase().includes(lower));
    setAlumnosFiltrados(filtrados);
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
      <CustomHeader navigation={navigation} title="Alumnos" menuType="tutor" showBackButton={true} />

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Busca un alumno"
          placeholderTextColor="#A0826D"
          value={searchText}
          onChangeText={filtrar}
        />
        {searchText.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => filtrar('')}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {alumnosFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay alumnos registrados</Text>
          </View>
        ) : (
          alumnosFiltrados.map(alumno => (
            <TouchableOpacity
              key={alumno.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => navigation && navigation.navigate ? navigation.navigate('PerfilAlumno', { alumnoId: alumno.id, previousScreen: 'alumnos' }) : null}
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
  searchContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#8B4513',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearText: {
    fontSize: 20,
    color: '#A0826D',
    fontWeight: 'bold',
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


