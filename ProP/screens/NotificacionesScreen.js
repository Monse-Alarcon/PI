import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

export default function NotificacionesScreen({ navigation }) {
  const handleGoBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const notificaciones = [
    {
      id: 1,
      tipo: 'sesion',
      titulo: 'Sesión Confirmada con Ángel León',
      descripcion: 'Tu tutoría para la materia de Cálculo fue aceptada. La hora de la sesión será el Jueves a partir de las 5:00 PM',
      tiempo: 'Justo Ahora',
      icono: '📅',
    },
    {
      id: 2,
      tipo: 'calificacion',
      titulo: 'Nueva Calificación Recibida',
      descripcion: 'Tu tutora Sofía calificó tu perfil por la sesión del Lunes con 5 estrellas.',
      tiempo: 'Hace 2 horas',
      icono: '⭐',
      destacado: true,
    },
    {
      id: 3,
      tipo: 'mensaje',
      titulo: 'Mensaje de Monserrath Alarcón',
      descripcion: '¿Podemos repasar el tema de hoy en la siguiente sesión de la próxima semana?',
      tiempo: 'Ayer',
      icono: '✉️',
    },
  ];

  const renderNotificacion = (notif) => {
    return (
      <TouchableOpacity
        key={notif.id}
        style={[
          styles.notificationCard,
          notif.destacado && styles.notificationHighlight,
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{notif.icono}</Text>
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notif.titulo}</Text>
          <Text style={styles.notificationDescription}>
            {notif.descripcion}
          </Text>
          <Text style={styles.notificationTime}>{notif.tiempo}</Text>
        </View>

        {notif.destacado && (
          <View style={styles.highlightIcon}>
            <Text style={styles.highlightIconText}>👉</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Logo en la esquina superior */}
      <TouchableOpacity 
        style={styles.logoContainer}
        onPress={handleGoBack}
        activeOpacity={0.7}
      >
        <Image
          source={require('../assets/LogoMenu.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
      </View>

      {/* Lista de notificaciones */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.notificationsContainer}>
          {notificaciones.map(renderNotificacion)}
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
  logoContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  header: {
    backgroundColor: '#F5E6D3',
    paddingTop: 80,
    paddingBottom: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D3A1A',
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
});
