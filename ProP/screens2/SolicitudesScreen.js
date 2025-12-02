import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getSesionesByTutor, updateSesion, getUserById } from '../utils/database';
import CustomHeader from '../components/CustomHeader';

export default function SolicitudesScreen({ navigation, route }) {
  const tutorId = route?.params?.usuarioId || navigation?.currentUserId;
  const mostrarTodas = !!route?.params?.mostrarTodas;

  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      if (!tutorId) {
        setSesiones([]);
        return;
      }

      const sesionesTutor = await getSesionesByTutor(tutorId);

      // Enriquecer con nombre del alumno
      const sesionesConAlumno = await Promise.all(
        sesionesTutor.map(async (sesion) => {
          try {
            const alumno = await getUserById(sesion.usuarioId);
            return {
              ...sesion,
              nombreAlumno: alumno?.name || 'Alumno',
            };
          } catch {
            return {
              ...sesion,
              nombreAlumno: 'Alumno',
            };
          }
        })
      );

      setSesiones(sesionesConAlumno);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaStr) => {
    try {
      const fecha = new Date(fechaStr);
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const año = fecha.getFullYear();
      return `${dia}/${mes}/${año}`;
    } catch {
      return fechaStr;
    }
  };

  const actualizarEstado = async (sesion, nuevoEstado) => {
    try {
      await updateSesion(sesion.id, {
        tutorId: sesion.tutorId,
        materia: sesion.materia,
        fecha: sesion.fecha,
        hora: sesion.hora,
        estado: nuevoEstado,
      });
      
      // Actualizar el estado local inmediatamente para reflejar el cambio
      setSesiones(prevSesiones => 
        prevSesiones.map(s => 
          s.id === sesion.id ? { ...s, estado: nuevoEstado } : s
        )
      );
      
      // Recargar datos en segundo plano para asegurar sincronización
      cargarSolicitudes();
      
      Alert.alert('Éxito', `Solicitud ${nuevoEstado === 'aceptada' ? 'aceptada' : 'rechazada'}`);
    } catch (error) {
      console.error('Error al actualizar sesión:', error);
      Alert.alert('Error', 'No se pudo actualizar la solicitud');
    }
  };

  const handleAceptar = (sesion) => {
    Alert.alert(
      'Aceptar solicitud',
      `¿Quieres aceptar la tutoría con ${sesion.nombreAlumno}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: () => actualizarEstado(sesion, 'aceptada'),
        },
      ]
    );
  };

  const handleRechazar = (sesion) => {
    Alert.alert(
      'Rechazar solicitud',
      `¿Quieres rechazar la tutoría con ${sesion.nombreAlumno}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: () => actualizarEstado(sesion, 'rechazada'),
        },
      ]
    );
  };

  // Filtrar según si se muestran todas o solo pendientes
  const sesionesPendientes = sesiones.filter(s => s.estado === 'pendiente');
  const sesionesParaMostrar = mostrarTodas ? sesiones : sesionesPendientes;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Cargando solicitudes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader navigation={navigation} title="Solicitudes" menuType="tutor" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sesionesParaMostrar.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {mostrarTodas
                ? 'No tienes solicitudes registradas'
                : 'No tienes solicitudes pendientes'}
            </Text>
          </View>
        ) : (
          sesionesParaMostrar.map((sesion) => (
            <View key={sesion.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{sesion.nombreAlumno}</Text>
                <Text style={[
                  styles.estadoBadge,
                  sesion.estado === 'aceptada' && styles.estadoAceptada,
                  sesion.estado === 'rechazada' && styles.estadoRechazada,
                  sesion.estado === 'pendiente' && styles.estadoPendiente,
                ]}>
                  {sesion.estado === 'pendiente'
                    ? 'Pendiente'
                    : sesion.estado === 'aceptada'
                    ? 'Aceptada'
                    : sesion.estado === 'rechazada'
                    ? 'Rechazada'
                    : sesion.estado}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Materia:</Text>
                <Text style={styles.detailValue}>{sesion.materia}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fecha:</Text>
                <Text style={styles.detailValue}>{formatearFecha(sesion.fecha)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Hora:</Text>
                <Text style={styles.detailValue}>{sesion.hora}</Text>
              </View>

              {sesion.estado === 'pendiente' && (
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAceptar(sesion)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionButtonText}>Aceptar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleRechazar(sesion)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionButtonText}>Rechazar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  estadoPendiente: {
    backgroundColor: '#C9A878',
  },
  estadoAceptada: {
    backgroundColor: '#3E6B3E',
  },
  estadoRechazada: {
    backgroundColor: '#7A2E2E',
  },
  detailRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F5E6D3',
    marginRight: 6,
  },
  detailValue: {
    fontSize: 13,
    color: '#F5E6D3',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  acceptButton: {
    backgroundColor: '#3E6B3E',
  },
  rejectButton: {
    backgroundColor: '#7A2E2E',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});


