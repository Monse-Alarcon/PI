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
import CustomHeader from '../components/CustomHeader';
import { getNotificacionesByUsuario, limpiarNotificaciones } from '../utils/database';

export default function NotificacionesTutoradoScreen({ navigation, route }) {
  const { usuarioId } = route?.params || {};
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarNotificaciones();
  }, [usuarioId]);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const notifs = await getNotificacionesByUsuario(usuarioId);
      setNotificaciones(notifs);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiarNotificaciones = async () => {
    Alert.alert(
      'Limpiar Notificaciones',
      '¿Estás seguro de que quieres eliminar todas las notificaciones?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            try {
              await limpiarNotificaciones();
              setNotificaciones([]);
              Alert.alert('Éxito', 'Notificaciones eliminadas');
            } catch (error) {
              console.error('Error limpiando notificaciones:', error);
              Alert.alert('Error', 'No se pudieron limpiar las notificaciones');
            }
          },
        },
      ]
    );
  };

  const obtenerIconoPorTipo = (tipo) => {
    switch (tipo) {
      case 'sesion_confirmada':
        return '✅';
      case 'sesion_rechazada':
        return '❌';
      case 'sesion_pendiente':
        return '⏳';
      case 'calificacion':
        return '⭐';
      case 'mensaje':
        return '✉️';
      default:
        return '🔔';
    }
  };

  const obtenerTiempoTranscurrido = (fecha) => {
    const ahora = new Date();
    const creacion = new Date(fecha);
    const diferencia = ahora - creacion;

    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (minutos < 1) return 'Justo Ahora';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    return creacion.toLocaleDateString();
  };

  const renderNotificacion = (notif) => {
    const icono = obtenerIconoPorTipo(notif.tipo);
    const tiempo = obtenerTiempoTranscurrido(notif.createdAt);
    const esReciente = new Date() - new Date(notif.createdAt) < 3600000;

    return (
      <TouchableOpacity
        key={notif.id}
        style={[
          styles.notificationCard,
          esReciente && styles.notificationHighlight,
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{icono}</Text>
        </View>

        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notif.titulo}</Text>
          <Text style={styles.notificationDescription}>
            {notif.descripcion}
          </Text>
          <Text style={styles.notificationTime}>{tiempo}</Text>
        </View>

        {esReciente && (
          <View style={styles.highlightIcon}>
            <Text style={styles.highlightIconText}>👉</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader navigation={navigation} title="Notificaciones" showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B4513" />
            <Text style={styles.loadingText}>Cargando notificaciones...</Text>
          </View>
        ) : notificaciones.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No tienes notificaciones</Text>
          </View>
        ) : (
          <View style={styles.notificationsContainer}>
            {notificaciones.map(renderNotificacion)}
          </View>
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
  scrollView: {
    flex: 1,
  },
  notificationsContainer: {
    padding: 15,
  },
  notificationCard: {
    backgroundColor: '#D4A574',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
  },
  notificationHighlight: {
    backgroundColor: '#E6B87D',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F5E6D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
    paddingRight: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C1810',
    marginBottom: 6,
  },
  notificationDescription: {
    fontSize: 13,
    color: '#3D2415',
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#5D3A1A',
    fontStyle: 'italic',
  },
  highlightIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -15,
  },
  highlightIconText: {
    fontSize: 30,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#5D3A1A',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#5D3A1A',
    textAlign: 'center',
  },
});
