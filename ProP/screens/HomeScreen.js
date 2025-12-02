import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  Alert,
  Animated,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation, currentUserId: currentUserIdProp }) {
  const currentUserId = currentUserIdProp || navigation?.currentUserId;
  const [searchText, setSearchText] = useState('');
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

  const topScores = [
    {
      id: '1',
      name: 'Monserrath Alarcón Aguilar',
      subject: 'Ética profesional',
      score: 4.5,
      maxScore: 5,
    },
    {
      id: '2',
      name: 'Daniela López Pacheco',
      subject: 'Cálculo Integral',
      score: 4.4,
      maxScore: 5,
    },
    {
      id: '3',
      name: 'Ángel León Solís',
      subject: 'Programación web',
      score: 4.3,
      maxScore: 5,
    },
  ];

  const handleSearch = () => {
    if (searchText.trim()) {
      Alert.alert('Búsqueda', `Buscando: ${searchText}`);
    }
  };

  const handleScheduleSession = () => {
    navigation.navigate('AgendarSesion', { usuarioId: currentUserId });
  };

  const handleMyAgenda = () => {
    navigation.navigate('MiAgenda', { usuarioId: currentUserId });
  };

  const handleTutors = () => {
    Alert.alert('Tutores', 'Ver lista de tutores disponibles');
  };

  const renderScoreCard = ({ item }) => (
    <TouchableOpacity style={styles.scoreCard} activeOpacity={0.7}>
      <View style={styles.scoreContent}>
        <Text style={styles.scoreName}>{item.name}</Text>
        <Text style={styles.scoreSubject}>Materia: {item.subject}</Text>
      </View>
      <View style={styles.scoreRight}>
        <Text style={styles.scoreValue}>
          {item.score}/{item.maxScore}
        </Text>
        <Text style={styles.scoreArrow}>→</Text>
      </View>
    </TouchableOpacity>
  );

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

          <TouchableOpacity style={styles.menuItem} onPress={() => setMenuOpen(false)}>
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

          <TouchableOpacity style={styles.menuItem} onPress={() => setMenuOpen(false)}>
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
        <Text style={styles.headerTitle}>¡HOLA CARDENAL!</Text>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!menuOpen}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Busca alguna materia"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchText('')}
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Top Scores Section */}
        <View style={styles.scoresSection}>
          <Text style={styles.scoresTitle}>Mejores puntuajes</Text>
          <FlatList
            data={topScores}
            renderItem={renderScoreCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleScheduleSession}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>📅</Text>
            <Text style={styles.buttonText}>Agendar sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMyAgenda}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>📆</Text>
            <Text style={styles.buttonText}>Mi agenda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTutors}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>👨‍🏫</Text>
            <Text style={styles.buttonText}>Tutores</Text>
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
  header: {
    backgroundColor: '#8B4513',
    paddingTop: 18,
    paddingBottom: 30,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0C8B8',
  },
  clearButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0C8B8',
  },
  clearText: {
    fontSize: 20,
    color: '#999',
  },
  scoresSection: {
    marginBottom: 24,
  },
  scoresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 12,
    backgroundColor: '#C9A878',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  scoreCard: {
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
  scoreContent: {
    flex: 1,
  },
  scoreName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scoreSubject: {
    fontSize: 12,
    color: '#E0C8B8',
    marginTop: 2,
  },
  scoreRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C9A878',
  },
  scoreArrow: {
    fontSize: 18,
    color: '#C9A878',
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
});

