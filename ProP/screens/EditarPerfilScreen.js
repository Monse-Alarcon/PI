import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import { getUserById, updateUser } from '../utils/database';

export default function EditarPerfilScreen({ route, navigation }) {
  const usuarioId = route?.params?.usuarioId || 1;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    grupo: '',
    matricula: '',
    email: '',
    phone: '',
    edificio: '',
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const u = await getUserById(usuarioId);
        if (u) {
          setForm({
            name: u.name || '',
            grupo: u.grupo || '',
            matricula: u.matricula || '',
            email: u.email || '',
            phone: u.phone || '',
            edificio: u.edificio || '',
          });
        }
      } catch (err) {
        console.warn('Error cargando usuario', err);
        Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
      } finally {
        setLoading(false);
      }
    })();
  }, [usuarioId]);

  const onChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const onSave = async () => {
    if (!form.name || !form.email) {
      Alert.alert('Validación', 'Nombre y correo son obligatorios');
      return;
    }
    try {
      setSaving(true);
      // Save known fields to storage; some fields like grupo/matricula
      // are supported by AsyncStorage/web fallbacks even if SQLite lacks columns.
      const changes = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        edificio: form.edificio,
        grupo: form.grupo,
        matricula: form.matricula,
      };
      await updateUser(usuarioId, changes);
      Alert.alert('Listo', 'Perfil actualizado correctamente');
      // go back to Perfil and trigger a reload
      navigation.navigate('Perfil');
    } catch (err) {
      console.warn('update error', err);
      Alert.alert('Error', 'No se pudo guardar el perfil');
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
      <CustomHeader navigation={navigation} title="Editar Perfil" showBackButton={true} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}><Text style={styles.avatarEmoji}>👤</Text></View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Datos personales</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={form.name}
            onChangeText={t => onChange('name', t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Grupo"
            value={form.grupo}
            onChangeText={t => onChange('grupo', t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Matricula"
            value={form.matricula}
            onChangeText={t => onChange('matricula', t)}
          />

          <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Datos de contacto</Text>
          <TextInput
            style={styles.input}
            placeholder="Correo"
            keyboardType="email-address"
            value={form.email}
            onChangeText={t => onChange('email', t)}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Celular"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={t => onChange('phone', t)}
          />
          <TextInput
            style={styles.input}
            placeholder="Edificio"
            value={form.edificio}
            onChangeText={t => onChange('edificio', t)}
          />

          <View style={styles.saveRow}>
            <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={saving}>
              <Text style={styles.saveText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
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
  header: { backgroundColor: '#8B4513', paddingTop: 18, paddingBottom: 22, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  menuButton: { position: 'absolute', left: 12, top: 8 },
  logo: { width: 60, height: 60 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  content: { paddingHorizontal: 16, paddingVertical: 20, alignItems: 'center' },
  avatarContainer: { marginBottom: 8 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#8B5A3C', alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 48 },
  formCard: { width: '95%', backgroundColor: '#A0634A', padding: 16, borderRadius: 12 },
  sectionTitle: { color: '#FFF', fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10 },
  saveRow: { alignItems: 'flex-end' },
  saveButton: { backgroundColor: '#8B4513', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20 },
  saveText: { color: '#FFF', fontWeight: '700' },
});
