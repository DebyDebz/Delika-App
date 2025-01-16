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
}

interface StaffProps {
  restaurantId: string;
  branchId: string;
}

const Staff = ({ restaurantId, branchId }: StaffProps) => {
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

      if (!globalThis.userData?.restaurantId || !globalThis.userData?.branchId) {
        throw new Error('Missing restaurant or branch ID');
      }

      const response = await fetch(
          'https://api-server.krontiva.africa/api:uEBBwbSs/get/team/members',
          {
          method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            'Authorization': `Bearer ${globalThis.userData?.token || ''}`
          },
          body: JSON.stringify({
            restaurantId: globalThis.userData.restaurantId,
            branchId: globalThis.userData.branchId,
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      const data = await response.json();
      console.log('API Response:', data);

      const transformedData = data.map((member: any) => {
        const imageUrl = member.image?.url || 
                        member.profileImage || 
                        member.avatar || 
                        null;

        return {
          ...member,
          status: Boolean(member.status),
          image_url: imageUrl
        };
      });

      console.log('Transformed Data:', transformedData);
      setTeamMembers(transformedData);
      } catch (err) {
        setError('Failed to fetch team members');
      console.error('Error:', err);
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
    fetchTeamMembers();
  }, []);

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleDelete = (member: TeamMember) => {
    Alert.alert(
      'Delete Member',
      `Are you sure you want to remove ${member.name} from the team?`,
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
    console.log('Processed Image URL:', imageUrl);
    
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.imageWrapper}>
            {imageUrl ? (
              <Image
                source={{ 
                  uri: imageUrl,
                  headers: {
                    'Authorization': `Bearer ${globalThis.userData?.token || ''}`
                  }
                }}
                style={styles.profileImage}
                defaultSource={require('../assets/images/logo.png')}
                onError={(e) => {
                  console.log('Image Error:', e.nativeEvent.error);
                  console.log('Failed URL:', imageUrl);
                }}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={32} color="#9CA3AF" />
              </View>
            )}
          </View>

          <View style={styles.mainInfo}>
            <Text style={styles.name}>{member.fullName || member.name}</Text>
            <Text style={styles.role}>{member.role || 'Staff Member'}</Text>
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
});

export default Staff;
