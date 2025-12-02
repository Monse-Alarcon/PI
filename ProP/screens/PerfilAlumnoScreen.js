import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getUserById } from '../utils/database';
import CustomHeader from '../components/CustomHeader';

export default function PerfilAlumnoScreen({ route, navigation }) {
  const alumnoId = route?.params?.alumnoId || 1;
  const [loading, setLoading] = useState(true);
  const [alumno, setAlumno] = useState(null);

  useEffect(() => {
    cargarAlumno();
  }, [alumnoId]);

  const cargarAlumno = async () => {
    try {
      setLoading(true);
      const u = await getUserById(alumnoId);
      if (u) setAlumno(u);
      else Alert.alert('No encontrado', 'Alumno no encontrado');
    } catch (err) {
      console.warn('Error cargando alumno', err);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!alumno) {
    return (
      <View style={styles.container}>
        <CustomHeader navigation={navigation} title="Perfil del Alumno" showBackButton={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se encontró el alumno</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader navigation={navigation} title="Perfil del Alumno" showBackButton={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información del Alumno */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <Text style={styles.alumnoName}>{alumno.name}</Text>
            <Text style={styles.alumnoType}>{alumno.userType || 'Tutorado'}</Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📧 Correo:</Text>
              <Text style={styles.infoValue}>{alumno.email || '—'}</Text>
            </View>

            {alumno.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📱 Teléfono:</Text>
                <Text style={styles.infoValue}>{alumno.phone}</Text>
              </View>
            )}

            {alumno.grupo && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>👥 Grupo:</Text>
                <Text style={styles.infoValue}>{alumno.grupo}</Text>
              </View>
            )}

            {alumno.matricula && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🎓 Matrícula:</Text>
                <Text style={styles.infoValue}>{alumno.matricula}</Text>
              </View>
            )}

            {alumno.edificio && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🏢 Edificio:</Text>
                <Text style={styles.infoValue}>{alumno.edificio}</Text>
              </View>
            )}
          </View>
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
  alumnoName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 8,
  },
  alumnoType: {
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
});
