import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Image,
	Dimensions,
	FlatList,
	Animated,
} from 'react-native';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

// Home para TUTOR: acciones centradas en gestionar tutorías
export default function HomeTutorado({ navigation, currentUserId: currentUserIdProp }) {
	const currentUserId = currentUserIdProp || navigation?.currentUserId;
	const [menuOpen, setMenuOpen] = useState(false);
	const [menuAnimation] = useState(new Animated.Value(-width * 0.7));

	const toggleMenu = () => {
		Animated.timing(menuAnimation, {
			toValue: menuOpen ? -width * 0.7 : 0,
			duration: 300,
			useNativeDriver: false,
		}).start(() => setMenuOpen(!menuOpen));
	};

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
		Alert.alert('Solicitudes', 'Aquí verás solicitudes (pendiente).');
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
				<TouchableOpacity style={styles.requestBtn} onPress={() => { /* aceptar */ }}>
					<Text style={styles.requestBtnText}>Aceptar</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.requestBtn, { backgroundColor: '#7A2E2E' }]} onPress={() => { /* rechazar */ }}>
					<Text style={styles.requestBtnText}>Rechazar</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	return (
		<View style={styles.container}>
			{menuOpen && <TouchableOpacity style={styles.menuOverlay} onPress={toggleMenu} />}

			<Animated.View style={[styles.drawer, { transform: [{ translateX: menuAnimation }] }]}>
				<View style={styles.drawerContent}>
					<View style={styles.profileSection}>
						<View style={styles.profileIcon}><Text style={styles.profileText}>👨‍🏫</Text></View>
						<Text style={styles.profileLabel}>Tutor</Text>
					</View>

					<TouchableOpacity style={styles.menuItem} onPress={() => setMenuOpen(false)}>
						<Text style={styles.menuItemText}>Inicio</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); handleVerAgenda(); }}>
						<Text style={styles.menuItemText}>Mi agenda</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); handleSolicitudes(); }}>
						<Text style={styles.menuItemText}>Solicitudes</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); handlePerfil(); }}>
						<Text style={styles.menuItemText}>Perfil</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); navigation.navigate('Logout'); }}>
						<Text style={styles.menuItemText}>Cerrar sesión</Text>
					</TouchableOpacity>

					<View style={styles.menuBottom}>
						<TouchableOpacity style={styles.settingsIcon}><Text style={styles.settingsText}>⚙️</Text></TouchableOpacity>
					</View>
				</View>
			</Animated.View>

			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
					<Image source={require('../assets/LogoMenu.png')} style={styles.logo} resizeMode="contain" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Panel del Tutor</Text>
			</View>

			{/* Content */}
			<ScrollView style={styles.content} showsVerticalScrollIndicator={false} scrollEnabled={!menuOpen}>
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
	container: { flex: 1, backgroundColor: '#F5E6D3' },
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
	menuButton: { position: 'absolute', left: 16, top: 1, zIndex: 40 },
	logo: { width: 90, height: 90 },
	headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
	content: { flex: 1, paddingHorizontal: 16, paddingVertical: 16 },
	section: { marginBottom: 24 },
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
	itemTitle: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
	itemSub: { fontSize: 12, color: '#E0C8B8', marginTop: 2 },
	itemRight: { fontSize: 12, fontWeight: '600', color: '#C9A878' },
	requestActions: { flexDirection: 'row', gap: 8 },
	requestBtn: {
		backgroundColor: '#3E6B3E',
		borderRadius: 10,
		paddingHorizontal: 10,
		paddingVertical: 6,
	},
	requestBtnText: { color: '#FFF', fontWeight: '600' },
	buttonsSection: { marginBottom: 32 },
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
	buttonIcon: { fontSize: 20 },
	buttonText: { fontSize: 15, fontWeight: 'bold', color: '#FFF' },
	drawer: {
		position: 'absolute', left: 0, top: 0, width: width * 0.7, height: '100%',
		backgroundColor: '#8B4513', zIndex: 100, paddingTop: 20,
	},
	drawerContent: { flex: 1, paddingHorizontal: 16 },
	profileSection: {
		alignItems: 'center', marginBottom: 24, paddingBottom: 16,
		borderBottomWidth: 1, borderBottomColor: '#A0826D',
	},
	profileIcon: {
		width: 60, height: 60, borderRadius: 30, backgroundColor: '#D4AF9F',
		alignItems: 'center', justifyContent: 'center', marginBottom: 8,
	},
	profileText: { fontSize: 28 },
	profileLabel: { fontSize: 14, fontWeight: 'bold', color: '#FFF' },
	menuItem: { paddingVertical: 14, paddingHorizontal: 12, borderRadius: 8, marginBottom: 8 },
	menuItemText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
	menuBottom: { flex: 1, justifyContent: 'flex-end', paddingBottom: 24 },
	settingsIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#A0826D', alignItems: 'center', justifyContent: 'center' },
	settingsText: { fontSize: 24 },
	menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 99 },
});

