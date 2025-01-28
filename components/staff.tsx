import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Image, 
  TouchableOpacity, 
  Linking,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Color } from '../constants/GlobalStyles';
import EditMember from './EditStaff';
import { useRouter } from 'expo-router';
import { useSelectedBranch } from '../context/SelectedBranchContext';

interface TeamMember {
  id: number;
  name: string;
  role?: string;
  image_url?: string;
  email?: string;
  phoneNumber?: string;
  userName?: string;
  fullName?: string;
  country?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  dateOfBirth?: string;
  branchId?: number;
  branchName?: string;
}

interface StaffProps {
  restaurantId: string;
  branchId: string;
}

const Staff = ({ restaurantId, branchId }: StaffProps) => {
  const { selectedBranch } = useSelectedBranch();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const router = useRouter();

  const fetchTeamMembers = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      const isAdmin = globalThis.userData?.role === 'Admin';
      console.log('Is Admin:', isAdmin);
      console.log('Current Restaurant ID:', globalThis.userData?.restaurantId);
      console.log('Selected Branch:', selectedBranch);
      
      const requestBody = {
        restaurantId: isAdmin 
          ? (selectedBranch?.restaurantId || globalThis.userData?.restaurantId)
          : globalThis.userData?.restaurantId,
        branchId: isAdmin
          ? (selectedBranch?.id || globalThis.userData?.branchId)
          : globalThis.userData?.branchId
      };

      console.log('Request Body:', requestBody);

      const response = await fetch(
        isAdmin 
          ? 'https://api-server.krontiva.africa/api:uEBBwbSs/get/team/members/admin'
          : 'https://api-server.krontiva.africa/api:uEBBwbSs/get/team/members',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${globalThis.userData?.token || ''}`
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch team members: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response Data:', data);

      if (!data || data.length === 0) {
        console.log('No team members found');
        setTeamMembers([]);
        return;
      }

      const transformedData = data.map((member: any) => ({
        id: member.id,
        name: member.name || member.fullName,
        role: member.role,
        status: Boolean(member.Status),
        image_url: member.image?.url,
        email: member.email,
        phoneNumber: member.phoneNumber,
        userName: member.userName,
        fullName: member.fullName,
        country: member.country,
        city: member.city,
        address: member.address,
        postalCode: member.postalCode,
        dateOfBirth: member.dateOfBirth,
        branchId: member.branchId,
        branchName: member.branchesTable?.branchName || 'N/A'
      }));

      console.log('Transformed Data:', transformedData);
      setTeamMembers(transformedData);
    } catch (err) {
      console.error('Error details:', err);
      setError('Failed to fetch team members');
      setTeamMembers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getImageUrl = (member: TeamMember) => {
    if (!member?.image_url) return null;
    
    if (member.image_url.startsWith('http')) {
      return member.image_url;
    }
    
    return `https://api-server.krontiva.africa${member.image_url}`;
  };

  useEffect(() => {
    console.log('Effect triggered - Fetching team members');
    fetchTeamMembers();
  }, [selectedBranch]);

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleDelete = (member: TeamMember) => {
    Alert.alert(
      'Delete Staff',
      `Are you sure you want to remove ${member.fullName || member.name} from the team?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `https://api-server.krontiva.africa/api:uEBBwbSs/delikaquickshipper_user_table/${member.id}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${globalThis.userData?.token || ''}`
                  }
                }
              );

              if (response.ok) {
                Alert.alert('Success', 'Member removed successfully');
                // Optionally refresh the team members list
                fetchTeamMembers();
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Failed to delete member');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete member');
            }
          }
        }
      ]
    );
  };

  const TeamMemberCard = ({ member }: { member: TeamMember }) => {
    const imageUrl = getImageUrl(member);
    const formatDate = (date: string | undefined) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString();
    };
    
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.imageWrapper}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.profileImage}
                defaultSource={require('../assets/images/logo.png')}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <MaterialIcons name="person" size={24} color="#9CA3AF" />
              </View>
            )}
          </View>
          <View style={styles.mainInfo}>
            <Text style={styles.name}>{member.fullName || member.name}</Text>
            <Text style={styles.role}>{member.role || 'Staff Member'}</Text>
            <View style={styles.branchContainer}>
              <MaterialIcons name="store" size={14} color="#666666" />
              <Text style={styles.branchName}>{member.branchName}</Text>
            </View>
            <Text style={styles.username}>@{member.userName || 'N/A'}</Text>
          </View>

          <View style={styles.quickActions}>
            {member.email && (
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => Linking.openURL(`mailto:${member.email}`)}
              >
                <Ionicons name="mail" size={20} color={Color.otherOrange} />
              </TouchableOpacity>
            )}
            {member.phoneNumber && (
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => Linking.openURL(`tel:${member.phoneNumber}`)}
              >
                <Ionicons name="call" size={20} color={Color.otherOrange} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.cardBottom}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <MaterialIcons name="location-on" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                {[member.city, member.country].filter(Boolean).join(', ') || 'Location N/A'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="event" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                {member.dateOfBirth || 'DOB N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEdit(member)}
            >
              <MaterialIcons name="edit" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(member)}
            >
              <MaterialIcons name="delete" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Color.otherOrange} />
        <Text style={styles.loadingText}>Loading team members...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchTeamMembers()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchTeamMembers(false);
            }}
            colors={[Color.otherOrange]}
          />
        }
      >
        <View style={styles.overviewSection}>
          <View style={styles.overviewCards}>
            <View style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={styles.statIconWrapper}>
                  <MaterialIcons name="people-alt" size={24} color={Color.otherOrange} />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statValue}>{teamMembers.length}</Text>
                  <Text style={styles.statLabel}>Total Team Members</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.listContainer}>
          {teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="group-off" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No team members found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/AddStaffMembers')}
      >
        <MaterialIcons name="person-add" size={24} color="#FFF" />
      </TouchableOpacity>

      {selectedMember && (
        <EditMember
          visible={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMember(null);
            fetchTeamMembers(); // Refresh the list after edit
          }}
          member={selectedMember}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  overviewSection: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  overviewCards: {
    width: '100%',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Color.otherOrange,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTop: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Color.otherOrange,
  },
  placeholderImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  role: {
    fontSize: 14,
    color: Color.otherOrange,
    fontWeight: '500',
    marginBottom: 2,
  },
  username: {
    fontSize: 12,
    color: '#6B7280',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBottom: {
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 24,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  branchInfo: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
    fontWeight: '500'
  },
  branchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  branchName: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
});

export default Staff;
