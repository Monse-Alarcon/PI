import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';

// Home para TUTOR: acciones centradas en gestionar tutorías
export default function HomeTutorado({ navigation, currentUserId: currentUserIdProp }) {
  const currentUserId = currentUserIdProp || navigation?.currentUserId;

  // Datos de ejemplo: próximas sesiones y solicitudes pendientes
  const upcomingSessions = [
    { id: 's1', alumno: 'Juan Pérez', materia: 'Programación web', fecha: '02 Dic, 10:00' },
    { id: 's2', alumno: 'María López', materia: 'Cálculo Integral', fecha: '03 Dic, 12:00' },
  ];

  const pendingRequests = [
    { id: 'r1', alumno: 'Ana Ruiz', materia: 'Ética profesional' },
    { id: 'r2', alumno: 'Carlos Díaz', materia: 'Bases de Datos' },
  ];

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
        <Text style={styles.itemTitle}>{item.alumno}</Text>
        <Text style={styles.itemSub}>Materia: {item.materia}</Text>
      </View>
      <Text style={styles.itemRight}>{item.fecha}</Text>
    </View>
  );

  const renderRequest = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.alumno}</Text>
        <Text style={styles.itemSub}>Materia: {item.materia}</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity style={styles.requestBtn} onPress={() => Alert.alert('Aceptar', `Sesión con ${item.alumno}`)}>
          <Text style={styles.requestBtnText}>Aceptar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.requestBtn, { backgroundColor: '#7A2E2E' }]} onPress={() => Alert.alert('Rechazar', `Sesión con ${item.alumno}`)}>
          <Text style={styles.requestBtnText}>Rechazar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Próximas sesiones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximas sesiones</Text>
          <FlatList data={upcomingSessions} keyExtractor={(i) => i.id} renderItem={renderSession} scrollEnabled={false} />
        </View>

        {/* Solicitudes pendientes */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>Solicitudes pendientes</Text>
            <TouchableOpacity style={styles.linkBtn} onPress={handleSolicitudes}>
              <Text style={styles.linkBtnText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          <FlatList data={pendingRequests} keyExtractor={(i) => i.id} renderItem={renderRequest} scrollEnabled={false} />
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
});

