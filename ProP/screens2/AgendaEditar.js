import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import { getSesionById, updateSesion } from '../utils/database';

export default function AgendaEditar({ route, navigation }) {
  const sesionId = route?.params?.sesionId;
  const previous = route?.params?.previousScreen || 'home';
  const [loading, setLoading] = useState(true);
  const [sesion, setSesion] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sesionId) {
      Alert.alert('Error', 'Sesión inválida');
      navigation && navigation.navigate && navigation.navigate(previous);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const s = await getSesionById(sesionId);
        if (!s) {
          Alert.alert('Error', 'Sesión no encontrada');
          navigation && navigation.navigate && navigation.navigate(previous);
          return;
        }
        setSesion(s);
      } catch (err) {
        console.warn('getSesionById error', err);
        Alert.alert('Error', 'No se pudo cargar la sesión');
        navigation && navigation.navigate && navigation.navigate(previous);
      } finally {
        setLoading(false);
      }
    })();
  }, [sesionId]);

  const cambiarEstado = async (nuevoEstado) => {
    try {
      setSaving(true);
      await updateSesion(sesionId, { estado: nuevoEstado });
      Alert.alert('Listo', `Estado actualizado a ${nuevoEstado}`);
      navigation && navigation.navigate && navigation.navigate(previous);
    } catch (err) {
      console.warn('updateSesion err', err);
      Alert.alert('Error', 'No se pudo actualizar el estado');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader navigation={navigation} title="Editar agenda" menuType="tutor" showBackButton={true} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Materia</Text>
          <Text style={styles.value}>{sesion?.materia || '—'}</Text>

          <Text style={styles.label}>Tutor</Text>
          <Text style={styles.value}>{sesion?.tutorId || '—'}</Text>

          <Text style={styles.label}>Fecha</Text>
          <Text style={styles.value}>{sesion?.fecha || '—'}</Text>

          <Text style={styles.label}>Hora</Text>
          <Text style={styles.value}>{sesion?.hora || '—'}</Text>

          <Text style={styles.label}>Estado actual</Text>
          <Text style={[styles.value, styles.estado]}>{sesion?.estado || 'pendiente'}</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => cambiarEstado('aceptada')} disabled={saving}>
              <Text style={styles.actionText}>Aceptar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => cambiarEstado('rechazada')} disabled={saving}>
              <Text style={styles.actionText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5E6D3' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5E6D3' },
  header: { backgroundColor: '#8B4513', paddingTop: 18, paddingBottom: 18, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  backButton: { position: 'absolute', left: 12, top: 12 },
  backText: { color: '#FFF', fontSize: 20 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16, alignItems: 'center' },
  card: { width: '100%', backgroundColor: '#A0634A', padding: 16, borderRadius: 12 },
  label: { color: '#FFF', fontWeight: '700', marginTop: 8 },
  value: { color: '#FFF', fontSize: 16, marginTop: 4 },
  estado: { fontWeight: '900', marginBottom: 12 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 6 },
  acceptBtn: { backgroundColor: '#2E8B57' },
  rejectBtn: { backgroundColor: '#B22222' },
  actionText: { color: '#FFF', fontWeight: '700' },
});
