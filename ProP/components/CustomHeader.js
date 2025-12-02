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

export default function CustomHeader({ navigation, title = '¡HOLA CARDENAL!' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(-width * 0.7));

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

  const menuItems = [
    { label: 'Inicio', screen: 'home' },
    { label: 'Mis agendas', screen: 'miagenda' },
    { label: 'Tutores', screen: 'tutores' },
    { label: 'Perfil', screen: 'perfil' },
    { label: 'Cerrar sesión', screen: 'logout' },
  ];

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
                  toValue: -width * 0.7,
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
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Image
            source={require('../assets/LogoMenu.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#8B4513',
    paddingTop: 18,
    paddingBottom: 30,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  menuButton: {
    position: 'absolute',
    left: 16,
    top: 1,
    zIndex: 40,
  },
  logo: {
    width: 90,
    height: 90,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
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
