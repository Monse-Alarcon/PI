import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getSesionesByTutor, updateSesion, getUserById, insertNotificacion } from '../utils/database';
import CustomHeader from '../components/CustomHeader';

// Home para TUTOR: acciones centradas en gestionar tutorías
export default function HomeTutorado({ navigation, currentUserId: currentUserIdProp }) {
  const currentUserId = currentUserIdProp || navigation?.currentUserId;
  
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      if (!currentUserId) {
        setUpcomingSessions([]);
        setPendingRequests([]);
        return;
      }

      const sesionesTutor = await getSesionesByTutor(currentUserId);

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

      // Separar en pendientes y aceptadas
      const pendientes = sesionesConAlumno.filter(s => s.estado === 'pendiente');
      const aceptadas = sesionesConAlumno
        .filter(s => s.estado === 'aceptada')
        .sort((a, b) => {
          const fechaA = new Date(a.fecha);
          const fechaB = new Date(b.fecha);
          return fechaA - fechaB;
        })
        .slice(0, 3); // Solo mostrar las próximas 3

      setPendingRequests(pendientes);
      setUpcomingSessions(aceptadas);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar las sesiones');
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

  const formatearFechaHora = (fechaStr, horaStr) => {
    try {
      const fecha = new Date(fechaStr);
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const dia = fecha.getDate();
      const mes = meses[fecha.getMonth()];
      return `${dia} ${mes}, ${horaStr}`;
    } catch {
      return `${fechaStr}, ${horaStr}`;
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
      
      // Actualizar el estado local inmediatamente
      if (nuevoEstado === 'aceptada') {
        // Mover de pendientes a próximas sesiones
        setPendingRequests(prev => prev.filter(s => s.id !== sesion.id));
        setUpcomingSessions(prev => {
          const nuevaSesion = { ...sesion, estado: nuevoEstado };
          const nuevas = [...prev, nuevaSesion].sort((a, b) => {
            const fechaA = new Date(a.fecha);
            const fechaB = new Date(b.fecha);
            return fechaA - fechaB;
          });
          return nuevas.slice(0, 3);
        });
      } else {
        // Solo quitar de pendientes
        setPendingRequests(prev => prev.filter(s => s.id !== sesion.id));
      }
      
      // Crear notificaciones para alumno y tutor al cambiar estado
      try {
        const tutor = await getUserById(currentUserId);
        const nombreTutor = tutor?.name || 'el tutor';
        const fechaFormateada = formatearFecha(sesion.fecha);

        // Notificación para el alumno
        await insertNotificacion({
          usuarioId: sesion.usuarioId,
          tipo: nuevoEstado === 'aceptada' ? 'sesion_confirmada' : 'sesion_rechazada',
          titulo: nuevoEstado === 'aceptada' ? `Sesión Confirmada con ${nombreTutor}` : `Sesión Rechazada por ${nombreTutor}`,
          descripcion: nuevoEstado === 'aceptada'
            ? `Tu tutoría para ${sesion.materia} fue aceptada. Será el ${fechaFormateada} a las ${sesion.hora}`
            : `Tu tutoría para ${sesion.materia} fue rechazada por ${nombreTutor}.`,
        });

        // Notificación para el tutor (confirmación local)
        await insertNotificacion({
          usuarioId: currentUserId,
          tipo: nuevoEstado === 'aceptada' ? 'sesion_confirmada' : 'sesion_rechazada',
          titulo: nuevoEstado === 'aceptada' ? `Aceptaste la sesión con ${sesion.nombreAlumno || 'el alumno'}` : `Rechazaste la sesión con ${sesion.nombreAlumno || 'el alumno'}`,
          descripcion: nuevoEstado === 'aceptada'
            ? `Has aceptado la tutoría de ${sesion.materia} con ${sesion.nombreAlumno}. La sesión será el ${fechaFormateada} a las ${sesion.hora}`
            : `Has rechazado la tutoría de ${sesion.materia} con ${sesion.nombreAlumno}.`,
        });
      } catch (err) {
        console.warn('Error al insertar notificaciones en HomeTutorado:', err);
      }

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

  const handleVerAgenda = () => {
    navigation.navigate('MiAgenda', { usuarioId: currentUserId, rol: 'tutor' });
  };

  const handleSolicitudes = () => {
    navigation.navigate('Solicitudes', { usuarioId: currentUserId, mostrarTodas: true });
  };

  const handlePerfil = () => {
    navigation.navigate('Perfil', { usuarioId: currentUserId });
  };

  const renderSession = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.nombreAlumno || 'Alumno'}</Text>
        <Text style={styles.itemSub}>Materia: {item.materia}</Text>
      </View>
      <Text style={styles.itemRight}>{formatearFechaHora(item.fecha, item.hora)}</Text>
    </View>
  );

  const renderRequest = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.nombreAlumno || 'Alumno'}</Text>
        <Text style={styles.itemSub}>Materia: {item.materia}</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity style={styles.requestBtn} onPress={() => handleAceptar(item)}>
          <Text style={styles.requestBtnText}>Aceptar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.requestBtn, { backgroundColor: '#7A2E2E' }]} onPress={() => handleRechazar(item)}>
          <Text style={styles.requestBtnText}>Rechazar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomHeader navigation={navigation} title="Panel de tutor" menuType="tutor" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader navigation={navigation} title="Panel de tutor" menuType="tutor" />
      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Próximas sesiones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximas sesiones</Text>
          {upcomingSessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tienes sesiones próximas</Text>
            </View>
          ) : (
            <FlatList data={upcomingSessions} keyExtractor={(i) => String(i.id)} renderItem={renderSession} scrollEnabled={false} />
          )}
        </View>

        {/* Solicitudes pendientes */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>Solicitudes pendientes</Text>
            <TouchableOpacity style={styles.linkBtn} onPress={handleSolicitudes}>
              <Text style={styles.linkBtnText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {pendingRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tienes solicitudes pendientes</Text>
            </View>
          ) : (
            <FlatList data={pendingRequests} keyExtractor={(i) => String(i.id)} renderItem={renderRequest} scrollEnabled={false} />
          )}
        </View>

        {/* Acciones rápidas */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleVerAgenda}>
            <Text style={styles.buttonIcon}>📆</Text>
            <Text style={styles.buttonText}>Mi agenda</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleSolicitudes}>
            <Text style={styles.buttonIcon}>📝</Text>
            <Text style={styles.buttonText}>Solicitudes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handlePerfil}>
            <Text style={styles.buttonIcon}>👤</Text>
            <Text style={styles.buttonText}>Perfil</Text>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 12,
    backgroundColor: '#C9A878',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  linkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  linkBtnText: {
    color: '#8B4513',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  itemCard: {
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
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  itemSub: {
    fontSize: 12,
    color: '#E0C8B8',
    marginTop: 2,
  },
  itemRight: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C9A878',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  requestBtn: {
    backgroundColor: '#3E6B3E',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  requestBtnText: {
    color: '#FFF',
    fontWeight: '600',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#8B4513',
    textAlign: 'center',
  },
});

