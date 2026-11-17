import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';
import { getAllCategories, createCategory, deleteCategory, Category } from '../services/category.service';

const CategoryManagerScreen = () => {
  const { navigate, showToast } = useAppNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding ] = useState(false);
  
  // New Category Form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('');
  const [newIcon, setNewIcon] = useState('📦');

  const lightColors = ['#E8F5E9', '#FFF3E0', '#E3F2FD', '#F3E5F5', '#FFFDE7', '#FBE9E7', '#E0F2F1', '#F1F8E9', '#E8EAF6', '#FCE4EC'];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data.filter(c => c.id !== 'all'));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newTitle || !newType) {
      showToast('Title and Type are required', 'error');
      return;
    }

    try {
      setLoading(true);
      await createCategory({
        title: newTitle,
        category: newType.trim().toLowerCase().replace(/\s+/g, '-'),
        icon: newIcon,
      });
      showToast('Category added successfully', 'success');
      setNewTitle('');
      setNewType('');
      setNewIcon('📦');
      setIsAdding(false);
      fetchCategories();
    } catch (error: any) {
      showToast(error.message || 'Failed to add category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
        const performDelete = async () => {
            try {
              setLoading(true);
              await deleteCategory(id);
              showToast('Category deleted', 'success');
              fetchCategories();
            } catch (error: any) {
              showToast(error.message || 'Failed to delete category', 'error');
              setLoading(false);
            }
        };
        performDelete();
    }
  };

  const renderCategoryItem = ({ item, index }: { item: Category, index: number }) => (
    <View style={styles.categoryCard}>
      <View style={[styles.categoryIconBox, { backgroundColor: lightColors[index % lightColors.length] }]}>
        <Text style={styles.categoryIconMain}>{item.icon || '📂'}</Text>
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.title}</Text>
        <Text style={styles.categoryTag}>Type: {item.category}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => handleDeleteCategory(item.id, item.title)}
      >
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Global Category Manager</Text>
        <TouchableOpacity onPress={fetchCategories} style={styles.refreshBtn}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, paddingBottom: 120, alignItems: 'center' }}>
        <View style={styles.contentWrapper}>
          <View style={styles.content}>
            {isAdding ? (
              <View style={styles.addForm}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Create New Category</Text>
                  <TouchableOpacity onPress={() => setIsAdding(false)}>
                    <Text style={styles.closeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category Title</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Organic Grains"
                    value={newTitle}
                    onChangeText={setNewTitle}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category Type</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. grains, dairy"
                    value={newType}
                    onChangeText={setNewType}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category Icon (Emoji)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 🌾"
                    value={newIcon}
                    onChangeText={setNewIcon}
                  />
                </View>
                <View style={styles.formActions}>
                  <TouchableOpacity 
                    style={[styles.btn, styles.cancelBtn]} 
                    onPress={() => setIsAdding(false)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.btn, styles.saveBtn]} 
                    onPress={handleAddCategory}
                  >
                    <Text style={styles.saveBtnText}>Save Category</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addTrigger} 
                onPress={() => setIsAdding(true)}
              >
                <Text style={styles.addTriggerText}>+ Create New Category</Text>
              </TouchableOpacity>
            )}

            {loading && !isAdding ? (
              <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
            ) : (
              <FlatList
                scrollEnabled={false}
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => renderCategoryItem({ item, index })}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📂</Text>
                    <Text style={styles.emptyText}>No categories found</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  refreshBtn: {
    padding: 5,
  },
  refreshIcon: {
    fontSize: 20,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 600,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  addTrigger: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  addTriggerText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addForm: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
    marginBottom: 6,
    marginLeft: 1,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F5F5F5',
  },
  saveBtn: {
    backgroundColor: '#2E7D32',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: '600',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryIconMain: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryTag: {
    fontSize: 11,
    color: '#2E7D32',
    marginTop: 4,
    fontWeight: '700',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
  },
  deleteBtn: {
    padding: 10,
  },
  deleteIcon: {
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyIcon: {
    fontSize: 50,
    opacity: 0.1,
  },
  emptyText: {
    color: '#999',
    marginTop: 10,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    paddingBottom: 12,
  },
  closeIcon: {
    fontSize: 18,
    color: '#999',
    padding: 5,
  },
});

export default CategoryManagerScreen;
