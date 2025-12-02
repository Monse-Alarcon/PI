import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { getSesionesByUsuario, deleteSesion, getUserById } from '../utils/database';
import { getMaestros } from '../utils/database';

const { width } = Dimensions.get('window');

export default function MiAgendaScreen({ navigation, route }) {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maestros, setMaestros] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(-width * 0.7));
  const currentUserId = route?.params?.usuarioId || navigation?.currentUserId;

  const toggleMenu = () => {
    if (menuOpen) {
      Animated.timing(menuAnimation, {
        toValue: -width * 0.7,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setMenuOpen(false);
    } else {
      Animated.timing(menuAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setMenuOpen(true);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      if (currentUserId) {
        const sesionesData = await getSesionesByUsuario(currentUserId);
        const maestrosData = await getMaestros();
        setSesiones(sesionesData);
        setMaestros(maestrosData);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar las sesiones');
    } finally {
      setLoading(false);
    }
  };

  const getNombreMaestro = (tutorId) => {
    if (!tutorId) return 'No asignado';
    const maestro = maestros.find(m => m.id === tutorId);
    return maestro ? maestro.name : 'Maestro no encontrado';
  };

  const formatearFecha = (fechaStr) => {
    try {
      const fecha = new Date(fechaStr);
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const año = fecha.getFullYear();
      return `${dia}/${mes}/${año}`;
    } catch (error) {
      return fechaStr;
    }
  };

  const handleEliminar = (sesionId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas cancelar esta sesión?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSesion(sesionId);
              Alert.alert('Éxito', 'Sesión cancelada correctamente');
              cargarDatos(); // Recargar lista
            } catch (error) {
              console.error('Error al eliminar sesión:', error);
              Alert.alert('Error', 'No se pudo cancelar la sesión');
            }
          },
        },
      ]
    );
  };

  const handleEditar = (sesion) => {
    // Guardar que venimos de miagenda para regresar aquí
    navigation.navigate('AgendarSesion', {
      usuarioId: currentUserId,
      sesionEdit: sesion,
      previousScreen: 'miagenda',
    });
  };

  const handleAgendarNueva = () => {
    // Guardar que venimos de miagenda para regresar aquí
    navigation.navigate('AgendarSesion', {
      usuarioId: currentUserId,
      previousScreen: 'miagenda',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Cargando agenda...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hamburger Menu Overlay */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.menuOverlay}
          onPress={toggleMenu}
          activeOpacity={0.8}
        />
      )}

      {/* Animated Drawer Menu */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: menuAnimation }],
          },
        ]}
      >
        <View style={styles.drawerContent}>
          <View style={styles.profileSection}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileText}>👤</Text>
            </View>
            <Text style={styles.profileLabel}>Usuario</Text>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('Home');
            }}
          >
            <Text style={styles.menuItemText}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('MiAgenda', { usuarioId: currentUserId });
            }}
          >
            <Text style={styles.menuItemText}>Mis agendas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('Tutores', { usuarioId: currentUserId });
            }}
          >
            <Text style={styles.menuItemText}>Tutores</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('Perfil');
            }}
          >
            <Text style={styles.menuItemText}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('Logout');
            }}
          >
            <Text style={styles.menuItemText}>Cerrar sesión</Text>
          </TouchableOpacity>

          <View style={styles.menuBottom}>
            <TouchableOpacity style={styles.settingsIcon}>
              <Text style={styles.settingsText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Image
            source={require('../assets/LogoMenu.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrowButton}>
          <Text style={styles.backArrowText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi agenda</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sesiones.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes sesiones agendadas</Text>
            <Text style={styles.emptySubtext}>
              Presiona "Agendar nueva tutoría" para crear una
            </Text>
          </View>
        ) : (
          sesiones.map((sesion) => (
            <View key={sesion.id} style={styles.sesionCard}>
              <View style={styles.sesionDetailsBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tutor:</Text>
                  <Text style={styles.detailValue}>
                    {getNombreMaestro(sesion.tutorId)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Materia:</Text>
                  <Text style={styles.detailValue}>{sesion.materia}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha:</Text>
                  <Text style={styles.detailValue}>
                    {formatearFecha(sesion.fecha)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hora:</Text>
                  <Text style={styles.detailValue}>{sesion.hora}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estado:</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      styles.estadoText,
                      sesion.estado === 'Confirmada' && styles.estadoConfirmada,
                      sesion.estado === 'pendiente' && styles.estadoPendiente,
                      sesion.estado === 'cancelada' && styles.estadoCancelada,
                    ]}
                  >
                    {sesion.estado === 'pendiente'
                      ? 'Pendiente'
                      : sesion.estado === 'cancelada'
                      ? 'Cancelada'
                      : sesion.estado}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleEliminar(sesion.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditar(sesion)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Agendar nueva tutoría button */}
        <TouchableOpacity
          style={styles.agendarButton}
          onPress={handleAgendarNueva}
          activeOpacity={0.8}
        >
          <Text style={styles.agendarButtonText}>Agendar nueva tutoría</Text>
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
  header: {
    backgroundColor: '#8B4513',
    paddingTop: 18,
    paddingBottom: 22,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    left: 12,
    top: 8,
    zIndex: 40,
  },
  backArrowButton: {
    position: 'absolute',
    right: 12,
    top: 18,
    zIndex: 40,
    padding: 8,
  },
  backArrowText: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
  },
  logo: {
    width: 60,
    height: 60,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: width * 0.7,
    height: '100%',
    backgroundColor: '#8B4513',
    zIndex: 100,
    paddingTop: 20,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#A0826D',
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D4AF9F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileText: {
    fontSize: 28,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  menuBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  settingsIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#A0826D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    fontSize: 24,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 99,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  sesionCard: {
    backgroundColor: '#D4AF9F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  sesionDetailsBox: {
    backgroundColor: '#8B4513',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    width: 80,
  },
  detailValue: {
    fontSize: 15,
    color: '#FFF',
    flex: 1,
  },
  estadoText: {
    fontWeight: 'bold',
  },
  estadoConfirmada: {
    color: '#90EE90',
  },
  estadoPendiente: {
    color: '#FFD700',
  },
  estadoCancelada: {
    color: '#FF6B6B',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#8B3A3A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  agendarButton: {
    backgroundColor: '#8B4513',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  agendarButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

