import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function CustomHeader({ navigation, title = '¡HOLA CARDENAL!', menuType = 'alumno', showBackButton = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(-width * 0.75));

  const handleBackPress = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  const toggleMenu = () => {
    if (menuOpen) {
      Animated.timing(menuAnimation, {
        toValue: -width * 0.75,
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

  let menuItems = [];

  if (menuType === 'tutor') {
    // Menú para TUTOR
    menuItems = [
      { label: 'Inicio', screen: 'home' },
      { label: 'Mis agendas', screen: 'miagenda' },
      { label: 'Sesiones', screen: 'solicitudes' },
      { label: 'Tutores', screen: 'tutores' },
      { label: 'Alumnos', screen: 'alumnos' },
      { label: 'Notificaciones', screen: 'notificaciones' },
      { label: 'Perfil', screen: 'perfil' },
      { label: 'Calificar alumnos y tutores', screen: 'calificaciones' },
      { label: 'Cerrar sesión', screen: 'logout' },
    ];
  } else {
    // Menú para ALUMNO / TUTORADO (por defecto)
    menuItems = [
      { label: 'Inicio', screen: 'home' },
      { label: 'Mis agendas', screen: 'miagenda' },
      { label: 'Tutores', screen: 'tutores' },
      { label: 'Calificar tutores', screen: 'tutores' },
      { label: 'Perfil', screen: 'perfil' },
      { label: 'Cerrar sesión', screen: 'logout' },
    ];
  }

  return (
    <>
      {/* Drawer Menu */}
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

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                Animated.timing(menuAnimation, {
                  toValue: -width * 0.75,
                  duration: 300,
                  useNativeDriver: false,
                }).start(() => {
                  navigation.navigate(item.screen);
                });
              }}
            >
              <Text style={styles.menuItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.menuBottom}>
            <TouchableOpacity style={styles.settingsIcon}>
              <Text style={styles.settingsText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Overlay cuando el menú está abierto */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.menuOverlay}
          onPress={toggleMenu}
          activeOpacity={0.8}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {showBackButton ? (
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Atrás</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
              <Image
                source={require('../assets/LogoMenu.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.headerBottom}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#8B4513',
    paddingTop: 10,
    paddingBottom: 0,
    paddingHorizontal: 16,
    position: 'relative',
    zIndex: 1,
    
    
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 5,
    
  },
  headerBottom: {
    alignItems: 'center',
    paddingBottom: 5,
    backgroundColor: '#F5E6D3',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  menuButton: {
    zIndex: 30,
    flexDirection: 'row',
  },
  backButton: {
    zIndex: 30,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#D4AF9F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  logo: {
    width: 100,
    height: 100,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: width * 0.75,
    height: '100%',
    backgroundColor: '#8B4513',
    zIndex: 100,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
});
