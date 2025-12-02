import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { getUserById } from '../utils/database';

const { width } = Dimensions.get('window');

export default function PerfilScreen({ route, navigation }) {
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(-width * 0.7));

  useEffect(() => {
    cargarUsuario();
  }, []);

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

  const cargarUsuario = async () => {
    try {
      setLoading(true);
      const usuarioId = route?.params?.usuarioId || 1;
      const u = await getUserById(usuarioId);
      if (u) setUsuario(u);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !usuario) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
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
          <View style={styles.profileSectionDrawer}>
            <View style={styles.profileIconDrawer}>
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
              const usuarioId = route?.params?.usuarioId || 1;
              navigation.navigate('MiAgenda', { usuarioId });
            }}
          >
            <Text style={styles.menuItemText}>Mis agendas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('Home');
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

      {/* Header with bird (left) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Image
            source={require('../assets/LogoMenu.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              const id = usuario?.id || route?.params?.usuarioId || 1;
              navigation.navigate('EditarPerfil', { usuarioId: id });
            }}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>

          <Text style={styles.nameText}>
            {usuario ? usuario.name : '—'}
          </Text>
          <Text style={styles.roleText}>{usuario?.userType || '—'}</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Correo</Text>
            <Text style={styles.infoValue}>{usuario?.email || '—'}</Text>

            <Text style={[styles.infoLabel, { marginTop: 12 }]}>Celular</Text>
            <Text style={styles.infoValue}>{usuario?.phone || '—'}</Text>

              <Text style={[styles.infoLabel, { marginTop: 12 }]}>Grupo</Text>
              <Text style={styles.infoValue}>{usuario?.grupo || usuario?.grupo || '—'}</Text>

              <Text style={[styles.infoLabel, { marginTop: 12 }]}>Matrícula</Text>
              <Text style={styles.infoValue}>{usuario?.matricula || usuario?.matricula || '—'}</Text>

              <Text style={[styles.infoLabel, { marginTop: 12 }]}>Edificio</Text>
              <Text style={styles.infoValue}>{usuario?.edificio || '—'}</Text>
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
  header: {
    backgroundColor: '#8B4513',
    paddingTop: 18,
    paddingBottom: 22,
    paddingHorizontal: 16,
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
  logo: {
    width: 60,
    height: 60,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#D4AF9F',
    paddingVertical: 24,
    borderRadius: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8B5A3C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  editButton: {
    position: 'absolute',
    right: '5%',
    top: 90,
    backgroundColor: '#FFFFFFAA',
    padding: 6,
    borderRadius: 20,
  },
  editIcon: {
    fontSize: 18,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  roleText: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#A0634A',
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    width: '90%',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 4,
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
  profileSectionDrawer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#A0826D',
  },
  profileIconDrawer: {
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
});
